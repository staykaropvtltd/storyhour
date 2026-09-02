import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# In-memory SQLite DB for isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "docs" in data


def test_signup_success(client):
    payload = {
        "first_name": "Adithya",
        "last_name": "Goud",
        "email": "adithya@example.com",
        "password": "SecretPassword123!",
        "confirm_password": "SecretPassword123!"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "adithya@example.com"
    assert data["user"]["first_name"] == "Adithya"
    assert data["user"]["last_name"] == "Goud"
    assert "hashed_password" not in data["user"]


def test_signup_password_mismatch(client):
    payload = {
        "first_name": "Adithya",
        "last_name": "Goud",
        "email": "mismatch@example.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword!"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422
    assert "confirm password does not match password" in response.text


def test_signup_duplicate_email(client):
    payload = {
        "first_name": "Adithya",
        "last_name": "Goud",
        "email": "duplicate@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    # First signup
    res1 = client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 201

    # Second signup with same email
    res2 = client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_signin_success(client):
    # Register first
    signup_payload = {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    client.post("/api/auth/signup", json=signup_payload)

    # Sign in
    signin_payload = {
        "email": "jane@example.com",
        "password": "Password123!"
    }
    response = client.post("/api/auth/signin", json=signin_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"


def test_signin_wrong_password(client):
    # Register first
    signup_payload = {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane_wrong@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    client.post("/api/auth/signup", json=signup_payload)

    # Sign in with wrong password
    signin_payload = {
        "email": "jane_wrong@example.com",
        "password": "IncorrectPassword!"
    }
    response = client.post("/api/auth/signin", json=signin_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_signin_nonexistent_user(client):
    signin_payload = {
        "email": "ghost@example.com",
        "password": "Password123!"
    }
    response = client.post("/api/auth/signin", json=signin_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_get_current_user_me_success(client):
    # Register
    signup_payload = {
        "first_name": "Alice",
        "last_name": "Wonder",
        "email": "alice@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    res = client.post("/api/auth/signup", json=signup_payload)
    token = res.json()["access_token"]

    # Request /me
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == "alice@example.com"
    assert user_data["first_name"] == "Alice"
    assert user_data["last_name"] == "Wonder"


def test_get_current_user_me_unauthorized(client):
    # No auth header
    response = client.get("/api/auth/me")
    assert response.status_code == 401

    # Invalid token
    response_invalid = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_123"})
    assert response_invalid.status_code == 401
