from fastapi import APIRouter, status
from app.config import settings
from app.database import get_database_diagnostics

router = APIRouter(tags=["Health & Status"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="API & Database Health check"
)
def health_check():
    """Health check endpoint for API and Supabase PostgreSQL database."""
    diag = get_database_diagnostics()
    db_healthy = diag.get("connected", False)
    return {
        "status": "healthy" if db_healthy else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": db_healthy,
            "engine": "postgresql",
            "host": "db.pbbmbryyncgoywappgjg.supabase.co",
            "latency_ms": diag.get("latency_ms"),
            "server_version": diag.get("server_version"),
            "pool": diag.get("pool"),
        }
    }

