import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class NotificationChannel(str, enum.Enum):
    email = "email"
    sms = "sms"
    push = "push"


class NotificationStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"), nullable=False)
    slot_id: Mapped[int | None] = mapped_column(ForeignKey("slots.id"), nullable=True)
    channel: Mapped[NotificationChannel] = mapped_column(Enum(NotificationChannel), nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(Enum(NotificationStatus), default=NotificationStatus.pending, nullable=False)
    message: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    sent_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
    alert: Mapped["Alert"] = relationship("Alert", back_populates="notifications")
    slot: Mapped["Slot"] = relationship("Slot", back_populates="notifications")
