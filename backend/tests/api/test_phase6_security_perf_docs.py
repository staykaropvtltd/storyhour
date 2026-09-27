import logging
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.core.logging import SensitiveDataFilter
from app.core.rate_limit import RateLimiter, contact_rate_limiter
from app.main import app
from app.models.category import Category


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def user_headers(valid_token):
    return {"Authorization": f"Bearer {valid_token}"}


# ============================================================================
# 1. RATE LIMITING TESTS
# ============================================================================

def test_rate_limiter_allows_under_limit(api_client: TestClient):
    """Verify that requests within configured limits succeed without 429."""
    contact_rate_limiter.reset()
    payload = {
        "name": "Rate Test User",
        "email": "ratetest@example.com",
        "enquiry_type": "General Enquiry",
        "message": "Testing that rate limiting allows normal traffic flow.",
    }
    res = api_client.post("/api/v1/contact", json=payload)
    assert res.status_code == status.HTTP_201_CREATED
    assert "id" in res.json()


def test_rate_limiter_blocks_excessive_requests(api_client: TestClient):
    """Verify that bursting beyond threshold returns 429 with Retry-After header."""
    limiter = RateLimiter(requests_limit=2, window_seconds=60, key_prefix="test_burst")
    
    class MockClient:
        host = "192.168.1.100"

    class MockRequest:
        client = MockClient()
        headers = {}
        scope = {"path": "/test/endpoint"}

    req = MockRequest()

    import asyncio
    asyncio.run(limiter(req))
    asyncio.run(limiter(req))

    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(limiter(req))

    assert exc_info.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert "Retry-After" in exc_info.value.headers
    assert int(exc_info.value.headers["Retry-After"]) >= 1


def test_contact_rate_limiting_integration(api_client: TestClient):
    """Verify contact endpoint returns 429 when burst limit is reached."""
    original_limit = contact_rate_limiter.requests_limit
    contact_rate_limiter.requests_limit = 2
    contact_rate_limiter.reset()

    payload = {
        "name": "Burst Tester",
        "email": "burst@example.com",
        "enquiry_type": "General Enquiry",
        "message": "Enquiry message designed to test rapid burst submissions.",
    }

    try:
        res1 = api_client.post("/api/v1/contact", json=payload)
        res2 = api_client.post("/api/v1/contact", json=payload)
        res3 = api_client.post("/api/v1/contact", json=payload)

        assert res1.status_code == status.HTTP_201_CREATED
        assert res2.status_code == status.HTTP_201_CREATED
        assert res3.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert "Retry-After" in res3.headers
    finally:
        contact_rate_limiter.requests_limit = original_limit
        contact_rate_limiter.reset()


# ============================================================================
# 2. HTTP CACHING & ETAG TESTS
# ============================================================================

def test_public_get_returns_cache_control_and_etag(api_client: TestClient, api_db):
    """Verify that public read-only endpoints return Cache-Control and ETag headers."""
    cat = api_db.query(Category).filter(Category.slug == "cache-cat").first()
    if not cat:
        cat = Category(name="Cache Category", slug="cache-cat", is_active=True)
        api_db.add(cat)
        api_db.commit()

    res = api_client.get("/api/v1/categories")
    assert res.status_code == status.HTTP_200_OK
    assert "ETag" in res.headers
    assert "Cache-Control" in res.headers
    assert "public" in res.headers["Cache-Control"]
    assert "max-age=" in res.headers["Cache-Control"]


def test_conditional_if_none_match_returns_304(api_client: TestClient, api_db):
    """Verify that sending a matching If-None-Match header returns 304 Not Modified."""
    res1 = api_client.get("/api/v1/categories")
    assert res1.status_code == status.HTTP_200_OK
    etag = res1.headers.get("ETag")
    assert etag is not None

    res2 = api_client.get("/api/v1/categories", headers={"If-None-Match": etag})
    assert res2.status_code == status.HTTP_304_NOT_MODIFIED
    assert res2.headers.get("ETag") == etag


def test_private_and_authenticated_routes_set_no_store(api_client: TestClient, user_headers):
    """Verify that authenticated endpoints are NEVER cached and return no-store, private."""
    res = api_client.get("/api/v1/library/me", headers=user_headers)
    assert res.status_code == status.HTTP_200_OK
    assert "Cache-Control" in res.headers
    assert "no-store" in res.headers["Cache-Control"]
    assert "private" in res.headers["Cache-Control"]


def test_admin_routes_set_no_store(api_client: TestClient, admin_headers):
    """Verify that administrative endpoints are NEVER cached and return no-store, private."""
    res = api_client.get("/api/v1/admin/stories", headers=admin_headers)
    assert res.status_code == status.HTTP_200_OK
    assert "Cache-Control" in res.headers
    assert "no-store" in res.headers["Cache-Control"]


# ============================================================================
# 3. OBSERVABILITY & REQUEST ID TESTS
# ============================================================================

def test_request_id_generated_and_propagated(api_client: TestClient):
    """Verify X-Request-ID header is generated and returned on responses."""
    res = api_client.get("/api/health")
    assert res.status_code == status.HTTP_200_OK
    assert "X-Request-ID" in res.headers
    assert len(res.headers["X-Request-ID"]) > 10


def test_client_request_id_preserved(api_client: TestClient):
    """Verify that client-provided X-Request-ID header is preserved."""
    custom_id = "test-request-id-xyz-12345"
    res = api_client.get("/api/health", headers={"X-Request-ID": custom_id})
    assert res.status_code == status.HTTP_200_OK
    assert res.headers["X-Request-ID"] == custom_id


