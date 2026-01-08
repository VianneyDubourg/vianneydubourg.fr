"""
Spots API routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Spot, SpotCategory
from app.schemas import SpotResponse, SpotCreate, SpotUpdate
from app.auth import get_current_admin_user

router = APIRouter()


@router.get("/", response_model=List[SpotResponse])
async def get_spots(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[SpotCategory] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of spots"""
    query = db.query(Spot)
    
    # Filter by category
    if category:
        query = query.filter(Spot.category == category)
    
    # Search by name or location
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Spot.name.ilike(search_term)) | 
            (Spot.location.ilike(search_term))
        )
    
    spots = query.order_by(Spot.rating.desc()).offset(skip).limit(limit).all()
    return spots


@router.get("/{spot_id}", response_model=SpotResponse)
async def get_spot(spot_id: int, db: Session = Depends(get_db)):
    """Get a single spot by ID"""
    spot = db.query(Spot).filter(Spot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    return spot


@router.post("/", response_model=SpotResponse)
async def create_spot(
    spot: SpotCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Create a new spot (admin only)"""
    db_spot = Spot(**spot.dict())
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    return db_spot


@router.put("/{spot_id}", response_model=SpotResponse)
async def update_spot(
    spot_id: int,
    spot_update: SpotUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update a spot (admin only)"""
    db_spot = db.query(Spot).filter(Spot.id == spot_id).first()
    if not db_spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    
    update_data = spot_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_spot, field, value)
    
    db.commit()
    db.refresh(db_spot)
    return db_spot


@router.delete("/{spot_id}")
async def delete_spot(
    spot_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete a spot (admin only)"""
    db_spot = db.query(Spot).filter(Spot.id == spot_id).first()
    if not db_spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    
    db.delete(db_spot)
    db.commit()
    return {"message": "Spot deleted successfully"}
