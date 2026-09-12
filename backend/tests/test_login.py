import pytest
from fastapi import status
from app.services.supabase_service import supabase_service


@pytest.fixture(scope="module")
def registered_user():
    """
    Creates a temporary verified test user in Supabase Auth,
    yields the test credentials, and deletes the test user upon completion.
    """
    admin = supabase_service.admin_client
    if not admin:
        pytest.skip("Supabase admin client not configured for live user tests")

    test_email = "test-matrix-runner@storyhour.com"
    test_password = "SecurePassword123!"

    # Clean up any residual test user
    try:
        users = admin.auth.admin.list_users()
        for u in users:
            if getattr(u, "email", "") == test_email:
                admin.auth.admin.delete_user(u.id)
    except Exception:
        pass

    # Create test user
    created = admin.auth.admin.create_user({
        "email": test_email,
        "password": test_password,
        "email_confirm": True,
        "user_metadata": {"full_name": "Test Matrix Runner"},
    })
    user_id = str(created.user.id)

    yield {
        "email": test_email,
        "password": test_password,
        "user_id": user_id,
    }

    # Teardown: delete test user from Supabase
    try:
        admin.auth.admin.delete_user(user_id)
    except Exception:
        pass


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


def test_case_3_unregistered_email(client):
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


def test_case_5_empty_password(client, registered_user):
    """
    Test Case 5: Empty password
    Input: Password = empty ("")
    Expected: Validation error (422 Unprocessable Entity); request rejected.
    """
    response = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
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
