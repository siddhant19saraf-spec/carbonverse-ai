from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid


class ChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    goal_type: str
    goal_value: float
    reward_score: int
    starts_at: datetime
    ends_at: datetime
    is_active: bool


class UserChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge: ChallengeResponse
    progress: float
    completed: bool
    completed_at: Optional[datetime] = None
