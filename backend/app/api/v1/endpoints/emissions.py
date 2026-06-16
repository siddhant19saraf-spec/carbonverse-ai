from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.emission_service import EmissionService
from app.schemas.emission import EmissionCreate, EmissionRecordResponse, EmissionSummary, CarbonScoreResponse

router = APIRouter()


@router.post("/", response_model=EmissionRecordResponse, status_code=201)
def record_emission(
    data: EmissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = EmissionService(db)
    return service.record_emission(current_user.id, data)


@router.get("/", response_model=list[EmissionRecordResponse])
def get_emissions(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = EmissionService(db)
    records = service.get_user_emissions(current_user.id, days)
    return records


@router.get("/summary", response_model=EmissionSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = EmissionService(db)
    return service.get_emission_summary(current_user.id)


@router.get("/score", response_model=CarbonScoreResponse)
def get_score(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = EmissionService(db)
    return service.calculate_carbon_score(current_user.id)


@router.get("/compare-national")
def compare_national(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = EmissionService(db)
    return service.compare_with_national_average(current_user.id)
