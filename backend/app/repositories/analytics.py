from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.repository import BaseRepository
from app.models.analytics import AnalyticsEvent


class AnalyticsRepository(BaseRepository[AnalyticsEvent]):
    """Repository handling database access for Analytics telemetry events."""

    def __init__(self):
        super().__init__(AnalyticsEvent)

    def create_event(
        self,
        db: Session,
        *,
        event_type: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None,
    ) -> AnalyticsEvent:
        """Create and flush an analytics event instance."""
        event = AnalyticsEvent(
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            properties=properties or {},
        )
        db.add(event)
        db.flush()
        db.refresh(event)
        return event

    def list_events(
        self,
        db: Session,
        *,
        event_type: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[AnalyticsEvent]:
        """Query analytics events with optional filters."""
        query = db.query(self.model)

        if event_type:
            query = query.filter(self.model.event_type == event_type)
        if user_id:
            query = query.filter(self.model.user_id == user_id)
        if session_id:
            query = query.filter(self.model.session_id == session_id)
        if start_date:
            query = query.filter(self.model.created_at >= start_date)
        if end_date:
            query = query.filter(self.model.created_at <= end_date)

        return (
            query.order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_summary(self, db: Session) -> Dict[str, Any]:
        """Aggregate counts grouped by event type, unique users, and total counts."""
        total_events = db.query(func.count(self.model.id)).scalar() or 0

        type_counts = (
            db.query(self.model.event_type, func.count(self.model.id))
            .group_by(self.model.event_type)
            .all()
        )
        events_by_type = {etype: count for etype, count in type_counts}

        unique_users = (
            db.query(func.count(func.distinct(self.model.user_id)))
            .filter(self.model.user_id.isnot(None))
            .scalar()
            or 0
        )

        unique_sessions = (
            db.query(func.count(func.distinct(self.model.session_id)))
            .filter(self.model.session_id.isnot(None))
            .scalar()
            or 0
        )

        return {
            "total_events": total_events,
            "events_by_type": events_by_type,
            "unique_users": unique_users,
            "unique_sessions": unique_sessions,
        }
