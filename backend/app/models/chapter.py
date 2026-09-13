from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import BaseSaaSModel


class Chapter(BaseSaaSModel):
    """
    StoryHour Chapter model.
    Represents an ordered segment or episode within a story, with audio timeline markers
    and explicit database-level sequence persistence.
    """
    __tablename__ = "chapters"

    story_id = Column(
        String(36),
        ForeignKey("stories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    # Database-backed chapter order index (1, 2, 3...)
    order = Column(Integer, nullable=False, index=True)
    # Timeline cue points in seconds
    start_time = Column(Integer, default=0, nullable=False)
    duration = Column(Integer, default=0, nullable=False)
    preview_available = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("story_id", "order", name="uq_chapter_story_order"),
    )

    # Database relationships
    story = relationship("Story", back_populates="chapters")
    audio_assets = relationship(
        "AudioAsset",
        back_populates="chapter",
        lazy="selectin",
    )
