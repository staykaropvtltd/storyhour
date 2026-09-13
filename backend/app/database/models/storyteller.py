from sqlalchemy import Column, String, Text

from app.database.base import BaseSaaSModel


class Storyteller(BaseSaaSModel):
    """
    StoryHour storyteller profile.

    Represents a person who tells or contributes stories on the platform.
    """

    __tablename__ = "storytellers"

    name = Column(String(255), nullable=False, index=True)
    biography = Column(Text, nullable=True)
    portrait_url = Column(String(1024), nullable=True)

    # References to the storyteller's primary region/language will be added
    # when those domain models are introduced.
