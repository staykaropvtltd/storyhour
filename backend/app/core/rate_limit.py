import threading
import time
import uuid
from collections import defaultdict
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, Request, status

from app.config import settings
from app.core.logging import logger

try:
    import redis
except ImportError:
    redis = None


def _normalize_rate_limit_path(path: str) -> str:
    """
    Normalizes endpoint URLs across versioning and path aliases so equivalent
    routes share the exact same rate-limit bucket.
    """
    p = path.rstrip("/")
    if p.startswith("/api/v1/"):
        p = "/api/" + p[8:]
    elif p == "/api/v1":
        p = "/api"

    # Canonical mapping for route aliases
    if p in ("/api/auth/login", "/api/login", "/auth/login", "/login"):
        return "/auth/login"
    if p in ("/api/auth/signup", "/api/signup", "/auth/signup", "/signup"):
        return "/auth/signup"
    if p in ("/api/contact", "/contact"):
        return "/contact"
    if p in ("/api/analytics/events", "/analytics/events"):
        return "/analytics/events"
    return p


class RateLimiter:
    """
    Sliding window rate limiter for FastAPI endpoints supporting both
    in-memory and distributed Redis backends.

    Features:
    - Bounded in-memory fallback if Redis is unavailable.
    - Memory leak prevention: automatic eviction of expired client IP keys.
    - Unified alias bucket sharing for auth, contact, and analytics endpoints.
    - Untrusted proxy protection (X-Forwarded-For ignored unless explicitly enabled).
    """

    def __init__(
        self,
        requests_limit: int = 30,
        window_seconds: int = 60,
        key_prefix: str = "",
        use_path: bool = True,
        redis_client: Optional[Any] = None,
    ):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.key_prefix = key_prefix
        self.use_path = use_path
        self._history: Dict[str, List[float]] = defaultdict(list)
        self._lock = threading.Lock()
        self._last_cleanup = time.time()
        self._redis_client = redis_client
        self._redis_initialized = False

    def _get_redis_client(self) -> Optional[Any]:
        """Lazy-initialize or return configured Redis client."""
        if self._redis_client is not None:
            return self._redis_client

        if getattr(settings, "RATE_LIMIT_STORAGE", "memory") != "redis":
            return None

        redis_url = getattr(settings, "REDIS_URL", None)
        if not redis_url or not redis:
            return None

        if not self._redis_initialized:
            try:
                self._redis_client = redis.Redis.from_url(
                    redis_url,
                    socket_connect_timeout=2.0,
                    socket_timeout=2.0,
                    decode_responses=True,
                )
                self._redis_initialized = True
            except Exception as exc:
                logger.warning(
                    f"Failed to initialize Redis rate limiter client: {type(exc).__name__}. "
                    "Falling back to process-local rate limiting."
                )
                self._redis_client = None

        return self._redis_client

    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP safely.
        Untrusted forwarded headers are ignored unless TRUST_PROXY_HEADERS is explicitly True.
        """
        if getattr(settings, "TRUST_PROXY_HEADERS", False):
            forwarded = request.headers.get("x-forwarded-for")
            if forwarded:
                return forwarded.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def _build_key(self, request: Request) -> str:
        """Construct the canonical bucket key for the request."""
        client_ip = self._get_client_ip(request)

        if not self.use_path:
            return f"{self.key_prefix}:{client_ip}" if self.key_prefix else client_ip

        raw_path = request.scope.get("path", "")
        normalized_path = _normalize_rate_limit_path(raw_path)
        return (
            f"{self.key_prefix}:{client_ip}:{normalized_path}"
            if self.key_prefix
            else f"{client_ip}:{normalized_path}"
        )

    def _cleanup_expired_keys(self, now: float) -> None:
        """
        Periodic sweep to purge stale client keys from memory.
        Runs at most once per window_seconds to keep per-request work O(1).
        """
        if now - self._last_cleanup < self.window_seconds:
            return
        self._last_cleanup = now
        cutoff = now - self.window_seconds
        stale_keys = [
            k for k, timestamps in list(self._history.items())
            if not timestamps or timestamps[-1] <= cutoff
        ]
        for k in stale_keys:
            self._history.pop(k, None)

    async def _check_redis(self, key: str, now: float, cutoff: float) -> Optional[bool]:
        """
        Check rate limit using Redis sorted set sliding window (RL-01).
        Executes atomic pipeline to prune, record, count, and expire in a single round-trip,
        eliminating multi-worker race conditions.
        """
        r_client = self._get_redis_client()
        if r_client is None:
            return None

        redis_key = f"rl:{key}"
        member = f"{now}:{uuid.uuid4().hex[:8]}"
        try:
            pipe = r_client.pipeline()
            # 1. Prune expired entries
            pipe.zremrangebyscore(redis_key, 0, cutoff)
            # 2. Record this request atomically
            pipe.zadd(redis_key, {member: now})
            # 3. Get total active requests in current window
            pipe.zcard(redis_key)
            # 4. Refresh key TTL
            pipe.expire(redis_key, self.window_seconds + 5)
            results = pipe.execute()
            active_count = results[2]

            if active_count > self.requests_limit:
                # Remove over-quota member so rejected attempts don't pollute subsequent requests
                try:
                    r_client.zrem(redis_key, member)
                except Exception:
                    pass
                oldest_entries = r_client.zrange(redis_key, 0, 0, withscores=True)
                oldest_ts = oldest_entries[0][1] if oldest_entries else now
                retry_after = max(1, int(self.window_seconds - (now - oldest_ts)))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.requests_limit} requests per {self.window_seconds}s.",
                    headers={"Retry-After": str(retry_after)},
                )

            return True

        except HTTPException:
            raise
        except Exception as exc:
            logger.warning(
                f"Redis rate limiter operation failed: {type(exc).__name__}. "
                "Engaging bounded process-local rate limit fallback."
            )
            return None

    def _check_memory(self, key: str, now: float, cutoff: float) -> None:
        """Process-local in-memory sliding window check with active eviction."""
        with self._lock:
            # 1. Periodic cleanup of dead keys
            self._cleanup_expired_keys(now)

            # 2. Prune expired timestamps for current key
            history = [ts for ts in self._history.get(key, []) if ts > cutoff]

            if len(history) >= self.requests_limit:
                self._history[key] = history
                oldest = history[0]
                retry_after = max(1, int(self.window_seconds - (now - oldest)))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.requests_limit} requests per {self.window_seconds}s.",
                    headers={"Retry-After": str(retry_after)},
                )

            # 3. Append current timestamp and update history
            history.append(now)
            self._history[key] = history

    async def __call__(self, request: Request) -> None:
        if not getattr(settings, "RATE_LIMIT_ENABLED", True):
            return

        key = self._build_key(request)
        now = time.time()
        cutoff = now - self.window_seconds

        # Attempt Redis distributed rate check if configured
        redis_result = await self._check_redis(key, now, cutoff)
        if redis_result is True:
            return

        # Handle fail-open policy if Redis backend was targeted but unavailable
        is_redis_targeted = (self._redis_client is not None) or (getattr(settings, "RATE_LIMIT_STORAGE", "memory") == "redis")
        if is_redis_targeted and getattr(settings, "RATE_LIMIT_FAIL_OPEN", False):
            logger.warning(
                f"Redis rate limiter unavailable and RATE_LIMIT_FAIL_OPEN is True; bypassing rate limit for key {key}."
            )
            return

        # Fallback to in-memory limiter
        self._check_memory(key, now, cutoff)

    def reset(self) -> None:
        """Reset internal rate limit tracking state (used for test isolation)."""
        with self._lock:
            self._history.clear()
        r_client = self._get_redis_client()
        if r_client is not None:
            try:
                # Clear all rate limit keys if in a test context
                keys = r_client.keys("rl:*")
                if keys:
                    r_client.delete(*keys)
            except Exception:
                pass


# Pre-configured rate limiter instances initialized with config thresholds
contact_rate_limiter = RateLimiter(
    requests_limit=getattr(settings, "CONTACT_RATE_LIMIT_PER_MINUTE", 30),
    window_seconds=60,
    key_prefix="contact",
    use_path=False,
)

# Shared authentication limiters enforcing quota across canonical and alias routes
auth_login_limiter = RateLimiter(
    requests_limit=getattr(settings, "AUTH_RATE_LIMIT_PER_MINUTE", 30),
    window_seconds=60,
    key_prefix="auth:login",
    use_path=False,
)

auth_signup_limiter = RateLimiter(
    requests_limit=getattr(settings, "AUTH_RATE_LIMIT_PER_MINUTE", 30),
    window_seconds=60,
    key_prefix="auth:signup",
    use_path=False,
)

auth_rate_limiter = RateLimiter(
    requests_limit=getattr(settings, "AUTH_RATE_LIMIT_PER_MINUTE", 30),
    window_seconds=60,
    key_prefix="auth",
    use_path=True,
)

analytics_rate_limiter = RateLimiter(
    requests_limit=getattr(settings, "ANALYTICS_RATE_LIMIT_PER_MINUTE", 120),
    window_seconds=60,
    key_prefix="analytics",
    use_path=False,
)
