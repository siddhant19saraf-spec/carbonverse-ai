from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, text, cast, Date
from app.models.user import User
from app.models.emission import EmissionRecord
from app.models.achievement import UserAchievement
from app.models.challenge import UserChallenge
from app.schemas.admin import UserAnalytics, PlatformMetrics, EmissionAnalytics, SystemHealth


class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_analytics(self) -> UserAnalytics:
        total = self.db.query(func.count(User.id)).scalar() or 0
        active = self.db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
        today = datetime.now(timezone.utc).date()
        new_today = self.db.query(func.count(User.id)).filter(
            func.date(User.created_at) == today
        ).scalar() or 0
        verified = self.db.query(func.count(User.id)).filter(User.is_verified == True).scalar() or 0

        return UserAnalytics(
            total_users=total,
            active_users=active,
            new_users_today=new_today,
            verified_users=verified,
        )

    def get_platform_metrics(self) -> PlatformMetrics:
        total_emissions = self.db.query(func.sum(EmissionRecord.carbon_footprint)).scalar() or 0
        avg_score = self.db.query(func.avg(User.sustainability_score)).scalar() or 0
        total_achievements = self.db.query(func.count(UserAchievement.id)).scalar() or 0
        total_completed_challenges = self.db.query(func.count(UserChallenge.id)).filter(
            UserChallenge.completed == True
        ).scalar() or 0

        return PlatformMetrics(
            total_emissions_recorded=round(float(total_emissions), 2),
            avg_sustainability_score=round(float(avg_score), 1),
            total_achievements_unlocked=total_achievements,
            total_challenges_completed=total_completed_challenges,
        )

    def get_emission_analytics(self) -> EmissionAnalytics:
        category_totals = {}
        rows = (
            self.db.query(
                EmissionRecord.category,
                func.sum(EmissionRecord.carbon_footprint),
            )
            .group_by(EmissionRecord.category)
            .all()
        )
        for category, total in rows:
            category_totals[category] = round(float(total), 2)

        now = datetime.now(timezone.utc)
        daily_totals = []
        for i in range(30):
            day = (now - timedelta(days=i)).date()
            day_total = (
                self.db.query(func.sum(EmissionRecord.carbon_footprint))
                .filter(cast(EmissionRecord.recorded_at, Date) == day)
                .scalar()
                or 0
            )
            daily_totals.append({"date": day.isoformat(), "total": round(float(day_total), 2)})

        monthly_trend = []
        for i in range(12):
            month_date = now - timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            month_total = (
                self.db.query(func.sum(EmissionRecord.carbon_footprint))
                .filter(
                    EmissionRecord.recorded_at >= month_start,
                    EmissionRecord.recorded_at < month_start + timedelta(days=30),
                )
                .scalar()
                or 0
            )
            monthly_trend.append({
                "month": month_start.strftime("%Y-%m"),
                "total": round(float(month_total), 2),
            })

        return EmissionAnalytics(
            total_by_category=category_totals,
            daily_totals=daily_totals,
            monthly_trend=monthly_trend,
        )

    def get_system_health(self) -> SystemHealth:
        try:
            self.db.execute(text("SELECT 1"))
            db_status = "healthy"
        except Exception:
            db_status = "unhealthy"

        return SystemHealth(
            status="healthy" if db_status == "healthy" else "degraded",
            uptime="running",
            db_connections=1,
            active_sessions=0,
        )
