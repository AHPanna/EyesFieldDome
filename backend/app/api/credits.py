from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionStatus
from app.models.credits import CreditLog, Coupon, CouponUsage
from app.schemas.transaction import TransactionOut, CreditPack
from app.schemas.credits import CreditLogOut, CouponRedeem, CouponOut, CouponUsageOut, CouponCreate, CouponUpdate
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/credits", tags=["Crédits"])

CREDIT_PACKS = [
    {"id": "pack_10", "name": "10 Crédits", "credits": 10, "price_cents": 500},
    {"id": "pack_25", "name": "25 Crédits", "credits": 25, "price_cents": 1000},
    {"id": "pack_50", "name": "50 Crédits", "credits": 50, "price_cents": 1800},
]


@router.get("/packs", response_model=list[CreditPack])
def get_credit_packs():
    """Liste les packs de crédits disponibles."""
    return CREDIT_PACKS


@router.post("/purchase/{pack_id}", response_model=TransactionOut)
def purchase_credits(
    pack_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simule l'achat d'un pack de crédits.
    En Phase 2, on valide immédiatement la transaction pour simplification.
    """
    pack = next((p for p in CREDIT_PACKS if p["id"] == pack_id), None)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack non trouvé")

    # Simulation transaction
    transaction = Transaction(
        user_id=current_user.id,
        amount_cents=pack["price_cents"],
        credits_added=pack["credits"],
        status=TransactionStatus.completed,  # Auto-validé pour la démo
        provider_id=f"sim_{datetime.now().timestamp()}"
    )
    
    # Mise à jour des crédits utilisateur
    current_user.credits += pack["credits"]
    
    # Log addition
    db.add(CreditLog(
        user_id=current_user.id,
        amount=pack["credits"],
        operation=f"Achat Pack: {pack['name']}"
    ))
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    db.refresh(current_user)
    
    return transaction


@router.get("/history", response_model=list[CreditLogOut])
def get_credit_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère l'historique complet des crédits de l'utilisateur."""
    return db.query(CreditLog).filter(CreditLog.user_id == current_user.id).order_by(CreditLog.created_at.desc()).all()


@router.post("/redeem", response_model=CreditLogOut)
def redeem_coupon(
    redeem: CouponRedeem,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Active un coupon de crédit."""
    coupon = db.query(Coupon).filter(Coupon.code == redeem.code).first()
    if not coupon or not coupon.is_active:
        raise HTTPException(status_code=404, detail="Coupon invalide ou expiré")
    
    if coupon.current_uses >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="Ce coupon a atteint sa limite d'utilisation")
    
    # Vérifier si l'utilisateur l'a déjà utilisé
    usage = db.query(CouponUsage).filter(
        CouponUsage.coupon_id == coupon.id,
        CouponUsage.user_id == current_user.id
    ).first()
    if usage:
        raise HTTPException(status_code=400, detail="Vous avez déjà utilisé ce coupon")
    
    # Appliquer le coupon
    coupon.current_uses += 1
    current_user.credits += coupon.credits
    
    log = CreditLog(
        user_id=current_user.id,
        amount=coupon.credits,
        operation=f"Coupon utilisé : {coupon.code}"
    )
    db.add(log)
    
    db.add(CouponUsage(coupon_id=coupon.id, user_id=current_user.id))
    db.add(coupon)
    db.add(current_user)
    db.commit()
    return log


# --- Admin Coupon Routes ---

@router.get("/admin/coupons", response_model=list[CouponOut])
def list_coupons(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Liste tous les coupons (Admin)."""
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post("/admin/coupons", response_model=CouponOut)
def create_coupon(
    coupon_in: CouponCreate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Crée un nouveau coupon (Admin)."""
    coupon = Coupon(
        code=coupon_in.code,
        credits=coupon_in.credits,
        max_uses=coupon_in.max_uses
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/admin/coupons/{coupon_id}/usages", response_model=list[CouponUsageOut])
def get_coupon_usages(
    coupon_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Liste les utilisateurs ayant utilisé un coupon spécifique (Admin)."""
    usages = db.query(CouponUsage).filter(CouponUsage.coupon_id == coupon_id).all()
    # Enrichir avec les emails (ou le faire dans le schema via ORM)
    for u in usages:
        u.user_email = u.user.email
        u.coupon_code = u.coupon.code
    return usages


@router.put("/admin/coupons/{coupon_id}", response_model=CouponOut)
def update_coupon(
    coupon_id: int,
    coupon_in: CouponUpdate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Modifie un coupon existant (Admin)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon non trouvé")
    
    update_data = coupon_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(coupon, key, value)
        
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/admin/coupons/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Supprime un coupon (Admin)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon non trouvé")
    
    # Supprimer également les historiques d'utilisation
    db.query(CouponUsage).filter(CouponUsage.coupon_id == coupon_id).delete()
    db.delete(coupon)
    db.commit()
    return {"message": "Coupon supprimé"}


@router.delete("/admin/usages/{usage_id}")
def delete_coupon_usage(
    usage_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Supprime l'utilisation d'un coupon par un utilisateur et lui retire les crédits (Admin)."""
    usage = db.query(CouponUsage).filter(CouponUsage.id == usage_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Utilisation non trouvée")
        
    coupon = usage.coupon
    user = usage.user
    
    # Retirer les crédits
    user.credits -= coupon.credits
    if user.credits < 0:
        user.credits = 0  # Éviter les crédits négatifs
        
    # Log de l'opération
    log = CreditLog(
        user_id=user.id,
        amount=-coupon.credits,
        operation=f"Annulation coupon par admin : {coupon.code}"
    )
    db.add(log)
    
    # Décrémenter l'usage du coupon
    if coupon.current_uses > 0:
        coupon.current_uses -= 1
        
    db.delete(usage)
    db.add(coupon)
    db.add(user)
    db.commit()
    return {"message": "Utilisation annulée et crédits retirés"}


@router.get("/admin/users/{user_id}/coupons", response_model=list[CouponUsageOut])
def get_user_coupons(
    user_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Récupère tous les coupons utilisés par un utilisateur spécifique."""
    usages = db.query(CouponUsage).filter(CouponUsage.user_id == user_id).all()
    for u in usages:
        u.user_email = u.user.email
        u.coupon_code = u.coupon.code
    return usages
