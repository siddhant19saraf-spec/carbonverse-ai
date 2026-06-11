from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    months_ahead: int = Field(default=3, ge=1, le=12)


class PredictionPoint(BaseModel):
    date: date
    predicted_value: float
    upper_bound: float
    lower_bound: float

    model_config = ConfigDict(from_attributes=True)


class PredictionResponse(BaseModel):
    predictions: list[PredictionPoint]
    trend_direction: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    projected_score: int = Field(..., ge=0, le=100)

    model_config = ConfigDict(from_attributes=True)
