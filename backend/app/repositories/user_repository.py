from typing import Optional, List
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.models.user import User
from datetime import datetime, timezone


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_active_users(self) -> List[User]:
        return self.db.query(User).filter(User.is_active).all()

    def get_users_by_role(self, role: str) -> List[User]:
        return self.db.query(User).filter(User.role == role).all()

    def update_sustainability_score(self, user_id: uuid.UUID, score: int):
        user = self.get(user_id)
        if user:
            self.update(user, {"sustainability_score": score})

    def update_green_level(self, user_id: uuid.UUID, level: int):
        user = self.get(user_id)
        if user:
            self.update(user, {"green_level": level})

    def update_streak(self, user_id: uuid.UUID, streak: int):
        user = self.get(user_id)
        if user:
            self.update(user, {"streak_days": streak})

    def get_user_count(self) -> int:
        return self.db.query(func.count(User.id)).scalar() or 0

    def get_new_users_today(self) -> int:
        today = datetime.now(timezone.utc).date()
        return self.db.query(func.count(User.id)).filter(
            func.date(User.created_at) == today
        ).scalar() or 0
