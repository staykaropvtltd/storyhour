from typing import List
from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user, require_role
from app.schemas.user import AuthenticatedUser

router = APIRouter(prefix="/library", tags=["User Library & Entitlements"])


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get user library entitlements",
    description="Retrieves the authenticated user's purchased stories, active entitlements, and audio access."
)
def get_user_library(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Sample protected resource demonstrating integration with future
    StoryHour library, audio streams, and purchase entitlements.
    """
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "entitlements": [
            {
                "story_id": "story-mythology-01",
                "title": "Stories that Live Beyond Time",
                "has_audio_access": True,
                "tier": current_user.role,
            }
        ],
        "library_count": 1,
    }


@router.get(
    "/admin/overview",
    status_code=status.HTTP_200_OK,
    summary="Admin overview of system entitlements",
    description="Restricted endpoint requiring admin role.",
    dependencies=[Depends(require_role(["admin"]))]
)
def admin_entitlements_overview():
    """Admin-only endpoint demonstrating RBAC role verification."""
    return {
        "status": "authorized",
        "message": "Welcome to admin panel. RBAC check passed.",
    }
