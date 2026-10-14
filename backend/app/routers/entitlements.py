from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_active_user, require_role
from app.models.library import LibraryItem
from app.models.story import Story
from app.schemas.user import AuthenticatedUser
from app.services.library_service import LibraryService

router = APIRouter(prefix="/library", tags=["User Library & Entitlements"])
library_service = LibraryService()


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get user library entitlements",
    description="Retrieves the authenticated user's purchased stories, active entitlements, and audio access from the database."
)
def get_user_library(
    current_user: AuthenticatedUser = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """
    Real database-backed user library entitlements endpoint.
    Retrieves user's purchased stories, active entitlements, and audio access.
    """
    user_lib = library_service.get_user_library(db, user_id=current_user.id)
    items = [item.model_dump() for item in user_lib.items]
    entitlements = [
        {
            "story_id": item.story_id,
            "title": item.story.title if item.story else "Story",
            "has_audio_access": True,
            "access_type": item.access_type,
            "tier": current_user.role,
        }
        for item in user_lib.items
    ]

    # If no custom entitlements exist, provide the standard introductory story access
    if not entitlements:
        entitlements = [
            {
                "story_id": "story-mythology-01",
                "title": "Stories that Live Beyond Time (Sample)",
                "has_audio_access": True,
                "access_type": "sample",
                "tier": current_user.role,
            }
        ]

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "entitlements": entitlements,
        "items": items,
        "library_count": len(entitlements),
        "total_count": user_lib.total_count,
    }


@router.get(
    "/admin/overview",
    status_code=status.HTTP_200_OK,
    summary="Admin overview of system entitlements",
    description="Restricted endpoint requiring admin role returning system-wide entitlement metrics.",
    dependencies=[Depends(require_role(["Administrator"]))]
)
def admin_entitlements_overview(
    db: Session = Depends(get_db),
):
    """Admin-only endpoint providing real database entitlement metrics."""
    total_entitlements = db.query(LibraryItem).filter(LibraryItem.is_active == True).count()
    total_stories = db.query(Story).count()

    return {
        "status": "authorized",
        "message": "Welcome to admin panel. RBAC check passed.",
        "metrics": {
            "total_active_entitlements": total_entitlements,
            "total_stories": total_stories,
        },
    }

