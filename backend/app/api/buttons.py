from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("", response_model=schemas.Button)
def create_button(page_id: int, button: schemas.ButtonCreate, db: Session = Depends(get_db)):
    db_button = models.Button(**button.model_dump(), page_id=page_id)
    db.add(db_button)
    db.commit()
    db.refresh(db_button)
    return db_button

@router.put("/{button_id}", response_model=schemas.Button)
def update_button(button_id: int, button: schemas.ButtonUpdate, db: Session = Depends(get_db)):
    db_button = db.query(models.Button).filter(models.Button.id == button_id).first()
    if not db_button:
        raise HTTPException(status_code=404, detail="Button not found")
    
    update_data = button.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_button, key, value)
    
    db.commit()
    db.refresh(db_button)
    return db_button

@router.delete("/{button_id}")
def delete_button(button_id: int, db: Session = Depends(get_db)):
    db_button = db.query(models.Button).filter(models.Button.id == button_id).first()
    if not db_button:
        raise HTTPException(status_code=404, detail="Button not found")
    
    db.delete(db_button)
    db.commit()
    return {"ok": True}

@router.get("/{button_id}/actions", response_model=List[schemas.ButtonAction])
def read_button_actions(button_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    actions = db.query(models.ButtonAction).filter(models.ButtonAction.button_id == button_id).offset(skip).limit(limit).all()
    return actions
