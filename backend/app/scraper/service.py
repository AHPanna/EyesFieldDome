import asyncio
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.alert import Alert
from app.models.prefecture import Prefecture
from app.models.slot import Slot
from app.models.notification import Notification
from app.scraper.rdv_nationale import RDVNationaleScraper
from datetime import datetime

class ScraperService:
    def __init__(self):
        self.scrapers = {
            "rdv_nationale": RDVNationaleScraper()
        }

    async def run_once(self):
        """Runs one round of scraping for all active prefectures in alerts."""
        db = SessionLocal()
        try:
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

                print(f"Checking availability for: {pref.name}")
                slots = await scraper.check_availability(pref.url)
                
                if slots:
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
                            notif = Notification(
                                user_id=alert.user_id,
                                alert_id=alert.id,
                                slot_id=new_slot.id,
                                channel="email" if alert.notif_email else "sms",
                                status="pending"
                            )
                            db.add(notif)
            
            db.commit()
        except Exception as e:
            print(f"Error in ScraperService: {e}")
            db.rollback()
        finally:
            db.close()

    async def start_loop(self, interval_seconds: int = 300):
        """Starts the background loop."""
        while True:
            await self.run_once()
            await asyncio.sleep(interval_seconds)

scraper_service = ScraperService()
