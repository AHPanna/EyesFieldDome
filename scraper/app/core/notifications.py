import logging
import os
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.notification import Notification, NotificationChannel, NotificationStatus

logger = logging.getLogger("notifications")

# Notification Costs (configurable via code or DB later)
CREDIT_COSTS = {
    NotificationChannel.email: 0,  # Email is often free or low cost
    NotificationChannel.sms: 2,    # SMS usually costs more
}

class NotificationService:
    @staticmethod
    async def send_email(user: User, subject: str, content: str, db: Session, alert_id: int, slot_id: int) -> bool:
        """
        Sends an email and records the notification.
        """
        # Logic for Mailgun / Sendgrid would go here
        logger.info(f"Sending Email to {user.email}: {subject}")
        
        # Deduction of credits if any
        cost = CREDIT_COSTS.get(NotificationChannel.email, 0)
        if user.credits < cost:
            logger.warning(f"User {user.email} has insufficient credits for Email notification")
            return False
        
        # Mock success
        success = True 
        
        if success:
            user.credits -= cost
            notif = Notification(
                user_id=user.id,
                alert_id=alert_id,
                slot_id=slot_id,
                channel=NotificationChannel.email,
                status=NotificationStatus.sent
            )
            db.add(notif)
            db.add(user)
            db.commit()
            return True
        return False

    @staticmethod
    async def send_sms(user: User, message: str, db: Session, alert_id: int, slot_id: int) -> bool:
        """
        Sends an SMS and records the notification.
        """
        # Logic for Twilio / Vonage would go here
        logger.info(f"Sending SMS to {user.email}: {message}")
        
        cost = CREDIT_COSTS.get(NotificationChannel.sms, 2)
        if user.credits < cost:
            logger.warning(f"User {user.email} has insufficient credits for SMS notification")
            return False
            
        # Mock success (only if SMS is enabled / planned)
        success = True
        
        if success:
            user.credits -= cost
            notif = Notification(
                user_id=user.id,
                alert_id=alert_id,
                slot_id=slot_id,
                channel=NotificationChannel.sms,
                status=NotificationStatus.sent
            )
            db.add(notif)
            db.add(user)
            db.commit()
            return True
        return False

notification_service = NotificationService()
