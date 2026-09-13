from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str, Enum):
    """
    Application roles used for authorization.
    """

    CUSTOMER = "Customer"
    EDITOR = "Editor"
    ADMINISTRATOR = "Administrator"


class AuthenticatedUser(BaseModel):
    """
    Internal representation of an authenticated user.

    Identity and role information are populated from a validated
    authentication token and/or the application's user profile.
    """

    id: str = Field(..., description="Unique user ID")
    email: EmailStr = Field(..., description="User email address")
    role: UserRole = Field(
        default=UserRole.CUSTOMER,
        description="Application authorization role",
    )
    is_active: bool = Field(
        default=True,
        description="Whether the user account is active",
    )
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class UserResponse(BaseModel):
    """
    Public API representation of a user.
    """

    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    subscription_tier: str = "free"
    is_active: bool = True
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdateRequest(BaseModel):
    """
    Fields a user is allowed to update through the user API.

    Role, subscription tier, active status, and identity fields are
    deliberately excluded from this request.
    """

    full_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    avatar_url: Optional[str] = Field(
        default=None,
        max_length=1024,
    )

    model_config = ConfigDict(extra="forbid")
