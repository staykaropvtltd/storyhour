from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.library import UserLibraryResponse
from app.schemas.user import AuthenticatedUser
from app.services.library_service import LibraryService

router = APIRouter(prefix="/library", tags=["User Library"])

library_service = LibraryService()


@router.get(
    "/me",
    response_model=UserLibraryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user's real personal library",
)
def get_my_library(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(50, ge=1, le=100, description="Pagination limit"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserLibraryResponse:
    """
    Retrieve real database-backed stories and audio access entitlements for the authenticated user.
    Ensures strict tenant/user isolation.
    """
    return library_service.get_user_library(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
