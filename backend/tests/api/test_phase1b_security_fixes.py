"""
Phase 1B Security Regression Test Suite.
Validates remediation of:
- B-02: Configuration security, validation, and removal of hardcoded infrastructure details.
- B-05: Authentication rate-limiting bypass closure across aliases, account-enumeration
        mitigation, upstream error sanitization, and sensitive logging redaction.
"""

import asyncio
import logging
from unittest.mock import MagicMock, patch
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.config import (
    ALLOWED_AUTH_MODES,
    ALLOWED_JWT_ALGORITHMS,
    Settings,
    settings,
    validate_configuration,
)
from app.core.logging import SensitiveDataFilter
from app.core.rate_limit import (
    RateLimiter,
    analytics_rate_limiter,
    auth_login_limiter,
    auth_rate_limiter,
    auth_signup_limiter,
    contact_rate_limiter,
)
from app.services.supabase_service import supabase_service


# ==============================================================================
# PART A: B-02 CONFIGURATION & INFRASTRUCTURE TESTS
# ==============================================================================


def test_b02_valid_supabase_mode_configuration():
    """Valid configuration in supabase mode passes validation without error."""
    cfg = Settings(
        DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/testdb",
        AUTH_MODE="supabase",
        SUPABASE_URL="https://exampleproject.supabase.co",
        SUPABASE_ANON_KEY="valid-anon-key-abc",
    )
    # Should not raise
    validate_configuration(cfg)


def test_b02_valid_local_mode_configuration():
    """Valid configuration in local mode passes validation without requiring Supabase URL."""
    cfg = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="super-secure-local-jwt-secret-at-least-32-chars",
        SUPABASE_JWT_ALGORITHM="HS256",
    )
    # Should not raise
    validate_configuration(cfg)


