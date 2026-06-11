from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.coach_service import CoachService
from app.schemas.coach import CoachRequest, CoachResponse, WeeklyInsight

router = APIRouter()


@router.post("/chat", response_model=CoachResponse)
def chat_with_coach(
    request: CoachRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = CoachService(db)
    return service.generate_coach_response(str(current_user.id), request.message, request.context)


@router.get("/daily-tip")
def daily_tip():
    return {"tip": CoachService.get_daily_tip()}


@router.get("/weekly-insights", response_model=WeeklyInsight)
def weekly_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = CoachService(db)
    return service.generate_weekly_insights(str(current_user.id))


@router.get("/goals")
def get_coach_goals(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = CoachService(db)
    return {"goals": service.generate_sustainability_goals(str(current_user.id))}
