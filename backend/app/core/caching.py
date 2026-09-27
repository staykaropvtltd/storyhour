import hashlib
from typing import Tuple
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse

from app.config import settings

# Prefix paths of safe public read-only content endpoints eligible for caching
SAFE_PUBLIC_CACHE_PREFIXES: Tuple[str, ...] = (
    "/api/v1/stories",
    "/api/stories",
    "/api/v1/categories",
    "/api/categories",
    "/api/v1/languages",
    "/api/languages",
    "/api/v1/events",
    "/api/events",
    "/api/v1/journal",
    "/api/journal",
    "/api/v1/audio",
    "/api/audio",
)

# Paths that must strictly NEVER be cached even if matching public prefixes
PRIVATE_EXCLUDE_PREFIXES: Tuple[str, ...] = (
    "/api/v1/admin",
    "/api/admin",
    "/api/me",
    "/api/v1/me",
    "/api/v1/library",
    "/api/library",
    "/api/v1/progress",
    "/api/progress",
    "/api/v1/cart",
    "/api/cart",
    "/api/v1/orders",
    "/api/orders",
    "/api/v1/payments",
    "/api/payments",
    "/api/v1/products",
    "/api/products",
    "/api/v1/audio/stream",  # Protected audio stream descriptor
    "/api/audio/stream",
)


class ResponseCachingMiddleware(BaseHTTPMiddleware):
    """
    HTTP Response Caching & ETag Validation Middleware.

    1. Attaches 'Cache-Control: public, max-age={max_age}' and 'ETag' headers
       to safe public read-only GET/HEAD responses.
    2. Supports conditional HTTP validation: returns '304 Not Modified' when
       incoming 'If-None-Match' matches the computed ETag.
    3. Strictly enforces 'Cache-Control: no-store, private' on all authenticated,
       administrative, and personalized endpoints to prevent cache poisoning or
       credential leakage.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        method = request.method.upper()

        response = await call_next(request)

        # Check if route is private / authenticated / mutating
        has_auth = bool(request.headers.get("authorization"))
        is_private = has_auth or any(path.startswith(prefix) for prefix in PRIVATE_EXCLUDE_PREFIXES)

        # Stream endpoint check for protected audio
        if "/stream" in path:
            is_private = True

        if is_private or method not in ("GET", "HEAD"):
            # Strictly prevent caching of private or mutating responses
            response.headers["Cache-Control"] = "no-store, private"
            response.headers["Pragma"] = "no-cache"
            return response

        # Check if route is a safe public cacheable path
        is_cacheable = any(path.startswith(prefix) for prefix in SAFE_PUBLIC_CACHE_PREFIXES)
        if not is_cacheable or response.status_code != status.HTTP_200_OK:
            return response

        # Extract response body to compute ETag
        body = b""
        async for chunk in response.body_iterator:
            body += chunk if isinstance(chunk, bytes) else chunk.encode("utf-8")

        etag = f'"{hashlib.sha256(body).hexdigest()[:16]}"'
        max_age = getattr(settings, "HTTP_CACHE_MAX_AGE_SECONDS", 60)

        # Check conditional request (If-None-Match)
        client_etag = request.headers.get("if-none-match")
        if client_etag and client_etag.strip('"') == etag.strip('"'):
            cached_response = StarletteResponse(
                status_code=status.HTTP_304_NOT_MODIFIED,
                headers={
                    "ETag": etag,
                    "Cache-Control": f"public, max-age={max_age}",
                },
            )
            if "X-Request-ID" in response.headers:
                cached_response.headers["X-Request-ID"] = response.headers["X-Request-ID"]
            return cached_response

        # Re-construct response with body and cache headers
        headers = dict(response.headers)
        headers["ETag"] = etag
        headers["Cache-Control"] = f"public, max-age={max_age}"

        return Response(
            content=body,
            status_code=response.status_code,
            headers=headers,
            media_type=response.media_type,
        )
