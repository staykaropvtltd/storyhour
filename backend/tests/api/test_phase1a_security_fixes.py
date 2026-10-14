import time
from typing import Any, Dict
from unittest.mock import MagicMock
import jwt
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.config import settings
from app.database.models.profile import UserProfile
from app.models.story import Story, StoryStatus
from app.models.chapter import Chapter
from app.models.audio_asset import AudioAsset, AudioAccessType
from app.models.library import LibraryItem
from app.services.supabase_service import supabase_service


def _generate_test_token(
    sub: str = "user-1111-2222-3333-4444",
    email: str = "testuser@storyhour.com",
    role: str = "authenticated",
    exp_delta: int = 3600,
    aud: str = "authenticated",
    iss: str = None,
    secret: str = None,
    algorithm: str = None,
    app_metadata: Dict[str, Any] = None,
    user_metadata: Dict[str, Any] = None,
    extra_payload: Dict[str, Any] = None,
) -> str:
    now = int(time.time())
    payload = {
        "sub": sub,
        "email": email,
        "role": role,
        "aud": aud,
        "iat": now,
        "exp": now + exp_delta,
        "app_metadata": app_metadata or {"provider": "email"},
        "user_metadata": user_metadata or {"full_name": "Test User"},
    }
    if iss:
        payload["iss"] = iss
    if extra_payload:
        payload.update(extra_payload)
    key = secret if secret is not None else settings.SUPABASE_JWT_SECRET
    alg = algorithm or settings.SUPABASE_JWT_ALGORITHM
    return jwt.encode(payload, key, algorithm=alg)


# ==============================================================================
# B-03 REGRESSION TESTS: AUTHENTICATION AND JWT SECURITY
# ==============================================================================

def test_b03_valid_token_local(monkeypatch):
    """Valid token in local JWT mode succeeds with verified claims."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    token = _generate_test_token(sub="valid-sub-001", email="valid@storyhour.com")
    user = supabase_service.verify_token(token)
    assert user.id == "valid-sub-001"
    assert user.email == "valid@storyhour.com"
    assert user.role == "Customer"
    assert user.is_active is False  # Must NOT be hardcoded to True


def test_b03_invalid_signature_local(monkeypatch):
    """Token signed with wrong key is rejected with InvalidTokenError."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    tampered = _generate_test_token(secret="completely-wrong-secret-key-99999999")
    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(tampered)


def test_b03_malformed_token_local(monkeypatch):
    """Malformed token string is safely rejected."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token("not.a.valid.jwt.string")


def test_b03_expired_token_local(monkeypatch):
    """Expired token raises ExpiredSignatureError."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    expired = _generate_test_token(exp_delta=-3600)
    with pytest.raises(jwt.ExpiredSignatureError):
        supabase_service.verify_token(expired)


def test_b03_incorrect_audience_local(monkeypatch):
    """Token with mismatched audience claim is rejected."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    wrong_aud = _generate_test_token(aud="untrusted-foreign-service")
    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(wrong_aud)


def test_b03_incorrect_issuer_local(monkeypatch):
    """When issuer verification is configured, mismatched issuer is rejected."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    monkeypatch.setattr(settings, "JWT_ISSUER", "https://storyhour.supabase.co/auth/v1")
    wrong_iss = _generate_test_token(iss="https://malicious.evil.com/auth/v1")
    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(wrong_iss)


def test_b03_empty_signing_secret_rejected(monkeypatch):
    """Empty or whitespace signing secret configuration fails safely."""
    token = _generate_test_token(secret="some-initial-signing-secret-key-32b-long!!")
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", "")
    with pytest.raises(jwt.InvalidTokenError) as exc_info:
        supabase_service.verify_token(token)
    assert "secret is not configured" in str(exc_info.value).lower()


