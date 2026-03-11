from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.slot import Slot
from app.models.prefecture import Prefecture

router = APIRouter(prefix="/slots", tags=["Créneaux"])


@router.get("")
def list_slots(prefecture_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Slot).filter(Slot.is_still_available == True)
    if prefecture_id:
        query = query.filter(Slot.prefecture_id == prefecture_id)
    return query.order_by(Slot.available_date.asc()).all()
