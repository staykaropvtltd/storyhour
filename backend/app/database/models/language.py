from sqlalchemy import Column, String, Text

from app.database.base import BaseSaaSModel


class Language(BaseSaaSModel):
    """
    Language used for StoryHour content.
    """

    __tablename__ = "languages"

    name = Column(String(100), nullable=False, unique=True, index=True)
    code = Column(String(16), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
