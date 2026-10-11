from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import jwt
from supabase import create_client, Client

from app.config import settings
from app.core.logging import logger
from app.schemas.user import AuthenticatedUser

def _normalize_role(role: Optional[str]) -> str:
    """
    Convert authentication-provider roles into application roles.
    """
    role_map = {
        "authenticated": "Customer",
        "customer": "Customer",
        "editor": "Editor",
        "admin": "Administrator",
        "administrator": "Administrator",
    }

    normalized = (role or "authenticated").strip().lower()
    return role_map.get(normalized, "Customer")

class SupabaseAuthService:
    """
    Production-grade service to interact with Supabase Auth and
    verify Supabase JWT access tokens.
    """

    def __init__(self):
        self._anon_client: Optional[Client] = None
        self._admin_client: Optional[Client] = None

    @property
    def anon_client(self) -> Optional[Client]:
        """Lazy initializer for standard anonymous Supabase client."""
        if self._anon_client is None and settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                self._anon_client = create_client(
                    supabase_url=settings.SUPABASE_URL,
                    supabase_key=settings.SUPABASE_ANON_KEY
                )
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
        return self._anon_client

    @property
    def admin_client(self) -> Optional[Client]:
        """Lazy initializer for admin service-role Supabase client."""
        if self._admin_client is None and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                self._admin_client = create_client(
                    supabase_url=settings.SUPABASE_URL,
                    supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("Supabase admin client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase admin client: {str(e)}")
        return self._admin_client

    @property
    def auth_mode(self) -> str:
        """Determines the active authentication verification mode."""
        mode = (getattr(settings, "AUTH_MODE", "") or "").strip().lower()
        if mode in ("supabase", "local"):
            return mode
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            return "supabase"
        return "local"

    def verify_token(self, token: str) -> AuthenticatedUser:
        """
        Validates incoming access token (JWT).
        In 'supabase' mode: Strictly validates against Supabase Auth API without fallback.
        In 'local' mode: Strictly validates signature, expiration, audience, and claims locally.

        Raises:
            jwt.ExpiredSignatureError: When token has expired.
            jwt.InvalidTokenError: When token format or signature is invalid, or provider verification fails.
            ValueError: When required claims (sub, email) are missing.
        """
        if not token or not isinstance(token, str) or not token.strip():
            raise jwt.InvalidTokenError("Token is missing or empty")

        mode = self.auth_mode
        if mode == "supabase":
            return self._verify_supabase_remote(token)
        elif mode == "local":
            return self._verify_local_jwt(token)
        else:
            raise jwt.InvalidTokenError(f"Unsupported authentication mode: {mode}")

    def _verify_supabase_remote(self, token: str) -> AuthenticatedUser:
        """
        Strict authoritative remote verification against Supabase Auth API.
        Never falls back to local JWT decoding on failure.
        """
        if self.anon_client is None:
            logger.error("Supabase client is not configured for remote verification.")
            raise jwt.InvalidTokenError("Authentication service is currently not configured")

        try:
            res = self.anon_client.auth.get_user(token)
        except Exception as exc:
            err_msg = str(exc)
            logger.debug(f"Remote Supabase validation failed: {err_msg}")
            if "expired" in err_msg.lower():
                raise jwt.ExpiredSignatureError("Token has expired")
            raise jwt.InvalidTokenError(f"Could not validate credentials with authentication provider: {err_msg}")

        if not res or not getattr(res, "user", None):
            raise jwt.InvalidTokenError("Invalid token or user not found")

        user_data = res.user
        user_id = str(getattr(user_data, "id", "")).strip()
        if not user_id:
            raise ValueError("Token subject (sub) claim missing")

        email = getattr(user_data, "email", None)
        if not email or not str(email).strip():
            raise ValueError("Token email claim missing")

        app_meta = getattr(user_data, "app_metadata", {}) or {}
        user_meta = getattr(user_data, "user_metadata", {}) or {}
        raw_role = (
            app_meta.get("role")
            or getattr(user_data, "role", None)
            or "authenticated"
        )
        role = _normalize_role(raw_role)

        # Token identity verified; application active status is strictly verified by database
        return AuthenticatedUser(
            id=user_id,
            email=str(email).strip().lower(),
            role=role,
            is_active=False,
            app_metadata=app_meta,
            user_metadata=user_meta,
            created_at=str(getattr(user_data, "created_at", "")) if hasattr(user_data, "created_at") else None,
        )

    def _verify_local_jwt(self, token: str) -> AuthenticatedUser:
        """
        Strict local cryptographic verification for explicitly configured local JWT mode.
        """
        payload = self._decode_jwt(token)

        user_id = payload.get("sub")
        if not user_id or not str(user_id).strip():
            raise ValueError("Token subject (sub) claim missing")

        email = payload.get("email")
        if not email or not str(email).strip():
            raise ValueError("Token email claim missing")

        app_metadata = payload.get("app_metadata", {}) or {}
        user_metadata = payload.get("user_metadata", {}) or {}

        raw_role = app_metadata.get("role") or payload.get("role", "authenticated")
        role = _normalize_role(raw_role)

        return AuthenticatedUser(
            id=str(user_id).strip(),
            email=str(email).strip().lower(),
            role=role,
            is_active=False,
            app_metadata=app_metadata,
            user_metadata=user_metadata,
            created_at=payload.get("created_at"),
        )

    def _decode_jwt(self, token: str) -> Dict[str, Any]:
        """
        Cryptographically decodes and verifies JWT signature and expiry.
        Strictly validates secret, algorithm, expiration, and audience.
        """
        secret = settings.SUPABASE_JWT_SECRET
        if not secret or not isinstance(secret, str) or not secret.strip():
            logger.error("Local JWT verification failed: SUPABASE_JWT_SECRET is empty or not configured.")
            raise jwt.InvalidTokenError("JWT signing secret is not configured")

        algorithm = settings.SUPABASE_JWT_ALGORITHM or "HS256"
        if algorithm not in ["HS256", "HS384", "HS512"]:
            logger.error(f"Unsupported JWT signing algorithm: {algorithm}")
            raise jwt.InvalidTokenError(f"Unsupported JWT signing algorithm: {algorithm}")

        decode_options = {
            "verify_signature": True,
            "verify_exp": True,
            "verify_aud": bool(settings.JWT_AUDIENCE),
            "verify_iss": bool(settings.JWT_ISSUER),
            "require": ["sub", "exp"],
        }

        decode_kwargs: Dict[str, Any] = {
            "algorithms": [algorithm],
            "options": decode_options,
        }
        if settings.JWT_AUDIENCE:
            decode_kwargs["audience"] = settings.JWT_AUDIENCE
        if settings.JWT_ISSUER:
            decode_kwargs["issuer"] = settings.JWT_ISSUER

        try:
            return jwt.decode(token, secret, **decode_kwargs)
        except jwt.ExpiredSignatureError:
            logger.debug("Token verification failed: token has expired")
            raise
        except jwt.InvalidTokenError as e:
            logger.debug(f"Token verification failed: {str(e)}")
            raise

    def sign_up(self, name: str, email: str, password: str) -> Dict[str, Any]:
        """
        Registers a new user account with Supabase Auth and provisions their database profile.
        Accepts strictly:
        - name: User's Name
        - email: User's email id
        - password: User's password
        Returns user details and session tokens if immediate session is issued.
        """
        email = email.strip().lower()
        name = name.strip()

        if self.anon_client is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is currently not configured",
            )

        try:
            res = self.anon_client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": name,
                        "name": name,
                    }
                }
            })
            if not res or not res.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create account",
                )

            user = res.user

            # Check for existing account where Supabase returns empty identities list
            if hasattr(user, "identities") and user.identities is not None and len(user.identities) == 0:
                logger.warning(f"Registration conflict: account with {email} already exists")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists",
                )

            session = getattr(res, "session", None)

            # Sync user profile into PostgreSQL public.user_profiles
            self._sync_user_profile(user)

            access_token = session.access_token if session else None
            refresh_token = getattr(session, "refresh_token", None) if session else None
            expires_in = getattr(session, "expires_in", 3600) if session else None

            return {
                "message": "User registered successfully",
                "user_id": str(user.id),
                "email": user.email,
                "session_active": bool(session and session.access_token),
                "access_token": access_token,
                "token_type": "bearer" if access_token else None,
                "expires_in": expires_in,
                "refresh_token": refresh_token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "role": getattr(user, "role", "authenticated") or "authenticated",
                    "user_metadata": getattr(user, "user_metadata", {}) or {},
                    "app_metadata": getattr(user, "app_metadata", {}) or {},
                },
            }
        except HTTPException:
            raise
        except Exception as exc:
            err_msg = str(exc)
            logger.warning(f"Sign up failed for email {email}: {err_msg}")
            if "rate limit" in err_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please wait a few moments before trying again.",
                )
            if "already registered" in err_msg.lower() or "user already registered" in err_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {err_msg}",
            )

    def sign_in_with_password(self, email: str, password: str) -> Dict[str, Any]:
        """
        Authenticates user with email and password against Supabase Auth.
        Returns access token, refresh token, and user profile data.

        Security: Returns generic 'Invalid email or password' for all failure modes
        to strictly prevent user enumeration (OWASP security guidelines).
        """
        email = email.strip().lower()

        if self.anon_client is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is currently not configured",
            )

        try:
            res = self.anon_client.auth.sign_in_with_password({
                "email": email,
                "password": password,
            })
            if not res or not res.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            session = res.session
            user = res.user

            # Synchronize profile into public.user_profiles if database is available
            self._sync_user_profile(user)

            return {
                "access_token": session.access_token,
                "token_type": "bearer",
                "expires_in": getattr(session, "expires_in", 3600),
                "refresh_token": getattr(session, "refresh_token", None),
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "role": getattr(user, "role", "authenticated") or "authenticated",
                    "user_metadata": getattr(user, "user_metadata", {}) or {},
                    "app_metadata": getattr(user, "app_metadata", {}) or {},
                },
            }
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning(f"Login failed for email {email}: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def _sync_user_profile(self, user: Any) -> None:
        """Helper to ensure user profile exists in public.user_profiles."""
        try:
            from app.database.session import SessionLocal
            from app.database.models.profile import UserProfile
            from app.database.repository import BaseRepository

            with SessionLocal() as db:
                repo = BaseRepository(UserProfile)
                existing = db.query(UserProfile).filter(UserProfile.user_id == str(user.id)).first()
                metadata = getattr(user, "user_metadata", {}) or {}
                full_name = metadata.get("full_name") or metadata.get("name")

                if existing:
                    # Do not reactivate or update a soft-deleted or deactivated profile through synchronization
                    if existing.is_deleted or not existing.is_active:
                        logger.warning(
                            f"Profile synchronization bypassed: user {user.id} is marked inactive or soft-deleted."
                        )
                        return
                    if full_name and existing.full_name != full_name:
                        repo.update(db, db_obj=existing, obj_in={"full_name": full_name})
                else:
                    repo.create(db, obj_in={
                        "user_id": str(user.id),
                        "email": user.email,
                        "full_name": full_name,
                        "subscription_tier": "free",
                    })
        except Exception as err:
            logger.error(f"Failed to sync user profile into database: {str(err)}")


supabase_service = SupabaseAuthService()
SupabaseService = SupabaseAuthService

