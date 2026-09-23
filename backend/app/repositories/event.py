from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.event import Event, EventStatus


class EventRepository(BaseRepository[Event]):
    """Repository handling database access for Event entities."""

    def __init__(self):
        super().__init__(Event)

    def get_by_id(self, db: Session, id: str) -> Optional[Event]:
        """Retrieve event by primary key UUID."""
        return self.get(db, id)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Event]:
        """Retrieve event by unique URL slug."""
        return db.query(self.model).filter(self.model.slug == slug).first()

    def list(
        self,
        db: Session,
        *,
        status: Optional[EventStatus] = None,
        event_type: Optional[str] = None,
        is_online: Optional[bool] = None,
        featured: Optional[bool] = None,
        upcoming_only: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Event]:
        """List events with optional filtering and pagination."""
        query = db.query(self.model)

        if status is not None:
            query = query.filter(self.model.status == status)
        if event_type:
            query = query.filter(self.model.event_type == event_type)
        if is_online is not None:
            query = query.filter(self.model.is_online == is_online)
        if featured is not None:
            query = query.filter(self.model.featured == featured)
        if upcoming_only:
            now = datetime.now(timezone.utc)
            query = query.filter(self.model.start_date >= now)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    self.model.title.ilike(search_pattern),
                    self.model.short_description.ilike(search_pattern),
                    self.model.location.ilike(search_pattern),
                    self.model.storyteller_name.ilike(search_pattern),
                )
            )

        return query.order_by(self.model.start_date.asc()).offset(skip).limit(limit).all()
