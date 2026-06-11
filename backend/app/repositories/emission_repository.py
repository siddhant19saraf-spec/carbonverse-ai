from typing import Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, cast, Date
from app.repositories.base import BaseRepository
from app.models.emission import EmissionRecord
from datetime import datetime, timedelta, date, timezone

NATIONAL_AVERAGES_KG_PER_DAY = {
    "transportation": 4.2,
    "food": 2.8,
    "electricity": 3.5,
    "water": 0.5,
    "waste": 1.2,
}


class EmissionRepository(BaseRepository[EmissionRecord]):
    def __init__(self, db: Session):
        super().__init__(EmissionRecord, db)

    def get_by_user(self, user_id: Any) -> List[EmissionRecord]:
        return (
            self.db.query(EmissionRecord)
            .filter(EmissionRecord.user_id == user_id)
            .order_by(EmissionRecord.recorded_at.desc())
            .all()
        )

    def get_by_user_and_category(self, user_id: Any, category: str) -> List[EmissionRecord]:
        return (
            self.db.query(EmissionRecord)
            .filter(EmissionRecord.user_id == user_id, EmissionRecord.category == category)
            .order_by(EmissionRecord.recorded_at.desc())
            .all()
        )

    def get_by_date_range(
        self, user_id: Any, date_from: datetime, date_to: datetime
    ) -> List[EmissionRecord]:
        return (
            self.db.query(EmissionRecord)
            .filter(
                EmissionRecord.user_id == user_id,
                EmissionRecord.recorded_at >= date_from,
                EmissionRecord.recorded_at <= date_to,
            )
            .order_by(EmissionRecord.recorded_at.asc())
            .all()
        )

    def get_category_breakdown(self, user_id: Any) -> Dict[str, float]:
        rows = (
            self.db.query(
                EmissionRecord.category,
                func.sum(EmissionRecord.carbon_footprint).label("total"),
            )
            .filter(EmissionRecord.user_id == user_id)
            .group_by(EmissionRecord.category)
            .all()
        )
        return {row.category: float(row.total) for row in rows}

    def get_daily_totals(self, user_id: Any, days: int) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(days=days)
        rows = (
            self.db.query(
                cast(EmissionRecord.recorded_at, Date).label("day"),
                func.sum(EmissionRecord.carbon_footprint).label("total"),
            )
            .filter(
                EmissionRecord.user_id == user_id,
                EmissionRecord.recorded_at >= cutoff,
            )
            .group_by("day")
            .order_by("day")
            .all()
        )
        return [{"date": row.day.isoformat(), "total": float(row.total)} for row in rows]

    def get_weekly_totals(self, user_id: Any, weeks: int) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(weeks=weeks)
        rows = (
            self.db.query(
                extract("year", EmissionRecord.recorded_at).label("year"),
                extract("week", EmissionRecord.recorded_at).label("week"),
                func.sum(EmissionRecord.carbon_footprint).label("total"),
            )
            .filter(
                EmissionRecord.user_id == user_id,
                EmissionRecord.recorded_at >= cutoff,
            )
            .group_by("year", "week")
            .order_by("year", "week")
            .all()
        )
        return [
            {"year": int(row.year), "week": int(row.week), "total": float(row.total)}
            for row in rows
        ]

    def get_monthly_totals(self, user_id: Any, months: int) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(days=months * 30)
        rows = (
            self.db.query(
                extract("year", EmissionRecord.recorded_at).label("year"),
                extract("month", EmissionRecord.recorded_at).label("month"),
                func.sum(EmissionRecord.carbon_footprint).label("total"),
            )
            .filter(
                EmissionRecord.user_id == user_id,
                EmissionRecord.recorded_at >= cutoff,
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )
        return [
            {"year": int(row.year), "month": int(row.month), "total": float(row.total)}
            for row in rows
        ]

    def get_total_by_user(self, user_id: Any) -> float:
        result = (
            self.db.query(func.sum(EmissionRecord.carbon_footprint))
            .filter(EmissionRecord.user_id == user_id)
            .scalar()
        )
        return float(result) if result else 0.0

    def get_average_daily_emission(self, user_id: Any) -> float:
        total = self.get_total_by_user(user_id)
        count = (
            self.db.query(func.count(func.distinct(cast(EmissionRecord.recorded_at, Date))))
            .filter(EmissionRecord.user_id == user_id)
            .scalar()
        )
        if not count:
            return 0.0
        return round(total / count, 2)

    def get_national_category_averages(self) -> Dict[str, float]:
        return NATIONAL_AVERAGES_KG_PER_DAY
