from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, LoginResponse, SignUpRequest, SignUpResponse
from app.services.supabase_service import supabase_service

router = APIRouter(tags=["Authentication"])


@router.post(
    "/auth/signup",
    response_model=SignUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account (Strictly 4 fields)",
    description=(
        "Registers a new account in Supabase Auth. "
        "Strictly contains only 4 fields (not more than that):\n"
        "1. Name: (name)\n"
        "2. email id : (email)\n"
        "3. password : (password)\n"
        "4. confirm the password : (confirm_password)\n"
        "Any additional fields are forbidden."
    ),
)
def signup(payload: SignUpRequest) -> SignUpResponse:
    """
    Register a new user account.
    
    Accepts strictly 4 fields and not more than that:
    - Name:
    - email id :
    - password :
    - confirm the password :
    """
    result = supabase_service.sign_up(
        name=payload.name,
        email=payload.email,
        password=payload.password,
    )
    return SignUpResponse(**result)


@router.post(
    "/signup",
    response_model=SignUpResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
    summary="User signup alias",
)
def signup_alias(payload: SignUpRequest) -> SignUpResponse:
    """Convenience alias for /api/signup."""
    return signup(payload=payload)


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
