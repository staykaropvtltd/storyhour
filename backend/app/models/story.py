import enum
from typing import List
from sqlalchemy import (
    Boolean,
    Column,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    JSON,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship

from app.database.base import Base, BaseSaaSModel


class StoryStatus(str, enum.Enum):
    """Lifecycle status states for editorial publishing."""
    DRAFT = "DRAFT"
    REVIEW = "REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


# Association table for Story <-> Category many-to-many relationship
story_categories = Table(
    "story_categories",
    Base.metadata,
    Column(
        "story_id",
        String(36),
        ForeignKey("stories.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    ),
    Column(
        "category_id",
        String(36),
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    ),
)

# Association table for Story <-> Language many-to-many relationship
story_languages = Table(
    "story_languages",
    Base.metadata,
    Column(
        "story_id",
        String(36),
        ForeignKey("stories.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    ),
    Column(
        "language_id",
        String(36),
        ForeignKey("languages.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    ),
)


class Story(BaseSaaSModel):
    """
    StoryHour Core Story model.
    Encapsulates core folklore, epic, and audiobook content metadata,
    supporting multilingual tagging, categorisation, and chapter hierarchy.
    """
    __tablename__ = "stories"

    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    short_description = Column(Text, nullable=True)
    long_description = Column(Text, nullable=True)
    cover_image = Column(String(1024), nullable=True)
    hero_media = Column(String(1024), nullable=True)

    status = Column(
        SAEnum(StoryStatus, native_enum=False, length=32),
        default=StoryStatus.DRAFT,
        nullable=False,
        index=True,
    )

    # Simple production-safe JSON representation for themes
    themes = Column(JSON, default=list, nullable=False)

    narrator = Column(String(255), nullable=True)
    # Total duration in seconds (e.g., 860 mins = 51600 seconds)
    duration = Column(Integer, default=0, nullable=False)
    age_group = Column(String(64), nullable=True)
    cultural_context = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)

    # Reference mapping for future commerce integration (belongs to Saketh)
    product_id = Column(String(64), nullable=True, index=True)

    featured = Column(Boolean, default=False, nullable=False, index=True)
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(String(500), nullable=True)

    # Database relationships
    categories = relationship(
        "Category",
        secondary=story_categories,
        back_populates="stories",
        lazy="joined",
    )

    languages = relationship(
        "Language",
        secondary=story_languages,
        back_populates="stories",
        lazy="joined",
    )

    chapters = relationship(
        "Chapter",
        back_populates="story",
        cascade="all, delete-orphan",
        order_by="Chapter.order",
        lazy="selectin",
    )

    audio_assets = relationship(
        "AudioAsset",
        back_populates="story",
        cascade="all, delete-orphan",
        foreign_keys="[AudioAsset.story_id]",
        lazy="selectin",
    )
