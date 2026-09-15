from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import BaseSaaSModel


class ListeningProgress(BaseSaaSModel):
    """
    StoryHour Listening Progress model.
    Tracks playback timestamp, chapter progression, and completion status
    for authenticated users with strict user isolation.
    """
    __tablename__ = "listening_progress"

    user_id = Column(String(36), nullable=False, index=True)
    story_id = Column(
        String(36),
        ForeignKey("stories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chapter_id = Column(
        String(36),
        ForeignKey("chapters.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    position_seconds = Column(Integer, default=0, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "story_id",
            "chapter_id",
            name="uq_user_story_chapter_progress",
        ),
    )

    # Database relationships
    story = relationship("Story", lazy="joined")
    chapter = relationship("Chapter", lazy="joined")
