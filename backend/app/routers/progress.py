from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.listening_progress import (
    ListeningProgressResponse,
    ListeningProgressUpdate,
    ResumePointResponse,
)
from app.schemas.user import AuthenticatedUser
from app.services.listening_progress_service import ListeningProgressService

router = APIRouter(prefix="/progress", tags=["Listening Progress"])

progress_service = ListeningProgressService()


@router.post(
    "",
    response_model=ListeningProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Record or update listening progress",
)
def record_listening_progress(
    payload: ListeningProgressUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ListeningProgressResponse:
    """
    Save or update audio playback position for the authenticated user.
    Derives user ID strictly from the verified authentication token to prevent cross-user spoofing.
    """
    return progress_service.record_progress(
        db,
        user_id=current_user.id,
        payload=payload,
    )


@router.get(
    "/resume",
    response_model=List[ResumePointResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user's in-progress stories to resume playback",
)
def get_resume_points(
    limit: int = Query(20, ge=1, le=50, description="Max resume entries to return"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ResumePointResponse]:
    """
    Retrieve active in-progress stories for quick resume playback.
    Strictly isolated to the authenticated user.
    """
    return progress_service.get_user_resume_points(
        db,
        user_id=current_user.id,
        limit=limit,
    )


@router.get(
    "/{story_id}",
    response_model=List[ListeningProgressResponse],
    status_code=status.HTTP_200_OK,
    summary="Get listening progress for a specific story",
)
def get_story_listening_progress(
    story_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ListeningProgressResponse]:
    """
    Retrieve all listening progress entries for a specific story belonging to the authenticated user.
    Never returns another user's progress records.
    """
    return progress_service.get_story_progress(
        db,
        user_id=current_user.id,
        story_id=story_id,
    )
