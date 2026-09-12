import time
from typing import Any, Dict
from sqlalchemy import text

from app.core.logging import logger
from app.database.session import engine


def check_database_health() -> bool:
    """
    Lightweight health check verifying Supabase PostgreSQL connectivity.
    Returns True if database is reachable and can execute queries.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            return True
    except Exception as exc:
        logger.error(f"Database health check probe failed: {str(exc)}")
        return False


def get_database_diagnostics() -> Dict[str, Any]:
    """
    Production diagnostic inspection of database status, latency, and connection pool metrics.
    """
    start_time = time.perf_counter()
    is_healthy = False
    error_message = None
    server_version = None

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            row = result.fetchone()
            if row:
                server_version = row[0].split()[0] + " " + row[0].split()[1]
            is_healthy = True
    except Exception as exc:
        error_message = str(exc)
        logger.error(f"Database diagnostics probe failed: {error_message}")

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
    pool = engine.pool

    diagnostics = {
        "connected": is_healthy,
        "latency_ms": latency_ms if is_healthy else None,
        "engine": "postgresql",
        "dialect": engine.dialect.name,
        "server_version": server_version,
        "pool": {
            "size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
        },
    }

    if error_message:
        diagnostics["error"] = error_message

    return diagnostics
