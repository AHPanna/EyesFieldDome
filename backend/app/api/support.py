from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.support import SupportTicket, SupportMessage, TicketStatus
from app.schemas.support import (
    SupportTicketCreate, 
    SupportTicketOut, 
    SupportTicketDetailOut, 
    SupportMessageCreate,
    SupportTicketUpdate,
    SupportMessageOut
)

router = APIRouter(prefix="/support", tags=["Support"])


# --- User Routes ---

@router.post("/tickets", response_model=SupportTicketDetailOut)
def create_ticket(
    ticket_in: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crée un nouveau ticket de support."""
    ticket = SupportTicket(
        user_id=current_user.id,
        subject=ticket_in.subject,
        priority=ticket_in.priority
    )
    db.add(ticket)
    db.flush()  # Récupérer l'ID du ticket

    message = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=ticket_in.initial_message,
        is_admin_reply=False
    )
    db.add(message)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/tickets", response_model=List[SupportTicketOut])
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste les tickets de l'utilisateur actuel."""
    return db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()


@router.get("/tickets/{ticket_id}", response_model=SupportTicketDetailOut)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupère les détails d'un ticket spécifique."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Vérifier que l'utilisateur est le propriétaire ou un admin
    if ticket.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return ticket


@router.post("/tickets/{ticket_id}/messages", response_model=SupportMessageOut)
def add_message(
    ticket_id: int,
    message_in: SupportMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ajoute un message à un ticket existant."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    if ticket.status == TicketStatus.closed:
        raise HTTPException(status_code=400, detail="Ce ticket est fermé")

    is_admin = current_user.role == UserRole.admin
    message = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=message_in.message,
        is_admin_reply=is_admin
    )
    
    # Mettre à jour le statut du ticket
    if is_admin:
        ticket.status = TicketStatus.pending
    else:
        ticket.status = TicketStatus.open
        
    db.add(message)
    db.add(ticket)
    db.commit()
    db.refresh(message)
    return message


# --- Admin Routes ---

@router.get("/admin/tickets", response_model=List[SupportTicketOut])
def admin_list_tickets(
    status: TicketStatus = None,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Liste tous les tickets (Admin)."""
    query = db.query(SupportTicket)
    if status:
        query = query.filter(SupportTicket.status == status)
    return query.order_by(SupportTicket.updated_at.desc()).all()


@router.patch("/admin/tickets/{ticket_id}", response_model=SupportTicketOut)
def admin_update_ticket(
    ticket_id: int,
    ticket_update: SupportTicketUpdate,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Met à jour le statut ou la priorité d'un ticket (Admin)."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket_update.status:
        ticket.status = ticket_update.status
    if ticket_update.priority:
        ticket.priority = ticket_update.priority
        
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
