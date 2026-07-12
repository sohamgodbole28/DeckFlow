from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("", response_model=List[schemas.Device])
def read_devices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    devices = db.query(models.Device).offset(skip).limit(limit).all()
    return devices

@router.post("/approve", response_model=schemas.Device)
def approve_device(device_uuid: str, db: Session = Depends(get_db)):
    db_device = db.query(models.Device).filter(models.Device.uuid == device_uuid).first()
    if not db_device:
        # Create it if it doesn't exist
        db_device = models.Device(uuid=device_uuid, approved=True, last_seen=datetime.now(timezone.utc))
        db.add(db_device)
    else:
        db_device.approved = True
        db_device.last_seen = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_device)
    return db_device

@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db_device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    db.delete(db_device)
    db.commit()
    return {"ok": True}
