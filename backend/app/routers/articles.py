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
from app.utils import get_or_404, update_model, create_slug, ensure_unique_slug, add_author_name

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
    
    return [ArticleResponse(**add_author_name({**a.__dict__}, a.author)) for a in articles]


def _increment_views_and_format(article: Article, db: Session) -> ArticleResponse:
    """Helper to increment views and format response"""
    article.views += 1
    db.commit()
    db.refresh(article)
    article_dict = add_author_name({**article.__dict__}, article.author)
    return ArticleResponse(**article_dict)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, db: Session = Depends(get_db)):
    """Get a single article by ID"""
    article = get_or_404(db, Article, article_id)
    return _increment_views_and_format(article, db)


@router.get("/slug/{slug}", response_model=ArticleResponse)
async def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a single article by slug"""
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return _increment_views_and_format(article, db)


@router.post("/", response_model=ArticleResponse)
async def create_article(
    article: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new article"""
    slug = ensure_unique_slug(db, Article, create_slug(article.title))
    db_article = Article(**article.dict(), slug=slug, author_id=current_user.id, status=ArticleStatus.DRAFT)
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return ArticleResponse(**add_author_name({**db_article.__dict__}, current_user))


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    article_update: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an article"""
    db_article = get_or_404(db, Article, article_id)
    if db_article.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = article_update.dict(exclude_unset=True)
    if update_data.get("status") == ArticleStatus.PUBLISHED and not db_article.published_at:
        update_data["published_at"] = datetime.now()
    
    update_model(db, db_article, update_data)
    return ArticleResponse(**add_author_name({**db_article.__dict__}, db_article.author))


@router.delete("/{article_id}")
async def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an article (admin only)"""
    from app.utils import delete_model
    return delete_model(db, get_or_404(db, Article, article_id))
