from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.event import EventResponse, EventSummaryResponse
from app.services.event_service import event_service

router = APIRouter(prefix="/events", tags=["Events"])


@router.get(
    "",
    response_model=List[EventSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List published events with optional filtering",
)
def list_events(
    event_type: Optional[str] = Query(None, description="Filter by event format type"),
    is_online: Optional[bool] = Query(None, description="Filter by virtual / in-person mode"),
    featured: Optional[bool] = Query(None, description="Filter by featured showcase status"),
    upcoming_only: Optional[bool] = Query(None, description="Filter for upcoming events only"),
    search: Optional[str] = Query(None, description="Search across title, description, location, and storyteller"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
) -> List[EventSummaryResponse]:
    """
    Retrieve list of published storytelling events.
    Excludes drafts, cancelled, and archived events from public view.
    """
    return event_service.list_published_events(
        db,
        event_type=event_type,
        is_online=is_online,
        featured=featured,
        upcoming_only=upcoming_only,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{slug}",
    response_model=EventResponse,
    status_code=status.HTTP_200_OK,
    summary="Get event details by unique URL slug",
)
def get_event_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> EventResponse:
    """
    Retrieve full details for an event by slug.
    Returns 404 if the event does not exist or is not published.
    """
    event = event_service.get_event_by_slug(db, slug=slug, published_only=True)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with slug '{slug}' not found",
        )
    return event
