from typing import Optional, List, Any, Dict
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.audit_log import AuditLog
from datetime import datetime, timezone


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def log_action(
        self,
        user_id: Any,
        action: str,
        resource: str,
        resource_id: Any = None,
        details: Optional[Dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=str(resource_id) if resource_id else None,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_by_user(self, user_id: Any) -> List[AuditLog]:
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.user_id == user_id)
            .order_by(AuditLog.created_at.desc())
            .all()
        )

    def get_recent_actions(self, limit: int = 50) -> List[AuditLog]:
        return (
            self.db.query(AuditLog)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_resource(self, resource: str, resource_id: Any) -> List[AuditLog]:
        return (
            self.db.query(AuditLog)
            .filter(
                AuditLog.resource == resource,
                AuditLog.resource_id == str(resource_id),
            )
            .order_by(AuditLog.created_at.desc())
            .all()
        )
