from sqlalchemy import Boolean, Column, String
from app.database.base import BaseSaaSModel, SoftDeleteMixin


class UserProfile(BaseSaaSModel, SoftDeleteMixin):
    """
    SaaS User Profile table synchronized with Supabase Auth identities.
    Links auth UUIDs to domain profile information and membership tier.
    """
    __tablename__ = "user_profiles"

    # Supabase Auth User UUID (matches auth.users.id)
    user_id = Column(String(36), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(1024), nullable=True)
    
    # StoryHour membership tier: "free", "standard", "patron", "unlimited"
    subscription_tier = Column(String(32), default="free", nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
