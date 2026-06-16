from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
from io import BytesIO
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.report_service import ReportService
from app.schemas.report import ReportRequest, ReportResponse

router = APIRouter()


@router.post("/generate", response_model=ReportResponse)
def generate_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = ReportService(db)
    return service.generate_report_response(
        current_user.id, request.date_from, request.date_to, request.include_recommendations
    )


@router.post("/download")
def download_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    service = ReportService(db)
    pdf_bytes = service.generate_pdf_report(
        current_user.id, request.date_from, request.date_to, request.include_recommendations
    )
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=carbon-report-{date.today().isoformat()}.pdf"},
    )
