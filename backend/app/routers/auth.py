from fastapi import APIRouter, Depends, status

from app.core.rate_limit import (
    auth_login_limiter,
    auth_rate_limiter,
    auth_signup_limiter,
)
from app.dependencies import require_active_user
from app.schemas.user import AuthenticatedUser
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MessageResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
    SignUpRequest,
    SignUpResponse,
)
from app.services.supabase_service import supabase_service

router = APIRouter(tags=["Authentication"])


@router.post(
    "/auth/signup",
    response_model=SignUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account (Strictly 4 fields)",
    dependencies=[Depends(auth_signup_limiter)],
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
    dependencies=[Depends(auth_signup_limiter)],
)
def signup_alias(payload: SignUpRequest) -> SignUpResponse:
    """Convenience alias for /api/signup."""
    return signup(payload=payload)


@router.post(
    "/auth/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User login with email and password",
    dependencies=[Depends(auth_login_limiter)],
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
    dependencies=[Depends(auth_login_limiter)],
)
def login_alias(credentials: LoginRequest) -> LoginResponse:
    """Convenience alias for /api/login."""
    return login(credentials=credentials)


@router.post(
    "/auth/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="User logout (API-02)",
    description=(
        "Terminates active session. In Supabase mode, notifies auth provider to sign out; "
        "in stateless JWT mode, confirms session closure for client token disposal."
    ),
)
def logout() -> LogoutResponse:
    """
    Terminates the user session.
    Stateless JWT tokens are discarded client-side; in remote mode, Supabase session is revoked.
    """
    result = supabase_service.sign_out()
    return LogoutResponse(**result)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
    summary="User logout alias (API-02)",
)
def logout_alias() -> LogoutResponse:
    """Convenience alias for /api/logout."""
    return logout()


@router.post(
    "/auth/refresh",
    response_model=RefreshTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token (B-10)",
    dependencies=[Depends(auth_rate_limiter)],
    description="Exchanges a valid refresh token for a fresh access token without re-prompting credentials.",
)
def refresh_token(payload: RefreshTokenRequest) -> RefreshTokenResponse:
    """Refreshes an expired or expiring access token."""
    result = supabase_service.refresh_session(refresh_token=payload.refresh_token)
    return RefreshTokenResponse(**result)


@router.post(
    "/auth/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset link (B-10)",
    dependencies=[Depends(auth_rate_limiter)],
    description="Sends a password recovery email. Always returns a generic message to prevent email enumeration.",
)
def forgot_password(payload: ForgotPasswordRequest) -> MessageResponse:
    """Initiates password reset flow."""
    result = supabase_service.forgot_password(email=payload.email)
    return MessageResponse(**result)


@router.post(
    "/auth/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password with recovery token (B-10)",
    dependencies=[Depends(auth_rate_limiter)],
    description="Updates user password using the temporary recovery access token received in recovery email.",
)
def reset_password(payload: ResetPasswordRequest) -> MessageResponse:
    """Completes password reset using recovery token."""
    result = supabase_service.reset_password(
        access_token=payload.access_token,
        new_password=payload.new_password,
    )
    return MessageResponse(**result)


@router.post(
    "/auth/change-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Change password (Authenticated) (B-10)",
    dependencies=[Depends(auth_rate_limiter)],
    description="Allows authenticated active users to change their password after verifying current credentials.",
)
def change_password(
    payload: ChangePasswordRequest,
    current_user: AuthenticatedUser = Depends(require_active_user),
) -> MessageResponse:
    """Updates password for authenticated active user."""
    result = supabase_service.change_password(
        email=current_user.email,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return MessageResponse(**result)

