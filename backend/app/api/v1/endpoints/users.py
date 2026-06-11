from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_profile(current_user=Depends(get_current_active_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    repo = UserRepository(db)
    update_dict = update_data.model_dump(exclude_unset=True)
    if "password" in update_dict:
        from app.core.security import get_password_hash
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
    updated = repo.update(current_user, update_dict)
    return updated
