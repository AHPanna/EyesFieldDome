from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.core.deps import require_admin
from app.models.user import User, UserRole
from app.models.alert import Alert
from app.models.slot import Slot
from app.models.prefecture import Prefecture
from app.schemas.user import UserOut, UserUpdate
from app.schemas.alert import AlertOut

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    active_alerts = db.query(func.count(Alert.id)).filter(Alert.is_active == True).scalar()
    total_slots_detected = db.query(func.count(Slot.id)).scalar()
    available_slots = db.query(func.count(Slot.id)).filter(Slot.is_still_available == True).scalar()
    total_prefectures = db.query(func.count(Prefecture.id)).filter(Prefecture.is_active == True).scalar()
    return {
        "total_users": total_users,
        "active_alerts": active_alerts,
        "total_slots_detected": total_slots_detected,
        "available_slots": available_slots,
        "total_prefectures": total_prefectures,
    }


@router.get("/users", response_model=list[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.id == current_admin.id and payload.role == UserRole.user:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous rétrograder vous-même")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/alerts", response_model=list[AlertOut])
def list_all_alerts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/prefectures")
def list_prefectures(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Prefecture).order_by(Prefecture.department.asc()).all()


@router.post("/prefectures", status_code=status.HTTP_201_CREATED)
def create_prefecture(
    name: str,
    department: str,
    city: str,
    url: str,
    scraper_type: str = "rdv_nationale",
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    pref = Prefecture(name=name, department=department, city=city, url=url, scraper_type=scraper_type)
    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref
