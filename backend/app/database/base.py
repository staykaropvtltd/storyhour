import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.orm import declarative_base, declared_attr

# Declarative Base for all SQLAlchemy models
Base = declarative_base()


class TimestampMixin:
    """
    SaaS Mixin providing timezone-aware UTC timestamps for record creation and updates.
    """
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UUIDPrimaryKeyMixin:
    """
    SaaS Mixin providing UUIDv4 as primary key for distributed scale and obfuscated IDs.
    """
    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
        nullable=False,
    )


class SoftDeleteMixin:
    """
    SaaS Mixin enabling recoverable soft-deletes without permanent data loss.
    """
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def soft_delete(self) -> None:
        """Mark record as deleted with timestamp."""
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)

    def restore(self) -> None:
        """Restore previously soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None


class AuditMixin:
    """
    SaaS Mixin tracking user attribution for creation and modification.
    """
    created_by = Column(String(64), nullable=True)
    updated_by = Column(String(64), nullable=True)


class BaseSaaSModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Abstract SaaS Base Model combining UUID primary key and timezone-aware timestamps.
    Automatically assigns table names matching the class name in snake_case.
    """
    __abstract__ = True

    @declared_attr
    def __tablename__(cls) -> str:
        # Convert CamelCase to snake_case automatically
        import re
        name = re.sub(r"(?<!^)(?=[A-Z])", "_", cls.__name__).lower()
        return name if name.endswith("s") else f"{name}s"

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance columns to dictionary representation."""
        result: Dict[str, Any] = {}
        for col in self.__table__.columns:
            val = getattr(self, col.name)
            if isinstance(val, datetime):
                result[col.name] = val.isoformat()
            else:
                result[col.name] = val
        return result
