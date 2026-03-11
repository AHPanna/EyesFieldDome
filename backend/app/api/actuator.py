from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
import time

router = APIRouter(prefix="/actuator", tags=["Actuator"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify API and Database status.
    """
    start_time = time.time()
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        db_status = "UP"
    except Exception as e:
        db_status = f"DOWN: {str(e)}"
    
    latency_ms = round((time.time() - start_time) * 1000, 2)
    
    return {
        "status": "UP" if db_status == "UP" else "DEGRADED",
        "components": {
            "api": "UP",
            "database": db_status
        },
        "details": {
            "database_latency_ms": latency_ms
        }
    }

@router.get("/info")
def info():
    """
    Basic information about the application.
    """
    from app.config import settings
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": "production" if not settings.DEBUG else "development"
    }
