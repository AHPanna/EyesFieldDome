from pydantic import BaseModel
from datetime import datetime

class SystemSettingsBase(BaseModel):
    scraper_enabled: bool
    scraping_interval_minutes: int
    proxy_list: list[str]

class SystemSettingsOut(SystemSettingsBase):
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemSettingsUpdate(BaseModel):
    scraper_enabled: bool | None = None
    scraping_interval_minutes: int | None = None
    proxy_list: list[str] | None = None
