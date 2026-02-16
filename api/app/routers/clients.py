from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from database import get_session
from models import Client, ClientCreate, ClientRead, ClientUpdate
from auth import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=ClientRead)
def create_client(
    client: ClientCreate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    db_client = Client.model_validate(client)
    db_client.user_id = current_user["user_id"]
    
    session.add(db_client)
    session.commit()
    session.refresh(db_client)
    return db_client

@router.get("/", response_model=List[ClientRead])
def read_clients(
    offset: int = 0, 
    limit: int = Query(default=100, le=100), 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    statement = select(Client).where(Client.user_id == current_user["user_id"]).offset(offset).limit(limit)
    clients = session.exec(statement).all()
    return clients

@router.get("/{client_id}", response_model=ClientRead)
def read_client(
    client_id: int, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    client = session.get(Client, client_id)
    if not client or client.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.patch("/{client_id}", response_model=ClientRead)
def update_client(
    client_id: int, 
    client: ClientUpdate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    db_client = session.get(Client, client_id)
    if not db_client or db_client.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_data = client.model_dump(exclude_unset=True)
    db_client.sqlmodel_update(client_data)
    
    session.add(db_client)
    session.commit()
    session.refresh(db_client)
    return db_client

@router.delete("/{client_id}")
def delete_client(
    client_id: int, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    client = session.get(Client, client_id)
    if not client or client.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Client not found")
    session.delete(client)
    session.commit()
    return {"ok": True}

