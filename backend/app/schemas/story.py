from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.story import StoryStatus
from app.schemas.category import CategoryResponse
from app.schemas.language import LanguageResponse
from app.schemas.chapter import ChapterResponse


class StoryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Full story title")
    slug: str = Field(..., min_length=1, max_length=255, description="URL slug (e.g., ramayana-english)")
    short_description: Optional[str] = Field(None, description="Brief hook or subtitle")
    long_description: Optional[str] = Field(None, description="Full editorial story overview")
    cover_image: Optional[str] = Field(None, max_length=1024, description="Primary artwork URL")
    hero_media: Optional[str] = Field(None, max_length=1024, description="Hero banner or trailer URL")
    status: StoryStatus = Field(StoryStatus.DRAFT, description="Content lifecycle state")
    themes: List[str] = Field(default_factory=list, description="Editorial themes (e.g. Dharma, Devotion)")
    narrator: Optional[str] = Field(None, max_length=255, description="Narrator or ensemble name")
    duration: int = Field(0, ge=0, description="Total playback duration in seconds")
    age_group: Optional[str] = Field(None, max_length=64, description="Intended audience group")
    cultural_context: Optional[str] = Field(None, description="Cultural note or folklore context")
    transcript: Optional[str] = Field(None, description="Optional textual narration transcript")
    product_id: Optional[str] = Field(None, max_length=64, description="Reference mapping for commerce")
    featured: bool = Field(False, description="Whether highlighted on hero showcase")
    seo_title: Optional[str] = Field(None, max_length=255, description="Meta title for SEO")
    seo_description: Optional[str] = Field(None, max_length=500, description="Meta description for SEO")


class StoryCreate(StoryBase):
    """Payload schema for creating a new Story."""
    category_ids: Optional[List[str]] = Field(default_factory=list, description="UUIDs of categories to associate")
    language_ids: Optional[List[str]] = Field(default_factory=list, description="UUIDs of languages to associate")


class StoryUpdate(BaseModel):
    """Payload schema for updating an existing Story."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    cover_image: Optional[str] = None
    hero_media: Optional[str] = None
    status: Optional[StoryStatus] = None
    themes: Optional[List[str]] = None
    narrator: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)
    age_group: Optional[str] = None
    cultural_context: Optional[str] = None
    transcript: Optional[str] = None
    product_id: Optional[str] = None
    featured: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    category_ids: Optional[List[str]] = None
    language_ids: Optional[List[str]] = None


class StorySummaryResponse(StoryBase):
    """Lightweight summary schema for listing stories."""
    id: str
    categories: List[CategoryResponse] = Field(default_factory=list)
    languages: List[LanguageResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StoryResponse(StorySummaryResponse):
    """Complete detail response schema including ordered chapters."""
    chapters: List[ChapterResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
