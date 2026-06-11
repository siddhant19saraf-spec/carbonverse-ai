from pydantic import BaseModel, ConfigDict
from datetime import date, datetime


class SustainabilityGoalBase(BaseModel):
    title: str
    description: str
    target_carbon_reduction: float
    category: str
    target_date: date


class SustainabilityGoalCreate(SustainabilityGoalBase):
    pass


class SustainabilityGoalResponse(SustainabilityGoalBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    current_reduction: float
    is_completed: bool
    created_at: datetime
    updated_at: datetime
