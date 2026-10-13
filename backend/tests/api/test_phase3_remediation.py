import asyncio
import logging
import time
from unittest.mock import MagicMock, patch
import pytest
from fastapi import HTTPException, Request, status
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, settings, validate_configuration
from app.core.logging import SensitiveDataFilter, configure_global_logging_filters
from app.core.rate_limit import RateLimiter, contact_rate_limiter, analytics_rate_limiter
from app.database.safety import validate_test_database_target
from app.models.chapter import Chapter
from app.models.story import Story, StoryStatus
from app.schemas.contact import ContactCreate
from app.services.contact_service import contact_service
from app.services.supabase_service import supabase_service


# ==============================================================================
# 1. RL-01: DISTRIBUTED RATE LIMITING & GRACEFUL FALLBACK
# ==============================================================================

class MockRedisPipeline:
    def __init__(self, storage):
        self.storage = storage
        self.commands = []

    def zremrangebyscore(self, key, min_score, max_score):
        self.commands.append(("zremrangebyscore", key, min_score, max_score))
        return self

    def zadd(self, key, mapping):
        self.commands.append(("zadd", key, mapping))
        return self

    def zcard(self, key):
        self.commands.append(("zcard", key))
        return self

    def expire(self, key, seconds):
        self.commands.append(("expire", key, seconds))
        return self

    def execute(self):
        results = []
        for cmd in self.commands:
            action = cmd[0]
            key = cmd[1]
            entries = self.storage.get(key, [])
            if action == "zremrangebyscore":
                cutoff = cmd[3]
                remaining = [e for e in entries if e[1] > cutoff]
                removed = len(entries) - len(remaining)
                self.storage[key] = remaining
                results.append(removed)
            elif action == "zadd":
                mapping = cmd[2]
                curr = self.storage.get(key, [])
                for member, score in mapping.items():
                    curr.append((member, score))
                self.storage[key] = curr
                results.append(len(mapping))
            elif action == "zcard":
                results.append(len(self.storage.get(key, [])))
            elif action == "expire":
                results.append(True)
        return results


class MockRedisClient:
    """Mock Redis client simulating Redis sorted sets for sliding window rate limiting."""
    def __init__(self):
        self.storage = {}

    def pipeline(self):
        return MockRedisPipeline(self.storage)

    def zrange(self, key, start, stop, withscores=False):
        entries = self.storage.get(key, [])
        if not entries:
            return []
        if withscores:
            return [(entries[0][0], entries[0][1])]
        return [entries[0][0]]

    def zrem(self, key, *members):
        entries = self.storage.get(key, [])
        self.storage[key] = [e for e in entries if e[0] not in members]

    def keys(self, pattern):
        return list(self.storage.keys())

    def delete(self, *keys):
        for k in keys:
            self.storage.pop(k, None)


def _make_mock_request(client_ip="192.168.1.50", path="/test/endpoint"):
    class MockClient:
        host = client_ip

    class MockRequest:
        client = MockClient()
        headers = {}
        scope = {"path": path}

    return MockRequest()


