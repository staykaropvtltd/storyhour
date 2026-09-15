from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.schemas.story import StorySummaryResponse


class LibraryItemResponse(BaseModel):
    """Response DTO for an individual user library entry."""
    id: str
    user_id: str
    story_id: str
    access_type: str
    is_active: bool
    created_at: datetime
    story: Optional[StorySummaryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class UserLibraryResponse(BaseModel):
    """Container DTO for an authenticated user's complete library."""
    user_id: str
    items: List[LibraryItemResponse]
    total_count: int

    model_config = ConfigDict(from_attributes=True)
