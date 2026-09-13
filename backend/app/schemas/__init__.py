"""
Application API schemas.
"""

from app.schemas.auth import (
    ErrorResponse,
    LoginRequest,
    LoginResponse,
    SignUpRequest,
    SignUpResponse,
    TokenData,
)
from app.schemas.user import (
    AuthenticatedUser,
    UserResponse,
    UserRole,
    UserUpdateRequest,
)
from app.schemas.category import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)
from app.schemas.language import (
    LanguageBase,
    LanguageCreate,
    LanguageUpdate,
    LanguageResponse,
)
from app.schemas.chapter import (
    ChapterBase,
    ChapterCreate,
    ChapterUpdate,
    ChapterResponse,
)
from app.schemas.audio import (
    AudioAssetBase,
    AudioAssetCreate,
    AudioAssetUpdate,
    AudioAssetResponse,
    AudioPlaybackDescriptor,
)
from app.schemas.story import (
    StoryBase,
    StoryCreate,
    StoryUpdate,
    StorySummaryResponse,
    StoryResponse,
)

__all__ = [
    # Auth & User
    "AuthenticatedUser",
    "UserResponse",
    "UserRole",
    "UserUpdateRequest",
    "ErrorResponse",
    "LoginRequest",
    "LoginResponse",
    "SignUpRequest",
    "SignUpResponse",
    "TokenData",

    # Category
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",

    # Language
    "LanguageBase",
    "LanguageCreate",
    "LanguageUpdate",
    "LanguageResponse",

    # Chapter
    "ChapterBase",
    "ChapterCreate",
    "ChapterUpdate",
    "ChapterResponse",

    # Audio
    "AudioAssetBase",
    "AudioAssetCreate",
    "AudioAssetUpdate",
    "AudioAssetResponse",
    "AudioPlaybackDescriptor",

    # Story
    "StoryBase",
    "StoryCreate",
    "StoryUpdate",
    "StorySummaryResponse",
    "StoryResponse",
]
