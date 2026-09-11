import os
from typing import List, Union
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
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:StoryHour%401234@db.pbbmbryyncgoywappgjg.supabase.co:5432/postgres"
    )

    # Supabase credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://pbbmbryyncgoywappgjg.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Supabase JWT Secret (for local token signature verification)
    # Default fallback secret for development/testing if not configured in .env
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "storyhour-dev-jwt-secret-minimum-32-chars-long-2026")
    SUPABASE_JWT_ALGORITHM: str = "HS256"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(".env", "backend/.env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
