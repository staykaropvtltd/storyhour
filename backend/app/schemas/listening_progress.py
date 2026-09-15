from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ListeningProgressUpdate(BaseModel):
    """Payload schema for creating or updating playback progress."""
    story_id: str = Field(..., description="UUID of the parent story")
    chapter_id: Optional[str] = Field(None, description="Optional UUID of the specific chapter")
    position_seconds: int = Field(..., ge=0, description="Current audio timeline offset in seconds")
    is_completed: Optional[bool] = Field(None, description="Explicit completion status override")


class ListeningProgressResponse(BaseModel):
    """Response DTO for listening progress."""
    id: str
    user_id: str
    story_id: str
    chapter_id: Optional[str] = None
    position_seconds: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumePointResponse(BaseModel):
    """Clean summary DTO for quickly resuming in-progress stories."""
    progress_id: str
    story_id: str
    story_title: str
    story_slug: str
    chapter_id: Optional[str] = None
    chapter_title: Optional[str] = None
    position_seconds: int
    is_completed: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
