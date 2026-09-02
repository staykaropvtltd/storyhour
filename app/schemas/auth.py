from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserSignUpRequest(BaseModel):
    """Schema for user sign up."""
    first_name: str = Field(..., min_length=1, max_length=100, description="First name of the user", examples=["John"])
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name of the user", examples=["Doe"])
    email: EmailStr = Field(..., description="Valid email address", examples=["john.doe@example.com"])
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)", examples=["SecurePass123!"])
    confirm_password: str = Field(..., description="Confirm password matching the password field", examples=["SecurePass123!"])

    @model_validator(mode="after")
    def verify_password_match(self):
        if self.password != self.confirm_password:
            raise ValueError("confirm password does not match password")
        return self


class UserSignInRequest(BaseModel):
    """Schema for user sign in."""
    email: EmailStr = Field(..., description="Registered user email", examples=["john.doe@example.com"])
    password: str = Field(..., description="User password", examples=["SecurePass123!"])


class UserResponse(BaseModel):
    """Public user response schema."""
    id: int
    first_name: str
    last_name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Token response schema for successful authentication."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
