from datetime import datetime
from pydantic import BaseModel
from app.models.transaction import TransactionStatus


class TransactionBase(BaseModel):
    amount_cents: int
    credits_added: int


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int
    user_id: int
    status: TransactionStatus
    provider_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CreditPack(BaseModel):
    id: str
    name: str
    credits: int
    price_cents: int
