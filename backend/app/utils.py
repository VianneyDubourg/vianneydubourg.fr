"""
Utility functions to reduce code duplication
"""
from sqlalchemy.orm import Session
from sqlalchemy import Column
from fastapi import HTTPException
from typing import Type, TypeVar, Optional, Dict, Any
from datetime import datetime

ModelType = TypeVar("ModelType")


def get_or_404(db: Session, model: Type[ModelType], item_id: int) -> ModelType:
    """Get an item by ID or raise 404"""
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return item


def update_model(db: Session, model_instance: ModelType, update_data: Dict[str, Any]) -> ModelType:
    """Update model instance with provided data"""
    for field, value in update_data.items():
        setattr(model_instance, field, value)
    db.commit()
    db.refresh(model_instance)
    return model_instance


def delete_model(db: Session, model_instance: ModelType) -> Dict[str, str]:
    """Delete a model instance"""
    model_name = model_instance.__class__.__name__
    db.delete(model_instance)
    db.commit()
    return {"message": f"{model_name} deleted successfully"}


def create_slug(text: str) -> str:
    """Generate a URL-friendly slug from text"""
    slug = text.lower().replace(" ", "-").replace("'", "").replace(",", "")
    return "".join(c for c in slug if c.isalnum() or c == "-")


def ensure_unique_slug(db: Session, model: Type[ModelType], slug: str, exclude_id: Optional[int] = None) -> str:
    """Ensure slug is unique, append timestamp if needed"""
    query = db.query(model).filter(model.slug == slug)
    if exclude_id:
        query = query.filter(model.id != exclude_id)
    if query.first():
        slug = f"{slug}-{int(datetime.now().timestamp())}"
    return slug


def add_author_name(article_dict: Dict, author) -> Dict:
    """Add author_name to article dictionary"""
    article_dict["author_name"] = author.full_name or author.username if author else None
    return article_dict
