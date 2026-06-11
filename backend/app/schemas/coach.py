from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CoachMessage(BaseModel):
    role: str
    content: str

    model_config = ConfigDict(from_attributes=True)


class CoachRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class CoachResponse(BaseModel):
    reply: str
    suggestions: list[str]

    model_config = ConfigDict(from_attributes=True)


class WeeklyInsight(BaseModel):
    week_start: date
    week_end: date
    summary: str
    achievements: list[str]
    areas_for_improvement: list[str]
    next_week_goals: list[str]

    model_config = ConfigDict(from_attributes=True)
