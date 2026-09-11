from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AuthenticatedUser(BaseModel):
    """
    Internal model representing a verified user from Supabase Auth.
    Strictly populated from validated JWT claims / Supabase Auth profile.
    """
    id: str = Field(..., description="Unique Supabase Auth User ID (UUID)")
    email: EmailStr = Field(..., description="User email address")
    role: str = Field(default="authenticated", description="User role from Supabase claims")
    is_active: bool = Field(default=True, description="Account active status")
    app_metadata: Dict[str, Any] = Field(default_factory=dict, description="Supabase application metadata")
    user_metadata: Dict[str, Any] = Field(default_factory=dict, description="Supabase custom user profile metadata")
    created_at: Optional[str] = Field(default=None, description="Account creation timestamp")

    model_config = ConfigDict(extra="ignore")

    @property
    def full_name(self) -> Optional[str]:
        """Convenience accessor to get user full name from user_metadata."""
        if not self.user_metadata:
            return None
        if "full_name" in self.user_metadata:
            return self.user_metadata["full_name"]
        first = self.user_metadata.get("first_name", "")
        last = self.user_metadata.get("last_name", "")
        combined = f"{first} {last}".strip()
        return combined or None


class UserProfileResponse(BaseModel):
    """
    Public response schema for /api/me endpoint.
    Safely exposes essential profile information without internal secrets.
    """
    id: str
    email: EmailStr
    role: str
    is_active: bool
    full_name: Optional[str] = None
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None

    model_config = ConfigDict(extra="ignore")
