from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    full_name: str | None = None
    profile_image: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None
    credits: int | None = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    profile_image: str | None = None
    role: UserRole
    is_active: bool
    credits: int
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginForm(BaseModel):
    email: EmailStr
    password: str
