import logging
from sqlalchemy.orm import Session
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.repositories.user_repository import UserRepository
from app.repositories.audit_log_repository import AuditLogRepository

logger = logging.getLogger(__name__)


class AuthenticationError(Exception):
    def __init__(self, detail: str):
        self.detail = detail


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditLogRepository(db)

    def register(self, email: str, username: str, password: str, full_name: str | None = None):
        if len(password) < 6:
            raise AuthenticationError("Password must be at least 6 characters")
        if self.user_repo.get_by_email(email):
            raise AuthenticationError("Email already registered")
        if self.user_repo.get_by_username(username):
            raise AuthenticationError("Username already taken")

        user = self.user_repo.create({
            "email": email,
            "username": username,
            "hashed_password": get_password_hash(password),
            "full_name": full_name,
            "role": "user",
            "is_active": True,
            "is_verified": False,
            "sustainability_score": 0,
            "carbon_saved": 0.0,
            "green_level": 1,
            "streak_days": 0,
        })
        logger.info(f"New user registered: {username} ({email})")
        self.audit_repo.log_action(user.id, "register", "user", user.id, {}, None, None)
        return user

    def authenticate(self, email: str, password: str):
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid credentials")
        if not user.is_active:
            raise AuthenticationError("Account disabled")
        logger.info(f"User authenticated: {email}")
        return user

    def create_tokens(self, user) -> dict:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        self.audit_repo.log_action(
            user.id, "login", "user", user.id,
            {"access_token_issued": True}, None, None
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    def refresh_token(self, refresh_token_str: str) -> dict:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise AuthenticationError("Invalid refresh token")

        user = self.user_repo.get(payload.get("sub"))
        if not user or not user.is_active:
            raise AuthenticationError("Invalid user")

        return self.create_tokens(user)

    def change_password(self, user_id: str, old_password: str, new_password: str):
        if len(new_password) < 6:
            raise AuthenticationError("New password must be at least 6 characters")
        user = self.user_repo.get(user_id)
        if not user or not verify_password(old_password, user.hashed_password):
            raise AuthenticationError("Incorrect password")
        self.user_repo.update(user, {"hashed_password": get_password_hash(new_password)})
        logger.info(f"Password changed for user: {user_id}")
        self.audit_repo.log_action(
            user.id, "password_change", "user", user.id, {}, None, None
        )