def test_b03_unsupported_signing_algorithm(monkeypatch):
    """Tokens using unsupported algorithms (like 'none') are rejected."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    token = jwt.encode({"sub": "user1", "email": "a@b.com", "exp": int(time.time()) + 3600, "aud": "authenticated"}, "", algorithm="none")
    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(token)


def test_b03_missing_sub_claim(monkeypatch):
    """Token missing required 'sub' claim raises ValueError."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    token = _generate_test_token(sub="")
    with pytest.raises(ValueError):
        supabase_service.verify_token(token)


def test_b03_missing_email_claim(monkeypatch):
    """Token missing required 'email' claim raises ValueError."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    token = _generate_test_token(email="")
    with pytest.raises(ValueError):
        supabase_service.verify_token(token)


def test_b03_untrusted_email_metadata(monkeypatch):
    """User-controlled metadata cannot substitute for verified root email claim."""
    monkeypatch.setattr(settings, "AUTH_MODE", "local")
    # Attacker sets user_metadata email but leaves root email empty
    token = _generate_test_token(
        email="",
        user_metadata={"email": "victim-impersonated@storyhour.com"},
    )
    with pytest.raises(ValueError) as exc_info:
        supabase_service.verify_token(token)
    assert "email claim missing" in str(exc_info.value).lower()


def test_b03_supabase_mode_valid_token(monkeypatch):
    """In 'supabase' mode, verified remote response produces AuthenticatedUser."""
    monkeypatch.setattr(settings, "AUTH_MODE", "supabase")
    mock_client = MagicMock()
    mock_user = MagicMock()
    mock_user.id = "supabase-uuid-1234"
    mock_user.email = "remote@storyhour.com"
    mock_user.role = "authenticated"
    mock_user.app_metadata = {"role": "Customer"}
    mock_user.user_metadata = {"name": "Remote User"}
    mock_client.auth.get_user.return_value = MagicMock(user=mock_user)

    monkeypatch.setattr(supabase_service, "_anon_client", mock_client)

    user = supabase_service.verify_token("some.supabase.remote.jwt")
    assert user.id == "supabase-uuid-1234"
    assert user.email == "remote@storyhour.com"
    assert user.role == "Customer"
    assert user.is_active is False  # Must NOT be hardcoded to True


def test_b03_supabase_mode_invalid_token_no_fallback(monkeypatch):
    """In 'supabase' mode, provider rejection NEVER falls back to local JWT decoding."""
    monkeypatch.setattr(settings, "AUTH_MODE", "supabase")
    mock_client = MagicMock()
    # Supabase Auth returns invalid / expired token error
    mock_client.auth.get_user.side_effect = Exception("Invalid JWT: token has expired or is invalid")

    monkeypatch.setattr(supabase_service, "_anon_client", mock_client)

    # Even if token is cryptographically valid locally against SUPABASE_JWT_SECRET:
    valid_local_jwt = _generate_test_token(sub="fallback-attacker", email="attacker@evil.com")

    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(valid_local_jwt)


def test_b03_supabase_mode_network_failure_no_fallback(monkeypatch):
    """In 'supabase' mode, connection/network errors never silently fall back to local decode."""
    monkeypatch.setattr(settings, "AUTH_MODE", "supabase")
    mock_client = MagicMock()
    mock_client.auth.get_user.side_effect = ConnectionError("Could not connect to Supabase Auth API")

    monkeypatch.setattr(supabase_service, "_anon_client", mock_client)
    valid_local_jwt = _generate_test_token(sub="offline-sub", email="offline@storyhour.com")

    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(valid_local_jwt)


def test_b03_supabase_mode_unexpected_exception_no_fallback(monkeypatch):
    """In 'supabase' mode, arbitrary runtime exceptions never authorize the user."""
    monkeypatch.setattr(settings, "AUTH_MODE", "supabase")
    mock_client = MagicMock()
    mock_client.auth.get_user.side_effect = RuntimeError("Unexpected upstream gateway failure")

    monkeypatch.setattr(supabase_service, "_anon_client", mock_client)
    valid_local_jwt = _generate_test_token(sub="offline-sub", email="offline@storyhour.com")

    with pytest.raises(jwt.InvalidTokenError):
        supabase_service.verify_token(valid_local_jwt)


# ==============================================================================
# B-06 REGRESSION TESTS: USER ACCOUNT STATUS SECURITY
# ==============================================================================

def test_b06_active_user_accesses_me(api_client: TestClient, api_db):
    """Active user with legitimate database profile accesses /api/me successfully."""
    user_id = "user-active-123"
    profile = UserProfile(
        user_id=user_id,
        email="activeuser@storyhour.com",
        full_name="Active User",
        subscription_tier="free",
        is_active=True,
        is_deleted=False,
    )
    api_db.add(profile)
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="activeuser@storyhour.com")
    res = api_client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["id"] == user_id
    assert data["is_active"] is True
    assert data["email"] == "activeuser@storyhour.com"


def test_b06_inactive_user_accesses_me(api_client: TestClient, api_db):
    """Deactivated user (is_active=False) is blocked with HTTP 403 Forbidden."""
    user_id = "user-inactive-456"
    profile = UserProfile(
        user_id=user_id,
        email="inactive@storyhour.com",
        full_name="Inactive User",
        is_active=False,
        is_deleted=False,
    )
    api_db.add(profile)
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="inactive@storyhour.com")
    res = api_client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert "Inactive user account" in res.json()["detail"]


def test_b06_soft_deleted_user_accesses_me(api_client: TestClient, api_db):
    """Soft-deleted user (is_deleted=True) is blocked with HTTP 403 Forbidden."""
    user_id = "user-deleted-789"
    profile = UserProfile(
        user_id=user_id,
        email="deleted@storyhour.com",
        full_name="Deleted User",
        is_active=True,
        is_deleted=True,
    )
    api_db.add(profile)
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="deleted@storyhour.com")
    res = api_client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert "deactivated" in res.json()["detail"].lower()


def test_b06_missing_profile_accesses_me(api_client: TestClient):
    """Token with no corresponding UserProfile in database is blocked with HTTP 403."""
    user_id = "user-missing-profile-999"
    token = _generate_test_token(sub=user_id, email="ghost@storyhour.com")
    res = api_client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN)
    assert "profile not found" in res.json()["detail"].lower()


def test_b06_database_error_on_status_lookup(api_client: TestClient, monkeypatch):
    """Database lookup exceptions return HTTP 500 and NEVER authorize the user."""
    from app.dependencies import require_active_user
    token = _generate_test_token(sub="db-err-user", email="err@storyhour.com")

    class FaultyDB:
        def query(self, *args, **kwargs):
            raise RuntimeError("Database connection pool exhausted")

    from app.database import get_db
    api_client.app.dependency_overrides[get_db] = lambda: FaultyDB()

    res = api_client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Error verifying account status" in res.json()["detail"] or "Database error" in res.json()["detail"]


def test_b06_inactive_user_accesses_library(api_client: TestClient, api_db):
    """Inactive user is blocked from protected library endpoints."""
    user_id = "inactive-lib-user"
    api_db.add(UserProfile(user_id=user_id, email="lib@inactive.com", is_active=False))
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="lib@inactive.com")
    res = api_client.get("/api/v1/library/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_b06_soft_deleted_user_accesses_library(api_client: TestClient, api_db):
    """Soft-deleted user is blocked from protected library endpoints."""
    user_id = "deleted-lib-user"
    api_db.add(UserProfile(user_id=user_id, email="dellib@deleted.com", is_active=True, is_deleted=True))
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="dellib@deleted.com")
    res = api_client.get("/api/v1/library/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_b06_inactive_user_accesses_audio(api_client: TestClient, api_db):
    """Inactive user is blocked from protected audio stream endpoints."""
    user_id = "inactive-audio-user"
    api_db.add(UserProfile(user_id=user_id, email="audio@inactive.com", is_active=False))

    # Add a published story
    story = Story(title="Audio Test Story", slug="audio-test-story", status=StoryStatus.PUBLISHED)
    api_db.add(story)
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="audio@inactive.com")
    res = api_client.get("/api/v1/audio/audio-test-story/stream", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_b06_inactive_user_accesses_progress(api_client: TestClient, api_db):
    """Inactive user is blocked from listening progress resume points."""
    user_id = "inactive-prog-user"
    api_db.add(UserProfile(user_id=user_id, email="prog@inactive.com", is_active=False))
    api_db.commit()

    token = _generate_test_token(sub=user_id, email="prog@inactive.com")
    res = api_client.get("/api/v1/progress/resume", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_b06_role_based_authorization_after_fix(api_client: TestClient, api_db):
    """RBAC checks enforce active account status before verifying roles."""
    # 1. Inactive Administrator is blocked at active-status stage with 403 Inactive
    admin_id = "inactive-admin-123"
    api_db.add(UserProfile(user_id=admin_id, email="admin@inactive.com", is_active=False))
    api_db.commit()

    admin_token = _generate_test_token(sub=admin_id, email="admin@inactive.com", role="admin", app_metadata={"role": "admin"})
    res1 = api_client.get("/api/v1/admin/stories", headers={"Authorization": f"Bearer {admin_token}"})
    assert res1.status_code == status.HTTP_403_FORBIDDEN
    assert "Inactive user account" in res1.json()["detail"]

    # 2. Active Customer trying to access Admin endpoints is blocked with Insufficient permissions
    customer_id = "active-customer-456"
    api_db.add(UserProfile(user_id=customer_id, email="cust@active.com", is_active=True))
    api_db.commit()

    cust_token = _generate_test_token(sub=customer_id, email="cust@active.com", role="authenticated")
    res2 = api_client.get("/api/v1/admin/stories", headers={"Authorization": f"Bearer {cust_token}"})
    assert res2.status_code == status.HTTP_403_FORBIDDEN
    assert "Insufficient permissions" in res2.json()["detail"]


def test_b06_resource_ownership_preserved(api_client: TestClient, api_db):
    """Active user only retrieves their own library items, preserving isolation."""
    user1_id = "tenant-user-1"
    user2_id = "tenant-user-2"
    api_db.add(UserProfile(user_id=user1_id, email="user1@tenant.com", is_active=True))
    api_db.add(UserProfile(user_id=user2_id, email="user2@tenant.com", is_active=True))

    story1 = Story(title="Story One", slug="story-one", status=StoryStatus.PUBLISHED)
    story2 = Story(title="Story Two", slug="story-two", status=StoryStatus.PUBLISHED)
    api_db.add_all([story1, story2])
    api_db.commit()

    # User 1 has entitlement to Story 1, User 2 has entitlement to Story 2
    api_db.add(LibraryItem(user_id=user1_id, story_id=story1.id, is_active=True))
    api_db.add(LibraryItem(user_id=user2_id, story_id=story2.id, is_active=True))
    api_db.commit()

    token1 = _generate_test_token(sub=user1_id, email="user1@tenant.com")
    res = api_client.get("/api/v1/library/me", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["total_count"] == 1
    assert data["items"][0]["story_id"] == story1.id


def test_b06_profile_sync_does_not_reactivate_deleted(api_db):
    """Synchronization does not reactivate or update a soft-deleted profile."""
    user_id = "sync-deleted-user"
    profile = UserProfile(
        user_id=user_id,
        email="sync@deleted.com",
        full_name="Deleted Name",
        is_active=False,
        is_deleted=True,
    )
    api_db.add(profile)
    api_db.commit()

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = "sync@deleted.com"
    mock_user.user_metadata = {"full_name": "Reactivated Name"}

    from contextlib import contextmanager
    from unittest.mock import patch

    @contextmanager
    def mock_session():
        yield api_db

    with patch("app.database.session.SessionLocal", side_effect=mock_session):
        supabase_service._sync_user_profile(mock_user)

    refreshed = api_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    assert refreshed.is_active is False
    assert refreshed.is_deleted is True
    assert refreshed.full_name == "Deleted Name"  # Should NOT be updated
