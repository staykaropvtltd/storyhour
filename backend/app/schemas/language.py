from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LanguageBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Common language name (e.g., English, Hindi)")
    code: str = Field(..., min_length=2, max_length=10, description="ISO language code (e.g., en, hi, te)")
    native_name: Optional[str] = Field(None, max_length=100, description="Native vernacular script name")
    is_active: bool = Field(True, description="Active status indicator")


class LanguageCreate(LanguageBase):
    """Payload schema for creating a new Language."""
    pass


class LanguageUpdate(BaseModel):
    """Payload schema for updating an existing Language."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=2, max_length=10)
    native_name: Optional[str] = None
    is_active: Optional[bool] = None


class LanguageResponse(LanguageBase):
    """DTO response schema for Language data."""
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
