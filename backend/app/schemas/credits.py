from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


class CreditLogOut(BaseModel):
    id: int
    user_id: int
    amount: int
    operation: str
    created_at: datetime

    class Config:
        from_attributes = True


class CouponCreate(BaseModel):
    code: str = Field(..., max_length=50)
    credits: int = Field(..., gt=0)
    max_uses: int = Field(default=1, ge=1)


class CouponUpdate(BaseModel):
    credits: Optional[int] = Field(None, gt=0)
    max_uses: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class CouponOut(BaseModel):
    id: int
    code: str
    credits: int
    max_uses: int
    current_uses: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CouponUsageOut(BaseModel):
    id: int
    coupon_id: int
    user_id: int
    used_at: datetime
    user_email: Optional[str] = None
    coupon_code: Optional[str] = None

    class Config:
        from_attributes = True


class CouponRedeem(BaseModel):
    code: str
