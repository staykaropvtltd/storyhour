from sqlalchemy import Boolean, Column, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import BaseSaaSModel


class LibraryItem(BaseSaaSModel):
    """
    StoryHour User Library model.
    Represents an authenticated user's active entitlement to a story,
    originating from purchase, subscription, or promotional grant.
    """
    __tablename__ = "library_items"

    user_id = Column(String(36), nullable=False, index=True)
    story_id = Column(
        String(36),
        ForeignKey("stories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Entitlement origin type: "purchased", "subscription", "free_grant"
    access_type = Column(String(32), default="purchased", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    source_order_id = Column(String(36), nullable=True, index=True)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "story_id",
            name="uq_user_story_library",
        ),
    )

    # Database relationships
    story = relationship("Story", lazy="joined")
