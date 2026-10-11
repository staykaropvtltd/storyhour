import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.database.base import Base
import app.database.models  # noqa: F401
from app.main import app


@pytest.fixture
def api_db():
    """Provides a thread-safe in-memory database session for FastAPI TestClient execution."""
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    from app.database.models.profile import UserProfile
    standard_test_users = [
        ("d486d34e-0a56-4293-85f2-2b6b15801c80", "storyteller@storyhour.com", "Adithya Goud"),
        ("11111111-1111-1111-1111-111111111111", "user_11111111@storyhour.com", "User 1111"),
        ("22222222-2222-2222-2222-222222222222", "user_22222222@storyhour.com", "User 2222"),
        ("33333333-3333-3333-3333-333333333333", "user_33333333@storyhour.com", "User 3333"),
        ("44444444-4444-4444-4444-444444444444", "user_44444444@storyhour.com", "User 4444"),
        ("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "user_aaaaaaaa@storyhour.com", "User A"),
        ("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "user_bbbbbbbb@storyhour.com", "User B"),
        ("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa", "user_a1111@storyhour.com", "User A Int"),
        ("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb", "user_b2222@storyhour.com", "User B Int"),
    ]
    for uid, uemail, uname in standard_test_users:
        session.add(UserProfile(
            user_id=uid,
            email=uemail,
            full_name=uname,
            subscription_tier="free",
            is_active=True,
            is_deleted=False,
        ))
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def api_client(api_db):
    """FastAPI TestClient with get_db overridden to use isolated in-memory test database."""
    app.dependency_overrides[get_db] = lambda: api_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
