import asyncio
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.alert import Alert
from app.models.prefecture import Prefecture
from app.models.slot import Slot
from app.models.notification import Notification, NotificationChannel, NotificationStatus
from app.core.notifications import notification_service
from app.models.user import User
from datetime import datetime
from prometheus_client import Counter, Summary
from app.models.settings import SystemSettings

# Metrics
SCRAPE_REQUESTS = Counter("scraper_requests_total", "Total scraping requests", ["prefecture", "status"])
SCRAPE_DURATION = Summary("scraper_duration_seconds", "Time spent scraping", ["prefecture"])
SLOTS_FOUND = Counter("scraper_slots_found_total", "Total slots found", ["prefecture"])

class ScraperService:
    def __init__(self):
        self.scrapers = {
            "rdv_nationale": RDVNationaleScraper()
        }

    async def run_once(self):
        """Runs one round of scraping for all active prefectures in alerts."""
        db = SessionLocal()
        try:
            # Fetch global settings
            settings = db.query(SystemSettings).first()
            if not settings or not settings.scraper_enabled:
                print("Scraper is disabled globally. Skipping...")
                return

            # Find all prefectures that have active alerts
            active_prefectures = (
                db.query(Prefecture)
                .join(Alert)
                .filter(Alert.is_active == True)
                .distinct()
                .all()
            )

            for pref in active_prefectures:
                scraper = self.scrapers.get(pref.scraper_type)
                if not scraper:
                    print(f"No scraper found for type: {pref.scraper_type}")
                    continue

                # Update scraper proxies from DB
                scraper.proxies = settings.proxies

                print(f"Checking availability for: {pref.name}")
                with SCRAPE_DURATION.labels(prefecture=pref.name).time():
                    try:
                        SCRAPE_REQUESTS.labels(prefecture=pref.name, status="started").inc()
                        slots = await scraper.check_availability(pref.url)
                        SCRAPE_REQUESTS.labels(prefecture=pref.name, status="success").inc()
                    except Exception as e:
                        SCRAPE_REQUESTS.labels(prefecture=pref.name, status="error").inc()
                        print(f"Error scraping {pref.name}: {e}")
                        continue
                
                if slots:
                    SLOTS_FOUND.labels(prefecture=pref.name).inc(len(slots))
                    print(f"Found {len(slots)} slots for {pref.name}!")
                    for s in slots:
                        # Save the slot to DB
                        new_slot = Slot(
                            prefecture_id=pref.id,
                            available_date=datetime.strptime(s["date"], "%Y-%m-%d").date(),
                            available_time=s.get("time"),
                            procedure_type="titre_sejour",  # Simplified for demo
                            detected_at=datetime.now()
                        )
                        db.add(new_slot)
                        db.flush() # Get slot ID

                        # Notify users with active alerts for this prefecture
                        matching_alerts = db.query(Alert).filter(
                            Alert.prefecture_id == pref.id,
                            Alert.is_active == True
                            # Add procedure_type filter in production
                        ).all()

                        for alert in matching_alerts:
                            user = db.query(User).filter(User.id == alert.user_id).first()
                            if not user:
                                continue
                                
                            if alert.notif_email:
                                await notification_service.send_email(
                                    user=user,
                                    subject=f"Nouveau créneau disponible à {pref.name} !",
                                    content=f"Un créneau a été détecté pour le {new_slot.available_date}.",
                                    db=db,
                                    alert_id=alert.id,
                                    slot_id=new_slot.id
                                )
                            
                            if alert.notif_sms:
                                await notification_service.send_sms(
                                    user=user,
                                    message=f"RDV Préfecture: Nouveau créneau disponible à {pref.name} pour le {new_slot.available_date}.",
                                    db=db,
                                    alert_id=alert.id,
                                    slot_id=new_slot.id
                                )
            
            db.commit()
        except Exception as e:
            print(f"Error in ScraperService: {e}")
            db.rollback()
        finally:
            db.close()

    async def start_loop(self, default_interval_seconds: int = 600):
        """Starts the background loop."""
        while True:
            await self.run_once()
            
            # Fetch interval from settings
            db = SessionLocal()
            try:
                settings = db.query(SystemSettings).first()
                # interval from DB is in minutes, convert to seconds
                interval = (settings.scraping_interval_minutes * 60) if settings else default_interval_seconds
            except:
                interval = default_interval_seconds
            finally:
                db.close()
                
            await asyncio.sleep(interval)

scraper_service = ScraperService()
