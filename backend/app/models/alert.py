import enum
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, ForeignKey, Enum, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class ProcedureType(str, enum.Enum):
    titre_sejour = "titre_sejour"
    naturalisation = "naturalisation"
    carte_grise = "carte_grise"
    passeport = "passeport"
    carte_nationale_identite = "carte_nationale_identite"
    autre = "autre"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    prefecture_id: Mapped[int] = mapped_column(ForeignKey("prefectures.id"), nullable=False)
    procedure_type: Mapped[ProcedureType] = mapped_column(Enum(ProcedureType), nullable=False)
    date_from: Mapped[date] = mapped_column(Date, nullable=False)
    date_to: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notif_email: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notif_sms: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="alerts")
    prefecture: Mapped["Prefecture"] = relationship("Prefecture", back_populates="alerts")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="alert", cascade="all, delete-orphan")
