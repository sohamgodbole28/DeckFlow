from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("", response_model=List[schemas.ExecutionLog])
def read_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(models.ExecutionLog).order_by(models.ExecutionLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs
