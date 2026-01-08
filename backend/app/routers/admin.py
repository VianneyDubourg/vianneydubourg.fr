"""
Admin API routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from app.database import get_db
from app.models import Article, Spot, User, Newsletter, Comment, ArticleStatus
from app.schemas import UserResponse
from app.auth import get_current_admin_user

router = APIRouter()


def _calc_trend(current, previous):
    return round(((current - previous) / previous * 100) if previous > 0 else 0, 1)


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """Get dashboard statistics"""
    now = datetime.utcnow()
    last_month = now - timedelta(days=30)
    
    total_views = db.query(func.sum(Article.views)).scalar() or 0
    views_last_month = db.query(func.sum(Article.views)).filter(Article.created_at >= last_month).scalar() or 0
    views_previous = total_views - views_last_month
    
    total_spots = db.query(Spot).count()
    spots_last_month = db.query(Spot).filter(Spot.created_at >= last_month).count()
    spots_previous = total_spots - spots_last_month
    
    total_subscribers = db.query(Newsletter).filter(Newsletter.is_active == True).count()
    subs_last_month = db.query(Newsletter).filter(Newsletter.subscribed_at >= last_month, Newsletter.is_active == True).count()
    subs_previous = total_subscribers - subs_last_month
    
    return {
        "total_views": int(total_views),
        "total_spots": total_spots,
        "total_subscribers": total_subscribers,
        "pending_comments": db.query(Comment).filter(Comment.is_approved == False).count(),
        "trend_views": _calc_trend(total_views, views_previous),
        "trend_spots": _calc_trend(total_spots, spots_previous),
        "trend_subscribers": _calc_trend(total_subscribers, subs_previous)
    }


@router.get("/articles", response_model=dict)
async def get_all_articles(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ArticleStatus] = None,
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """Get all articles for admin dashboard with filters and pagination"""
    query = db.query(Article)
    if status: query = query.filter(Article.status == status)
    if category: query = query.filter(Article.category == category)
    if date_from: query = query.filter(Article.created_at >= datetime.fromisoformat(date_from.replace('Z', '+00:00')))
    if date_to: query = query.filter(Article.created_at <= datetime.fromisoformat(date_to.replace('Z', '+00:00')))
    
    total = query.count()
    articles = query.order_by(Article.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": [{
            "id": a.id, "title": a.title, "cover_image": a.cover_image,
            "author": a.author.full_name or a.author.username if a.author else "Unknown",
            "author_initials": (a.author.full_name or a.author.username)[:2].upper() if a.author else "??",
            "status": a.status.value, "created_at": a.created_at.isoformat() if a.created_at else None, "views": a.views
        } for a in articles],
        "total": total, "skip": skip, "limit": limit
    }


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
async def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """Delete a comment"""
    from app.utils import get_or_404, delete_model
    return delete_model(db, get_or_404(db, Comment, comment_id))

@router.post("/articles/bulk-delete")
async def bulk_delete_articles(article_ids: List[int], db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    """Bulk delete articles"""
    deleted = db.query(Article).filter(Article.id.in_(article_ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"{deleted} articles deleted", "deleted_count": deleted}
