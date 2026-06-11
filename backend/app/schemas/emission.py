from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime


class EmissionBase(BaseModel):
    category: str
    subcategory: Optional[str] = None
    amount: float
    unit: str


class EmissionCreate(EmissionBase):
    recorded_at: Optional[datetime] = None


class EmissionRecordResponse(EmissionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    carbon_footprint: float
    recorded_at: datetime
    created_at: datetime


class EmissionSummary(BaseModel):
    total_carbon: float
    category_breakdown: Dict[str, float]
    daily_average: float
    weekly_total: float
    monthly_total: float


class CarbonScoreResponse(BaseModel):
    score: int
    level: str
    total_emissions: float
    category_breakdown: Dict[str, float]
    suggestions: List[str]
