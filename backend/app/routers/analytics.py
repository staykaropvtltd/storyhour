from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_optional_user
from app.schemas.analytics import AnalyticsEventCreate, AnalyticsEventResponse
from app.schemas.user import AuthenticatedUser
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Telemetry"])


@router.post(
    "/events",
    response_model=AnalyticsEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest telemetry event",
)
def ingest_analytics_event(
    payload: AnalyticsEventCreate,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> AnalyticsEventResponse:
    """
    Ingest user activity telemetry (story views, plays, searches, filter usage, cart actions).
    Supports anonymous sessions as well as authenticated users.
    Strips credentials, tokens, or payment secrets automatically.
    """
    user_id = current_user.id if current_user else None
    return analytics_service.track_event(db, payload=payload, user_id=user_id)
