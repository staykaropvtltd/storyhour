from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, LoginResponse
from app.services.supabase_service import supabase_service

router = APIRouter(tags=["Authentication"])


@router.post(
    "/auth/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User login with email and password",
    description="Authenticates credentials with Supabase Auth, returning a JWT session and profile.",
)
def login(credentials: LoginRequest) -> LoginResponse:
    """
    Authenticate user with email and password.
    
    Security:
    - Normalizes email casing and trims whitespace automatically.
    - Employs anti-enumeration timing and uniform generic 401 error response.
    """
    result = supabase_service.sign_in_with_password(
        email=credentials.email,
        password=credentials.password,
    )
    return LoginResponse(**result)


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
    summary="User login alias",
)
def login_alias(credentials: LoginRequest) -> LoginResponse:
    """Convenience alias for /api/login."""
    return login(credentials=credentials)