def test_rl01_redis_distributed_sharing_across_instances():
    """
    RL-01: Two independent RateLimiter instances sharing the same Redis client
    must enforce the unified limit across both instances (simulating multi-worker processes).
    """
    mock_redis = MockRedisClient()

    # Worker 1 limiter
    worker_1_limiter = RateLimiter(
        requests_limit=2,
        window_seconds=60,
        key_prefix="worker_test",
        use_path=False,
        redis_client=mock_redis,
    )

    # Worker 2 limiter (independent instance with same Redis store)
    worker_2_limiter = RateLimiter(
        requests_limit=2,
        window_seconds=60,
        key_prefix="worker_test",
        use_path=False,
        redis_client=mock_redis,
    )

    req = _make_mock_request("10.0.0.1")

    # Request 1 via Worker 1: OK
    asyncio.run(worker_1_limiter(req))

    # Request 2 via Worker 2: OK (reaches quota of 2)
    asyncio.run(worker_2_limiter(req))

    # Request 3 via Worker 1: Exceeds limit across instances -> 429
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(worker_1_limiter(req))
    assert exc_info.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert "Retry-After" in exc_info.value.headers

    # Request 4 via Worker 2: Also blocked on other instance -> 429
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(worker_2_limiter(req))
    assert exc_info.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_rl01_redis_outage_falls_back_to_local_limiter_without_failing_open():
    """
    RL-01: When Redis is unreachable, RateLimiter falls back to process-local
    limiting, logging a warning and NOT failing wide open to infinite traffic.
    """
    broken_redis = MagicMock()
    broken_redis.pipeline.side_effect = ConnectionError("Redis cluster unreachable")

    limiter = RateLimiter(
        requests_limit=2,
        window_seconds=60,
        key_prefix="failover_test",
        use_path=False,
        redis_client=broken_redis,
    )

    req = _make_mock_request("10.0.0.2")

    # Request 1 & 2 pass locally
    asyncio.run(limiter(req))
    asyncio.run(limiter(req))

    # Request 3 must still be throttled locally with 429
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(limiter(req))
    assert exc_info.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_rl01_fail_open_setting_behavior(monkeypatch):
    """
    RL-01: When Redis is unreachable:
    - If RATE_LIMIT_FAIL_OPEN is False (default), traffic is throttled locally.
    - If RATE_LIMIT_FAIL_OPEN is True, rate limit is safely bypassed without crashing.
    """
    broken_redis = MagicMock()
    broken_redis.pipeline.side_effect = ConnectionError("Redis down")

    limiter = RateLimiter(
        requests_limit=1,
        window_seconds=60,
        key_prefix="fail_open_test",
        use_path=False,
        redis_client=broken_redis,
    )
    req = _make_mock_request("10.0.0.99")

    # 1. FAIL_OPEN = False: Throttle locally
    monkeypatch.setattr(settings, "RATE_LIMIT_FAIL_OPEN", False)
    asyncio.run(limiter(req))
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(limiter(req))
    assert exc_info.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    # 2. FAIL_OPEN = True: Allow traffic
    limiter.reset()
    monkeypatch.setattr(settings, "RATE_LIMIT_FAIL_OPEN", True)
    asyncio.run(limiter(req))
    asyncio.run(limiter(req))  # Passes without raising 429


# ==============================================================================
# 2. RL-02: CONTACT & ANALYTICS ROUTE ALIAS BUCKET SHARING
# ==============================================================================

def test_rl02_contact_route_aliases_share_single_rate_limit_bucket(api_client: TestClient):
    """
    RL-02: Alternating between /api/v1/contact and /api/contact shares the same
    request bucket and triggers HTTP 429 at the configured threshold.
    """
    contact_rate_limiter.requests_limit = 2
    contact_rate_limiter.reset()

    payload = {
        "name": "Alias Rate Tester",
        "email": "alias.tester@example.com",
        "message": "Testing that alternating between contact aliases shares quota.",
    }

    try:
        # Request 1 via canonical route /api/v1/contact -> 201
        res1 = api_client.post("/api/v1/contact", json=payload)
        assert res1.status_code == status.HTTP_201_CREATED

        # Request 2 via unversioned alias /api/contact -> 201 (reaches limit of 2)
        res2 = api_client.post("/api/contact", json=payload)
        assert res2.status_code == status.HTTP_201_CREATED

        # Request 3 via canonical route: must be blocked with 429
        res3 = api_client.post("/api/v1/contact", json=payload)
        assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert "Retry-After" in res3.headers

        # Request 4 via alias route: must ALSO be blocked with 429
        res4 = api_client.post("/api/contact", json=payload)
        assert res4.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    finally:
        contact_rate_limiter.requests_limit = 30
        contact_rate_limiter.reset()


# ==============================================================================
# 3. RL-03: RATE LIMITER MEMORY LEAK CLEANUP
# ==============================================================================

def test_rl03_expired_client_keys_are_evicted_from_memory():
    """
    RL-03: Expired request history entries are evicted from self._history,
    preventing unbounded memory growth from millions of unique IPs.
    """
    limiter = RateLimiter(requests_limit=5, window_seconds=2, key_prefix="mem_test", use_path=False)
    limiter.reset()

    req_old = _make_mock_request("1.2.3.4")
    req_active = _make_mock_request("5.6.7.8")

    # Record request for old IP
    asyncio.run(limiter(req_old))
    assert "mem_test:1.2.3.4" in limiter._history

    # Manually backdate the timestamp to simulate expiration beyond window
    limiter._history["mem_test:1.2.3.4"] = [time.time() - 10]
    limiter._last_cleanup = time.time() - 5

    # New request comes in from active client
    asyncio.run(limiter(req_active))

    # Old expired client key must be pruned from memory
    assert "mem_test:1.2.3.4" not in limiter._history
    # Active client key must still be retained
    assert "mem_test:5.6.7.8" in limiter._history


