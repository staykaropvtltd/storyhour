import time
from typing import Any, Dict
from sqlalchemy import text

from app.core.logging import logger
from app.database.session import engine


import threading

_health_cache_lock = threading.Lock()
_last_health_check_time: float = 0.0
_cached_health_status: bool = False
_HEALTH_CACHE_TTL_SECONDS: float = 5.0


def reset_database_health_cache() -> None:
    """Reset the database health cache (useful for test isolation)."""
    global _last_health_check_time, _cached_health_status
    with _health_cache_lock:
        _last_health_check_time = 0.0
        _cached_health_status = False


def check_database_health(force_refresh: bool = False) -> bool:
    """
    Lightweight health check verifying database connectivity.
    Employs a 5-second TTL cache to prevent connection pool exhaustion
    from high-frequency health probe queries (B-04 remediation).
    Returns True if database is reachable and can execute queries.
    """
    global _last_health_check_time, _cached_health_status

    now = time.perf_counter()
    with _health_cache_lock:
        if not force_refresh and (now - _last_health_check_time) < _HEALTH_CACHE_TTL_SECONDS:
            return _cached_health_status

    is_healthy = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            is_healthy = True
    except Exception as exc:
        logger.error(f"Database health check probe failed: {str(exc)}")
        is_healthy = False

    with _health_cache_lock:
        _cached_health_status = is_healthy
        _last_health_check_time = time.perf_counter()

    return is_healthy


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
            if engine.dialect.name == "postgresql":
                result = conn.execute(text("SELECT version();"))
                row = result.fetchone()
                if row:
                    server_version = row[0].split()[0] + " " + row[0].split()[1]
            elif engine.dialect.name == "sqlite":
                result = conn.execute(text("SELECT sqlite_version();"))
                row = result.fetchone()
                if row:
                    server_version = f"SQLite {row[0]}"
            else:
                conn.execute(text("SELECT 1;"))
            is_healthy = True
    except Exception as exc:
        error_message = str(exc)
        logger.error(f"Database diagnostics probe failed: {error_message}")

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
    pool = engine.pool

    pool_size = pool.size() if hasattr(pool, "size") and callable(pool.size) else (pool.size if hasattr(pool, "size") and isinstance(pool.size, int) else 0)
    pool_checked_in = pool.checkedin() if hasattr(pool, "checkedin") and callable(pool.checkedin) else (pool.checkedin if hasattr(pool, "checkedin") and isinstance(pool.checkedin, int) else 0)
    pool_checked_out = pool.checkedout() if hasattr(pool, "checkedout") and callable(pool.checkedout) else (pool.checkedout if hasattr(pool, "checkedout") and isinstance(pool.checkedout, int) else 0)
    pool_overflow = pool.overflow() if hasattr(pool, "overflow") and callable(pool.overflow) else (pool.overflow if hasattr(pool, "overflow") and isinstance(pool.overflow, int) else 0)

    diagnostics = {
        "connected": is_healthy,
        "latency_ms": latency_ms if is_healthy else None,
        "engine": engine.dialect.name,
        "dialect": engine.dialect.name,
        "server_version": server_version,
        "pool": {
            "size": pool_size,
            "checked_in": pool_checked_in,
            "checked_out": pool_checked_out,
            "overflow": pool_overflow,
        },
    }

    if error_message:
        diagnostics["error"] = error_message

    return diagnostics

