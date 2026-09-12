from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.config import settings
from app.core.logging import logger

# Production-grade SQLAlchemy Engine with robust connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # Auto-detect dropped connections and reconnect
    pool_size=10,             # Keep connections ready for concurrent requests
    max_overflow=20,          # Allow bursts under peak traffic
    pool_recycle=1800,        # Recycle connections every 30 minutes to prevent stale connections
    echo=False,               # Set to True only for verbose SQL debugging
)

# SessionLocal factory for creating independent database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding an isolated SQLAlchemy session.
    Automatically handles rollback on unhandled exceptions and ensures clean closure.
    """
    db: Session = SessionLocal()
    try:
        yield db
    except Exception as exc:
        db.rollback()
        logger.error(f"Database session rollback triggered by exception: {str(exc)}")
        raise
    finally:
        db.close()


@contextmanager
def transaction() -> Generator[Session, None, None]:
    """
    Context manager for atomic database transactions.
    Commits on successful block exit, rolls back on any exception.
    
    Example:
        with transaction() as session:
            user_repo.create(session, user_data)
    """
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.error(f"Transaction failed and was rolled back: {str(exc)}")
        raise
    finally:
        session.close()
