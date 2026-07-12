from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("", response_model=List[schemas.Setting])
def read_settings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    settings = db.query(models.Setting).offset(skip).limit(limit).all()
    return settings

@router.put("", response_model=List[schemas.Setting])
def update_settings(settings: List[schemas.SettingCreate], db: Session = Depends(get_db)):
    updated = []
    for setting in settings:
        db_setting = db.query(models.Setting).filter(models.Setting.key == setting.key).first()
        if db_setting:
            db_setting.value = setting.value
        else:
            db_setting = models.Setting(key=setting.key, value=setting.value)
            db.add(db_setting)
        updated.append(db_setting)
    
    db.commit()
    
    for item in updated:
        db.refresh(item)
    return updated
