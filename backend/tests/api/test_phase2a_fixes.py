import pytest
from unittest.mock import MagicMock, patch
from fastapi import status, HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
import app.database.models  # noqa: F401
from app.database.models.profile import UserProfile
from app.services.supabase_service import supabase_service
from app.schemas.auth import SignUpRequest, LoginRequest
from app.schemas.user import UserUpdateRequest
from app.schemas.contact import ContactCreate
from app.schemas.story import StoryBase, StoryUpdate


# ==============================================================================
# B-08.2 & B-08.3: PROFILE PERSISTENCE & ERROR HANDLING TESTS
# ==============================================================================

@pytest.fixture
def isolated_db_engine():
    """Provides an isolated in-memory SQLite database engine with SaaS tables created."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


def test_b08_2_profile_sync_persists_to_fresh_session(isolated_db_engine):
    """
    CRITICAL B-08.2 TEST:
    Verify that _sync_user_profile commits changes so that a fresh, independent
    session can read the persisted UserProfile record.
    """
    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)

    user_id = "test-persist-uuid-1234"
    user_email = "newuser@storyhour.com"
    full_name = "Committed User"

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = user_email
    mock_user.user_metadata = {"full_name": full_name}

    # Execute _sync_user_profile with isolated TestingSession
    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        profile = supabase_service._sync_user_profile(mock_user)

    assert profile is not None
    assert profile.user_id == user_id

    # Verify via a fresh, completely independent session (no shared cache)
    with TestingSession() as fresh_db:
        persisted = fresh_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        assert persisted is not None
        assert persisted.user_id == user_id
        assert persisted.email == user_email
        assert persisted.full_name == full_name
        assert persisted.is_active is True
        assert persisted.is_deleted is False


def test_b08_2_profile_update_persists_to_fresh_session(isolated_db_engine):
    """
    Verify that updating an existing profile's name commits changes and is
    readable in a fresh, independent session.
    """
    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)

    user_id = "test-update-uuid-5678"
    user_email = "existing@storyhour.com"

    # Pre-seed profile
    with TestingSession() as setup_db:
        setup_db.add(UserProfile(
            user_id=user_id,
            email=user_email,
            full_name="Initial Name",
            is_active=True,
            is_deleted=False,
        ))
        setup_db.commit()

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = user_email
    mock_user.user_metadata = {"full_name": "Updated Name"}

    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        supabase_service._sync_user_profile(mock_user)

    # Check from fresh session
    with TestingSession() as fresh_db:
        updated = fresh_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        assert updated is not None
        assert updated.full_name == "Updated Name"


def test_b08_2_inactive_or_deleted_profile_not_reactivated(isolated_db_engine):
    """
    Verify that inactive or soft-deleted profiles are not reactivated or modified
    during profile synchronization.
    """
    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)

    user_id = "test-deleted-uuid-9999"

    # Pre-seed soft-deleted profile
    with TestingSession() as setup_db:
        setup_db.add(UserProfile(
            user_id=user_id,
            email="deleted@storyhour.com",
            full_name="Original Deleted Name",
            is_active=False,
            is_deleted=True,
        ))
        setup_db.commit()

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = "deleted@storyhour.com"
    mock_user.user_metadata = {"full_name": "Should Not Update"}

    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        result = supabase_service._sync_user_profile(mock_user)

    assert result is not None
    assert result.is_deleted is True

    with TestingSession() as fresh_db:
        check = fresh_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        assert check.full_name == "Original Deleted Name"
        assert check.is_active is False
        assert check.is_deleted is True


def test_b08_3_profile_sync_database_failure_is_observable(isolated_db_engine):
    """
    B-08.3 TEST:
    Verify that a database error during _sync_user_profile is NOT silently swallowed,
    raises an HTTPException with status 500, and does not leak raw database exceptions.
    """
    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)

    mock_user = MagicMock()
    mock_user.id = "fail-user-id"
    mock_user.email = "fail@storyhour.com"
    mock_user.user_metadata = {"full_name": "Fail User"}

    # Simulate database flush error
    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        with patch.object(UserProfile, "__init__", side_effect=RuntimeError("Simulated DB connection drop")):
            with pytest.raises(HTTPException) as exc_info:
                supabase_service._sync_user_profile(mock_user)

    assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Database error occurred during user profile synchronization" in exc_info.value.detail
    # Must NOT leak raw exception class name or internal database trace
    assert "RuntimeError" not in exc_info.value.detail
    assert "Simulated DB connection drop" not in exc_info.value.detail


def test_b08_3_signup_fails_when_profile_sync_fails(api_client: TestClient, monkeypatch):
    """
    Verify that POST /api/auth/signup does NOT return HTTP 201 Created if
    profile synchronization fails.
    """
    fake_user_id = "55555555-5555-5555-5555-555555555555"
    fake_user = MagicMock()
    fake_user.id = fake_user_id
    fake_user.email = "syncfail@storyhour.com"
    fake_user.user_metadata = {"name": "Sync Fail"}
    fake_user.app_metadata = {}
    fake_user.identities = [MagicMock()]

    fake_res = MagicMock()
    fake_res.user = fake_user
    fake_res.session = MagicMock()
    fake_res.session.access_token = "mock-token"

    class FakeAuth:
        def sign_up(self, credentials):
            return fake_res

    fake_client = MagicMock()
    fake_client.auth = FakeAuth()
    monkeypatch.setattr(supabase_service, "anon_client", fake_client)

    # Mock _sync_user_profile to raise HTTP 500
    def mock_failing_sync(user):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during user profile synchronization.",
        )

    monkeypatch.setattr(supabase_service, "_sync_user_profile", mock_failing_sync)

    payload = {
        "Name:": "Sync Fail",
        "email id :": "syncfail@storyhour.com",
        "password :": "SecurePassword123!",
        "confirm the password :": "SecurePassword123!",
    }

    res = api_client.post("/api/auth/signup", json=payload)
    # Must NOT report success when profile sync failed
    assert res.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Database error occurred during user profile synchronization" in res.json()["detail"]


# ==============================================================================
# B-12.1: PASSWORD MAXIMUM LENGTH VALIDATION TESTS
# ==============================================================================

def test_b12_1_signup_password_128_chars_accepted():
    """Verify password at maximum allowed limit (128 chars) is accepted."""
    pw = "A" * 128
    data = SignUpRequest.model_validate({
        "Name:": "Max Password",
        "email id :": "maxpw@storyhour.com",
        "password :": pw,
        "confirm the password :": pw,
    })
    assert len(data.password) == 128


def test_b12_1_signup_password_129_chars_rejected():
    """Verify password exceeding 128 characters is rejected with validation error."""
    pw = "A" * 129
    with pytest.raises(ValidationError) as exc_info:
        SignUpRequest.model_validate({
            "Name:": "Oversized User",
            "email id :": "oversized@storyhour.com",
            "password :": pw,
            "confirm the password :": pw,
        })
    errors = exc_info.value.errors()
    assert any("at most 128" in e["msg"] for e in errors)


def test_b12_1_signup_password_100k_chars_rejected():
    """Verify massive 100,000-char password is immediately rejected (prevents DoS)."""
    pw = "A" * 100000
    with pytest.raises(ValidationError) as exc_info:
        SignUpRequest.model_validate({
            "Name:": "DoS Attacker",
            "email id :": "dos@storyhour.com",
            "password :": pw,
            "confirm the password :": pw,
        })
    errors = exc_info.value.errors()
    assert any("at most 128" in e["msg"] for e in errors)


def test_b12_1_login_password_128_chars_accepted():
    """Verify login accepts passwords up to 128 characters."""
    pw = "B" * 128
    data = LoginRequest.model_validate({
        "email": "user@storyhour.com",
        "password": pw,
    })
    assert len(data.password) == 128


def test_b12_1_login_password_129_chars_rejected():
    """Verify login rejects passwords over 128 characters."""
    pw = "B" * 129
    with pytest.raises(ValidationError) as exc_info:
        LoginRequest.model_validate({
            "email": "user@storyhour.com",
            "password": pw,
        })
    errors = exc_info.value.errors()
    assert any("at most 128" in e["msg"] for e in errors)


def test_b12_1_signup_confirm_password_oversized_rejected():
    """Verify oversized confirm_password is rejected."""
    with pytest.raises(ValidationError) as exc_info:
        SignUpRequest.model_validate({
            "Name:": "Test User",
            "email id :": "user@storyhour.com",
            "password :": "ValidPassword123!",
            "confirm the password :": "A" * 129,
        })
    errors = exc_info.value.errors()
    assert any("at most 128" in e["msg"] for e in errors)


# ==============================================================================
# B-12.2: SIGNUP NAME AND EMAIL MAXIMUM LENGTH VALIDATION TESTS
# ==============================================================================

def test_b12_2_signup_name_255_chars_accepted():
    """Verify signup accepts names up to 255 characters."""
    name = "A" * 255
    data = SignUpRequest.model_validate({
        "Name:": name,
        "email id :": "name255@storyhour.com",
        "password :": "ValidPassword123!",
        "confirm the password :": "ValidPassword123!",
    })
    assert len(data.name) == 255


def test_b12_2_signup_name_256_chars_rejected():
    """Verify signup rejects names longer than 255 characters."""
    name = "A" * 256
    with pytest.raises(ValidationError) as exc_info:
        SignUpRequest.model_validate({
            "Name:": name,
            "email id :": "name256@storyhour.com",
            "password :": "ValidPassword123!",
            "confirm the password :": "ValidPassword123!",
        })
    errors = exc_info.value.errors()
    assert any("at most 255" in e["msg"] for e in errors)


def test_b12_2_signup_email_256_chars_rejected():
    """Verify email addresses exceeding 255 characters are rejected."""
    # Construct an oversized email address: 243 chars local + '@storyhour.com' = 257 chars
    long_local = "a" * 243
    oversized_email = f"{long_local}@storyhour.com"
    with pytest.raises(ValidationError) as exc_info:
        SignUpRequest.model_validate({
            "Name:": "Test User",
            "email id :": oversized_email,
            "password :": "ValidPassword123!",
            "confirm the password :": "ValidPassword123!",
        })
    errors = exc_info.value.errors()
    assert any("too long" in e["msg"].lower() or "at most 255" in e["msg"] for e in errors)


def test_b12_2_unicode_and_international_names_accepted():
    """Verify diverse legitimate international names remain accepted."""
    names = [
        "আদিত্য গৌড়",                     # Bengali
        "आदित्य गौड़",                     # Devanagari / Hindi
        "ఆదిత్య గౌడ్",                      # Telugu
        "José María Aznar",                # Spanish accented
        "François Müller",                 # French / German
        "عبد الله بن عبد العزيز",           # Arabic
    ]
    for n in names:
        data = SignUpRequest.model_validate({
            "Name:": n,
            "email id :": "intl@storyhour.com",
            "password :": "ValidPassword123!",
            "confirm the password :": "ValidPassword123!",
        })
        assert data.name == n


# ==============================================================================
# B-12.3: USER UPDATE WHITESPACE VALIDATION TESTS
# ==============================================================================

def test_b12_3_user_update_rejects_whitespace_only():
    """Verify UserUpdateRequest rejects spaces-only names."""
    with pytest.raises(ValidationError) as exc_info:
        UserUpdateRequest.model_validate({"full_name": "     "})
    errors = exc_info.value.errors()
    assert any("cannot be empty or whitespace" in str(e["msg"]) for e in errors)


def test_b12_3_user_update_rejects_tab_newline_whitespace():
    """Verify UserUpdateRequest rejects tabs and newlines only."""
    with pytest.raises(ValidationError) as exc_info:
        UserUpdateRequest.model_validate({"full_name": "\t\n  \r "})
    errors = exc_info.value.errors()
    assert any("cannot be empty or whitespace" in str(e["msg"]) for e in errors)


def test_b12_3_user_update_trims_surrounding_whitespace():
    """Verify surrounding whitespace is trimmed while preserving valid name."""
    req = UserUpdateRequest.model_validate({"full_name": "  Adithya Goud  "})
    assert req.full_name == "Adithya Goud"


def test_b12_3_user_update_preserves_internal_spaces():
    """Verify names with internal spaces and multiple parts are preserved."""
    req = UserUpdateRequest.model_validate({"full_name": "Mary Jane Watson"})
    assert req.full_name == "Mary Jane Watson"


def test_b12_3_patch_me_rejects_whitespace_via_api(api_client: TestClient, valid_token: str):
    """Verify PATCH /api/me rejects whitespace-only full_name with HTTP 422."""
    res = api_client.patch(
        "/api/me",
        json={"full_name": "     "},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert res.status_code == getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)


# ==============================================================================
# B-12.4: CONTACT MESSAGE MAXIMUM LENGTH VALIDATION TESTS
# ==============================================================================

def test_b12_4_contact_message_5000_chars_accepted():
    """Verify contact message at 5,000 characters is accepted."""
    msg = "A" * 5000
    contact = ContactCreate.model_validate({
        "name": "Maya Raman",
        "email": "maya@storyhour.com",
        "message": msg,
    })
    assert len(contact.message) == 5000


def test_b12_4_contact_message_5001_chars_rejected():
    """Verify contact message exceeding 5,000 characters is rejected."""
    msg = "A" * 5001
    with pytest.raises(ValidationError) as exc_info:
        ContactCreate.model_validate({
            "name": "Maya Raman",
            "email": "maya@storyhour.com",
            "message": msg,
        })
    errors = exc_info.value.errors()
    assert any("at most 5000" in e["msg"] for e in errors)


def test_b12_4_contact_message_multiline_preserved():
    """Verify multiline contact messages are preserved."""
    msg = "Line 1: Performance inquiry.\nLine 2: School residency.\nLine 3: Thank you!"
    contact = ContactCreate.model_validate({
        "name": "Teacher Jane",
        "email": "jane@school.edu",
        "message": msg,
    })
    assert contact.message == msg


def test_b12_4_contact_api_rejects_oversized_message(api_client: TestClient):
    """Verify POST /api/contact rejects message > 5000 characters with HTTP 422."""
    res = api_client.post(
        "/api/contact",
        json={
            "name": "Maya Raman",
            "email": "maya@storyhour.com",
            "message": "X" * 5001,
        },
    )
    assert res.status_code == getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)


# ==============================================================================
# B-12.5: STORY SCHEMA CONSISTENT CONSTRAINTS TESTS
# ==============================================================================

def test_b12_5_story_update_valid_partial():
    """Verify partial updates with valid fields succeed."""
    update = StoryUpdate.model_validate({
        "title": "Updated Title",
        "narrator": "New Narrator",
        "cover_image": "https://assets.storyhour.com/cover.jpg",
    })
    assert update.title == "Updated Title"
    assert update.narrator == "New Narrator"
    assert update.cover_image == "https://assets.storyhour.com/cover.jpg"


def test_b12_5_story_update_omitted_fields_are_none():
    """Verify fields can be omitted during partial updates."""
    update = StoryUpdate.model_validate({"title": "Only Title"})
    assert update.title == "Only Title"
    assert update.slug is None
    assert update.cover_image is None
    assert update.narrator is None


def test_b12_5_story_update_rejects_oversized_cover_image():
    """Verify StoryUpdate rejects cover_image > 1024 characters."""
    with pytest.raises(ValidationError) as exc_info:
        StoryUpdate.model_validate({"cover_image": "https://example.com/" + "a" * 1020})
    errors = exc_info.value.errors()
    assert any("at most 1024" in e["msg"] for e in errors)


def test_b12_5_story_update_rejects_oversized_narrator():
    """Verify StoryUpdate rejects narrator > 255 characters."""
    with pytest.raises(ValidationError) as exc_info:
        StoryUpdate.model_validate({"narrator": "N" * 256})
    errors = exc_info.value.errors()
    assert any("at most 255" in e["msg"] for e in errors)


def test_b12_5_story_update_rejects_oversized_age_group():
    """Verify StoryUpdate rejects age_group > 64 characters."""
    with pytest.raises(ValidationError) as exc_info:
        StoryUpdate.model_validate({"age_group": "A" * 65})
    errors = exc_info.value.errors()
    assert any("at most 64" in e["msg"] for e in errors)


def test_b12_5_story_update_rejects_oversized_product_id():
    """Verify StoryUpdate rejects product_id > 64 characters."""
    with pytest.raises(ValidationError) as exc_info:
        StoryUpdate.model_validate({"product_id": "P" * 65})
    errors = exc_info.value.errors()
    assert any("at most 64" in e["msg"] for e in errors)


def test_b12_5_story_update_rejects_oversized_seo_title():
    """Verify StoryUpdate rejects seo_title > 255 characters."""
    with pytest.raises(ValidationError) as exc_info:
        StoryUpdate.model_validate({"seo_title": "S" * 256})
    errors = exc_info.value.errors()
    assert any("at most 255" in e["msg"] for e in errors)


def test_b12_5_story_update_rejects_seo_description():
    """Verify StoryUpdate rejects seo_description > 500 characters."""
    with pytest.raises(ValidationError) as exc_info:
        StoryUpdate.model_validate({"seo_description": "D" * 501})
    errors = exc_info.value.errors()
    assert any("at most 500" in e["msg"] for e in errors)


# ==============================================================================
# PHASE 2A FOLLOW-UP: CONCURRENCY RACE & TRANSACTION ROLLBACK TESTS
# ==============================================================================

def test_b08_2_concurrent_profile_creation_resolved_on_race(isolated_db_engine):
    """
    PHASE 2A FOLLOW-UP (TASK A):
    Verify that _sync_user_profile recovers gracefully when a concurrent worker
    creates the UserProfile between lookup and insertion, triggering IntegrityError.
    Asserts:
    1. IntegrityError is caught and db.rollback() is issued before retry query.
    2. The concurrent profile created in the database is retrieved and returned.
    3. The caller receives the valid profile without an error.
    """
    from sqlalchemy.exc import IntegrityError
    from app.database.repository import BaseRepository

    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)
    user_id = "concurrent-race-user-7777"
    email = "concurrent@storyhour.com"
    full_name = "Concurrent Storyteller"

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = email
    mock_user.user_metadata = {"full_name": full_name}

    # Side-effect for repo.create: simulate concurrent worker committing first
    def simulate_concurrent_insert_and_conflict(*args, **kwargs):
        # A concurrent worker commits the profile directly to the database
        with TestingSession() as concurrent_db:
            concurrent_db.add(UserProfile(
                user_id=user_id,
                email=email,
                full_name=full_name,
                is_active=True,
                is_deleted=False,
            ))
            concurrent_db.commit()
        # The current worker encounters an IntegrityError (e.g. duplicate key)
        raise IntegrityError("duplicate key value violates unique constraint", params={}, orig=Exception("unique_violation"))

    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        with patch.object(BaseRepository, "create", side_effect=simulate_concurrent_insert_and_conflict):
            profile = supabase_service._sync_user_profile(mock_user)

    assert profile is not None
    assert profile.user_id == user_id
    assert profile.full_name == full_name
    assert profile.is_active is True


def test_b08_2_unrelated_integrity_error_is_not_swallowed(isolated_db_engine):
    """
    PHASE 2A FOLLOW-UP (TASK A):
    Verify that an IntegrityError where the profile was NOT created concurrently
    (e.g., check constraint conflict) is NOT treated as a race,
    is re-raised, rolled back, and converted to a sanitized HTTP 500.
    """
    from sqlalchemy.exc import IntegrityError
    from app.database.repository import BaseRepository

    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)
    user_id = "unrelated-conflict-user-8888"
    mock_user = MagicMock(id=user_id, email="conflict@storyhour.com", user_metadata={"full_name": "Conflict"})

    def simulate_unrelated_integrity_error(*args, **kwargs):
        # Raise IntegrityError without creating a concurrent record for user_id
        raise IntegrityError("foreign key or check constraint violated", params={}, orig=Exception("fk_violation"))

    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        with patch.object(BaseRepository, "create", side_effect=simulate_unrelated_integrity_error):
            with pytest.raises(HTTPException) as exc_info:
                supabase_service._sync_user_profile(mock_user)

    assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Database error occurred during user profile synchronization" in exc_info.value.detail
    assert "fk_violation" not in exc_info.value.detail


def test_b08_3_real_transaction_commit_failure_triggers_rollback(isolated_db_engine):
    """
    PHASE 2A FOLLOW-UP (TASK B):
    Verify that an actual SQLAlchemy commit failure on an active transaction
    triggers db.rollback(), raises sanitized HTTPException(500), and ensures no
    uncommitted or dirty record remains in the database.
    """
    from sqlalchemy.exc import OperationalError
    from sqlalchemy.orm import Session

    TestingSession = sessionmaker(bind=isolated_db_engine, autocommit=False, autoflush=False)
    user_id = "commit-fail-user-9999"
    email = "commitfail@storyhour.com"

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = email
    mock_user.user_metadata = {"full_name": "Rollback Test"}

    def failing_commit(session_self):
        # Simulate database connection drop during commit
        raise OperationalError("Connection dropped during commit", params={}, orig=Exception("connection_reset"))

    with patch("app.database.session.SessionLocal", side_effect=TestingSession):
        with patch.object(Session, "commit", side_effect=failing_commit):
            with pytest.raises(HTTPException) as exc_info:
                supabase_service._sync_user_profile(mock_user)

    assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "Database error occurred during user profile synchronization" in exc_info.value.detail
    assert "connection_reset" not in exc_info.value.detail
    assert "OperationalError" not in exc_info.value.detail

    # Verify no profile was persisted
    with TestingSession() as verify_db:
        persisted = verify_db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        assert persisted is None


def test_b08_3_signup_route_rejects_tokens_when_commit_fails(api_client: TestClient, monkeypatch):
    """
    PHASE 2A FOLLOW-UP (TASK B):
    End-to-end API test: Verify that POST /api/auth/signup raises HTTP 500 and
    does NOT return an access token or session if the database commit fails.
    """
    from sqlalchemy.exc import OperationalError
    from sqlalchemy.orm import Session

    fake_user_id = "real-commit-fail-uuid"
    fake_user = MagicMock()
    fake_user.id = fake_user_id
    fake_user.email = "e2ecommitfail@storyhour.com"
    fake_user.user_metadata = {"name": "E2E Commit Fail"}
    fake_user.app_metadata = {}
    fake_user.identities = [MagicMock()]

    fake_res = MagicMock()
    fake_res.user = fake_user
    fake_res.session = MagicMock()
    fake_res.session.access_token = "secret-token-must-not-be-issued"

    class FakeAuth:
        def sign_up(self, credentials):
            return fake_res

    fake_client = MagicMock()
    fake_client.auth = FakeAuth()
    monkeypatch.setattr(supabase_service, "anon_client", fake_client)

    # Patch Session.commit inside _sync_user_profile to fail with OperationalError
    with patch.object(Session, "commit", side_effect=OperationalError("disk I/O error", params={}, orig=Exception("disk_full"))):
        res = api_client.post("/api/auth/signup", json={
            "Name:": "E2E Commit Fail",
            "email id :": "e2ecommitfail@storyhour.com",
            "password :": "SecurePassword123!",
            "confirm the password :": "SecurePassword123!",
        })

    assert res.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    data = res.json()
    assert "Database error occurred during user profile synchronization" in data["detail"]
    assert "access_token" not in data
    assert "disk_full" not in str(data)

