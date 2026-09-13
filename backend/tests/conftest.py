import time
from typing import Any, Dict
import jwt
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app


@pytest.fixture
def client():
    """TestClient fixture for FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def make_token():
    """Factory fixture to generate valid/custom Supabase-compatible JWTs."""
    def _generator(
        sub: str = "d486d34e-0a56-4293-85f2-2b6b15801c80",
        email: str = "storyteller@storyhour.com",
        role: str = "authenticated",
        exp_delta: int = 3600,
        app_metadata: Dict[str, Any] = None,
        user_metadata: Dict[str, Any] = None,
        secret: str = settings.SUPABASE_JWT_SECRET,
    ) -> str:
        now = int(time.time())
        payload = {
            "sub": sub,
            "email": email,
            "role": role,
            "aud": "authenticated",
            "iat": now,
            "exp": now + exp_delta,
            "app_metadata": app_metadata or {"provider": "email"},
            "user_metadata": user_metadata or {
                "first_name": "Adithya",
                "last_name": "Goud",
                "full_name": "Adithya Goud"
            },
        }
        return jwt.encode(payload, secret, algorithm=settings.SUPABASE_JWT_ALGORITHM)

    return _generator


@pytest.fixture
def valid_token(make_token):
    """Provides a standard valid Supabase user JWT."""
    return make_token()


@pytest.fixture
def expired_token(make_token):
    """Provides an expired Supabase user JWT."""
    return make_token(exp_delta=-3600)


@pytest.fixture
def admin_token(make_token):
    """Provides an admin user JWT."""
    return make_token(
        role="admin",
        app_metadata={"role": "admin", "provider": "email"},
        email="admin@storyhour.com",
    )


@pytest.fixture
def db_session():
    """Provides an isolated in-memory SQLite database session for unit testing."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.database.base import Base
    import app.database.models  # noqa: F401

    test_engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)
