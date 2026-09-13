from typing import Callable, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

from app.core.logging import logger
from app.schemas.user import AuthenticatedUser
from app.services.supabase_service import supabase_service

# Define HTTPBearer security scheme with auto_error=False for custom 401 handling
http_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> AuthenticatedUser:
    """
    Core FastAPI dependency to authenticate requests.
    Validates Supabase Bearer token and returns verified AuthenticatedUser.

    Raises:
        HTTPException: 401 UNAUTHORIZED when token is missing, expired, or invalid.
    """
    if not credentials or not credentials.credentials:
        logger.debug("Authentication failed: Missing Bearer token in request headers.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        user = supabase_service.verify_token(token)
        return user
    except jwt.ExpiredSignatureError:
        logger.debug("Authentication failed: Expired access token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={
                "WWW-Authenticate": 'Bearer error="invalid_token", error_description="The access token expired"'
            },
        )
    except (jwt.InvalidTokenError, ValueError) as exc:
        logger.debug(f"Authentication failed: Invalid credentials ({str(exc)}).")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={
                "WWW-Authenticate": 'Bearer error="invalid_token", error_description="The access token is invalid"'
            },
        )


def require_active_user(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """
    Enforces that the authenticated user account is active.

    Raises:
        HTTPException: 403 FORBIDDEN if user is deactivated or suspended.
    """
    if not current_user.is_active:
        logger.warning(f"Access denied for inactive user: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return current_user


def require_role(allowed_roles: List[str]) -> Callable[[AuthenticatedUser], AuthenticatedUser]:
    """
    Dependency factory to enforce Role-Based Access Control (RBAC).
    User role is extracted strictly from verified token claims.

    Example:
        @router.get(
            "/admin/analytics",
            dependencies=[Depends(require_role(["Administrator"]))])
    """
    def role_checker(
        current_user: AuthenticatedUser = Depends(require_active_user),
    ) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            logger.warning(
                f"User {current_user.id} with role '{current_user.role}' "
                f"forbidden from resource requiring {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this resource",
            )
        return current_user

    return role_checker


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> Optional[AuthenticatedUser]:
    """
    Optional authentication dependency for mixed public/member endpoints
    (e.g., sample audio preview vs full member-unlocked audio).
    Returns None if no token or invalid token, without raising an exception.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        return supabase_service.verify_token(credentials.credentials)
    except Exception:
        return None
