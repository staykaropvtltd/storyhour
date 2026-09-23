from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.event import Event, EventStatus
from app.repositories.event import EventRepository


class EventService:
    """
    Business service layer orchestrating Event domain operations.
    Enforces publication lifecycle validation and query delegation.
    """

    def __init__(self, event_repo: Optional[EventRepository] = None):
        self.event_repo = event_repo or EventRepository()

    def get_event_by_id(self, db: Session, event_id: str) -> Optional[Event]:
        """Fetch event by unique UUID."""
        return self.event_repo.get_by_id(db, event_id)

    def get_event_by_slug(
        self,
        db: Session,
        slug: str,
        published_only: bool = True,
    ) -> Optional[Event]:
        """
        Fetch event by slug.
        If published_only is True, verifies that the event status is PUBLISHED.
        """
        event = self.event_repo.get_by_slug(db, slug)
        if not event:
            return None
        if published_only and event.status != EventStatus.PUBLISHED:
            return None
        return event

    def list_published_events(
        self,
        db: Session,
        *,
        event_type: Optional[str] = None,
        is_online: Optional[bool] = None,
        featured: Optional[bool] = None,
        upcoming_only: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Event]:
        """List publicly available published events for frontend discovery."""
        return self.event_repo.list(
            db,
            status=EventStatus.PUBLISHED,
            event_type=event_type,
            is_online=is_online,
            featured=featured,
            upcoming_only=upcoming_only,
            search=search,
            skip=skip,
            limit=limit,
        )


event_service = EventService()
