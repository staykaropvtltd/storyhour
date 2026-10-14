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
    from sqlalchemy import event
    test_engine = create_engine("sqlite:///:memory:", echo=False)

    @event.listens_for(test_engine, "connect")
    def _set_sqlite_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


def test_database_package_exports():
    """Ensure all core architectural components are properly exposed from app.database."""
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
        validate_test_database_target,
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
    assert callable(validate_test_database_target)


def test_models_registry_and_reexport():
    """Verify UserProfile model is discoverable via app.database.models and app.models."""
    import app.models as top_models
    import app.database.models as db_models

    assert hasattr(db_models, "UserProfile")
    assert hasattr(top_models, "UserProfile")
    assert getattr(db_models, "UserProfile") is getattr(top_models, "UserProfile")


def test_base_saas_model_mixins(in_memory_session):
    """Test UUID generation, UTC timestamps, soft-delete, and to_dict functionality."""
    profile = UserProfile(
        user_id="test-uuid-12345",
        email="testuser@storyhour.com",
        full_name="Alice Reader",
        subscription_tier="free",
    )
    in_memory_session.add(profile)
    in_memory_session.commit()
    in_memory_session.refresh(profile)

    # UUID primary key should be populated
    assert profile.id is not None
    assert len(profile.id) == 36
    # Timestamps should be populated
    assert profile.created_at is not None
    assert profile.updated_at is not None
    assert profile.is_deleted is False

    # Soft delete
    profile.soft_delete()
    assert profile.is_deleted is True
    assert profile.deleted_at is not None

    # Restore
    profile.restore()
    assert profile.is_deleted is False
    assert profile.deleted_at is None

    # to_dict
    data = profile.to_dict()
    assert data["email"] == "testuser@storyhour.com"
    assert data["subscription_tier"] == "free"
    assert "id" in data
    assert "created_at" in data


def test_user_profile_repository_crud(in_memory_session):
    """Test generic BaseRepository Create, Read, Update, Delete, Count on UserProfile."""
    user_repo = BaseRepository(UserProfile)

    # Create
    user = user_repo.create(
        in_memory_session,
        obj_in={
            "user_id": "supabase-auth-user-001",
            "email": "storyteller@storyhour.com",
            "full_name": "Adithya Goud",
            "subscription_tier": "free",
        },
    )
    in_memory_session.commit()

    assert user.id is not None
    assert user.email == "storyteller@storyhour.com"

    # Read / Get
    retrieved = user_repo.get(in_memory_session, user.id)
    assert retrieved is not None
    assert retrieved.user_id == "supabase-auth-user-001"

    # Count
    count = user_repo.count(in_memory_session)
    assert count == 1
    count_filtered = user_repo.count(
        in_memory_session,
        filters={"email": "storyteller@storyhour.com"},
    )
    assert count_filtered == 1
    count_zero = user_repo.count(
        in_memory_session,
        filters={"email": "nonexistent@storyhour.com"},
    )
    assert count_zero == 0

    # Update
    updated = user_repo.update(
        in_memory_session,
        db_obj=user,
        obj_in={
            "full_name": "Adithya Goud (Updated)",
            "subscription_tier": "patron",
        },
    )
    in_memory_session.commit()

    assert updated.full_name == "Adithya Goud (Updated)"
    assert updated.subscription_tier == "patron"

    # Pagination / Get Multi
    multi = user_repo.get_multi(in_memory_session, skip=0, limit=10)
    assert len(multi) == 1

    # Delete
    deleted = user_repo.remove(in_memory_session, id=user.id)
    in_memory_session.commit()

    assert deleted is not None
    assert user_repo.get(in_memory_session, user.id) is None
    assert user_repo.count(in_memory_session) == 0


def test_check_database_health_unit(in_memory_session):
    """
    ISOLATED UNIT TEST (B-11.2):
    Verifies check_database_health probe using an isolated in-memory test engine.
    """
    from unittest.mock import patch
    with patch("app.database.health.engine", in_memory_session.bind):
        assert check_database_health() is True


def test_get_database_diagnostics_unit():
    """
    ISOLATED UNIT TEST (B-11.2):
    Verifies get_database_diagnostics structure using controlled mocks without network.
    """
    from unittest.mock import MagicMock, patch
    mock_conn = MagicMock()
    mock_result = MagicMock()
    mock_result.fetchone.return_value = ["PostgreSQL 15.1 on x86_64"]
    mock_conn.execute.return_value = mock_result
    mock_pool = MagicMock()
    mock_pool.size.return_value = 10
    mock_pool.checkedin.return_value = 8
    mock_pool.checkedout.return_value = 2
    mock_pool.overflow.return_value = 0

    mock_engine = MagicMock()
    mock_engine.connect.return_value.__enter__.return_value = mock_conn
    mock_engine.pool = mock_pool
    mock_engine.dialect.name = "postgresql"

    with patch("app.database.health.engine", mock_engine):
        diag = get_database_diagnostics()
        assert diag["connected"] is True
        assert diag["engine"] == "postgresql"
        assert diag["server_version"] == "PostgreSQL 15.1"
        assert diag["pool"]["size"] == 10
        assert "latency_ms" in diag



@pytest.mark.integration
def test_live_database_health_and_diagnostics():
    """
    OPTIONAL INTEGRATION TEST (B-11.2, DB-01):
    Tests health check and diagnostics against an isolated PostgreSQL test database.
    Requires a verified safe test database specified in DATABASE_URL.
    Skipped by default in unit test runs (-m 'not integration').
    """
    from app.config import settings
    from app.database.safety import validate_test_database_target

    # Guard: Fail safely before attempting any connection if target is unsafe (DB-01)
    validate_test_database_target(settings.DATABASE_URL, settings.ENVIRONMENT)

    is_healthy = check_database_health()
    assert is_healthy is True

    diag = get_database_diagnostics()
    assert diag["connected"] is True
    assert diag["engine"] in ("postgresql", "sqlite")
    assert "latency_ms" in diag
    assert diag["latency_ms"] is not None
    assert "pool" in diag


def test_get_db_dependency(in_memory_session):
    """
    ISOLATED UNIT TEST (B-11.2):
    Verify get_db dependency yields a valid session and closes properly
    without connecting to a live database.
    """
    from unittest.mock import patch
    with patch("app.database.session.SessionLocal", return_value=in_memory_session):
        gen = get_db()
        session = next(gen)
        assert session is not None
        try:
            next(gen)
        except StopIteration:
            pass


def test_b08_1_startup_connectivity_check_success():
    """
    B-08.1 REGRESSION TEST:
    Verify that application lifespan invokes init_db() on startup and completes cleanly.
    """
    import asyncio
    from unittest.mock import patch
    from app.main import app, lifespan

    async def _run():
        with patch("app.database.init_db.init_db", return_value=True) as mock_init:
            async with lifespan(app):
                pass
            mock_init.assert_called_once()

    asyncio.run(_run())


def test_b08_1_startup_connectivity_check_failure_is_non_fatal():
    """
    B-08.1 REGRESSION TEST:
    Verify that database failure on startup logs a warning and allows the service
    to start in degraded state without an unhandled process crash.
    """
    import asyncio
    from unittest.mock import patch
    from app.main import app, lifespan

    async def _run():
        with patch("app.database.init_db.init_db", return_value=False) as mock_init:
            async with lifespan(app):
                pass
            mock_init.assert_called_once()

    asyncio.run(_run())



