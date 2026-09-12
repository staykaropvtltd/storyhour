from app.core.logging import logger
from app.database.session import engine
from app.database.base import Base
# Import all models so Base.metadata is fully populated with all tables
import app.database.models  # noqa: F401


def init_db() -> bool:
    """
    Initializes database tables if they do not exist.
    Safe to run idempotently against Supabase PostgreSQL.
    """
    try:
        logger.info("Initializing database schema and verifying tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
        return True
    except Exception as exc:
        logger.error(f"Failed to initialize database schema: {str(exc)}")
        return False


if __name__ == "__main__":
    success = init_db()
    if success:
        print("Database schema successfully verified/created.")
    else:
        print("Database initialization encountered an error.")
