from typing import List, Optional, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "StoryHour Backend API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api"

    # Server binding
    HOST: str = "127.0.0.1"
    PORT: int = 8001

    # CORS configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database connection
    # Must be provided through environment configuration.
    DATABASE_URL: str

    # Supabase credentials
    # Kept temporarily while the existing authentication implementation
    # is migrated to local JWT + bcrypt authentication.
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Supabase JWT configuration
    # No secret is hard-coded in source code.
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_JWT_ALGORITHM: str = "HS256"

    # Phase 1A Authentication Mode
    # Options: "supabase" (default: authoritative remote Supabase Auth verification)
    #          "local" (explicitly configured local cryptographic JWT verification)
    AUTH_MODE: str = "supabase"
    JWT_AUDIENCE: Optional[str] = "authenticated"
    JWT_ISSUER: Optional[str] = None

    # Phase 6 Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    CONTACT_RATE_LIMIT_PER_MINUTE: int = 30
    AUTH_RATE_LIMIT_PER_MINUTE: int = 30
    ANALYTICS_RATE_LIMIT_PER_MINUTE: int = 120
    TRUST_PROXY_HEADERS: bool = False

    # Phase 6 HTTP Caching
    HTTP_CACHE_MAX_AGE_SECONDS: int = 60

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, list):
            return v
        raise ValueError(v)

    def validate_settings(self) -> None:
        """Validate settings instance against runtime security requirements."""
        validate_configuration(self)

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(".env", "backend/.env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


ALLOWED_AUTH_MODES = {"supabase", "local"}
ALLOWED_JWT_ALGORITHMS = {"HS256", "HS384", "HS512"}


def validate_configuration(cfg: Optional[Settings] = None) -> None:
    """
    Validates mandatory settings for the active runtime mode.
    Raises ValueError with a clear, safe message if configuration is invalid or missing.
    Never exposes secret values in error messages.
    """
    if cfg is None:
        cfg = settings

    errors: List[str] = []

    # 1. Database URL is required
    if not cfg.DATABASE_URL or not str(cfg.DATABASE_URL).strip():
        errors.append("DATABASE_URL is required and must not be empty.")

    # 2. Validate AUTH_MODE against explicit allowlist
    if not cfg.AUTH_MODE or cfg.AUTH_MODE not in ALLOWED_AUTH_MODES:
        errors.append(
            f"Invalid AUTH_MODE '{cfg.AUTH_MODE}'. Allowed modes are: {sorted(list(ALLOWED_AUTH_MODES))}."
        )
    else:
        # 3. Validate mode-specific required settings
        if cfg.AUTH_MODE == "supabase":
            if not cfg.SUPABASE_URL or not str(cfg.SUPABASE_URL).strip():
                errors.append("SUPABASE_URL is required when AUTH_MODE is 'supabase'.")
            elif not (cfg.SUPABASE_URL.startswith("http://") or cfg.SUPABASE_URL.startswith("https://")):
                errors.append("SUPABASE_URL must be a valid HTTP or HTTPS URL.")

            if not cfg.SUPABASE_ANON_KEY or not str(cfg.SUPABASE_ANON_KEY).strip():
                errors.append("SUPABASE_ANON_KEY is required when AUTH_MODE is 'supabase'.")

        elif cfg.AUTH_MODE == "local":
            if not cfg.SUPABASE_JWT_SECRET or not str(cfg.SUPABASE_JWT_SECRET).strip():
                errors.append("SUPABASE_JWT_SECRET is required when AUTH_MODE is 'local'.")

            if cfg.SUPABASE_JWT_ALGORITHM not in ALLOWED_JWT_ALGORITHMS:
                errors.append(
                    f"Unsupported SUPABASE_JWT_ALGORITHM '{cfg.SUPABASE_JWT_ALGORITHM}'. Allowed: {sorted(list(ALLOWED_JWT_ALGORITHMS))}."
                )

    if errors:
        raise ValueError("Configuration validation failed: " + "; ".join(errors))


settings = Settings()
