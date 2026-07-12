from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("", response_model=schemas.ButtonAction)
def create_action(button_id: int, action: schemas.ButtonActionCreate, db: Session = Depends(get_db)):
    db_action = models.ButtonAction(**action.model_dump(), button_id=button_id)
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

@router.put("/{action_id}", response_model=schemas.ButtonAction)
def update_action(action_id: int, action: schemas.ButtonActionUpdate, db: Session = Depends(get_db)):
    db_action = db.query(models.ButtonAction).filter(models.ButtonAction.id == action_id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    update_data = action.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_action, key, value)
    
    db.commit()
    db.refresh(db_action)
    return db_action

@router.delete("/{action_id}")
def delete_action(action_id: int, db: Session = Depends(get_db)):
    db_action = db.query(models.ButtonAction).filter(models.ButtonAction.id == action_id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    db.delete(db_action)
    db.commit()
    return {"ok": True}
