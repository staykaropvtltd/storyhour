import enum
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    Integer,
    JSON,
    String,
    Text,
)

from app.database.base import BaseSaaSModel, SoftDeleteMixin


class JournalStatus(str, enum.Enum):
    """Lifecycle publishing states for editorial journal articles."""
    DRAFT = "DRAFT"
    REVIEW = "REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class JournalArticle(BaseSaaSModel, SoftDeleteMixin):
    """
    StoryHour Journal Article model.
    Encapsulates editorial essays, cultural commentaries, storyteller interviews,
    and behind-the-scenes literature.
    """
    __tablename__ = "journal_articles"

    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    short_description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    hero_image = Column(String(1024), nullable=True)

    author_name = Column(String(255), nullable=False)
    author_bio = Column(Text, nullable=True)

    category = Column(String(100), nullable=True, index=True)
    tags = Column(JSON, default=list, nullable=False)

    status = Column(
        SAEnum(JournalStatus, native_enum=False, length=32),
        default=JournalStatus.DRAFT,
        nullable=False,
        index=True,
    )

    reading_time_minutes = Column(Integer, default=5, nullable=False)
    featured = Column(Boolean, default=False, nullable=False, index=True)
    publication_date = Column(DateTime(timezone=True), nullable=True, index=True)