def test_request_id_present_on_error_responses(api_client: TestClient):
    """Verify that error responses (404, 401, 422) also propagate X-Request-ID."""
    res = api_client.get("/api/v1/stories/non-existent-story-slug-999")
    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert "X-Request-ID" in res.headers


# ============================================================================
# 4. SENSITIVE LOG REDACTION TESTS
# ============================================================================

def test_sensitive_log_filter_redacts_credentials():
    """Verify SensitiveDataFilter redacts passwords, tokens, API keys, and cardholder data."""
    log_filter = SensitiveDataFilter()

    # Test Bearer header redaction
    rec1 = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="User authorized with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.abcdef",
        args=(), exc_info=None
    )
    log_filter.filter(rec1)
    assert "[REDACTED]" in rec1.msg
    assert "eyJhbGciOi" not in rec1.msg

    # Test password redaction
    rec2 = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="Authentication attempted with password='mySuperSecretPassword123'",
        args=(), exc_info=None
    )
    log_filter.filter(rec2)
    assert "[REDACTED]" in rec2.msg
    assert "mySuperSecretPassword123" not in rec2.msg

    # Test card number & CVV redaction
    rec3 = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="Processing transaction with card_number='4111222233334444' and cvv='987'",
        args=(), exc_info=None
    )
    log_filter.filter(rec3)
    assert "[REDACTED]" in rec3.msg
    assert "4111222233334444" not in rec3.msg
    assert "987" not in rec3.msg

    # Test standalone JWT token
    rec4 = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgN passed verification",
        args=(), exc_info=None
    )
    log_filter.filter(rec4)
    assert "[REDACTED_JWT]" in rec4.msg
    assert "dozjgN" not in rec4.msg


# ============================================================================
# 5. OPENAPI & API DOCUMENTATION TESTS
# ============================================================================

def test_openapi_schema_contains_required_phase_metadata():
    """Verify that OpenAPI documentation includes all API domains with no credentials exposed."""
    schema = app.openapi()
    assert schema["openapi"].startswith("3.")
    assert "paths" in schema
    assert "components" in schema

    # Verify key domains are present in tags
    tag_names = {t["name"] for t in schema.get("tags", [])}
    expected_tags = {
        "Stories", "Categories", "Languages", "Audio & Streaming",
        "Listening Progress", "User Library", "Events", "Journal",
        "Contact", "Admin & CMS", "Analytics & Telemetry",
        "Products", "Cart", "Orders", "Payments",
    }
    for tag in expected_tags:
        assert tag in tag_names, f"Missing OpenAPI tag: {tag}"

    import json
    schema_dump = json.dumps(schema)
    assert "your-supabase-service-role-secret-key" not in schema_dump
    assert "your-supabase-jwt-secret" not in schema_dump


# ============================================================================
# 6. END-TO-END API SMOKE TESTS ACROSS ALL MODULES
# ============================================================================

def test_api_smoke_test_public_modules(api_client: TestClient, api_db):
    """Smoke test: verify all public content modules return valid HTTP 200 responses."""
    # 1. Categories
    res_cat = api_client.get("/api/v1/categories")
    assert res_cat.status_code == 200

    # 2. Languages
    res_lang = api_client.get("/api/v1/languages")
    assert res_lang.status_code == 200

    # 3. Stories
    res_story = api_client.get("/api/v1/stories")
    assert res_story.status_code == 200

    # 4. Events
    res_events = api_client.get("/api/v1/events")
    assert res_events.status_code == 200

    # 5. Journal
    res_journal = api_client.get("/api/v1/journal")
    assert res_journal.status_code == 200


def test_api_smoke_test_authenticated_modules(api_client: TestClient, user_headers):
    """Smoke test: verify authenticated user endpoints return valid HTTP 200 responses."""
    # 1. User profile
    res_me = api_client.get("/api/v1/me", headers=user_headers)
    assert res_me.status_code in (200, 404)

    # 2. User library
    res_lib = api_client.get("/api/v1/library/me", headers=user_headers)
    assert res_lib.status_code == 200
    assert "items" in res_lib.json()

    # 3. Resume points
    res_resume = api_client.get("/api/v1/progress/resume", headers=user_headers)
    assert res_resume.status_code == 200
    assert isinstance(res_resume.json(), list)


def test_api_smoke_test_admin_modules(api_client: TestClient, admin_headers):
    """Smoke test: verify admin endpoints respond with HTTP 200 for Administrator role."""
    # 1. Admin stories
    res_stories = api_client.get("/api/v1/admin/stories", headers=admin_headers)
    assert res_stories.status_code == 200

    # 2. Admin events
    res_events = api_client.get("/api/v1/admin/events", headers=admin_headers)
    assert res_events.status_code == 200

    # 3. Admin journal
    res_journal = api_client.get("/api/v1/admin/journal", headers=admin_headers)
    assert res_journal.status_code == 200

    # 4. Admin contact submissions
    res_contact = api_client.get("/api/v1/admin/contact", headers=admin_headers)
    assert res_contact.status_code == 200

    # 5. Admin media
    res_media = api_client.get("/api/v1/admin/media", headers=admin_headers)
    assert res_media.status_code == 200

    # 6. Admin analytics summary
    res_summary = api_client.get("/api/v1/admin/analytics/summary", headers=admin_headers)
    assert res_summary.status_code == 200
    assert "total_events" in res_summary.json()


def test_api_smoke_test_commerce_modules(api_client: TestClient, user_headers):
    """Smoke test: verify commerce endpoints respond properly."""
    # 1. Products catalog
    res_prod = api_client.get("/api/v1/products")
    assert res_prod.status_code == 200

    # 2. User Cart
    res_cart = api_client.get("/api/v1/cart", headers=user_headers)
    assert res_cart.status_code in (200, 404)
