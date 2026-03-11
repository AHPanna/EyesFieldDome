from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Prefecture(Base):
    __tablename__ = "prefectures"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(10), nullable=False)  # e.g. "75", "69"
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    scraper_type: Mapped[str] = mapped_column(String(100), default="rdv_nationale", nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="prefecture")
    slots: Mapped[list["Slot"]] = relationship("Slot", back_populates="prefecture", cascade="all, delete-orphan")
