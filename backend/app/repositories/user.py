from typing import Optional

from sqlalchemy.orm import Session

from app.database.models.profile import UserProfile


class UserRepository:
    """
    Repository responsible for database access to user profiles.

    Authentication itself is handled by Supabase Auth.
    This repository manages the application's local UserProfile record.
    """

    def get_by_id(
        self,
        db: Session,
        user_id: str,
    ) -> Optional[UserProfile]:
        """Return a user profile by Supabase Auth user ID."""
        return (
            db.query(UserProfile)
            .filter(
                UserProfile.user_id == user_id,
                UserProfile.is_deleted.is_(False),
            )
            .first()
        )

    def get_by_email(
        self,
        db: Session,
        email: str,
    ) -> Optional[UserProfile]:
        """Return a user profile by email address."""
        return (
            db.query(UserProfile)
            .filter(
                UserProfile.email == email.strip().lower(),
                UserProfile.is_deleted.is_(False),
            )
            .first()
        )

    def create(
        self,
        db: Session,
        *,
        user_id: str,
        email: str,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        subscription_tier: str = "free",
    ) -> UserProfile:
        """Create a local user profile."""
        profile = UserProfile(
            user_id=user_id,
            email=email.strip().lower(),
            full_name=full_name,
            avatar_url=avatar_url,
            subscription_tier=subscription_tier,
            is_active=True,
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return profile

    def update(
        self,
        db: Session,
        profile: UserProfile,
        *,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
    ) -> UserProfile:
        """Update mutable profile fields."""
        if full_name is not None:
            profile.full_name = full_name.strip()

        if avatar_url is not None:
            profile.avatar_url = avatar_url

        db.commit()
        db.refresh(profile)

        return profile


user_repository = UserRepository()
