import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, Request, status

from app.config import settings


class RateLimiter:
    """
    In-memory sliding window rate limiter for FastAPI endpoints.
    Protects public writable endpoints (contact, auth, analytics) from burst/DoS abuse.

    Production Note:
    For clustered or multi-container deployments behind a load balancer,
    rate limiting should ideally be backed by a centralized Redis cluster
    or enforced at the API Gateway / Cloudflare layer.
    """

    def __init__(self, requests_limit: int = 30, window_seconds: int = 60, key_prefix: str = ""):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.key_prefix = key_prefix
        self._history: Dict[str, List[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    async def __call__(self, request: Request) -> None:
        if not getattr(settings, "RATE_LIMIT_ENABLED", True):
            return

        client_ip = self._get_client_ip(request)
        path = request.scope.get("path", "")
        key = f"{self.key_prefix}:{client_ip}:{path}" if self.key_prefix else f"{client_ip}:{path}"

        now = time.time()
        cutoff = now - self.window_seconds

        # Prune expired timestamps
        history = [ts for ts in self._history[key] if ts > cutoff]
        self._history[key] = history

        if len(history) >= self.requests_limit:
            oldest = history[0]
            retry_after = max(1, int(self.window_seconds - (now - oldest)))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_limit} requests per {self.window_seconds}s.",
                headers={"Retry-After": str(retry_after)},
            )

        self._history[key].append(now)

    def reset(self) -> None:
        """Reset internal rate limit tracking state (useful for test isolation)."""
        self._history.clear()


# Pre-configured rate limiter instances initialized with config thresholds
contact_rate_limiter = RateLimiter(
    requests_limit=getattr(settings, "CONTACT_RATE_LIMIT_PER_MINUTE", 30),
    window_seconds=60,
    key_prefix="contact",
)

auth_rate_limiter = RateLimiter(
    requests_limit=getattr(settings, "AUTH_RATE_LIMIT_PER_MINUTE", 30),
    window_seconds=60,
    key_prefix="auth",
)

analytics_rate_limiter = RateLimiter(
    requests_limit=getattr(settings, "ANALYTICS_RATE_LIMIT_PER_MINUTE", 120),
    window_seconds=60,
    key_prefix="analytics",
)
