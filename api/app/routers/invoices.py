from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from database import get_session
from models import Invoice, InvoiceCreate, InvoiceRead, InvoiceUpdate
from auth import get_current_user

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceRead)
def create_invoice(
    invoice: InvoiceCreate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    db_invoice = Invoice.model_validate(invoice)
    db_invoice.user_id = current_user["user_id"]
    session.add(db_invoice)
    session.commit()
    session.refresh(db_invoice)
    return db_invoice

@router.get("/", response_model=List[InvoiceRead])
def read_invoices(
    offset: int = 0, 
    limit: int = Query(default=100, le=100), 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    statement = select(Invoice).where(Invoice.user_id == current_user["user_id"]).offset(offset).limit(limit)
    invoices = session.exec(statement).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceRead)
def read_invoice(
    invoice_id: int, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    invoice = session.get(Invoice, invoice_id)
    if not invoice or invoice.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.patch("/{invoice_id}", response_model=InvoiceRead)
def update_invoice(
    invoice_id: int, 
    invoice: InvoiceUpdate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    db_invoice = session.get(Invoice, invoice_id)
    if not db_invoice or db_invoice.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice_data = invoice.model_dump(exclude_unset=True)
    for key, value in invoice_data.items():
        setattr(db_invoice, key, value)
    
    session.add(db_invoice)
    session.commit()
    session.refresh(db_invoice)
    return db_invoice

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    invoice = session.get(Invoice, invoice_id)
    if not invoice or invoice.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Invoice not found")
    session.delete(invoice)
    session.commit()
    return {"ok": True}

