from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text

from app.database.base import BaseSaaSModel


class Story(BaseSaaSModel):
    """
    Core StoryHour story content entity.
    """

    __tablename__ = "stories"

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)

    storyteller_id = Column(
        String(36),
        ForeignKey("storytellers.id"),
        nullable=False,
        index=True,
    )
    language_id = Column(
        String(36),
        ForeignKey("languages.id"),
        nullable=False,
        index=True,
    )
    region_id = Column(
        String(36),
        ForeignKey("regions.id"),
        nullable=False,
        index=True,
    )
    category_id = Column(
        String(36),
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )

    duration = Column(Integer, nullable=True)
    publication_date = Column(Date, nullable=True)
    audio_available = Column(Boolean, nullable=False, default=False)
