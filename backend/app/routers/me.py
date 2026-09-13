from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user
from app.schemas.user import AuthenticatedUser, UserResponse


router = APIRouter(tags=["User Profile"])


def _build_user_response(current_user: AuthenticatedUser) -> UserResponse:
    """
    Convert the authenticated identity into the public user response.

    The local UserProfile repository will eventually provide the
    domain-specific fields such as avatar_url and subscription_tier.
    """
    full_name = None

    if current_user.user_metadata:
        full_name = (
            current_user.user_metadata.get("full_name")
            or current_user.user_metadata.get("name")
        )

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user profile",
    description="Returns the authenticated user's profile.",
)
def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> UserResponse:
    """Return the currently authenticated user."""
    return _build_user_response(current_user)


@router.get(
    "/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
    summary="Get authenticated user profile (alias)",
)
def get_auth_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> UserResponse:
    """Compatibility alias for /api/auth/me."""
    return _build_user_response(current_user)
