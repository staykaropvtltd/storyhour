from typing import Any, Dict, Optional
from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class LoginRequest(BaseModel):
    """
    Sanitized credentials for user authentication.
    Applies automatic leading/trailing whitespace stripping and lowercasing.
    """
    email: EmailStr = Field(
        ...,
        description="User login email address",
        validation_alias=AliasChoices("email", "email_id", "email id", "emailId", "mail"),
    )
    password: str = Field(
        ...,
        min_length=1,
        description="User password",
        validation_alias=AliasChoices("password", "Password", "pass"),
    )

    model_config = ConfigDict(extra="ignore", populate_by_name=True)


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


class SignUpRequest(BaseModel):
    """
    Sanitized payload for user registration.
    Strictly contains only 4 fields and not more than that:
    1. Name:
    2. email id :
    3. password :
    4. confirm the password :
    """
    name: str = Field(
        ...,
        min_length=1,
        description="User's full name (Name:)",
        validation_alias=AliasChoices(
            "name",
            "Name",
            "Name:",
            "full_name",
        ),
    )
    email: EmailStr = Field(
        ...,
        description="User's email id (email id :)",
        validation_alias=AliasChoices(
            "email",
            "email_id",
            "email id",
            "email id :",
            "emailId",
            "Email id :",
            "Email ID :",
            "Email id",
            "Email ID",
            "mail",
        ),
    )
    password: str = Field(
        ...,
        min_length=6,
        description="User password (password :)",
        validation_alias=AliasChoices(
            "password",
            "Password",
            "password :",
            "Password :",
            "pass",
        ),
    )
    confirm_password: str = Field(
        ...,
        min_length=6,
        description="Confirmation password (confirm the password :)",
        validation_alias=AliasChoices(
            "confirm_password",
            "confirm the password",
            "confirm the password :",
            "Confirm the password :",
            "Confirm the password",
            "confirm_the_password",
            "confirm password",
            "confirm password :",
            "Confirm password :",
            "confirmPassword",
            "Confirm Password",
            "confirm_pass",
        ),
    )

    # Strictly forbid any additional fields beyond the 4 allowed fields
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty or whitespace")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip().lower()
            if not v:
                raise ValueError("Email cannot be empty or whitespace")
        return v

    @field_validator("password", "confirm_password", mode="before")
    @classmethod
    def validate_password_not_empty(cls, v: Any) -> Any:
        if isinstance(v, str) and not v:
            raise ValueError("Password cannot be empty")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self) -> "SignUpRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class SignUpResponse(BaseModel):
    """Response returned upon successful user registration."""
    message: str = "User registered successfully"
    user_id: str
    email: str
    session_active: bool = False
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None
    user: Dict[str, Any]

    model_config = ConfigDict(extra="ignore")

