from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class GamificationState(BaseModel):
    current_score: int
    green_level: int
    streak_days: int
    total_badges: int
    weekly_progress: float


class WeeklyChallenge(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    goal_type: str
    goal_value: float
    reward_score: int
    user_progress: float
    is_completed: bool
