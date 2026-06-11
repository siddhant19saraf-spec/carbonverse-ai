from typing import Optional, List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.achievement import Achievement, UserAchievement
from datetime import datetime, timezone


class AchievementRepository(BaseRepository[Achievement]):
    def __init__(self, db: Session):
        super().__init__(Achievement, db)

    def get_user_achievements(self, user_id: Any) -> List[UserAchievement]:
        return (
            self.db.query(UserAchievement)
            .filter(UserAchievement.user_id == user_id)
            .all()
        )

    def unlock_achievement(self, user_id: Any, achievement_id: Any) -> UserAchievement:
        existing = (
            self.db.query(UserAchievement)
            .filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id,
            )
            .first()
        )
        if existing:
            return existing

        ua = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id,
            unlocked_at=datetime.now(timezone.utc),
        )
        self.db.add(ua)
        self.db.commit()
        self.db.refresh(ua)
        return ua

    def check_and_award_achievements(self, user_id: Any, score: int) -> List[Achievement]:
        all_achievements = self.db.query(Achievement).all()
        awarded = []
        for ach in all_achievements:
            existing = (
                self.db.query(UserAchievement)
                .filter(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == ach.id,
                )
                .first()
            )
            if not existing and score >= ach.threshold_score:
                self.unlock_achievement(user_id, ach.id)
                awarded.append(ach)
        return awarded

    def get_achievement_count(self, user_id: Any) -> int:
        return (
            self.db.query(func.count(UserAchievement.id))
            .filter(UserAchievement.user_id == user_id)
            .scalar()
            or 0
        )

    def get_all_achievements(self) -> List[Achievement]:
        return self.db.query(Achievement).all()


from sqlalchemy import func
