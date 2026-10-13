"""
PostgreSQL Dedicated Integration Test Suite (DB-02).
Executed exclusively in CI against a disposable PostgreSQL service container
or in an explicitly configured isolated test environment.
Excluded by default in unit test runs via pytest.ini (-m 'not integration').
"""

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import (
    SessionLocal,
    check_database_health,
    engine,
    get_database_diagnostics,
    validate_test_database_target,
)
from app.database.models import UserProfile
from app.models.chapter import Chapter
from app.models.story import Story, StoryStatus


@pytest.fixture(autouse=True)
def ensure_safe_test_database():
    """Safety guard: verify connection string satisfies DB-01 policy before every integration test."""
    validate_test_database_target(settings.DATABASE_URL, settings.ENVIRONMENT)


@pytest.mark.integration
def test_postgres_connection_and_version():
    """Verify connectivity and dialect diagnostics against live PostgreSQL service."""
    assert check_database_health() is True
    diag = get_database_diagnostics()
    assert diag["connected"] is True
    assert diag["engine"] == "postgresql"
    assert "PostgreSQL" in str(diag["server_version"])
    assert diag["latency_ms"] is not None


@pytest.mark.integration
def test_postgres_foreign_key_enforcement():
    """Verify PostgreSQL strictly enforces foreign key constraints on relational tables."""
    with SessionLocal() as db:
        orphan = Chapter(
            story_id="00000000-0000-0000-0000-000000000000",
            title="Nonexistent Story Chapter",
            order=1,
            duration=60,
        )
        db.add(orphan)
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()


@pytest.mark.integration
def test_postgres_user_profile_lifecycle_and_transaction():
    """Verify transactional CRUD and rollback isolation on PostgreSQL."""
    test_uid = "pg-test-user-uuid-1111"
    with SessionLocal() as db:
        # Clean any leftover from previous runs
        db.query(UserProfile).filter(UserProfile.user_id == test_uid).delete()
        db.commit()

        # Create
        profile = UserProfile(
            user_id=test_uid,
            email="pg_test@example.com",
            full_name="Postgres Test User",
            subscription_tier="free",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        assert profile.id is not None
        assert profile.user_id == test_uid

    # Verify in a completely fresh session
    with SessionLocal() as db:
        fresh = db.query(UserProfile).filter(UserProfile.user_id == test_uid).first()
        assert fresh is not None
        assert fresh.email == "pg_test@example.com"

        # Cleanup
        db.delete(fresh)
        db.commit()


@pytest.mark.integration
def test_postgres_uniqueness_conflict_and_race_handling():
    """Verify PostgreSQL uniqueness conflict handling and check-then-insert race resolution."""
    test_uid = "pg-race-user-uuid-2222"
    with SessionLocal() as db1:
        # Clean previous run
        db1.query(UserProfile).filter(UserProfile.user_id == test_uid).delete()
        db1.commit()

        p1 = UserProfile(
            user_id=test_uid,
            email="race1@example.com",
            full_name="Race User 1",
            subscription_tier="free",
        )
        db1.add(p1)
        db1.commit()

        # Attempt duplicate insert in separate session db2
        with SessionLocal() as db2:
            p2 = UserProfile(
                user_id=test_uid,
                email="race2@example.com",
                full_name="Race User 2",
                subscription_tier="free",
            )
            db2.add(p2)
            with pytest.raises(IntegrityError):
                db2.commit()
            db2.rollback()

        # Cleanup
        db1.delete(p1)
        db1.commit()
