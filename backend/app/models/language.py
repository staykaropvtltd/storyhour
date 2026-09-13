from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship

from app.database.base import BaseSaaSModel


class Language(BaseSaaSModel):
    """
    StoryHour Language model.
    Database-driven representation for linguistic localization (e.g. en, hi, te).
    """
    __tablename__ = "languages"

    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False, index=True)
    native_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Many-to-many relationship with Story
    stories = relationship(
        "Story",
        secondary="story_languages",
        back_populates="languages",
    )
