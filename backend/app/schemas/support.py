from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.support import TicketStatus, TicketPriority


class SupportMessageCreate(BaseModel):
    message: str


class SupportMessageOut(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    message: str
    is_admin_reply: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    subject: str = Field(..., max_length=255)
    initial_message: str
    priority: TicketPriority = TicketPriority.medium


class SupportTicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None


class SupportTicketOut(BaseModel):
    id: int
    user_id: int
    subject: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupportTicketDetailOut(SupportTicketOut):
    messages: List[SupportMessageOut] = []

    class Config:
        from_attributes = True
