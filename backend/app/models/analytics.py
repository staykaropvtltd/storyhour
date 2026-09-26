import enum
from sqlalchemy import Column, JSON, String

from app.database.base import BaseSaaSModel


class AnalyticsEventType(str, enum.Enum):
    """Specification-defined analytics telemetry event types."""
    STORY_VIEW = "story_view"
    STORY_PLAY = "story_play"
    STORY_PROGRESS = "story_progress"
    STORY_COMPLETE = "story_complete"
    SEARCH = "search"
    FILTER_USED = "filter_used"
    ADD_TO_CART = "add_to_cart"
    CHECKOUT_START = "checkout_start"
    PURCHASE = "purchase"
    EVENT_VIEW = "event_view"
    EVENT_ENQUIRY = "event_enquiry"


class AnalyticsEvent(BaseSaaSModel):
    """
    StoryHour Analytics Event model.
    Captures telemetry events with structured contextual properties without
    storing credentials, authentication secrets, or payment credentials.
    """
    __tablename__ = "analytics_events"

    event_type = Column(
        String(64),
        nullable=False,
        index=True,
    )
    user_id = Column(
        String(64),
        nullable=True,
        index=True,
    )
    session_id = Column(
        String(128),
        nullable=True,
        index=True,
    )
    properties = Column(
        JSON,
        default=dict,
        nullable=False,
    )
