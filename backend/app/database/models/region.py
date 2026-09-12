from sqlalchemy import Column, String, Text

from app.database.base import BaseSaaSModel


class Region(BaseSaaSModel):
    """
    Geographic region associated with StoryHour content.
    """

    __tablename__ = "regions"

    name = Column(String(150), nullable=False, unique=True, index=True)
    code = Column(String(32), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
