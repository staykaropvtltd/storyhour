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

    # Database connection pool and timeout configuration (DB-03, DB-04)
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    DB_CONNECT_TIMEOUT: int = 5

    # Rate Limiting & Distributed Storage (RL-01)
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_STORAGE: str = "memory"  # "memory" or "redis"
    REDIS_URL: Optional[str] = None
    RATE_LIMIT_FAIL_OPEN: bool = False
    CONTACT_RATE_LIMIT_PER_MINUTE: int = 30
    AUTH_RATE_LIMIT_PER_MINUTE: int = 30
    ANALYTICS_RATE_LIMIT_PER_MINUTE: int = 120
    TRUST_PROXY_HEADERS: bool = False

    # Security Headers (SEC-01)
    ENABLE_HSTS: bool = False

    # Phase 6 HTTP Caching
    HTTP_CACHE_MAX_AGE_SECONDS: int = 60

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                import json
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        return [str(i).strip() for i in parsed if str(i).strip()]
                except Exception:
                    pass
            return [i.strip() for i in v_str.split(",") if i.strip()]
        if isinstance(v, list):
            return [str(i).strip() for i in v if str(i).strip()]
        raise ValueError("Invalid CORS_ORIGINS format")

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
ALLOWED_RATE_LIMIT_STORAGES = {"memory", "redis"}


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

    # 2. Database pool and timeout configuration (DB-03, DB-04)
    if not (1 <= cfg.DB_POOL_SIZE <= 50):
        errors.append("DB_POOL_SIZE must be between 1 and 50.")
    if not (0 <= cfg.DB_MAX_OVERFLOW <= 50):
        errors.append("DB_MAX_OVERFLOW must be between 0 and 50.")
    if not (1 <= cfg.DB_CONNECT_TIMEOUT <= 30):
        errors.append("DB_CONNECT_TIMEOUT must be between 1 and 30 seconds.")
    if not (60 <= cfg.DB_POOL_RECYCLE <= 7200):
        errors.append("DB_POOL_RECYCLE must be between 60 and 7200 seconds.")

    # 3. Rate limit storage configuration (RL-01)
    if cfg.RATE_LIMIT_STORAGE not in ALLOWED_RATE_LIMIT_STORAGES:
        errors.append(
            f"Invalid RATE_LIMIT_STORAGE '{cfg.RATE_LIMIT_STORAGE}'. Allowed: {sorted(list(ALLOWED_RATE_LIMIT_STORAGES))}."
        )
    if cfg.RATE_LIMIT_STORAGE == "redis" and (not cfg.REDIS_URL or not str(cfg.REDIS_URL).strip()):
        errors.append("REDIS_URL is required when RATE_LIMIT_STORAGE is 'redis'.")

    # 4. CORS configuration (SEC-03)
    if isinstance(cfg.CORS_ORIGINS, list):
        if "*" in cfg.CORS_ORIGINS:
            errors.append(
                "Insecure CORS configuration: Wildcard origin '*' is not permitted when credentials are supported."
            )
        for origin in cfg.CORS_ORIGINS:
            if not (origin.startswith("http://") or origin.startswith("https://")):
                errors.append(f"Invalid CORS origin '{origin}': must start with http:// or https://.")
    else:
        errors.append("CORS_ORIGINS must be a valid list of HTTP/HTTPS origin URLs.")

    # 5. Validate AUTH_MODE against explicit allowlist
    if not cfg.AUTH_MODE or cfg.AUTH_MODE not in ALLOWED_AUTH_MODES:
        errors.append(
            f"Invalid AUTH_MODE '{cfg.AUTH_MODE}'. Allowed modes are: {sorted(list(ALLOWED_AUTH_MODES))}."
        )
    else:
        # 6. Validate mode-specific required settings
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
