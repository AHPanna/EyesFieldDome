from datetime import datetime, date, time
from sqlalchemy import String, DateTime, Date, Time, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Slot(Base):
    __tablename__ = "slots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    prefecture_id: Mapped[int] = mapped_column(ForeignKey("prefectures.id"), nullable=False)
    procedure_type: Mapped[str] = mapped_column(String(100), nullable=False)
    available_date: Mapped[date] = mapped_column(Date, nullable=False)
    available_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    is_still_available: Mapped[bool] = mapped_column(default=True, nullable=False)

    prefecture: Mapped["Prefecture"] = relationship("Prefecture", back_populates="slots")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="slot")
