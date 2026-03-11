import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import require_admin
from app.core.logs import get_last_n_lines
from app.models.settings import SystemSettings
from app.schemas.settings import SystemSettingsOut, SystemSettingsUpdate

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])

@router.get("", response_model=SystemSettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Récupère les paramètres globaux du système."""
    settings = db.query(SystemSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Paramètres non trouvés")
    return settings

@router.patch("", response_model=SystemSettingsOut)
def update_settings(
    obj_in: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    """Met à jour les paramètres globaux (proxies, scraper, intervalle)."""
    settings = db.query(SystemSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Paramètres non trouvés")

    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/logs/{service}")
def get_service_logs(
    service: str,
    lines: int = 100,
    _admin = Depends(require_admin)
):
    """
    Récupère les dernières lignes de log pour un service donné.
    Services disponibles : 'backend', 'scraper'.
    """
    if service == "scraper":
        log_file = "logs/scraper.log"
    elif service == "backend":
        # Note: Backend might need specific logging config to write to file
        log_file = "logs/backend.log"
    else:
        raise HTTPException(status_code=400, detail="Service invalide")
    
    # In container, logs are in /app/logs/
    # If path doesn't exist, we might be running locally
    if not os.path.exists(log_file):
        # Fallback for local dev if logs/ is in root
        log_file = os.path.join(os.getcwd(), log_file)
        
    return {"logs": get_last_n_lines(log_file, lines)}
