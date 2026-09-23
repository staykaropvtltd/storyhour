from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.journal import JournalStatus


class JournalArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Article title")
    slug: str = Field(..., min_length=1, max_length=255, description="URL slug")
    short_description: Optional[str] = Field(None, description="Excerpt or brief introduction")
    content: str = Field(..., min_length=1, description="Full editorial body content")
    hero_image: Optional[str] = Field(None, max_length=1024, description="Primary artwork URL")
    author_name: str = Field(..., min_length=1, max_length=255, description="Author or editorial byline")
    author_bio: Optional[str] = Field(None, description="Author biographical note")
    category: Optional[str] = Field(None, max_length=100, description="Editorial category classification")
    tags: List[str] = Field(default_factory=list, description="Topical tags")
    status: JournalStatus = Field(JournalStatus.DRAFT, description="Publishing lifecycle state")
    reading_time_minutes: int = Field(5, ge=1, description="Estimated reading time in minutes")
    featured: bool = Field(False, description="Whether highlighted on journal showcase")
    publication_date: Optional[datetime] = Field(None, description="Editorial publication timestamp")


class JournalArticleCreate(JournalArticleBase):
    """Payload schema for creating a Journal Article."""
    pass


class JournalArticleUpdate(BaseModel):
    """Payload schema for updating a Journal Article."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    short_description: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    hero_image: Optional[str] = None
    author_name: Optional[str] = Field(None, min_length=1, max_length=255)
    author_bio: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[JournalStatus] = None
    reading_time_minutes: Optional[int] = Field(None, ge=1)
    featured: Optional[bool] = None
    publication_date: Optional[datetime] = None


class JournalSummaryResponse(BaseModel):
    """Lightweight response schema for listing journal articles (excludes full body content)."""
    id: str
    title: str
    slug: str
    short_description: Optional[str] = None
    hero_image: Optional[str] = None
    author_name: str
    author_bio: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    status: JournalStatus
    reading_time_minutes: int
    featured: bool
    publication_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JournalResponse(JournalSummaryResponse):
    """Complete detail response schema including full article content."""
    content: str

    model_config = ConfigDict(from_attributes=True)
