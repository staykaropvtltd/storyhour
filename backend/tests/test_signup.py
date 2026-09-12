import pytest
from unittest.mock import MagicMock
from fastapi import status
from app.schemas.auth import SignUpRequest
from app.services.supabase_service import supabase_service


# ==============================================================================
# UNIT TESTS: STRICT 4-FIELD SIGNUP SCHEMA VALIDATION
# ==============================================================================

def test_signup_schema_exact_four_fields_with_colons():
    """
    Test SignUpRequest accepts the exact 4 fields specified:
    - Name:
    - email id :
    - password :
    - confirm the password :
    """
    payload = {
        "Name:": "Adithya Goud",
        "email id :": "adithya@storyhour.com",
        "password :": "SecretPassword123!",
        "confirm the password :": "SecretPassword123!",
    }
    data = SignUpRequest.model_validate(payload)
    assert data.name == "Adithya Goud"
    assert data.email == "adithya@storyhour.com"
    assert data.password == "SecretPassword123!"
    assert data.confirm_password == "SecretPassword123!"


def test_signup_schema_standard_keys():
    """
    Test SignUpRequest accepts standard JSON field names:
    - name
    - email
    - password
    - confirm_password
    """
    payload = {
        "name": "Jane Doe",
        "email": "jane@storyhour.com",
        "password": "SecurePassword999!",
        "confirm_password": "SecurePassword999!",
    }
    data = SignUpRequest.model_validate(payload)
    assert data.name == "Jane Doe"
    assert data.email == "jane@storyhour.com"
    assert data.password == "SecurePassword999!"
    assert data.confirm_password == "SecurePassword999!"


def test_signup_schema_natural_aliases_without_colons():
    """
    Test SignUpRequest accepts natural aliases without colons:
    - Name
    - email id
    - password
    - confirm the password
    """
    payload = {
        "Name": "John Doe",
        "email id": "john@storyhour.com",
        "password": "MyPassword123!",
        "confirm the password": "MyPassword123!",
    }
    data = SignUpRequest.model_validate(payload)
    assert data.name == "John Doe"
    assert data.email == "john@storyhour.com"


def test_signup_schema_strictly_forbids_more_than_four_fields():
    """
    Test that supplying ANY extra field beyond the 4 allowed fields
    is strictly rejected by Pydantic (extra='forbid').
    """
    payload = {
        "Name:": "Attacker",
        "email id :": "attacker@example.com",
        "password :": "Pass123456!",
        "confirm the password :": "Pass123456!",
        "extra_field": "not_allowed",
    }
    with pytest.raises(Exception) as exc_info:
        SignUpRequest.model_validate(payload)
    
    err_str = str(exc_info.value)
    assert "extra_forbidden" in err_str or "Extra inputs are not permitted" in err_str


def test_signup_schema_rejects_missing_fields():
    """Test validation errors when any of the 4 required fields is missing."""
    # Missing confirm password
    with pytest.raises(Exception):
        SignUpRequest.model_validate({
            "Name:": "User",
            "email id :": "user@example.com",
            "password :": "Pass123456!",
        })

    # Missing email id
    with pytest.raises(Exception):
        SignUpRequest.model_validate({
            "Name:": "User",
            "password :": "Pass123456!",
            "confirm the password :": "Pass123456!",
        })

    # Missing name
    with pytest.raises(Exception):
        SignUpRequest.model_validate({
            "email id :": "user@example.com",
            "password :": "Pass123456!",
            "confirm the password :": "Pass123456!",
        })

    # Missing password
    with pytest.raises(Exception):
        SignUpRequest.model_validate({
            "Name:": "User",
            "email id :": "user@example.com",
            "confirm the password :": "Pass123456!",
        })


def test_signup_schema_rejects_password_mismatch():
    """Test that mismatched password and confirm_password raises validation error."""
    with pytest.raises(Exception) as exc_info:
        SignUpRequest.model_validate({
            "Name:": "User",
            "email id :": "user@example.com",
            "password :": "Password123!",
            "confirm the password :": "DifferentPassword456!",
        })
    assert "Passwords do not match" in str(exc_info.value)


