from typing import Optional, List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.sustainability_goal import SustainabilityGoal
from datetime import datetime, timezone


class SustainabilityGoalRepository(BaseRepository[SustainabilityGoal]):
    def __init__(self, db: Session):
        super().__init__(SustainabilityGoal, db)

    def get_by_user(self, user_id: Any) -> List[SustainabilityGoal]:
        return (
            self.db.query(SustainabilityGoal)
            .filter(SustainabilityGoal.user_id == user_id)
            .order_by(SustainabilityGoal.created_at.desc())
            .all()
        )

    def get_active_goals(self, user_id: Any) -> List[SustainabilityGoal]:
        return (
            self.db.query(SustainabilityGoal)
            .filter(
                SustainabilityGoal.user_id == user_id,
                SustainabilityGoal.is_completed == False,
            )
            .all()
        )

    def update_progress(self, user_id: Any, goal_id: Any, reduction: float) -> SustainabilityGoal:
        goal = (
            self.db.query(SustainabilityGoal)
            .filter(
                SustainabilityGoal.id == goal_id,
                SustainabilityGoal.user_id == user_id,
            )
            .first()
        )
        if not goal:
            raise ValueError("Goal not found")

        goal.current_reduction += reduction
        if goal.current_reduction >= goal.target_carbon_reduction:
            goal.is_completed = True
        goal.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def mark_complete(self, user_id: Any, goal_id: Any) -> SustainabilityGoal:
        goal = (
            self.db.query(SustainabilityGoal)
            .filter(
                SustainabilityGoal.id == goal_id,
                SustainabilityGoal.user_id == user_id,
            )
            .first()
        )
        if not goal:
            raise ValueError("Goal not found")

        goal.is_completed = True
        goal.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_completed_goals_count(self, user_id: Any) -> int:
        from sqlalchemy import func
        return (
            self.db.query(func.count(SustainabilityGoal.id))
            .filter(
                SustainabilityGoal.user_id == user_id,
                SustainabilityGoal.is_completed == True,
            )
            .scalar()
            or 0
        )
