import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


from app.database import (
    Base,
    BaseSaaSModel,
    BaseRepository,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    SoftDeleteMixin,
    check_database_health,
    get_database_diagnostics,
    get_db,
    transaction,
)
from app.database.models import UserProfile


@pytest.fixture
def in_memory_session():
    """Provides an isolated in-memory SQLite database session for unit testing."""
    test_engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=test_engine)

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)
        test_engine.dispose()


def test_database_package_exports():
    """Ensure all core architectural components are properly exposed."""
    from app.database import (
        engine,
        SessionLocal,
        get_db,
        transaction,
        Base,
        BaseSaaSModel,
        BaseRepository,
        check_database_health,
        get_database_diagnostics,
        init_db,
    )

    assert engine is not None
    assert SessionLocal is not None
    assert callable(get_db)
    assert callable(transaction)
    assert Base is not None
    assert BaseRepository is not None
    assert callable(check_database_health)
    assert callable(get_database_diagnostics)
    assert callable(init_db)


def test_models_registry_and_reexport():
    """Verify UserProfile is discoverable through both model modules."""
    import app.models as top_models
    import app.database.models as db_models

    assert hasattr(db_models, "UserProfile")
    assert hasattr(top_models, "UserProfile")
    assert db_models.UserProfile is top_models.UserProfile


def test_base_saas_model_mixins(in_memory_session):
    """Test UUID generation, timestamps, soft-delete, and serialization."""
    profile = UserProfile(
        user_id="test-uuid-12345",
        email="testuser@storyhour.com",
        full_name="Alice Reader",
        subscription_tier="free",
    )

    in_memory_session.add(profile)
    in_memory_session.commit()
    in_memory_session.refresh(profile)

    assert profile.id is not None
    assert len(profile.id) == 36
    assert profile.created_at is not None
    assert profile.updated_at is not None
    assert profile.is_deleted is False

    profile.soft_delete()
    assert profile.is_deleted is True
    assert profile.deleted_at is not None

    profile.restore()
    assert profile.is_deleted is False
    assert profile.deleted_at is None

    data = profile.to_dict()
    assert data["email"] == "testuser@storyhour.com"
    assert data["subscription_tier"] == "free"
    assert "id" in data
    assert "created_at" in data


def test_user_profile_repository_crud(in_memory_session):
    """Test repository create, read, update, pagination, count, and delete."""
    user_repo = BaseRepository(UserProfile)

    user = user_repo.create(
        in_memory_session,
        obj_in={
            "user_id": "supabase-auth-user-001",
            "email": "storyteller@storyhour.com",
            "full_name": "Adithya Goud",
            "subscription_tier": "free",
        },
    )

    assert user.id is not None
    assert user.email == "storyteller@storyhour.com"

    retrieved = user_repo.get(in_memory_session, user.id)
    assert retrieved is not None
    assert retrieved.user_id == "supabase-auth-user-001"

    assert user_repo.count(in_memory_session) == 1
    assert user_repo.count(
        in_memory_session,
        filters={"email": "storyteller@storyhour.com"},
    ) == 1
    assert user_repo.count(
        in_memory_session,
        filters={"email": "nonexistent@storyhour.com"},
    ) == 0

    updated = user_repo.update(
        in_memory_session,
        db_obj=user,
        obj_in={
            "full_name": "Adithya Goud (Updated)",
            "subscription_tier": "patron",
        },
    )

    assert updated.full_name == "Adithya Goud (Updated)"
    assert updated.subscription_tier == "patron"

    multi = user_repo.get_multi(in_memory_session, skip=0, limit=10)
    assert len(multi) == 1

    deleted = user_repo.remove(in_memory_session, id=user.id)
    assert deleted is not None
    assert user_repo.get(in_memory_session, user.id) is None
    assert user_repo.count(in_memory_session) == 0


def test_live_database_health_and_diagnostics(monkeypatch):
    """Test health and diagnostics using a mocked PostgreSQL engine."""
    from types import SimpleNamespace
    from unittest.mock import MagicMock

    from app.database import health

    connection = MagicMock()
    connection.execute.side_effect = [
        MagicMock(),  # SELECT 1
        MagicMock(
            fetchone=MagicMock(
                return_value=("PostgreSQL 16.0",)
            )
        ),  # SELECT version()
    ]

    class FakeConnectionContext:
        def __enter__(self):
            return connection

        def __exit__(self, *args):
            return False

    fake_pool = SimpleNamespace(
        size=lambda: 10,
        checkedin=lambda: 10,
        checkedout=lambda: 0,
        overflow=lambda: 0,
    )

    fake_engine = SimpleNamespace(
        connect=lambda: FakeConnectionContext(),
        pool=fake_pool,
        dialect=SimpleNamespace(name="postgresql"),
    )

    monkeypatch.setattr(health, "engine", fake_engine)

    assert health.check_database_health() is True

    diagnostics = health.get_database_diagnostics()

    assert diagnostics["connected"] is True
    assert diagnostics["engine"] == "postgresql"
    assert diagnostics["dialect"] == "postgresql"
    assert diagnostics["server_version"] == "PostgreSQL 16.0"
    assert diagnostics["latency_ms"] is not None
    assert diagnostics["pool"]["size"] == 10
    assert diagnostics["pool"]["checked_in"] == 10
    assert diagnostics["pool"]["checked_out"] == 0
    assert diagnostics["pool"]["overflow"] == 0


def test_get_db_dependency():
    """Verify the database dependency yields and closes a session."""
    gen = get_db()
    session = next(gen)

    assert session is not None

    try:
        next(gen)
    except StopIteration:
        pass
    else:
        pytest.fail("get_db() should finish after yielding its session")
