from datetime import datetime
import re
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.analytics import AnalyticsEventType

SENSITIVE_KEY_PATTERNS = [
    r"pass(word)?",
    r"secret",
    r"token",
    r"access_token",
    r"refresh_token",
    r"auth",
    r"card",
    r"cvv",
    r"cvc",
    r"credit",
    r"pin",
    r"private",
    r"credential",
    r"bearer",
    r"api[_-]?key",
]
SENSITIVE_REGEX = re.compile("|".join(SENSITIVE_KEY_PATTERNS), re.IGNORECASE)
JWT_PATTERN = re.compile(r"^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$")


def sanitize_telemetry_properties(props: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize analytics properties dictionary by removing any keys
    or nested keys that could contain sensitive user credentials,
    passwords, tokens, payment secrets, or card information, as well
    as stripping raw bearer/JWT strings from values.
    """
    if not isinstance(props, dict):
        return {}

    sanitized: Dict[str, Any] = {}
    for key, val in props.items():
        if SENSITIVE_REGEX.search(key):
            continue  # Strip sensitive key
        if isinstance(val, dict):
            sanitized[key] = sanitize_telemetry_properties(val)
        elif isinstance(val, list):
            sanitized[key] = [
                sanitize_telemetry_properties(item) if isinstance(item, dict) else item
                for item in val
            ]
        elif isinstance(val, str):
            val_clean = val.strip()
            # Strip values that are raw Bearer tokens or JWTs
            if val_clean.lower().startswith("bearer ") or JWT_PATTERN.match(val_clean):
                continue
            sanitized[key] = val
        else:
            sanitized[key] = val
    return sanitized


class AnalyticsEventCreate(BaseModel):
    """Payload schema for ingesting a telemetry event."""
    event_type: str = Field(..., max_length=64, description="Telemetry event type identifier")
    session_id: Optional[str] = Field(None, max_length=128, description="Client session identifier")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Structured contextual event properties")

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        valid_types = {e.value for e in AnalyticsEventType}
        if v not in valid_types:
            raise ValueError(f"Invalid event_type '{v}'. Must be one of: {sorted(valid_types)}")
        return v

    @field_validator("properties", mode="before")
    @classmethod
    def validate_and_strip_properties(cls, v: Any) -> Dict[str, Any]:
        if not isinstance(v, dict):
            return {}
        if len(v) > 50:
            raise ValueError("Telemetry properties payload exceeds maximum allowed keys (50).")
        import json
        try:
            serialized = json.dumps(v)
            if len(serialized) > 32768:
                raise ValueError("Telemetry properties payload exceeds maximum allowed size (32KB).")
        except (TypeError, OverflowError):
            raise ValueError("Telemetry properties must be JSON serializable.")
        return sanitize_telemetry_properties(v)


class AnalyticsEventResponse(BaseModel):
    """Public/Admin representation of a tracked analytics event."""
    id: str
    event_type: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalyticsSummaryResponse(BaseModel):
    """Aggregated summary representation for admin analytics reporting."""
    total_events: int
    events_by_type: Dict[str, int] = Field(default_factory=dict)
    unique_users: int = 0
    unique_sessions: int = 0
