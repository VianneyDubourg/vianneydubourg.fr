"""
SQLAlchemy models for the database
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ArticleStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    REVIEW = "review"


class SpotCategory(str, enum.Enum):
    NATURE = "nature"
    URBAN = "urban"
    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"
    STREET = "street"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    articles = relationship("Article", back_populates="author")
    comments = relationship("Comment", back_populates="author")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    cover_image = Column(String, nullable=True)
    category = Column(String, nullable=True)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.DRAFT)
    reading_time = Column(Integer, default=5)  # in minutes
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    views = Column(Integer, default=0)
    
    author = relationship("User", back_populates="articles")
    comments = relationship("Comment", back_populates="article")


class Spot(Base):
    __tablename__ = "spots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(Enum(SpotCategory), nullable=True)
    image_url = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    tags = Column(String, nullable=True)  # JSON string or comma-separated
    best_time = Column(String, nullable=True)  # e.g., "Lever de soleil", "Nuit"
    equipment_needed = Column(String, nullable=True)  # e.g., "Trépied", "Objectif grand angle"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_approved = Column(Boolean, default=False)
    
    article = relationship("Article", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Newsletter(Base):
    __tablename__ = "newsletter"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
