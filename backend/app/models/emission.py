import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum as SAEnum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class EmissionCategory(str, enum.Enum):
    TRANSPORTATION = "transportation"
    FOOD = "food"
    ELECTRICITY = "electricity"
    WATER = "water"
    WASTE = "waste"


class EmissionRecord(Base):
    __tablename__ = "emission_records"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category: Mapped[EmissionCategory] = mapped_column(
        SAEnum(EmissionCategory),
        nullable=False,
    )
    subcategory: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    unit: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    carbon_footprint: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="CO2 equivalent in kilograms",
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="emission_records",
    )
