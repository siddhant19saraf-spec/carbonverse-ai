from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.prediction_service import PredictionService
from app.schemas.prediction import PredictionRequest, PredictionResponse

router = APIRouter()


@router.post("/", response_model=PredictionResponse)
def predict_emissions(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = PredictionService(db)
    return service.predict_emissions(current_user.id, request.months_ahead)
