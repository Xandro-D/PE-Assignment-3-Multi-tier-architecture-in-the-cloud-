from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, Note as NoteSchema

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/", response_model=NoteSchema)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db_note = Note(
        title=note_data.title,
        content=note_data.content,
        owner_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/", response_model=list[NoteSchema])
def list_notes(
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    notes = db.query(Note).filter(Note.owner_id == current_user.id).all()
    return notes


@router.get("/{note_id}", response_model=NoteSchema)
def get_note(
    note_id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(
        (Note.id == note_id) & (Note.owner_id == current_user.id)
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note


@router.put("/{note_id}", response_model=NoteSchema)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(
        (Note.id == note_id) & (Note.owner_id == current_user.id)
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(
        (Note.id == note_id) & (Note.owner_id == current_user.id)
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    db.delete(note)
    db.commit()
