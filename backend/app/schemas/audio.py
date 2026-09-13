from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.audio_asset import AudioAccessType


class AudioAssetBase(BaseModel):
    storage_key: str = Field(..., max_length=512, description="Safe storage path reference")
    duration: int = Field(0, ge=0, description="Audio duration in seconds")
    mime_type: str = Field("audio/mpeg", max_length=64, description="Media MIME type")
    access_type: AudioAccessType = Field(
        AudioAccessType.PROTECTED,
        description="Public preview or protected access policy",
    )


class AudioAssetCreate(AudioAssetBase):
    """Payload schema for registering an audio asset."""
    story_id: str = Field(..., description="UUID of the parent story")
    chapter_id: Optional[str] = Field(None, description="Optional UUID of the associated chapter")


class AudioAssetUpdate(BaseModel):
    """Payload schema for modifying audio asset metadata."""
    storage_key: Optional[str] = Field(None, max_length=512)
    duration: Optional[int] = Field(None, ge=0)
    mime_type: Optional[str] = Field(None, max_length=64)
    access_type: Optional[AudioAccessType] = None
    chapter_id: Optional[str] = None


class AudioAssetResponse(AudioAssetBase):
    """DTO response schema for AudioAsset metadata without leaking bucket secrets."""
    id: str
    story_id: str
    chapter_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AudioPlaybackDescriptor(BaseModel):
    """
    Clean playback descriptor prepared by the AudioService.
    Does NOT contain storage credentials, private bucket secrets, or signed keys.
    """
    asset_id: str
    story_id: str
    chapter_id: Optional[str] = None
    duration: int
    mime_type: str
    access_type: AudioAccessType
    is_accessible: bool
    stream_url: Optional[str] = None
