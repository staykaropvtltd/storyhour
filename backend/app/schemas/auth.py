from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    """
    Sanitized credentials for user authentication.
    Applies automatic leading/trailing whitespace stripping and lowercasing.
    """
    email: EmailStr = Field(..., description="User login email address")
    password: str = Field(..., min_length=1, description="User password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip().lower()
            if not v:
                raise ValueError("Email cannot be empty or whitespace")
        return v

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, v: Any) -> Any:
        if isinstance(v, str) and not v:
            raise ValueError("Password cannot be empty")
        return v


class LoginResponse(BaseModel):
    """Successful authentication response containing JWT access token and user metadata."""
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = 3600
    refresh_token: Optional[str] = None
    user: Dict[str, Any]

    model_config = ConfigDict(extra="ignore")


class TokenData(BaseModel):
    """Claims extracted from a validated Supabase JWT access token."""
    sub: str = Field(..., description="User ID (Subject)")
    email: Optional[str] = None
    role: str = "authenticated"
    exp: Optional[int] = None
    aud: Optional[str] = None
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(extra="ignore")


class ErrorResponse(BaseModel):
    """Standardized production error response."""
    detail: str
    error_code: str
    status_code: int

    model_config = ConfigDict(extra="ignore")
