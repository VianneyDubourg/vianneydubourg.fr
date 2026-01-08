"""
Articles API routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Article, User, ArticleStatus
from app.schemas import ArticleResponse, ArticleCreate, ArticleUpdate
from app.auth import get_current_user, get_current_admin_user

router = APIRouter()


@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ArticleStatus] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of articles"""
    query = db.query(Article)
    
    # Filter by status (default: only published for non-admin)
    if status:
        query = query.filter(Article.status == status)
    else:
        query = query.filter(Article.status == ArticleStatus.PUBLISHED)
    
    # Filter by category
    if category:
        query = query.filter(Article.category == category)
    
    articles = query.order_by(desc(Article.published_at)).offset(skip).limit(limit).all()
    
    # Add author name
    result = []
    for article in articles:
        article_dict = {
            **article.__dict__,
            "author_name": article.author.full_name or article.author.username if article.author else None
        }
        result.append(ArticleResponse(**article_dict))
    
    return result


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, db: Session = Depends(get_db)):
    """Get a single article by ID"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    article.views += 1
    db.commit()
    db.refresh(article)
    
    article_dict = {
        **article.__dict__,
        "author_name": article.author.full_name or article.author.username if article.author else None
    }
    return ArticleResponse(**article_dict)


@router.get("/slug/{slug}", response_model=ArticleResponse)
async def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a single article by slug"""
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    article.views += 1
    db.commit()
    db.refresh(article)
    
    article_dict = {
        **article.__dict__,
        "author_name": article.author.full_name or article.author.username if article.author else None
    }
    return ArticleResponse(**article_dict)


@router.post("/", response_model=ArticleResponse)
async def create_article(
    article: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new article"""
    # Generate slug from title
    slug = article.title.lower().replace(" ", "-").replace("'", "").replace(",", "")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    
    # Check if slug exists
    existing = db.query(Article).filter(Article.slug == slug).first()
    if existing:
        slug = f"{slug}-{datetime.now().timestamp()}"
    
    db_article = Article(
        **article.dict(),
        slug=slug,
        author_id=current_user.id,
        status=ArticleStatus.DRAFT
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    
    article_dict = {
        **db_article.__dict__,
        "author_name": current_user.full_name or current_user.username
    }
    return ArticleResponse(**article_dict)


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    article_update: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an article"""
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if user is author or admin
    if db_article.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    update_data = article_update.dict(exclude_unset=True)
    if update_data.get("status") == ArticleStatus.PUBLISHED and not db_article.published_at:
        update_data["published_at"] = datetime.now()
    
    for field, value in update_data.items():
        setattr(db_article, field, value)
    
    db.commit()
    db.refresh(db_article)
    
    article_dict = {
        **db_article.__dict__,
        "author_name": db_article.author.full_name or db_article.author.username if db_article.author else None
    }
    return ArticleResponse(**article_dict)


@router.delete("/{article_id}")
async def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an article (admin only)"""
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    db.delete(db_article)
    db.commit()
    return {"message": "Article deleted successfully"}
