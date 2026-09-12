from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user
from app.schemas.user import AuthenticatedUser, UserProfileResponse

router = APIRouter(tags=["User Profile"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user profile",
    description="Validates the Supabase Bearer token and returns authenticated user details."
)
def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> UserProfileResponse:
    """
    Returns verified profile data for the authenticated user.
    Role and identity are extracted exclusively from the Supabase JWT.
    """
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        full_name=current_user.full_name,
        app_metadata=current_user.app_metadata,
        user_metadata=current_user.user_metadata,
        created_at=current_user.created_at
    )


@router.get(
    "/auth/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
    summary="Get authenticated user profile (alias)",
)
def get_auth_me(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> UserProfileResponse:
    """Alias for /api/me under the /api/auth prefix."""
    return get_me(current_user=current_user)
