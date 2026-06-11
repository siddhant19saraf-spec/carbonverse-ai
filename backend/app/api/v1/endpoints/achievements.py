from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.gamification_service import GamificationService
from app.schemas.gamification import GamificationState

router = APIRouter()


@router.get("/state", response_model=GamificationState)
def get_gamification_state(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = GamificationService(db)
    return service.get_gamification_state(str(current_user.id))