def test_b02_missing_database_url_rejected():
    """Empty or missing DATABASE_URL is strictly rejected."""
    cfg = Settings(
        DATABASE_URL="",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="secret123",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    assert "DATABASE_URL is required" in str(exc_info.value)


def test_b02_invalid_auth_mode_rejected():
    """Unsupported AUTH_MODE is rejected against the strict allowlist."""
    cfg = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="insecure_fallback_mode",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    err = str(exc_info.value)
    assert "Invalid AUTH_MODE 'insecure_fallback_mode'" in err
    assert "Allowed modes" in err


def test_b02_supabase_mode_missing_url_rejected():
    """Supabase mode without SUPABASE_URL raises a clear, safe validation error."""
    cfg = Settings(
        DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/testdb",
        AUTH_MODE="supabase",
        SUPABASE_URL="",
        SUPABASE_ANON_KEY="anon-key",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    assert "SUPABASE_URL is required when AUTH_MODE is 'supabase'" in str(exc_info.value)


def test_b02_supabase_mode_invalid_url_rejected():
    """Supabase mode with non-HTTP/HTTPS URL raises validation error."""
    cfg = Settings(
        DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/testdb",
        AUTH_MODE="supabase",
        SUPABASE_URL="ftp://invalid-url.com",
        SUPABASE_ANON_KEY="anon-key",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    assert "SUPABASE_URL must be a valid HTTP or HTTPS URL" in str(exc_info.value)


def test_b02_supabase_mode_missing_anon_key_rejected():
    """Supabase mode without SUPABASE_ANON_KEY raises validation error."""
    cfg = Settings(
        DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/testdb",
        AUTH_MODE="supabase",
        SUPABASE_URL="https://project.supabase.co",
        SUPABASE_ANON_KEY="",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    assert "SUPABASE_ANON_KEY is required when AUTH_MODE is 'supabase'" in str(exc_info.value)


def test_b02_local_mode_missing_secret_rejected():
    """Local mode without SUPABASE_JWT_SECRET raises validation error."""
    cfg = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    assert "SUPABASE_JWT_SECRET is required when AUTH_MODE is 'local'" in str(exc_info.value)


def test_b02_local_mode_unsupported_algorithm_rejected():
    """Local mode with unsupported algorithm raises validation error."""
    cfg = Settings(
        DATABASE_URL="sqlite:///:memory:",
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET="valid-secret-key-12345",
        SUPABASE_JWT_ALGORITHM="none",
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    assert "Unsupported SUPABASE_JWT_ALGORITHM 'none'" in str(exc_info.value)


def test_b02_configuration_errors_never_reveal_secrets():
    """Configuration error messages never leak actual secret strings or passwords."""
    sensitive_secret_value = "super_classified_jwt_secret_9999"
    cfg = Settings(
        DATABASE_URL="",  # trigger error
        AUTH_MODE="local",
        SUPABASE_JWT_SECRET=sensitive_secret_value,
    )
    with pytest.raises(ValueError) as exc_info:
        validate_configuration(cfg)
    error_text = str(exc_info.value)
    assert sensitive_secret_value not in error_text


def test_b02_health_endpoint_does_not_disclose_hardcoded_host(api_client: TestClient):
    """Health check response does not expose the hardcoded host db.pbbmbryyncgoywappgjg.supabase.co."""
    res = api_client.get("/api/health")
    assert res.status_code in (status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE)
    res_text = res.text.lower()
    assert "pbbmbryyncgoywappgjg" not in res_text
    assert "db." not in res_text


def test_b02_health_endpoint_does_not_disclose_connection_strings_or_credentials(api_client: TestClient):
    """Health check response does not expose connection strings, passwords, or pool diagnostics."""
    res = api_client.get("/api/health")
    data = res.json()
    assert "password" not in res.text.lower()
    assert "postgres://" not in res.text.lower()
    assert "postgresql://" not in res.text.lower()
    # Pool diagnostics should not be leaked in public health check
    if "database" in data:
        db_data = data["database"]
        assert "pool" not in db_data
        assert "server_version" not in db_data
        assert "host" not in db_data
        assert "connected" in db_data


def test_b02_health_endpoint_returns_503_on_database_failure(api_client: TestClient, monkeypatch):
    """Health endpoint reports HTTP 503 and 'unhealthy' status when database probe fails."""
    monkeypatch.setattr("app.routers.health.check_database_health", lambda: False)

    res = api_client.get("/api/health")
    assert res.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    data = res.json()
    assert data["status"] == "unhealthy"
    assert data["database"]["connected"] is False


def test_b02_health_liveness_and_readiness_probes(api_client: TestClient):
    """Liveness probe returns alive and readiness probe reflects dependency state."""
    # Liveness probe
    live_res = api_client.get("/api/health/live")
    assert live_res.status_code == status.HTTP_200_OK
    assert live_res.json()["status"] == "alive"

    # Readiness probe
    ready_res = api_client.get("/api/health/ready")
    assert ready_res.status_code in (status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE)
    assert "status" in ready_res.json()


# ==============================================================================
# PART B: B-05 RATE LIMITING TESTS
# ==============================================================================


@pytest.fixture(autouse=True)
def reset_rate_limiters():
    """Ensure all rate limiters are cleared and thresholds restored between tests."""
    orig_limits = {
        auth_login_limiter: auth_login_limiter.requests_limit,
        auth_signup_limiter: auth_signup_limiter.requests_limit,
        auth_rate_limiter: auth_rate_limiter.requests_limit,
        contact_rate_limiter: contact_rate_limiter.requests_limit,
        analytics_rate_limiter: analytics_rate_limiter.requests_limit,
    }
    for limiter in orig_limits:
        limiter.reset()

    yield

    for limiter, orig_val in orig_limits.items():
        limiter.requests_limit = orig_val
        limiter.reset()


def test_b05_canonical_login_rate_limiting(api_client: TestClient, monkeypatch):
    """Canonical /api/auth/login route enforces the configured limit."""
    auth_login_limiter.requests_limit = 3
    auth_login_limiter.reset()

    # Mock sign_in to avoid external dependency
    monkeypatch.setattr(
        supabase_service,
        "sign_in_with_password",
        lambda email, password: {
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {"email": "user@test.com", "password": "Password123!"}
    res1 = api_client.post("/api/auth/login", json=payload)
    res2 = api_client.post("/api/auth/login", json=payload)
    res3 = api_client.post("/api/auth/login", json=payload)
    res4 = api_client.post("/api/auth/login", json=payload)

    assert res1.status_code == status.HTTP_200_OK
    assert res2.status_code == status.HTTP_200_OK
    assert res3.status_code == status.HTTP_200_OK
    assert res4.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert "Retry-After" in res4.headers


def test_b05_login_alias_rate_limiting(api_client: TestClient, monkeypatch):
    """Login alias /api/login enforces the same limit."""
    auth_login_limiter.requests_limit = 2
    auth_login_limiter.reset()

    monkeypatch.setattr(
        supabase_service,
        "sign_in_with_password",
        lambda email, password: {
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {"email": "user@test.com", "password": "Password123!"}
    res1 = api_client.post("/api/login", json=payload)
    res2 = api_client.post("/api/login", json=payload)
    res3 = api_client.post("/api/login", json=payload)

    assert res1.status_code == status.HTTP_200_OK
    assert res2.status_code == status.HTTP_200_OK
    assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_b05_login_alias_switching_shares_bucket_and_cannot_bypass(api_client: TestClient, monkeypatch):
    """Switching between /api/auth/login and /api/login shares quota and CANNOT bypass rate limiting."""
    auth_login_limiter.requests_limit = 2
    auth_login_limiter.reset()

    monkeypatch.setattr(
        supabase_service,
        "sign_in_with_password",
        lambda email, password: {
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {"email": "user@test.com", "password": "Password123!"}
    # Request 1 via canonical route
    res1 = api_client.post("/api/auth/login", json=payload)
    assert res1.status_code == status.HTTP_200_OK

    # Request 2 via alias route
    res2 = api_client.post("/api/login", json=payload)
    assert res2.status_code == status.HTTP_200_OK

    # Request 3 via canonical route: must be blocked with 429
    res3 = api_client.post("/api/auth/login", json=payload)
    assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    # Request 4 via alias route: must also be blocked with 429
    res4 = api_client.post("/api/login", json=payload)
    assert res4.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_b05_canonical_signup_rate_limiting(api_client: TestClient, monkeypatch):
    """Canonical /api/auth/signup route enforces configured limit."""
    auth_signup_limiter.requests_limit = 2
    auth_signup_limiter.reset()

    monkeypatch.setattr(
        supabase_service,
        "sign_up",
        lambda name, email, password: {
            "message": "User registered successfully",
            "user_id": "uid",
            "email": email,
            "session_active": True,
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {
        "Name:": "Test User",
        "email id :": "new@test.com",
        "password :": "Password123!",
        "confirm the password :": "Password123!",
    }

    res1 = api_client.post("/api/auth/signup", json=payload)
    res2 = api_client.post("/api/auth/signup", json=payload)
    res3 = api_client.post("/api/auth/signup", json=payload)

    assert res1.status_code == status.HTTP_201_CREATED
    assert res2.status_code == status.HTTP_201_CREATED
    assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_b05_signup_alias_rate_limiting(api_client: TestClient, monkeypatch):
    """Signup alias /api/signup enforces configured limit."""
    auth_signup_limiter.requests_limit = 2
    auth_signup_limiter.reset()

    monkeypatch.setattr(
        supabase_service,
        "sign_up",
        lambda name, email, password: {
            "message": "User registered successfully",
            "user_id": "uid",
            "email": email,
            "session_active": True,
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {
        "Name:": "Test User",
        "email id :": "new@test.com",
        "password :": "Password123!",
        "confirm the password :": "Password123!",
    }

    res1 = api_client.post("/api/signup", json=payload)
    res2 = api_client.post("/api/signup", json=payload)
    res3 = api_client.post("/api/signup", json=payload)

    assert res1.status_code == status.HTTP_201_CREATED
    assert res2.status_code == status.HTTP_201_CREATED
    assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_b05_signup_alias_switching_shares_bucket_and_cannot_bypass(api_client: TestClient, monkeypatch):
    """Switching between /api/auth/signup and /api/signup shares quota and cannot bypass rate limiting."""
    auth_signup_limiter.requests_limit = 2
    auth_signup_limiter.reset()

    monkeypatch.setattr(
        supabase_service,
        "sign_up",
        lambda name, email, password: {
            "message": "User registered successfully",
            "user_id": "uid",
            "email": email,
            "session_active": True,
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {
        "Name:": "Test User",
        "email id :": "new@test.com",
        "password :": "Password123!",
        "confirm the password :": "Password123!",
    }

    # Request 1 via canonical
    res1 = api_client.post("/api/auth/signup", json=payload)
    assert res1.status_code == status.HTTP_201_CREATED

    # Request 2 via alias
    res2 = api_client.post("/api/signup", json=payload)
    assert res2.status_code == status.HTTP_201_CREATED

    # Request 3 via canonical: must be 429
    res3 = api_client.post("/api/auth/signup", json=payload)
    assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    # Request 4 via alias: must be 429
    res4 = api_client.post("/api/signup", json=payload)
    assert res4.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_b05_spoofed_forwarded_ip_ignored_by_default(api_client: TestClient, monkeypatch):
    """Client cannot spoof IP via X-Forwarded-For to bypass rate limiter when TRUST_PROXY_HEADERS is False."""
    auth_login_limiter.requests_limit = 2
    auth_login_limiter.reset()

    monkeypatch.setattr(
        supabase_service,
        "sign_in_with_password",
        lambda email, password: {
            "access_token": "token",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "ref",
            "user": {"id": "uid", "email": email, "role": "authenticated"},
        },
    )

    payload = {"email": "user@test.com", "password": "Password123!"}

    # Spoofed X-Forwarded-For header attempts
    res1 = api_client.post("/api/auth/login", json=payload, headers={"X-Forwarded-For": "192.168.1.1"})
    res2 = api_client.post("/api/auth/login", json=payload, headers={"X-Forwarded-For": "192.168.1.2"})
    res3 = api_client.post("/api/auth/login", json=payload, headers={"X-Forwarded-For": "192.168.1.3"})

    assert res1.status_code == status.HTTP_200_OK
    assert res2.status_code == status.HTTP_200_OK
    # Res 3 must be blocked with 429 because untrusted header is ignored
    assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_b05_contact_and_analytics_rate_limits_preserved():
    """Contact (30/min) and analytics (120/min) configured thresholds remain preserved."""
    assert contact_rate_limiter.requests_limit == 30
    assert analytics_rate_limiter.requests_limit == 120
    assert auth_login_limiter.requests_limit == 30
    assert auth_signup_limiter.requests_limit == 30


# ==============================================================================
# PART B: B-05 ACCOUNT ENUMERATION & ERROR SANITIZATION TESTS
# ==============================================================================


def test_b05_duplicate_signup_does_not_reveal_account_existence(api_client: TestClient, monkeypatch):
    """Duplicate registration returns generic error and does not reveal whether account exists."""
    class FakeAuth:
        def sign_up(self, credentials):
            # Supabase returns empty identities when user already exists
            fake_user = MagicMock()
            fake_user.identities = []
            fake_res = MagicMock()
            fake_res.user = fake_user
            return fake_res

    fake_client = MagicMock()
    fake_client.auth = FakeAuth()
    monkeypatch.setattr(supabase_service, "anon_client", fake_client)

    payload = {
        "Name:": "Target User",
        "email id :": "target@victim.com",
        "password :": "SecretPassword123!",
        "confirm the password :": "SecretPassword123!",
    }

    res = api_client.post("/api/auth/signup", json=payload)
    # Must NOT return HTTP 409 revealing account exists
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    data = res.json()
    assert "already exists" not in data["detail"].lower()
    assert "could not be completed" in data["detail"].lower()


def test_b05_duplicate_signup_upstream_exception_sanitized(api_client: TestClient, monkeypatch):
    """Upstream 'user already registered' exception is mapped to generic safe error message."""
    class FakeAuth:
        def sign_up(self, credentials):
            raise Exception("User already registered with this email in Supabase")

    fake_client = MagicMock()
    fake_client.auth = FakeAuth()
    monkeypatch.setattr(supabase_service, "anon_client", fake_client)

    payload = {
        "Name:": "Target User",
        "email id :": "target@victim.com",
        "password :": "SecretPassword123!",
        "confirm the password :": "SecretPassword123!",
    }

    res = api_client.post("/api/auth/signup", json=payload)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    data = res.json()
    assert "already registered" not in data["detail"].lower()
    assert "supabase" not in data["detail"].lower()
    assert "could not be completed" in data["detail"].lower()


def test_b05_raw_upstream_exceptions_sanitized_in_signup(api_client: TestClient, monkeypatch):
    """Raw upstream internal errors are never leaked to API clients."""
    class FakeAuth:
        def sign_up(self, credentials):
            raise Exception("Internal Server Error: database connection to pgpool.internal:5432 failed")

    fake_client = MagicMock()
    fake_client.auth = FakeAuth()
    monkeypatch.setattr(supabase_service, "anon_client", fake_client)

    payload = {
        "Name:": "Test User",
        "email id :": "test@error.com",
        "password :": "SecretPassword123!",
        "confirm the password :": "SecretPassword123!",
    }

    res = api_client.post("/api/auth/signup", json=payload)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    data = res.json()
    # Must NOT reveal internal database or connection strings
    assert "pgpool" not in data["detail"].lower()
    assert "5432" not in data["detail"]
    assert "Registration could not be completed" in data["detail"]


def test_b05_failed_signup_never_reported_as_success(api_client: TestClient, monkeypatch):
    """Failed registration is never converted to a fake HTTP 200/201 success."""
    class FakeAuth:
        def sign_up(self, credentials):
            raise RuntimeError("Upstream provider failure")

    fake_client = MagicMock()
    fake_client.auth = FakeAuth()
    monkeypatch.setattr(supabase_service, "anon_client", fake_client)

    payload = {
        "Name:": "Test User",
        "email id :": "fail@test.com",
        "password :": "SecretPassword123!",
        "confirm the password :": "SecretPassword123!",
    }

    res = api_client.post("/api/auth/signup", json=payload)
    assert res.status_code != status.HTTP_200_OK
    assert res.status_code != status.HTTP_201_CREATED
    assert res.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================================
# PART B: B-05 SENSITIVE LOGGING REDACTION TESTS
# ==============================================================================


def test_b05_sensitive_log_filter_sanitizes_message():
    """SensitiveDataFilter sanitizes passwords and tokens in record.msg."""
    log_filter = SensitiveDataFilter()
    rec = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="User authenticated with password='MySecretPassword123!'",
        args=(), exc_info=None,
    )
    log_filter.filter(rec)
    assert "[REDACTED]" in rec.msg
    assert "MySecretPassword123!" not in rec.msg


def test_b05_sensitive_log_filter_sanitizes_args():
    """SensitiveDataFilter sanitizes passwords and secrets passed in record.args."""
    log_filter = SensitiveDataFilter()
    secret_pass = "SuperSecretPassword123!"
    rec = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="Login attempt for user %s with password %s",
        args=("adithya@storyhour.com", f"password='{secret_pass}'"), exc_info=None,
    )
    log_filter.filter(rec)
    formatted_msg = rec.getMessage()
    assert secret_pass not in formatted_msg
    assert "[REDACTED]" in formatted_msg


def test_b05_sensitive_log_filter_sanitizes_bearer_and_jwt_tokens():
    """SensitiveDataFilter redacts Bearer tokens and raw JWTs."""
    log_filter = SensitiveDataFilter()
    jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    rec = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg=f"Request received with Authorization: Bearer {jwt_token}",
        args=(), exc_info=None,
    )
    log_filter.filter(rec)
    assert jwt_token not in rec.msg
    assert "[REDACTED]" in rec.msg


def test_b05_sensitive_log_filter_sanitizes_connection_urls():
    """SensitiveDataFilter redacts passwords embedded in database connection strings."""
    log_filter = SensitiveDataFilter()
    conn_url = "postgresql+psycopg://postgres:TopSecretDbPass123@db.supabase.co:5432/postgres"
    rec = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg=f"Connected to database at {conn_url}",
        args=(), exc_info=None,
    )
    log_filter.filter(rec)
    assert "TopSecretDbPass123" not in rec.msg
    assert "[REDACTED]@" in rec.msg


def test_b05_sensitive_log_filter_sanitizes_exception_text():
    """SensitiveDataFilter redacts secrets in record.exc_text."""
    log_filter = SensitiveDataFilter()
    rec = logging.LogRecord(
        name="test", level=logging.ERROR, pathname="", lineno=0,
        msg="Database error occurred",
        args=(), exc_info=None,
    )
    rec.exc_text = "Traceback (most recent call last):\n  password='LeakedPasswordInTraceback999'"
    log_filter.filter(rec)
    assert "LeakedPasswordInTraceback999" not in rec.exc_text
    assert "[REDACTED]" in rec.exc_text
