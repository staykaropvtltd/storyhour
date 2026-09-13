from sqlalchemy import Column, String, Text

from app.database.base import BaseSaaSModel


class Category(BaseSaaSModel):
    """
    Content category used to organize StoryHour stories and related content.
    """

    __tablename__ = "categories"

    name = Column(String(150), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
