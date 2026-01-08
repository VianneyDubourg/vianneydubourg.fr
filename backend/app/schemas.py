"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import ArticleStatus, SpotCategory


# Article Schemas
class ArticleBase(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category: Optional[str] = None
    reading_time: int = 5


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    status: Optional[ArticleStatus] = None
    reading_time: Optional[int] = None


class ArticleResponse(ArticleBase):
    id: int
    slug: str
    status: ArticleStatus
    author_id: int
    author_name: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    views: int

    class Config:
        from_attributes = True


# Spot Schemas
class SpotBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    latitude: float
    longitude: float
    category: Optional[SpotCategory] = None
    image_url: Optional[str] = None
    rating: float = 0.0
    tags: Optional[str] = None
    best_time: Optional[str] = None
    equipment_needed: Optional[str] = None


class SpotCreate(SpotBase):
    pass


class SpotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[SpotCategory] = None
    image_url: Optional[str] = None
    rating: Optional[float] = None
    tags: Optional[str] = None
    best_time: Optional[str] = None
    equipment_needed: Optional[str] = None


class SpotResponse(SpotBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Comment Schemas
class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    article_id: int


class CommentResponse(CommentBase):
    id: int
    article_id: int
    author_id: int
    author_name: Optional[str] = None
    created_at: datetime
    is_approved: bool

    class Config:
        from_attributes = True


# Newsletter Schema
class NewsletterSubscribe(BaseModel):
    email: EmailStr
