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


def test_live_database_health_and_diagnostics():
    """Test health check and diagnostics against the live Supabase PostgreSQL database."""
    is_healthy = check_database_health()
    assert is_healthy is True

    diag = get_database_diagnostics()
    assert diag["connected"] is True
    assert diag["engine"] == "postgresql"
    assert "latency_ms" in diag
    assert diag["latency_ms"] is not None
    assert "pool" in diag
    assert diag["pool"]["size"] == 10


def test_get_db_dependency():
    """Verify get_db dependency yields a valid session and closes properly."""
    gen = get_db()
    session = next(gen)
    assert session is not None
    try:
        next(gen)
    except StopIteration:
        pass