# ==============================================================================
# 4. DB-01: INTEGRATION TEST DATABASE SAFETY GUARD
# ==============================================================================

def test_db01_safety_guard_accepts_valid_isolated_test_databases():
    """DB-01: Safe local and containerized test targets are accepted."""
    # SQLite memory
    validate_test_database_target("sqlite:///:memory:", "test")
    # Local containerized PostgreSQL with dedicated test database name
    validate_test_database_target(
        "postgresql+psycopg://postgres_test:pass@localhost:5432/storyhour_test",
        "test",
    )
    validate_test_database_target(
        "postgresql://postgres_test:pass@postgres:5432/test_db",
        "test",
    )


def test_db01_safety_guard_rejects_non_test_environment():
    """DB-01: Guard rejects production, staging, and development environments."""
    with pytest.raises(RuntimeError) as exc_info:
        validate_test_database_target("sqlite:///:memory:", "production")
    assert "ENVIRONMENT='test'" in str(exc_info.value)

    with pytest.raises(RuntimeError):
        validate_test_database_target("sqlite:///:memory:", "development")


def test_db01_safety_guard_rejects_cloud_production_hosts():
    """DB-01: Guard strictly rejects Supabase, AWS, Azure, and cloud hosts."""
    prohibited_hosts = [
        "postgresql://user:secret@db.project.supabase.co:5432/storyhour_test",
        "postgresql://user:secret@mydb.rds.amazonaws.com:5432/storyhour_test",
        "postgresql://user:secret@app.neon.tech:5432/storyhour_test",
    ]
    for url in prohibited_hosts:
        with pytest.raises(RuntimeError) as exc_info:
            validate_test_database_target(url, "test")
        assert "prohibited production cloud host" in str(exc_info.value)


def test_db01_safety_guard_rejects_production_database_names():
    """DB-01: Guard rejects default or production database names."""
    disallowed = [
        "postgresql://user:pass@localhost:5432/postgres",
        "postgresql://user:pass@localhost:5432/storyhour",
        "postgresql://user:pass@localhost:5432/production",
    ]
    for url in disallowed:
        with pytest.raises(RuntimeError) as exc_info:
            validate_test_database_target(url, "test")
        assert "forbidden for test execution" in str(exc_info.value) or "must contain 'test'" in str(exc_info.value)


def test_db01_safety_guard_never_leaks_connection_string():
    """DB-01: Rejection exceptions must never print the connection string or credentials."""
    secret_url = "postgresql://my_secret_user:super_secret_password@db.supabase.co:5432/prod_db"
    try:
        validate_test_database_target(secret_url, "test")
    except RuntimeError as exc:
        err_msg = str(exc)
        assert "super_secret_password" not in err_msg
        assert "my_secret_user" not in err_msg
        assert secret_url not in err_msg


# ==============================================================================
# 5. DB-03 & DB-04: CONNECTION TIMEOUT & POOL CONFIGURATION
# ==============================================================================

def test_db03_db04_configuration_validation_bounds():
    """DB-03, DB-04: Connection pool and timeout ranges are validated."""
    # Valid configuration
    valid_cfg = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="x" * 32,
        DB_POOL_SIZE=10,
        DB_MAX_OVERFLOW=20,
        DB_CONNECT_TIMEOUT=5,
        DB_POOL_RECYCLE=1800,
    )
    validate_configuration(valid_cfg)

    # Invalid pool size
    invalid_pool = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="x" * 32,
        DB_POOL_SIZE=100,  # exceeds 50
    )
    with pytest.raises(ValueError) as exc:
        validate_configuration(invalid_pool)
    assert "DB_POOL_SIZE must be between" in str(exc.value)

    # Invalid timeout
    invalid_timeout = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="x" * 32,
        DB_CONNECT_TIMEOUT=60,  # exceeds 30
    )
    with pytest.raises(ValueError) as exc:
        validate_configuration(invalid_timeout)
    assert "DB_CONNECT_TIMEOUT must be between" in str(exc.value)


# ==============================================================================
# 6. DB-05: SQLITE FOREIGN KEY ENFORCEMENT
# ==============================================================================

