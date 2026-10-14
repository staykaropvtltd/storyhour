import time
from unittest.mock import MagicMock, patch
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import settings
from app.database.health import check_database_health, reset_database_health_cache
from app.database.models.profile import UserProfile
from app.models.library import LibraryItem
from app.models.story import Story, StoryStatus
from app.services.supabase_service import supabase_service


# ==============================================================================
# B-04 TESTS: HEALTH CHECK TTL CACHING
# ==============================================================================

def test_b04_health_check_caching():
    """Verify check_database_health caches response for 5 seconds to prevent DB exhaustion."""
    reset_database_health_cache()

    with patch("app.database.health.engine.connect") as mock_connect:
        mock_conn = MagicMock()
        mock_connect.return_value.__enter__.return_value = mock_conn

        # First probe hits the DB
        first = check_database_health()
        assert first is True
        assert mock_connect.call_count == 1

        # Rapid consecutive probes within 5 seconds hit the cache and DO NOT call connect()
        for _ in range(10):
            cached = check_database_health()
            assert cached is True
        assert mock_connect.call_count == 1

        # Force refresh bypasses cache
        refreshed = check_database_health(force_refresh=True)
        assert refreshed is True
        assert mock_connect.call_count == 2


# ==============================================================================
# B-07 TESTS: CORS HEADERS ON 500 AND ERROR RESPONSES
# ==============================================================================

def test_b07_cors_headers_on_500_error(api_client: TestClient):
    """Verify unhandled 500 errors include Access-Control-Allow-Origin header."""
    from fastapi import APIRouter
    test_router = APIRouter()

    @test_router.get("/test-unhandled-500")
    def faulty_endpoint():
        raise RuntimeError("Simulated crash for 500 CORS verification")

    api_client.app.include_router(test_router)
    client = TestClient(api_client.app, raise_server_exceptions=False)

    res = client.get(
        "/test-unhandled-500",
        headers={"Origin": "http://localhost:3000"},
    )
    assert res.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert res.headers.get("access-control-allow-credentials") == "true"
    assert "Internal server error" in res.json()["detail"]


def test_b07_cors_headers_on_404_starlette_error(api_client: TestClient):
    """Verify unmatched 404 routes return CORS headers and standard error structure."""
    res = api_client.get(
        "/api/non-existent-route-404",
        headers={"Origin": "http://localhost:3000"},
    )
    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert res.headers.get("access-control-allow-credentials") == "true"


# ==============================================================================
# B-08 TESTS: PROFILE SYNC EMAIL UPDATE
# ==============================================================================

def test_b08_profile_sync_updates_email(api_db: Session):
    """Verify _sync_user_profile updates email if user changed email in Supabase."""
    user_id = "test-email-sync-123"
    api_db.add(UserProfile(
        user_id=user_id,
        email="oldemail@storyhour.com",
        full_name="Initial Name",
        is_active=True,
    ))
    api_db.commit()

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = "newemail@storyhour.com"
    mock_user.user_metadata = {"full_name": "Updated Name"}

    with patch("app.database.session.SessionLocal", side_effect=lambda: api_db):
        supabase_service._sync_user_profile(mock_user)

    updated = api_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    assert updated.email == "newemail@storyhour.com"
    assert updated.full_name == "Updated Name"


# ==============================================================================
# B-09 TESTS: REAL LIBRARY ENTITLEMENTS RESOLUTION
# ==============================================================================

