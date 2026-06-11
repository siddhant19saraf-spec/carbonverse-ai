from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.repositories.sustainability_goal_repository import SustainabilityGoalRepository
from app.schemas.sustainability_goal import SustainabilityGoalCreate, SustainabilityGoalResponse

router = APIRouter()


@router.get("/", response_model=list[SustainabilityGoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    repo = SustainabilityGoalRepository(db)
    return repo.get_by_user(str(current_user.id))


@router.post("/", response_model=SustainabilityGoalResponse, status_code=201)
def create_goal(
    data: SustainabilityGoalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    repo = SustainabilityGoalRepository(db)
    goal = repo.create({
        **data.model_dump(),
        "user_id": str(current_user.id),
        "current_reduction": 0.0,
        "is_completed": False,
    })
    return goal
