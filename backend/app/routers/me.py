from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import require_active_user
from app.repositories.user import user_repository
from app.schemas.user import (
    AuthenticatedUser,
    UserResponse,
    UserUpdateRequest,
)


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


def _build_auth_fallback_response(
    current_user: AuthenticatedUser,
) -> UserResponse:
    """
    Build a response from the authenticated JWT when a local profile
    does not yet exist.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=(
            current_user.user_metadata.get("full_name")
            or current_user.user_metadata.get("name")
        ),
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


def _get_user_profile(
    db: Session,
    current_user: AuthenticatedUser,
):
    """Return the local profile for the authenticated user."""
    profile = user_repository.get_by_id(db, current_user.id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
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
    current_user: AuthenticatedUser = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Return the authenticated user's profile."""
    profile = user_repository.get_by_id(db, current_user.id)

    if profile is None:
        return _build_auth_fallback_response(current_user)

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
    current_user: AuthenticatedUser = Depends(require_active_user),
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
    current_user: AuthenticatedUser = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Compatibility alias for /api/auth/me."""
    profile = user_repository.get_by_id(db, current_user.id)

    if profile is None:
        return _build_auth_fallback_response(current_user)

    return _build_user_response(current_user, profile)


@router.get(
    "/v1/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user profile",
)
def get_v1_auth_me(
    current_user: AuthenticatedUser = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Get the authenticated user's profile."""
    profile = user_repository.get_by_id(db, current_user.id)

    if profile is None:
        return _build_auth_fallback_response(current_user)

    return _build_user_response(current_user, profile)
