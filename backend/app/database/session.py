from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
from app.core.logging import logger

# SQLAlchemy Engine with dialect-appropriate connection configuration
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if ":memory:" in settings.DATABASE_URL or settings.DATABASE_URL in ("sqlite://", "sqlite:///"):
        from sqlalchemy.pool import StaticPool
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args=connect_args,
            poolclass=StaticPool,
            echo=False,
        )
    else:
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args=connect_args,
            echo=False,
        )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"connect_timeout": settings.DB_CONNECT_TIMEOUT},
        pool_pre_ping=True,                     # Auto-detect dropped connections and reconnect
        pool_size=settings.DB_POOL_SIZE,       # Keep connections ready for concurrent requests
        max_overflow=settings.DB_MAX_OVERFLOW, # Allow bursts under peak traffic
        pool_timeout=settings.DB_POOL_TIMEOUT, # Maximum seconds to wait for a connection from pool
        pool_recycle=settings.DB_POOL_RECYCLE, # Recycle connections periodically to prevent staleness
        echo=False,                            # Set to True only for verbose SQL debugging
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
