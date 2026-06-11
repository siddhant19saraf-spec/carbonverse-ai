from typing import Optional, List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.challenge import Challenge, UserChallenge
from datetime import datetime, timezone


class ChallengeRepository(BaseRepository[Challenge]):
    def __init__(self, db: Session):
        super().__init__(Challenge, db)

    def get_active_challenges(self) -> List[Challenge]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(Challenge)
            .filter(Challenge.is_active == True, Challenge.starts_at <= now, Challenge.ends_at >= now)
            .all()
        )

    def get_user_challenges(self, user_id: Any) -> List[UserChallenge]:
        return (
            self.db.query(UserChallenge)
            .filter(UserChallenge.user_id == user_id)
            .all()
        )

    def join_challenge(self, user_id: Any, challenge_id: Any) -> UserChallenge:
        existing = (
            self.db.query(UserChallenge)
            .filter(
                UserChallenge.user_id == user_id,
                UserChallenge.challenge_id == challenge_id,
            )
            .first()
        )
        if existing:
            return existing

        uc = UserChallenge(
            user_id=user_id,
            challenge_id=challenge_id,
            progress=0,
            completed=False,
            started_at=datetime.now(timezone.utc),
        )
        self.db.add(uc)
        self.db.commit()
        self.db.refresh(uc)
        return uc

    def update_progress(self, user_id: Any, challenge_id: Any, progress: float) -> UserChallenge:
        uc = (
            self.db.query(UserChallenge)
            .filter(
                UserChallenge.user_id == user_id,
                UserChallenge.challenge_id == challenge_id,
            )
            .first()
        )
        if not uc:
            raise ValueError("User challenge not found")

        uc.progress = progress
        challenge = self.get(challenge_id)
        if challenge and progress >= challenge.goal_value:
            uc.completed = True
            uc.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(uc)
        return uc

    def complete_challenge(self, user_id: Any, challenge_id: Any) -> UserChallenge:
        return self.update_progress(user_id, challenge_id, 100.0)
