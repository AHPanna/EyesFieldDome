import json
from datetime import datetime
from sqlalchemy import String, Boolean, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class SystemSettings(Base):
    """
    Global system settings stored in the database.
    Allows admin to change proxy lists, scraper status, etc., without redeploying.
    """
    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Scraper control
    scraper_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    scraping_interval_minutes: Mapped[int] = mapped_column(default=10)
    
    # Proxies stored as a JSON list of strings
    # Format: ["http://proxy1:8080", "http://proxy2:8080"]
    proxy_list: Mapped[list] = mapped_column(JSON, default=list)
    
    # Last updated info
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    @property
    def proxies(self) -> list[str]:
        return self.proxy_list or []
