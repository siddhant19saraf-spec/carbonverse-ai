from pydantic import BaseModel, ConfigDict
from datetime import date, datetime


class ReportRequest(BaseModel):
    date_from: date
    date_to: date
    include_recommendations: bool = True


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    generated_at: datetime
    report_url: str
    date_from: date
    date_to: date
