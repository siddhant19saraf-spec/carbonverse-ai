from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, emissions, coach, predictions, achievements, challenges, goals, reports, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(emissions.router, prefix="/emissions", tags=["Emissions"])
api_router.include_router(coach.router, prefix="/coach", tags=["AI Coach"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
api_router.include_router(goals.router, prefix="/goals", tags=["Goals"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
