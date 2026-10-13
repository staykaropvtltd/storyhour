from types import SimpleNamespace
from unittest.mock import patch

import pytest
from fastapi import status

from app.services.supabase_service import supabase_service


TEST_EMAIL = "test-matrix-runner@storyhour.com"
TEST_PASSWORD = "SecurePassword123!"
TEST_USER_ID = "d486d34e-0a56-4293-85f2-2b6b15801c80"


@pytest.fixture
def mock_login():
    """Mock Supabase login and profile synchronization for isolated tests."""
    user = SimpleNamespace(
        id=TEST_USER_ID,
        email=TEST_EMAIL,
        role="authenticated",
        user_metadata={"full_name": "Test Matrix Runner"},
        app_metadata={"provider": "email"},
    )
    session = SimpleNamespace(
        access_token="mock-access-token",
        refresh_token="mock-refresh-token",
        expires_in=3600,
    )
    result = SimpleNamespace(session=session, user=user)

    with (
        patch.object(supabase_service, "sign_in_with_password") as login,
        patch.object(supabase_service, "_sync_user_profile"),
    ):
        login.return_value = {
            "access_token": session.access_token,
            "token_type": "bearer",
            "expires_in": session.expires_in,
            "refresh_token": session.refresh_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "user_metadata": user.user_metadata,
                "app_metadata": user.app_metadata,
            },
        }
        yield login


def test_case_1_valid_login(client, mock_login):
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["access_token"] == "mock-access-token"
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert data["user"]["email"] == TEST_EMAIL
    assert data["user"]["id"] == TEST_USER_ID
    mock_login.assert_called_once_with(
        email=TEST_EMAIL, password=TEST_PASSWORD
    )


def test_case_2_wrong_password(client, mock_login):
    from fastapi import HTTPException

    mock_login.side_effect = HTTPException(
        status_code=401,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": "WrongPassword123!"},
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"
    assert "access_token" not in response.json()


def test_case_3_unregistered_email(client, mock_login):
    from fastapi import HTTPException

    mock_login.side_effect = HTTPException(
        status_code=401,
        detail="Invalid email or password",
    )
    response = client.post(
        "/api/auth/login",
        json={
            "email": "unregistered-random@example.com",
            "password": "SomePassword123!",
        },
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"
    assert "access_token" not in response.json()


def test_case_4_empty_email(client, mock_login):
    response = client.post(
        "/api/auth/login",
        json={"email": "", "password": "ValidPassword123!"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    mock_login.assert_not_called()


def test_case_5_empty_password(client, mock_login):
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": ""},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    mock_login.assert_not_called()


def test_case_6_invalid_email_format(client, mock_login):
    for email in ("abc@", "hello", "@example.com"):
        response = client.post(
            "/api/auth/login",
            json={"email": email, "password": "ValidPassword123!"},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    mock_login.assert_not_called()


def test_case_7_email_case_handling(client, mock_login):
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL.upper(), "password": TEST_PASSWORD},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["user"]["email"] == TEST_EMAIL
    mock_login.assert_called_once_with(
        email=TEST_EMAIL, password=TEST_PASSWORD
    )


def test_case_8_leading_trailing_whitespace(client, mock_login):
    response = client.post(
        "/api/auth/login",
        json={"email": f"   {TEST_EMAIL}   ", "password": TEST_PASSWORD},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["user"]["email"] == TEST_EMAIL
    mock_login.assert_called_once_with(
        email=TEST_EMAIL, password=TEST_PASSWORD
    )
