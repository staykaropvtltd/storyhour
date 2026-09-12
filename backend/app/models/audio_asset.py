import enum
from sqlalchemy import (
    Column,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.database.base import BaseSaaSModel


class AudioAccessType(str, enum.Enum):
    """Access tier classification for audio media assets."""
    PUBLIC_PREVIEW = "PUBLIC_PREVIEW"
    PROTECTED = "PROTECTED"


class AudioAsset(BaseSaaSModel):
    """
    StoryHour Audio Asset model.
    Stores abstract storage keys and technical audio metadata without leaking
    underlying object-store secrets, private credentials, or signed URLs.
    """
    __tablename__ = "audio_assets"

    story_id = Column(
        String(36),
        ForeignKey("stories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chapter_id = Column(
        String(36),
        ForeignKey("chapters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Storage reference/key in object storage (e.g., "audio/stories/ramayana/ch1.mp3")
    storage_key = Column(String(512), nullable=False, index=True)
    # Playback duration in seconds
    duration = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(64), default="audio/mpeg", nullable=False)

    access_type = Column(
        SAEnum(AudioAccessType, native_enum=False, length=32),
        default=AudioAccessType.PROTECTED,
        nullable=False,
        index=True,
    )

    # Database relationships
    story = relationship(
        "Story",
        back_populates="audio_assets",
        foreign_keys=[story_id],
    )
    chapter = relationship(
        "Chapter",
        back_populates="audio_assets",
        foreign_keys=[chapter_id],
    )
