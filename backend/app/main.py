from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, SessionLocal
from app.database import Base
from app.api import auth, users, alerts, slots, admin, prefectures
from app.core.security import get_password_hash
from app.models.user import User, UserRole

# Import all models so that Base knows about them for table creation
from app.models import user, prefecture, alert, slot, notification  # noqa: F401


def seed_database():
    """Create tables and seed initial data on startup."""
    Base.metadata.create_all(bind=engine)
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


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
