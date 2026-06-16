from fastapi import APIRouter
from app.services.coach_service import CoachService

router = APIRouter()


@router.get("/daily")
def daily_tip():
    return {"tip": CoachService.get_daily_tip()}
