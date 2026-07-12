from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("")
def create_page(profile_id: int, page: schemas.PageCreate, db: Session = Depends(get_db)):
    db_page = models.Page(**page.model_dump(), profile_id=profile_id)
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page

@router.put("/{page_id}", response_model=schemas.Page)
def update_page(page_id: int, page: schemas.PageUpdate, db: Session = Depends(get_db)):
    db_page = db.query(models.Page).filter(models.Page.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    update_data = page.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_page, key, value)
    
    db.commit()
    db.refresh(db_page)
    return db_page

@router.delete("/{page_id}")
def delete_page(page_id: int, db: Session = Depends(get_db)):
    db_page = db.query(models.Page).filter(models.Page.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    db.delete(db_page)
    db.commit()
    return {"ok": True}

@router.get("/{page_id}/buttons", response_model=List[schemas.Button])
def read_page_buttons(page_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    buttons = db.query(models.Button).filter(models.Button.page_id == page_id).offset(skip).limit(limit).all()
    return buttons
