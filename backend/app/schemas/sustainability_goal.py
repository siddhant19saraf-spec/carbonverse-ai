from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
import uuid


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

    id: uuid.UUID
    user_id: uuid.UUID
    current_reduction: float
    is_completed: bool
    created_at: datetime
    updated_at: datetime