def test_db05_sqlite_foreign_key_enforcement_raises_integrity_error(api_db: Session):
    """
    DB-05: Inserting a child record with a nonexistent parent foreign key
    strictly raises an IntegrityError in SQLite test fixtures.
    """
    orphan_chapter = Chapter(
        story_id="00000000-0000-0000-0000-000000000000",  # Nonexistent story ID
        title="Orphan Chapter",
        order=1,
        duration=120,
    )
    api_db.add(orphan_chapter)
    with pytest.raises(IntegrityError):
        api_db.commit()
    api_db.rollback()


# ==============================================================================
# 7. SEC-01: HTTP SECURITY HEADERS
# ==============================================================================

def test_sec01_security_headers_present_on_all_responses(api_client: TestClient):
    """
    SEC-01: Standard browser security headers are present on successful
    responses, 404s, and validation error responses.
    """
    # 1. Successful 200 response
    res_root = api_client.get("/")
    assert res_root.status_code == status.HTTP_200_OK
    assert res_root.headers.get("X-Content-Type-Options") == "nosniff"
    assert res_root.headers.get("X-Frame-Options") == "DENY"
    assert res_root.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert res_root.headers.get("X-XSS-Protection") == "1; mode=block"

    # 2. 404 Not Found response
    res_404 = api_client.get("/api/v1/nonexistent-endpoint")
    assert res_404.status_code == status.HTTP_404_NOT_FOUND
    assert res_404.headers.get("X-Content-Type-Options") == "nosniff"
    assert res_404.headers.get("X-Frame-Options") == "DENY"

    # 3. 422 Validation Error response
    res_422 = api_client.post("/api/v1/contact", json={"invalid": "payload"})
    assert res_422.status_code == 422
    assert res_422.headers.get("X-Content-Type-Options") == "nosniff"
    assert res_422.headers.get("X-Frame-Options") == "DENY"


# ==============================================================================
# 8. SEC-02: GLOBAL LOG REDACTION ACROSS RELEVANT LOGGERS
# ==============================================================================

def test_sec02_sensitive_data_redaction_across_loggers(caplog):
    """
    SEC-02: SensitiveDataFilter sanitizes Bearer tokens, passwords, and DB credentials
    across application, root, and server loggers.
    """
    configure_global_logging_filters()
    f = SensitiveDataFilter()

    # Bearer token redaction
    assert "[REDACTED]" in f.sanitize_text("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret")
    # Password redaction
    assert "[REDACTED]" in f.sanitize_text('user_login with "password": "SuperSecretPassword123!"')
    # Connection URL credential redaction
    assert "postgres://app:[REDACTED]@localhost:5432/db" == f.sanitize_text(
        "postgres://app:my_secret_pass@localhost:5432/db"
    )

    # Verify filter handles non-string and complex args safely without crashing
    assert f._sanitize_value(None) is None
    assert f._sanitize_value(12345) == 12345
    sanitized_dict = f._sanitize_value({"password": "secret", "user": "alice"})
    assert sanitized_dict["password"] == "[REDACTED]"
    assert sanitized_dict["user"] == "alice"


# ==============================================================================
# 9. SEC-03: STRICT CORS ORIGIN VALIDATION
# ==============================================================================

def test_sec03_cors_origins_validation():
    """SEC-03: CORS rejects wildcard origin '*' when credentials are enabled."""
    # Wildcard origin rejected
    wildcard_cfg = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="x" * 32,
        CORS_ORIGINS=["*"],
    )
    with pytest.raises(ValueError) as exc:
        validate_configuration(wildcard_cfg)
    assert "Wildcard origin '*' is not permitted" in str(exc.value)

    # Non-HTTP origins rejected
    invalid_proto = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="x" * 32,
        CORS_ORIGINS=["ftp://evil.com"],
    )
    with pytest.raises(ValueError) as exc:
        validate_configuration(invalid_proto)
    assert "must start with http:// or https://" in str(exc.value)


# ==============================================================================
# 10. API-02: AUTHENTICATION LOGOUT ENDPOINTS
# ==============================================================================

def test_api02_auth_logout_canonical_and_alias(api_client: TestClient):
    """
    API-02: POST /api/auth/logout and /api/logout successfully terminate session.
    """
    # Canonical route
    res = api_client.post("/api/auth/logout")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["message"] == "User logged out successfully"
    assert data["session_active"] is False

    # Alias route
    res_alias = api_client.post("/api/logout")
    assert res_alias.status_code == status.HTTP_200_OK
    assert res_alias.json()["message"] == "User logged out successfully"
