from sqlalchemy import Boolean, Column, String, Text
from sqlalchemy.orm import relationship

from app.database.base import BaseSaaSModel


class Category(BaseSaaSModel):
    """
    StoryHour Category model.
    Database-driven taxonomy for classifying stories (e.g. Mythology, Folk Tales, Epics).
    """
    __tablename__ = "categories"

    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Many-to-many relationship with Story
    stories = relationship(
        "Story",
        secondary="story_categories",
        back_populates="categories",
    )
