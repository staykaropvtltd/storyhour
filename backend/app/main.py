import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.core.caching import ResponseCachingMiddleware
from app.core.logging import logger
from app.routers import (
    admin,
    analytics,
    audio,
    auth,
    cart,
    categories,
    contact,
    entitlements,
    events,
    health,
    journal,
    languages,
    library,
    me,
    orders,
    payments,
    products,
    progress,
    stories,
)

OPENAPI_TAGS = [
    {
        "name": "Health & Status",
        "description": "System health verification and API catalog discovery endpoints.",
    },
    {
        "name": "Authentication",
        "description": "User registration and credential authentication issuing verified JWT access tokens.",
    },
    {
        "name": "User Profiles",
        "description": "Authenticated user profile inspection (/api/me) and account state.",
    },
    {
        "name": "Stories",
        "description": "Public story exploration, folklore, epics, chapter hierarchy, and multilingual catalog.",
    },
    {
        "name": "Categories",
        "description": "Taxonomy classification for cultural and thematic story categorisation.",
    },
    {
        "name": "Languages",
        "description": "Localization metadata and vernacular language script catalog.",
    },
    {
        "name": "Audio & Streaming",
        "description": "Free preview audio descriptors and entitlement-protected audio playback endpoints.",
    },
    {
        "name": "Listening Progress",
        "description": "User playback timestamp synchronization, resume points, and 90% auto-completion tracking.",
    },
    {
        "name": "User Library",
        "description": "Personal story access entitlements originating from verified purchases or grants.",
    },
    {
        "name": "Events",
        "description": "Public storytelling performances, workshops, circles, and cultural festival listings.",
    },
    {
        "name": "Journal",
        "description": "Editorial essays, cultural commentaries, storyteller interviews, and literary publications.",
    },
    {
        "name": "Contact",
        "description": "Public enquiries, school residencies, and performance booking requests.",
    },
    {
        "name": "Products",
        "description": "Commerce product catalog and audiobook pricing.",
    },
    {
        "name": "Cart",
        "description": "Shopping cart management and cart item operations.",
    },
    {
        "name": "Orders",
        "description": "Order creation, snapshotting, and checkout workflows.",
    },
    {
        "name": "Payments",
        "description": "Three-stage payment completion pipeline and webhook processing.",
    },
    {
        "name": "Admin & CMS",
        "description": "Role-protected editorial CMS for Stories, Chapters, Taxonomies, Events, Journal, Media, and Enquiries.",
    },
    {
        "name": "Analytics & Telemetry",
        "description": "Privacy-safe user telemetry ingestion and aggregated administrative metric reporting.",
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-ready FastAPI backend for StoryHour supporting Supabase Auth, "
        "JWT token verification, user profile extraction (/api/me), and protected audio/library entitlements."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=OPENAPI_TAGS,
)

# Configure CORS for Next.js frontend (e.g. http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP Response Caching & ETag Validation for Safe Public Content
app.add_middleware(ResponseCachingMiddleware)


# Request Context & Correlation ID Middleware
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Global Exception Handlers for Secure and Consistent Error Responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    headers = dict(exc.headers) if exc.headers else {}
    req_id = getattr(request.state, "request_id", None)
    if req_id and "X-Request-ID" not in headers:
        headers["X-Request-ID"] = req_id
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
        },
        headers=headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Sanitize validation errors without leaking raw system structures
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({"field": field, "message": err.get("msg")})
    req_id = getattr(request.state, "request_id", None)
    headers = {"X-Request-ID": req_id} if req_id else None
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Request validation failed",
            "errors": errors,
            "status_code": 422,
        },
        headers=headers,
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[Req {req_id}] Database operation error at {request.method} {request.url.path}: {str(exc)}")
    headers = {"X-Request-ID": req_id} if req_id != "unknown" else None
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database error occurred. Please try again later.",
            "status_code": 500,
        },
        headers=headers,
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[Req {req_id}] Unhandled server error at {request.method} {request.url.path}: {str(exc)}")
    headers = {"X-Request-ID": req_id} if req_id != "unknown" else None
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error. Please try again later.",
            "status_code": 500,
        },
        headers=headers,
    )


# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(me.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(entitlements.router, prefix=settings.API_V1_STR)

# Story & Content Routers (supporting both /api/v1 and /api prefix conventions)
app.include_router(stories.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(stories.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(categories.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(languages.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(languages.router, prefix=settings.API_V1_STR, include_in_schema=False)


app.include_router(products.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(cart.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/v1")

# Phase 3 Audio, Progress, and User Library Routers
app.include_router(audio.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(audio.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(progress.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(progress.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(library.router, prefix=f"{settings.API_V1_STR}/v1")

# Phase 4 Events, Journal, and Contact Routers
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(events.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(journal.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(journal.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(contact.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(contact.router, prefix=settings.API_V1_STR, include_in_schema=False)

# Phase 5 Admin & CMS, Media Management, and Analytics Routers
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(admin.router, prefix=settings.API_V1_STR, include_in_schema=False)
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/v1")
app.include_router(analytics.router, prefix=settings.API_V1_STR, include_in_schema=False)

@app.get("/", tags=["Health & Status"])
def root():
    """Root health and discovery endpoint."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "health": f"{settings.API_V1_STR}/health",
            "signup": f"{settings.API_V1_STR}/auth/signup",
            "login": f"{settings.API_V1_STR}/auth/login",
            "me": f"{settings.API_V1_STR}/me",
            "library": f"{settings.API_V1_STR}/library/me",
            "stories": f"{settings.API_V1_STR}/v1/stories",
            "categories": f"{settings.API_V1_STR}/v1/categories",
            "languages": f"{settings.API_V1_STR}/v1/languages",
            "events": f"{settings.API_V1_STR}/v1/events",
            "journal": f"{settings.API_V1_STR}/v1/journal",
            "contact": f"{settings.API_V1_STR}/v1/contact",
            "admin": f"{settings.API_V1_STR}/v1/admin",
            "analytics": f"{settings.API_V1_STR}/v1/analytics/events",
        },
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
