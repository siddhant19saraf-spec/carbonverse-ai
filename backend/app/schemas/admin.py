from datetime import date

from pydantic import BaseModel, ConfigDict


class UserAnalytics(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    verified_users: int

    model_config = ConfigDict(from_attributes=True)


class PlatformMetrics(BaseModel):
    total_emissions_recorded: int
    avg_sustainability_score: float
    total_achievements_unlocked: int
    total_challenges_completed: int

    model_config = ConfigDict(from_attributes=True)


class EmissionAnalytics(BaseModel):
    total_by_category: dict[str, float]
    daily_totals: list
    monthly_trend: list

    model_config = ConfigDict(from_attributes=True)


class SystemHealth(BaseModel):
    status: str
    uptime: str
    db_connections: int
    active_sessions: int

    model_config = ConfigDict(from_attributes=True)
