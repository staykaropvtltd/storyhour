import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.models.profile import UserProfile
from app.database.session import get_db
from app.dependencies import get_current_user, require_active_user
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


@router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Deactivate user account (GDPR soft-delete) (B-10)",
    description="Deactivates the authenticated user account and marks profile as soft-deleted.",
)
def delete_me(
    current_user: AuthenticatedUser = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Soft-deletes and deactivates the user profile."""
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )
    if profile:
        profile.is_deleted = True
        profile.is_active = False
        db.commit()

    return {
        "message": "User account successfully deactivated.",
        "user_id": current_user.id,
        "is_deleted": True,
    }


@router.get(
    "/me/export",
    status_code=status.HTTP_200_OK,
    summary="Export user personal data (GDPR Article 20) (B-10)",
    description="Exports all personal data, library entitlements, and listening progress stored for the user.",
)
def export_my_data(
    current_user: AuthenticatedUser = Depends(require_active_user),
    db: Session = Depends(get_db),
):
    """Exports personal data archive for the authenticated user."""
    from app.models.library import LibraryItem
    from app.models.listening_progress import ListeningProgress
    from app.models.order import Order

    profile = _get_user_profile(db, current_user)
    lib_items = db.query(LibraryItem).filter(LibraryItem.user_id == current_user.id).all()
    progress_items = db.query(ListeningProgress).filter(ListeningProgress.user_id == current_user.id).all()
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()

    return {
        "export_metadata": {
            "user_id": current_user.id,
            "export_format": "GDPR-JSON-v1",
        },
        "profile": {
            "email": current_user.email,
            "full_name": profile.full_name,
            "avatar_url": profile.avatar_url,
            "subscription_tier": profile.subscription_tier,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
        },
        "library_entitlements": [
            {
                "story_id": item.story_id,
                "access_type": item.access_type,
                "is_active": item.is_active,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in lib_items
        ],
        "listening_progress": [
            {
                "story_id": p.story_id,
                "chapter_id": p.chapter_id,
                "position_seconds": p.position_seconds,
                "completed": p.completed,
                "updated_at": p.updated_at.isoformat() if p.updated_at else None,
            }
            for p in progress_items
        ],
        "orders": [
            {
                "order_number": o.order_number,
                "status": o.status,
                "currency": o.currency,
                "total_amount": float(o.total_amount) if hasattr(o, "total_amount") and o.total_amount is not None else 0.0,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
    }

