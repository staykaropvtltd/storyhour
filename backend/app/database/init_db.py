from sqlalchemy import text

from app.core.logging import logger
from app.database.session import engine


def init_db() -> bool:
    """
    Verify that the application can connect to PostgreSQL.

    Database schema creation and changes are managed exclusively through
    Alembic migrations. This function must not create or alter tables.
    """
    try:
        logger.info("Verifying database connectivity...")
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("Database connectivity verified successfully.")
        return True

    except Exception as exc:
        logger.error(f"Database connectivity check failed: {str(exc)}")
        return False


if __name__ == "__main__":
    success = init_db()
    if success:
        print("Database connectivity successfully verified.")
    else:
        print("Database connectivity check failed.")
