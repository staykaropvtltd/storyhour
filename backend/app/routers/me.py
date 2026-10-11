import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.profile import UserProfile
from app.database.session import get_db
from app.dependencies import get_current_user
from app.repositories.user import user_repository
from app.schemas.user import (
    AuthenticatedUser,
    UserResponse,
    UserUpdateRequest,
)

logger = logging.getLogger("storyhour")

router = APIRouter(tags=["User Profile"])


def _build_user_response(
    current_user: AuthenticatedUser,
    profile,
) -> UserResponse:
    """
    Convert the authenticated identity and local profile into
    the public user response.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        role=current_user.role,
        subscription_tier=profile.subscription_tier,
        is_active=profile.is_active,
        created_at=(
            profile.created_at.isoformat()
            if profile.created_at
            else current_user.created_at
        ),
    )


def _get_user_profile(
    db: Session,
    current_user: AuthenticatedUser,
):
    """Return the local profile for the authenticated user, validating active status."""
    try:
        profile = (
            db.query(UserProfile)
            .filter(UserProfile.user_id == current_user.id)
            .first()
        )
    except Exception as e:
        logger.error(f"Database error checking user profile for {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while verifying account status.",
        )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    if profile.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated",
        )

    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return profile


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user profile",
    description="Returns the authenticated user's profile.",
)
def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Return the authenticated user's profile."""
    profile = _get_user_profile(db, current_user)
    return _build_user_response(current_user, profile)


@router.patch(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update authenticated user profile",
    description="Updates mutable profile fields for the authenticated user.",
)
def update_me(
    payload: UserUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Update the currently authenticated user's profile."""
    profile = _get_user_profile(db, current_user)

    updated_profile = user_repository.update(
        db,
        profile,
        full_name=payload.full_name,
        avatar_url=payload.avatar_url,
    )

    return _build_user_response(current_user, updated_profile)


@router.get(
    "/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
    summary="Get authenticated user profile (alias)",
)
def get_auth_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Compatibility alias for /api/auth/me."""
    profile = _get_user_profile(db, current_user)
    return _build_user_response(current_user, profile)


@router.get(
    "/v1/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user profile",
)
def get_v1_auth_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Get the authenticated user's profile."""
    profile = _get_user_profile(db, current_user)
    return _build_user_response(current_user, profile)
