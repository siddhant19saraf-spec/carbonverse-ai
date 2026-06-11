from datetime import datetime, timedelta, date, timezone
from sqlalchemy.orm import Session
from app.repositories.emission_repository import EmissionRepository
from app.schemas.prediction import PredictionPoint, PredictionResponse


class PredictionService:
    def __init__(self, db: Session):
        self.db = db
        self.emission_repo = EmissionRepository(db)

    def _linear_regression(self, x_values: list[float], y_values: list[float]) -> tuple[float, float]:
        n = len(x_values)
        if n < 2:
            return (y_values[0] if y_values else 0, 0)
        sum_x = sum(x_values)
        sum_y = sum(y_values)
        sum_xy = sum(x * y for x, y in zip(x_values, y_values))
        sum_x2 = sum(x * x for x in x_values)

        denominator = n * sum_x2 - sum_x * sum_x
        if abs(denominator) < 1e-10:
            return (sum_y / n, 0)
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        intercept = (sum_y - slope * sum_x) / n
        return (intercept, slope)

    def predict_emissions(self, user_id: str, months_ahead: int = 3) -> PredictionResponse:
        daily_totals = self.emission_repo.get_daily_totals(user_id, 90)

        if not daily_totals:
            now = datetime.now(timezone.utc)
            return PredictionResponse(
                predictions=[],
                trend_direction="stable",
                confidence_score=0.0,
                projected_score=50,
            )

        x_vals = list(range(len(daily_totals)))
        y_vals = [d["total"] for d in daily_totals]
        intercept, slope = self._linear_regression(x_vals, y_vals)

        y_mean = sum(y_vals) / len(y_vals)
        ss_res = sum((y - (intercept + slope * x)) ** 2 for x, y in zip(x_vals, y_vals))
        ss_tot = sum((y - y_mean) ** 2 for y in y_vals)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        confidence = max(0.0, min(1.0, r_squared))

        if slope < -0.01:
            trend = "decreasing"
        elif slope > 0.01:
            trend = "increasing"
        else:
            trend = "stable"

        predictions = []
        start_date = datetime.now(timezone.utc).date()
        for day_offset in range(1, months_ahead * 30 + 1, 30):
            future_x = len(daily_totals) + day_offset
            predicted = intercept + slope * future_x
            noise = predicted * 0.1
            predictions.append(PredictionPoint(
                date=start_date + timedelta(days=day_offset),
                predicted_value=round(max(0, predicted), 2),
                upper_bound=round(max(0, predicted + noise), 2),
                lower_bound=round(max(0, predicted - noise), 2),
            ))

        national_avg = 12.2
        projected_total = sum(p.predicted_value for p in predictions) if predictions else 0
        projected_monthly = projected_total / months_ahead if months_ahead > 0 else 0
        projected_score = max(0, min(100, int(100 - (projected_monthly / national_avg) * 100)))

        return PredictionResponse(
            predictions=predictions,
            trend_direction=trend,
            confidence_score=round(confidence, 2),
            projected_score=projected_score,
        )
