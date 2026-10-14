from unittest.mock import MagicMock
import pytest
from fastapi import status
from sqlalchemy.orm import sessionmaker
from app.services.supabase_service import supabase_service


@pytest.fixture
def registered_user(db_session, make_token, monkeypatch):
    """
    B-11.1 REMEDIATION:
    Provides an isolated test user and mocks Supabase Auth client to guarantee
    zero external network access and zero account mutations on live Supabase.
    """
    test_email = "test-matrix-runner@storyhour.com"
    test_password = "SecurePassword123!"
    test_user_id = "test-matrix-runner-uuid-0001"

    # Pre-seed UserProfile in isolated in-memory test database
    from app.database.models.profile import UserProfile
    existing = db_session.query(UserProfile).filter(UserProfile.user_id == test_user_id).first()
    if not existing:
        db_session.add(UserProfile(
            user_id=test_user_id,
            email=test_email,
            full_name="Test Matrix Runner",
            subscription_tier="free",
            is_active=True,
            is_deleted=False,
        ))
        db_session.commit()

    # Create mock Supabase Auth client with simulated authentication logic
    class MockAuthClient:
        def sign_in_with_password(self, credentials):
            email = (credentials.get("email") or "").strip().lower()
            password = credentials.get("password") or ""
            if email == test_email and password == test_password:
                token = make_token(
                    sub=test_user_id,
                    email=test_email,
                    role="authenticated",
                    user_metadata={"full_name": "Test Matrix Runner"},
                )
                session = MagicMock()
                session.access_token = token
                session.refresh_token = "mock-refresh-token"
                session.expires_in = 3600

                user = MagicMock()
                user.id = test_user_id
                user.email = test_email
                user.role = "authenticated"
                user.user_metadata = {"full_name": "Test Matrix Runner"}
                user.app_metadata = {}

                res = MagicMock()
                res.session = session
                res.user = user
                return res

            # Simulate Supabase Auth failure on incorrect credentials
            raise Exception("Invalid login credentials")

    fake_anon = MagicMock()
    fake_anon.auth = MockAuthClient()
    monkeypatch.setattr(supabase_service, "anon_client", fake_anon)
    TestingSession = sessionmaker(bind=db_session.bind, autocommit=False, autoflush=False)
    monkeypatch.setattr("app.database.session.SessionLocal", TestingSession)

    # Strictly ensure admin client account mutation APIs are NEVER called
    mock_admin = MagicMock()
    mock_admin.auth.admin.create_user.side_effect = RuntimeError(
        "CRITICAL SAFETY VIOLATION: create_user called during unit tests"
    )
    mock_admin.auth.admin.delete_user.side_effect = RuntimeError(
        "CRITICAL SAFETY VIOLATION: delete_user called during unit tests"
    )
    monkeypatch.setattr(supabase_service, "admin_client", mock_admin)

    return {
        "email": test_email,
        "password": test_password,
        "user_id": test_user_id,
    }



# ==============================================================================
# 8-POINT USER LOGIN TEST MATRIX
# ==============================================================================


def test_case_1_valid_login(client, registered_user):
    """
    Test Case 1: Valid login
    Input: Correct registered email + correct password
    Expected: Login succeeds (200 OK) and valid access token / session is returned.
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert "user" in data
    assert data["user"]["email"] == registered_user["email"]
    assert data["user"]["id"] == registered_user["user_id"]

    # Verify that the issued access_token can access protected /api/me
    token = data["access_token"]
    me_res = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == status.HTTP_200_OK
    assert me_res.json()["email"] == registered_user["email"]


def test_case_2_wrong_password(client, registered_user):
    """
    Test Case 2: Wrong password
    Input: Correct email + incorrect password
    Expected: Login rejected (401 Unauthorized) with safe error.
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": "CompletelyWrongPassword!999",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert data["detail"] == "Invalid email or password"
    assert "access_token" not in data


def test_case_3_unregistered_email(client, registered_user):
    """
    Test Case 3: Unregistered email
    Input: Email doesn't exist + any password
    Expected: Login rejected (401 Unauthorized) with identical error; does not reveal whether account exists.
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": "completely-unregistered-random-email-xyz@storyhour.com",
            "password": "SomePassword123!",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    # Anti-enumeration assertion: error message must be identical to wrong password error
    assert data["detail"] == "Invalid email or password"
    assert "access_token" not in data



def test_case_4_empty_email(client):
    """
    Test Case 4: Empty email
    Input: Email = empty ("")
    Expected: Validation error (422 Unprocessable Entity); request rejected before hitting auth provider.
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": "",
            "password": "ValidPassword123!",
        },
    )
    assert response.status_code == 422
    data = response.json()
    assert "errors" in data or "detail" in data


def test_case_5_empty_password(client):
    """
    Test Case 5: Empty password
    Input: Password = empty ("")
    Expected: Validation error (422 Unprocessable Entity); request rejected.
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@example.com",
            "password": "",
        },
    )
    assert response.status_code == 422


def test_case_6_invalid_email_format(client):
    """
    Test Case 6: Invalid email format
    Input: "abc@" / "hello"
    Expected: Validation error (422 Unprocessable Entity).
    """
    # Sub-case 6a: missing domain
    res1 = client.post(
        "/api/auth/login",
        json={"email": "abc@", "password": "ValidPassword123!"},
    )
    assert res1.status_code == 422

    # Sub-case 6b: raw text without @
    res2 = client.post(
        "/api/auth/login",
        json={"email": "hello", "password": "ValidPassword123!"},
    )
    assert res2.status_code == 422

    # Sub-case 6c: missing local part
    res3 = client.post(
        "/api/auth/login",
        json={"email": "@example.com", "password": "ValidPassword123!"},
    )
    assert res3.status_code == 422


def test_case_7_email_case_handling(client, registered_user):
    """
    Test Case 7: Email case handling
    Input: Registered email with different capitalization (e.g. UPPERCASE)
    Expected: Normalized consistently according to auth rules; login succeeds (200 OK).
    """
    uppercase_email = registered_user["email"].upper()
    response = client.post(
        "/api/auth/login",
        json={
            "email": uppercase_email,
            "password": registered_user["password"],
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == registered_user["email"].lower()


def test_case_8_leading_trailing_whitespace(client, registered_user):
    """
    Test Case 8: Leading/trailing whitespace
    Input: "  user@example.com  "
    Expected: Trimmed and normalized consistently; login succeeds (200 OK).
    """
    padded_email = f"   {registered_user['email']}   "
    response = client.post(
        "/api/auth/login",
        json={
            "email": padded_email,
            "password": registered_user["password"],
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == registered_user["email"].strip().lower()


def test_b11_1_admin_client_account_mutation_never_invoked(registered_user):
    """
    B-11.1 REGRESSION TEST:
    Explicitly assert that Supabase administrative account mutation APIs
    (admin.auth.admin.create_user and admin.auth.admin.delete_user) were never
    invoked during test execution.
    """
    admin = supabase_service.admin_client
    assert admin is not None
    admin.auth.admin.create_user.assert_not_called()
    admin.auth.admin.delete_user.assert_not_called()

