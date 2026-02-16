from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List
from database import get_session
from models import Note, NoteCreate, NoteRead, NoteUpdate
from auth import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("/", response_model=NoteRead)
def create_note(
    note: NoteCreate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    db_note = Note.model_validate(note)
    db_note.user_id = current_user["user_id"]
    session.add(db_note)
    session.commit()
    session.refresh(db_note)
    return db_note

@router.get("/", response_model=List[NoteRead])
def read_notes(
    offset: int = 0, 
    limit: int = Query(default=100, le=100), 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    statement = select(Note).where(Note.user_id == current_user["user_id"]).offset(offset).limit(limit)
    notes = session.exec(statement).all()
    return notes

@router.get("/{note_id}", response_model=NoteRead)
def read_note(
    note_id: int, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    note = session.get(Note, note_id)
    if not note or note.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.patch("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: int, 
    note: NoteUpdate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    db_note = session.get(Note, note_id)
    if not db_note or db_note.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note_data = note.model_dump(exclude_unset=True)
    for key, value in note_data.items():
        setattr(db_note, key, value)
    
    session.add(db_note)
    session.commit()
    session.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(
    note_id: int, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    note = session.get(Note, note_id)
    if not note or note.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Note not found")
    session.delete(note)
    session.commit()
    return {"ok": True}
