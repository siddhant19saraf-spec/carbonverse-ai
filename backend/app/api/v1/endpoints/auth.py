from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.auth_service import AuthService, AuthenticationError
from app.schemas.user import UserCreate, UserLogin, TokenResponse, RefreshTokenRequest, UserResponse

router = APIRouter()


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        user = service.register(user_in.email, user_in.username, user_in.password, user_in.full_name)
        return user
    except AuthenticationError as e:
        raise HTTPException(status_code=400, detail=e.detail)


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        user = service.authenticate(credentials.email, credentials.password)
        return service.create_tokens(user)
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=e.detail)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        return service.refresh_token(body.refresh_token)
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=e.detail)


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_active_user)):
    return current_user


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = AuthService(db)
    try:
        service.change_password(str(current_user.id), body.old_password, body.new_password)
        return {"message": "Password changed successfully"}
    except AuthenticationError as e:
        raise HTTPException(status_code=400, detail=e.detail)
