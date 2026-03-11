import os
import asyncio
import logging
from logging.handlers import RotatingFileHandler
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        RotatingFileHandler("logs/backend.log", maxBytes=10*1024*1024, backupCount=5)
    ]
)

logger = logging.getLogger("backend")
from app.database import engine, SessionLocal
from app.database import Base
from app.api import auth, users, alerts, slots, admin, prefectures, credits, settings as settings_api, support, actuator
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from prometheus_fastapi_instrumentator import Instrumentator

# Import all models so that Base knows about them for table creation
from app.models import user, prefecture, alert, slot, notification, transaction, support as support_models, settings as settings_models, credits as credits_models  # noqa: F401
from sqlalchemy import text


def seed_database():
    """Create tables and seed initial data on startup."""
    Base.metadata.create_all(bind=engine)
    
    # Manual schema update for Phase 2 (since Base.metadata.create_all doesn't update columns)
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 5 NOT NULL"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255)"))
        conn.commit()

    db = SessionLocal()
    try:
        # Create admin user if not exists
        admin_user = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                full_name="Administrateur",
                role=UserRole.admin,
            )
            db.add(admin_user)

        # Create default system settings if not exists
        from app.models.settings import SystemSettings
        if db.query(SystemSettings).count() == 0:
            default_settings = SystemSettings(
                scraper_enabled=True,
                scraping_interval_minutes=10,
                proxy_list=[]
            )
            db.add(default_settings)

        # Seed some prefectures if none exist
        from app.models.prefecture import Prefecture
        if db.query(Prefecture).count() == 0:
            prefectures_data = [
                {"name": "Préfecture de Paris", "department": "75", "city": "Paris", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/3/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture du Rhône", "department": "69", "city": "Lyon", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/8/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture des Bouches-du-Rhône", "department": "13", "city": "Marseille", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/10/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture de la Haute-Garonne", "department": "31", "city": "Toulouse", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/12/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture du Nord", "department": "59", "city": "Lille", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/15/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture des Alpes-Maritimes", "department": "06", "city": "Nice", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/11/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture de la Gironde", "department": "33", "city": "Bordeaux", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/9/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture du Val-de-Marne", "department": "94", "city": "Créteil", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/5/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture de Seine-Saint-Denis", "department": "93", "city": "Bobigny", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/4/creneau/", "scraper_type": "rdv_nationale"},
                {"name": "Préfecture du Bas-Rhin", "department": "67", "city": "Strasbourg", "url": "https://www.rdv-prefecture.interieur.gouv.fr/rdvpref/reservation/demarche/14/creneau/", "scraper_type": "rdv_nationale"},
            ]
            for p in prefectures_data:
                db.add(Prefecture(**p))

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(alerts.router)
app.include_router(slots.router)
app.include_router(admin.router)
app.include_router(prefectures.router)
app.include_router(credits.router)
app.include_router(settings_api.router)
app.include_router(support.router)
app.include_router(actuator.router)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
