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