def test_b09_library_entitlements_returns_real_database_stories(api_client: TestClient, api_db: Session, make_token):
    """Verify /api/library/me resolves real database stories and entitlements."""
    user_id = "lib-entitlements-user-01"
    email = "libuser@storyhour.com"
    api_db.add(UserProfile(user_id=user_id, email=email, is_active=True))

    story = Story(
        title="Real Folktale of the Nilgiris",
        slug="real-folktale-nilgiris",
        status=StoryStatus.PUBLISHED,
    )
    api_db.add(story)
    api_db.commit()

    # Add real entitlement
    api_db.add(LibraryItem(user_id=user_id, story_id=story.id, access_type="purchased", is_active=True))
    api_db.commit()

    token = make_token(sub=user_id, email=email)
    res = api_client.get("/api/library/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["user_id"] == user_id
    assert data["total_count"] == 1
    assert data["items"][0]["story_id"] == story.id
    assert data["entitlements"][0]["title"] == "Real Folktale of the Nilgiris"


def test_b09_admin_overview_returns_real_metrics(api_client: TestClient, admin_token: str):
    """Verify /api/library/admin/overview returns real system metrics."""
    res = api_client.get("/api/library/admin/overview", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["status"] == "authorized"
    assert "metrics" in data
    assert "total_stories" in data["metrics"]


# ==============================================================================
# B-10 TESTS: ACCOUNT MANAGEMENT & GDPR ENDPOINTS
# ==============================================================================

def test_b10_refresh_token_endpoint(api_client: TestClient):
    """Verify POST /api/auth/refresh returns a fresh access token."""
    res = api_client.post("/api/auth/refresh", json={"refresh_token": "valid-test-refresh-token"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_b10_forgot_password_generic_response(api_client: TestClient):
    """Verify POST /api/auth/forgot-password returns safe anti-enumeration message."""
    res = api_client.post("/api/auth/forgot-password", json={"email": "victim@storyhour.com"})
    assert res.status_code == status.HTTP_200_OK
    assert "password reset link has been sent" in res.json()["message"]


def test_b10_reset_password_endpoint(api_client: TestClient):
    """Verify POST /api/auth/reset-password succeeds with token and new password."""
    res = api_client.post("/api/auth/reset-password", json={
        "access_token": "mock-recovery-access-token",
        "new_password": "NewSecurePassword123!",
    })
    assert res.status_code == status.HTTP_200_OK
    assert "successfully reset" in res.json()["message"]


def test_b10_change_password_endpoint(api_client: TestClient, api_db: Session, make_token):
    """Verify POST /api/auth/change-password operates for authenticated active user."""
    user_id = "change-pw-user"
    email = "changepw@storyhour.com"
    api_db.add(UserProfile(user_id=user_id, email=email, is_active=True))
    api_db.commit()

    token = make_token(sub=user_id, email=email)
    res = api_client.post(
        "/api/auth/change-password",
        json={
            "current_password": "OldPassword123!",
            "new_password": "NewPassword456!",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == status.HTTP_200_OK
    assert "Password updated successfully" in res.json()["message"]


def test_b10_delete_me_gdpr_soft_delete(api_client: TestClient, api_db: Session, make_token):
    """Verify DELETE /api/me deactivates and soft-deletes the user account."""
    user_id = "delete-me-user"
    email = "deleteme@storyhour.com"
    profile = UserProfile(user_id=user_id, email=email, is_active=True, is_deleted=False)
    api_db.add(profile)
    api_db.commit()

    token = make_token(sub=user_id, email=email)
    res = api_client.delete("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["is_deleted"] is True

    # Fresh DB check
    refreshed = api_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    assert refreshed.is_deleted is True
    assert refreshed.is_active is False

    # Subsequent access is blocked with 403 Forbidden
    blocked = api_client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert blocked.status_code == status.HTTP_403_FORBIDDEN


def test_b10_export_me_gdpr_data(api_client: TestClient, api_db: Session, make_token):
    """Verify GET /api/me/export returns full user archive data."""
    user_id = "export-user-01"
    email = "exportuser@storyhour.com"
    api_db.add(UserProfile(user_id=user_id, email=email, full_name="Export User", is_active=True))
    api_db.commit()

    token = make_token(sub=user_id, email=email)
    res = api_client.get("/api/me/export", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["profile"]["email"] == email
    assert data["profile"]["full_name"] == "Export User"
    assert "library_entitlements" in data
    assert "listening_progress" in data
    assert "orders" in data
