from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ChapterBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Chapter or episode title")
    order: int = Field(..., ge=1, description="Sequential ordering index within the story")
    start_time: int = Field(0, ge=0, description="Audio timeline start offset in seconds")
    duration: int = Field(0, ge=0, description="Playback length in seconds")
    preview_available: bool = Field(False, description="Whether free public preview is permitted")


class ChapterCreate(ChapterBase):
    """Payload schema for creating a new Chapter under a story."""
    story_id: str = Field(..., description="UUID of the parent story")


class ChapterUpdate(BaseModel):
    """Payload schema for updating an existing Chapter."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    order: Optional[int] = Field(None, ge=1)
    start_time: Optional[int] = Field(None, ge=0)
    duration: Optional[int] = Field(None, ge=0)
    preview_available: Optional[bool] = None


class ChapterResponse(ChapterBase):
    """DTO response schema for Chapter data."""
    id: str
    story_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
