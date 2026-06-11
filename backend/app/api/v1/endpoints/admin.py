from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_admin_user
from app.services.admin_service import AdminService

router = APIRouter()


@router.get("/user-analytics")
def user_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    service = AdminService(db)
    return service.get_user_analytics()


@router.get("/platform-metrics")
def platform_metrics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    service = AdminService(db)
    return service.get_platform_metrics()


@router.get("/emission-analytics")
def emission_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    service = AdminService(db)
    return service.get_emission_analytics()


@router.get("/system-health")
def system_health(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    service = AdminService(db)
    return service.get_system_health()
