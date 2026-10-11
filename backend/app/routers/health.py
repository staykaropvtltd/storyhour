from fastapi import APIRouter, Response, status
from app.config import settings
from app.database.health import check_database_health

router = APIRouter(tags=["Health & Status"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="API & Database Health check",
    responses={
        200: {"description": "Service and database are healthy"},
        503: {"description": "Database or dependency is unhealthy"},
    },
)
def health_check(response: Response):
    """
    Public health check endpoint for API and database connectivity.
    Returns safe, minimal operational status without disclosing internal infrastructure.
    """
    try:
        db_healthy = check_database_health()
    except Exception:
        db_healthy = False

    if not db_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "database": {
                "connected": False,
            },
        }

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": True,
        },
    }


@router.get(
    "/health/live",
    status_code=status.HTTP_200_OK,
    summary="Application Liveness probe",
)
def liveness_check():
    """Liveness probe verifying application process is responsive."""
    return {
        "status": "alive",
        "service": settings.PROJECT_NAME,
    }


@router.get(
    "/health/ready",
    status_code=status.HTTP_200_OK,
    summary="Application Readiness probe",
    responses={
        200: {"description": "Application dependencies are ready"},
        503: {"description": "Application dependencies are not ready"},
    },
)
def readiness_check(response: Response):
    """Readiness probe verifying database dependency readiness."""
    try:
        db_healthy = check_database_health()
    except Exception:
        db_healthy = False

    if not db_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "database": "disconnected",
        }

    return {
        "status": "ready",
        "database": "connected",
    }

