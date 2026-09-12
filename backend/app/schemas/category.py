from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Display name of the category")
    slug: str = Field(..., min_length=1, max_length=120, description="URL-safe unique identifier")
    description: Optional[str] = Field(None, description="Detailed category overview")
    is_active: bool = Field(True, description="Active publication status")


class CategoryCreate(CategoryBase):
    """Payload schema for creating a new Category."""
    pass


class CategoryUpdate(BaseModel):
    """Payload schema for updating an existing Category."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """DTO response schema for Category data."""
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
