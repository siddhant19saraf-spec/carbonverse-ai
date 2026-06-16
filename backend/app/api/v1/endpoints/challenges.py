from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.gamification_service import GamificationService
from app.schemas.challenge import UserChallengeResponse

router = APIRouter()


@router.get("/", response_model=list[UserChallengeResponse])
def get_challenges(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = GamificationService(db)
    return service.get_weekly_challenges(current_user.id)
