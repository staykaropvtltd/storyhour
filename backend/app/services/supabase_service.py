from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import jwt
from supabase import create_client, Client

from app.config import settings
from app.core.logging import logger
from app.schemas.user import AuthenticatedUser



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

    def verify_token(self, token: str) -> AuthenticatedUser:
        """
        Validates incoming Supabase access token (JWT).
        1. Checks signature and expiry locally using SUPABASE_JWT_SECRET.
        2. If live Supabase client is configured, optionally validates against Supabase Auth server.
        3. Returns an AuthenticatedUser instance with verified claims.

        Raises:
            jwt.ExpiredSignatureError: When token has expired.
            jwt.InvalidTokenError: When token format or signature is invalid.
            ValueError: When required claims (sub, email) are missing.
        """
        if not token or not isinstance(token, str):
            raise jwt.InvalidTokenError("Token is missing or empty")

        # Step 1: Remote verification with Supabase Auth API if client is available
        if self.anon_client is not None:
            try:
                res = self.anon_client.auth.get_user(token)
                if res and res.user:
                    user_data = res.user
                    app_meta = getattr(user_data, "app_metadata", {}) or {}
                    user_meta = getattr(user_data, "user_metadata", {}) or {}
                    role = app_meta.get("role") or getattr(user_data, "role", "authenticated") or "authenticated"
                    return AuthenticatedUser(
                        id=str(user_data.id),
                        email=user_data.email or "",
                        role=role,
                        is_active=True,
                        app_metadata=app_meta,
                        user_metadata=user_meta,
                        created_at=str(getattr(user_data, "created_at", "")) if hasattr(user_data, "created_at") else None,
                    )
            except Exception as e:
                logger.debug(f"Remote Supabase validation fallback to local decode: {str(e)}")

        # Step 2: Fallback to local cryptographic signature and claims verification
        payload = self._decode_jwt(token)

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token subject (sub) claim missing")

        email = payload.get("email")
        if not email:
            email = payload.get("user_metadata", {}).get("email")
        if not email:
            raise ValueError("Token email claim missing")

        role = payload.get("role", "authenticated")
        app_metadata = payload.get("app_metadata", {})
        user_metadata = payload.get("user_metadata", {})
        if "role" in app_metadata:
            role = app_metadata["role"]

        return AuthenticatedUser(
            id=str(user_id),
            email=email,
            role=role,
            is_active=True,
            app_metadata=app_metadata,
            user_metadata=user_metadata,
            created_at=payload.get("created_at"),
        )


    def _decode_jwt(self, token: str) -> Dict[str, Any]:
        """
        Cryptographically decodes and verifies JWT signature and expiry.
        Supports HS256 with SUPABASE_JWT_SECRET.
        """
        # Ensure audience verification is permissive for Supabase 'authenticated' audience
        decode_options = {
            "verify_signature": True,
            "verify_exp": True,
            "verify_aud": False,  # Supabase tokens use aud: 'authenticated'
        }

        try:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=[settings.SUPABASE_JWT_ALGORITHM],
                options=decode_options
            )
        except jwt.ExpiredSignatureError:
            logger.debug("Token verification failed: token has expired")
            raise
        except jwt.InvalidTokenError as e:
            logger.debug(f"Token verification failed: invalid token ({str(e)})")
            raise

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

                if not existing:
                    repo.create(db, obj_in={
                        "user_id": str(user.id),
                        "email": user.email,
                        "full_name": full_name,
                        "subscription_tier": "free",
                    })
                elif full_name and existing.full_name != full_name:
                    repo.update(db, db_obj=existing, obj_in={"full_name": full_name})
        except Exception as err:
            logger.error(f"Failed to sync user profile into database: {str(err)}")


supabase_service = SupabaseAuthService()

