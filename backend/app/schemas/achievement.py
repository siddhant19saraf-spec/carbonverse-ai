from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    badge_icon: str
    category: str
    threshold_score: int


class UserAchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    achievement: AchievementResponse
    unlocked_at: datetime
