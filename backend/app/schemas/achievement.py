from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid


class AchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str
    badge_icon: str
    category: str
    threshold_score: int


class UserAchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    achievement: AchievementResponse
    unlocked_at: datetime
