from datetime import datetime, date
from pydantic import BaseModel
from app.models.alert import ProcedureType


class AlertCreate(BaseModel):
    prefecture_id: int
    procedure_type: ProcedureType
    date_from: date
    date_to: date
    notif_email: bool = True
    notif_sms: bool = False
    phone_number: str | None = None


class AlertUpdate(BaseModel):
    procedure_type: ProcedureType | None = None
    date_from: date | None = None
    date_to: date | None = None
    is_active: bool | None = None
    notif_email: bool | None = None
    notif_sms: bool | None = None
    phone_number: str | None = None


class PrefectureOut(BaseModel):
    id: int
    name: str
    department: str
    city: str

    model_config = {"from_attributes": True}


class AlertOut(BaseModel):
    id: int
    user_id: int
    prefecture: PrefectureOut
    procedure_type: ProcedureType
    date_from: date
    date_to: date
    is_active: bool
    notif_email: bool
    notif_sms: bool
    phone_number: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
