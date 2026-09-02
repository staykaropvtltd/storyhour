import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "StoryHour Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security / JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "storyhour-super-secure-secret-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./storyhour.db")

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
