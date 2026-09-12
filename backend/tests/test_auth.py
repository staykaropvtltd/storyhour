import pytest
from fastapi import status


def test_health_check(client):
    """Test public health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "version" in data


def test_root_endpoint(client):
    """Test API discovery root endpoint."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "online"
    assert "endpoints" in data


def test_get_me_without_token(client):
    """Test /api/me requires authorization header."""
    response = client.get("/api/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == "Bearer"
    data = response.json()
    assert data["detail"] == "Authentication credentials were not provided"


def test_get_me_with_malformed_token(client):
    """Test /api/me rejects malformed or random strings."""
    response = client.get(
        "/api/me",
        headers={"Authorization": "Bearer not-a-valid-jwt-token"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert data["detail"] == "Could not validate credentials"


def test_get_me_with_tampered_token(client, make_token):
    """Test /api/me rejects token signed with wrong secret key."""
    tampered_token = make_token(secret="completely-different-wrong-secret-key-123456")
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {tampered_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert data["detail"] == "Could not validate credentials"


def test_get_me_with_expired_token(client, expired_token):
    """Test /api/me correctly identifies and rejects expired tokens."""
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert data["detail"] == "Token has expired"


def test_get_me_with_valid_token(client, valid_token):
    """Test /api/me successfully decodes Supabase JWT and returns profile."""
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {valid_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == "d486d34e-0a56-4293-85f2-2b6b15801c80"
    assert data["email"] == "storyteller@storyhour.com"
    assert data["role"] == "authenticated"
    assert data["is_active"] is True
    assert data["full_name"] == "Adithya Goud"
    assert "user_metadata" in data
    assert "app_metadata" in data


def test_get_auth_me_alias(client, valid_token):
    """Test /api/auth/me behaves identically to /api/me."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {valid_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == "storyteller@storyhour.com"


def test_protected_library_entitlements(client, valid_token):
    """Test protected library entitlements endpoint."""
    response = client.get(
        "/api/library/me",
        headers={"Authorization": f"Bearer {valid_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == "d486d34e-0a56-4293-85f2-2b6b15801c80"
    assert data["library_count"] >= 1


def test_admin_route_forbidden_for_normal_user(client, valid_token):
    """Test RBAC blocks standard users from admin endpoints."""
    response = client.get(
        "/api/library/admin/overview",
        headers={"Authorization": f"Bearer {valid_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Insufficient permissions" in response.json()["detail"]


def test_admin_route_accessible_for_admin_user(client, admin_token):
    """Test RBAC allows access when user has admin role in metadata."""
    response = client.get(
        "/api/library/admin/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "authorized"


def test_token_missing_email_rejected(client, make_token):
    """Test token lacking email claim is safely rejected without server crash."""
    invalid_claim_token = make_token(email="")
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {invalid_claim_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
