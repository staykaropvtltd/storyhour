"""
Production SaaS Database Package for StoryHour.
Provides centralized connection pooling, session lifecycle management,
declarative base mixins, generic CRUD repository pattern, and health diagnostics.
"""

from app.database.session import (
    engine,
    SessionLocal,
    get_db,
    transaction,
)
from app.database.base import (
    Base,
    BaseSaaSModel,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    SoftDeleteMixin,
    AuditMixin,
)
from app.database.health import (
    check_database_health,
    get_database_diagnostics,
)
from app.database.repository import (
    BaseRepository,
)
from app.database.init_db import (
    init_db,
)

__all__ = [
    # Engine & Session
    "engine",
    "SessionLocal",
    "get_db",
    "transaction",
    # Base & Mixins
    "Base",
    "BaseSaaSModel",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "SoftDeleteMixin",
    "AuditMixin",
    # Health Diagnostics
    "check_database_health",
    "get_database_diagnostics",
    # Repository Pattern
    "BaseRepository",
    # Bootstrap
    "init_db",
]
