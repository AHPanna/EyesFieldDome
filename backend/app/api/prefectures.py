from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prefecture import Prefecture
from app.schemas.alert import PrefectureOut

router = APIRouter(prefix="/prefectures", tags=["Préfectures"])


@router.get("", response_model=list[PrefectureOut])
def list_prefectures(db: Session = Depends(get_db)):
    return db.query(Prefecture).filter(Prefecture.is_active == True).order_by(Prefecture.department.asc()).all()