def test_signup_schema_rejects_short_password():
    """Test that passwords shorter than 6 characters are rejected."""
    with pytest.raises(Exception):
        SignUpRequest.model_validate({
            "Name:": "User",
            "email id :": "user@example.com",
            "password :": "123",
            "confirm the password :": "123",
        })


def test_signup_schema_rejects_blank_name():
    """Test that empty or whitespace-only name is rejected."""
    with pytest.raises(Exception) as exc_info:
        SignUpRequest.model_validate({
            "Name:": "     ",
            "email id :": "user@example.com",
            "password :": "Password123!",
            "confirm the password :": "Password123!",
        })
    assert "Name cannot be empty or whitespace" in str(exc_info.value)


# ==============================================================================
# API ROUTE TESTS: FASTAPI HTTP ENDPOINTS
# ==============================================================================

def test_api_signup_rejects_extra_fields(client):
    """
    POST /api/auth/signup must reject any request with > 4 fields
    with HTTP 422 Unprocessable Entity.
    """
    response = client.post(
        "/api/auth/signup",
        json={
            "Name:": "Testing Extra",
            "email id :": "extra@storyhour.com",
            "password :": "StrongPass123!",
            "confirm the password :": "StrongPass123!",
            "phone_number": "+1234567890",
            "role": "admin",
        },
    )
    assert response.status_code == 422
    data = response.json()
    err_text = str(data)
    assert "extra_forbidden" in err_text or "Extra inputs are not permitted" in err_text


def test_api_signup_rejects_mismatched_password(client):
    """POST /api/auth/signup rejects mismatched password."""
    response = client.post(
        "/api/auth/signup",
        json={
            "Name:": "Story User",
            "email id :": "mismatch@storyhour.com",
            "password :": "Password123!",
            "confirm the password :": "DifferentPass999!",
        },
    )
    assert response.status_code == 422
    assert "Passwords do not match" in str(response.json())


def test_api_signup_rejects_missing_fields(client):
    """POST /api/auth/signup rejects incomplete payloads."""
    response = client.post(
        "/api/auth/signup",
        json={
            "Name:": "Only Name",
        },
    )
    assert response.status_code == 422


def test_api_signup_success_mocked(client, monkeypatch):
    """
    POST /api/auth/signup successfully registers user with the 4 fields.
    """
    fake_user_id = "11111111-2222-3333-4444-555555555555"
    fake_email = "newuser@storyhour.com"
    fake_name = "New Storyteller"

    def mock_sign_up(name: str, email: str, password: str):
        assert name == fake_name
        assert email == fake_email
        assert password == "SecurePassword123!"
        return {
            "message": "User registered successfully",
            "user_id": fake_user_id,
            "email": fake_email,
            "session_active": True,
            "access_token": "mock-jwt-token-xyz",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "mock-refresh-token",
            "user": {
                "id": fake_user_id,
                "email": fake_email,
                "role": "authenticated",
                "user_metadata": {"name": fake_name},
                "app_metadata": {"provider": "email"},
            },
        }

    monkeypatch.setattr(supabase_service, "sign_up", mock_sign_up)

    # 1. Test with exact colon format:
    res1 = client.post(
        "/api/auth/signup",
        json={
            "Name:": fake_name,
            "email id :": fake_email,
            "password :": "SecurePassword123!",
            "confirm the password :": "SecurePassword123!",
        },
    )
    assert res1.status_code == status.HTTP_201_CREATED
    data1 = res1.json()
    assert data1["message"] == "User registered successfully"
    assert data1["user_id"] == fake_user_id
    assert data1["email"] == fake_email
    assert data1["session_active"] is True

    # 2. Test with convenience route alias /api/signup:
    res2 = client.post(
        "/api/signup",
        json={
            "Name:": fake_name,
            "email id :": fake_email,
            "password :": "SecurePassword123!",
            "confirm the password :": "SecurePassword123!",
        },
    )
    assert res2.status_code == status.HTTP_201_CREATED
    data2 = res2.json()
    assert data2["user_id"] == fake_user_id
