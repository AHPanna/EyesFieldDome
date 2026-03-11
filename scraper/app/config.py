from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "RDV Préfecture API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://rdv:rdv@localhost:5432/rdv_prefecture"

    # JWT
    SECRET_KEY: str = "change-me-in-production-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 heures

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # First admin account (auto-created on startup)
    FIRST_ADMIN_EMAIL: str = "admin@rdv-prefecture.fr"
    FIRST_ADMIN_PASSWORD: str = "Admin1234!"

    class Config:
        env_file = ".env"


settings = Settings()
