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


class EventStatus(str, enum.Enum):
    """Lifecycle status states for events."""
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class Event(BaseSaaSModel, SoftDeleteMixin):
    """
    StoryHour Event model.
    Encapsulates scheduled performances, storytelling circles, workshops, and festivals.
    """
    __tablename__ = "events"

    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    hero_media = Column(String(1024), nullable=True)

    event_type = Column(String(64), nullable=False, default="performance", index=True)

    status = Column(
        SAEnum(EventStatus, native_enum=False, length=32),
        default=EventStatus.DRAFT,
        nullable=False,
        index=True,
    )

    start_date = Column(DateTime(timezone=True), nullable=False, index=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    time_display = Column(String(100), nullable=True)

    location = Column(String(255), nullable=False)
    venue_details = Column(Text, nullable=True)
    is_online = Column(Boolean, default=False, nullable=False, index=True)

    featured = Column(Boolean, default=False, nullable=False, index=True)
    storyteller_name = Column(String(255), nullable=True)

    # Agenda / schedule breakdown as structured JSON
    schedule = Column(JSON, default=list, nullable=False)

    # Informational admission / ticket notes (booking/payments explicitly out of scope)
    ticket_info = Column(String(255), nullable=True)
    registration_url = Column(String(1024), nullable=True)
    capacity = Column(Integer, nullable=True)
