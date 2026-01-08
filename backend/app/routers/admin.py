"""
Admin API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import Article, Spot, User, Newsletter, Comment
from app.schemas import UserResponse
from app.auth import get_current_admin_user

router = APIRouter()


@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get dashboard statistics"""
    total_views = db.query(func.sum(Article.views)).scalar() or 0
    total_spots = db.query(Spot).count()
    total_subscribers = db.query(Newsletter).filter(Newsletter.is_active == True).count()
    pending_comments = db.query(Comment).filter(Comment.is_approved == False).count()
    
    return {
        "total_views": int(total_views),
        "total_spots": total_spots,
        "total_subscribers": total_subscribers,
        "pending_comments": pending_comments
    }


@router.get("/articles", response_model=List[dict])
async def get_all_articles(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get all articles for admin dashboard"""
    articles = db.query(Article).order_by(Article.created_at.desc()).all()
    result = []
    for article in articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "author": article.author.full_name or article.author.username if article.author else "Unknown",
            "status": article.status.value,
            "created_at": article.created_at.isoformat() if article.created_at else None,
            "views": article.views
        })
    return result


@router.get("/comments")
async def get_comments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get all comments for moderation"""
    comments = db.query(Comment).order_by(Comment.created_at.desc()).all()
    result = []
    for comment in comments:
        result.append({
            "id": comment.id,
            "content": comment.content,
            "article_id": comment.article_id,
            "article_title": comment.article.title if comment.article else "Unknown",
            "author": comment.author.full_name or comment.author.username if comment.author else "Unknown",
            "is_approved": comment.is_approved,
            "created_at": comment.created_at.isoformat() if comment.created_at else None
        })
    return result


@router.post("/comments/{comment_id}/approve")
async def approve_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Approve a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_approved = True
    db.commit()
    return {"message": "Comment approved"}


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}
