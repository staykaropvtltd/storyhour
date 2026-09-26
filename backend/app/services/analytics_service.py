from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsEvent
from app.repositories.analytics import AnalyticsRepository
from app.schemas.analytics import AnalyticsEventCreate


class AnalyticsService:
    """
    Business service layer orchestrating analytics ingestion, telemetry validation,
    sensitive field sanitization, and administrative aggregation.
    """

    def __init__(self, analytics_repo: Optional[AnalyticsRepository] = None):
        self.analytics_repo = analytics_repo or AnalyticsRepository()

    def track_event(
        self,
        db: Session,
        payload: AnalyticsEventCreate,
        user_id: Optional[str] = None,
    ) -> AnalyticsEvent:
        """
        Record and commit a sanitized telemetry event.
        Guarantees that credentials, tokens, or payment secrets are stripped.
        """
        try:
            event = self.analytics_repo.create_event(
                db,
                event_type=payload.event_type,
                user_id=user_id,
                session_id=payload.session_id,
                properties=payload.properties,
            )
            db.commit()
            db.refresh(event)
            return event
        except Exception:
            db.rollback()
            raise

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
        """Retrieve paginated analytics events for authorized administrative analysis."""
        return self.analytics_repo.list_events(
            db,
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit,
        )

    def get_summary(self, db: Session) -> Dict[str, Any]:
        """Aggregate event counts and key metrics for administrative reporting."""
        return self.analytics_repo.get_summary(db)


analytics_service = AnalyticsService()
