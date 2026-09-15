import pytest
from fastapi import status

from app.models.chapter import Chapter
from app.models.listening_progress import ListeningProgress
from app.models.story import Story, StoryStatus


USER_A_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
USER_B_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"


def _user_token(make_token, user_id):
    return make_token(sub=user_id, email=f"user_{user_id[:8]}@storyhour.com")


def _seed_story_with_chapter(api_db, *, duration=1000, ch_duration=500):
    story = Story(
        title="Vikram and Betal",
        slug="vikram-and-betal",
        status=StoryStatus.PUBLISHED,
        duration=duration,
    )
    api_db.add(story)
    api_db.commit()
    api_db.refresh(story)

    ch = Chapter(
        story_id=story.id,
        title="Riddle of the King",
        order=1,
        duration=ch_duration,
        preview_available=True,
    )
    api_db.add(ch)
    api_db.commit()
    api_db.refresh(ch)
    return story, ch


def test_progress_endpoint_requires_authentication(api_client, api_db):
    """Unauthenticated request to record progress returns 401."""
    story, ch = _seed_story_with_chapter(api_db)
    payload = {
        "story_id": story.id,
        "chapter_id": ch.id,
        "position_seconds": 120,
    }
    response = api_client.post("/api/v1/progress", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_record_progress_success(api_client, api_db, make_token):
    """Authenticated user successfully creates new progress record."""
    story, ch = _seed_story_with_chapter(api_db)
    token = _user_token(make_token, USER_A_ID)

    payload = {
        "story_id": story.id,
        "chapter_id": ch.id,
        "position_seconds": 150,
    }
    response = api_client.post(
        "/api/v1/progress",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["user_id"] == USER_A_ID
    assert data["story_id"] == story.id
    assert data["chapter_id"] == ch.id
    assert data["position_seconds"] == 150
    assert data["is_completed"] is False


def test_record_progress_upsert_behavior(api_client, api_db, make_token):
    """Subsequent progress calls update the existing record rather than creating duplicates."""
    story, ch = _seed_story_with_chapter(api_db)
    token = _user_token(make_token, USER_A_ID)

    # First call
    api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 100},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Second call updating position
    response = api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 250},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["position_seconds"] == 250

    # Ensure only 1 record exists in DB for this user + story + chapter
    count = (
        api_db.query(ListeningProgress)
        .filter(
            ListeningProgress.user_id == USER_A_ID,
            ListeningProgress.story_id == story.id,
            ListeningProgress.chapter_id == ch.id,
        )
        .count()
    )
    assert count == 1


def test_negative_position_rejected(api_client, api_db, make_token):
    """Negative playback position is rejected with 422."""
    story, ch = _seed_story_with_chapter(api_db)
    token = _user_token(make_token, USER_A_ID)

    response = api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": -15},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_completion_threshold_auto_marking(api_client, api_db, make_token):
    """Reaching >= 90% of chapter duration marks is_completed=True."""
    story, ch = _seed_story_with_chapter(api_db, ch_duration=500)
    token = _user_token(make_token, USER_A_ID)

    # 450 seconds is 90% of 500
    response = api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 460},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_completed"] is True


def test_get_story_progress(api_client, api_db, make_token):
    """Retrieving progress by story ID returns the user's progress records."""
    story, ch = _seed_story_with_chapter(api_db)
    token = _user_token(make_token, USER_A_ID)

    api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 180},
        headers={"Authorization": f"Bearer {token}"},
    )

    response = api_client.get(
        f"/api/v1/progress/{story.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    items = response.json()
    assert len(items) == 1
    assert items[0]["position_seconds"] == 180


def test_get_resume_points(api_client, api_db, make_token):
    """Resume endpoint returns active non-completed in-progress stories."""
    story, ch = _seed_story_with_chapter(api_db)
    token = _user_token(make_token, USER_A_ID)

    api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 180},
        headers={"Authorization": f"Bearer {token}"},
    )

    response = api_client.get(
        "/api/v1/progress/resume",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["story_id"] == story.id
    assert data[0]["story_title"] == story.title
    assert data[0]["position_seconds"] == 180


def test_cross_user_progress_read_isolation(api_client, api_db, make_token):
    """User B cannot read User A's progress for a story."""
    story, ch = _seed_story_with_chapter(api_db)
    token_a = _user_token(make_token, USER_A_ID)
    token_b = _user_token(make_token, USER_B_ID)

    # User A records progress
    api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 300},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    # User B queries progress for same story
    response = api_client.get(
        f"/api/v1/progress/{story.id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == status.HTTP_200_OK
    # Must be empty for User B
    assert response.json() == []


def test_cross_user_progress_update_isolation(api_client, api_db, make_token):
    """User B cannot update User A's progress even if submitting identical story and chapter."""
    story, ch = _seed_story_with_chapter(api_db)
    token_a = _user_token(make_token, USER_A_ID)
    token_b = _user_token(make_token, USER_B_ID)

    # User A sets 100s
    api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 100},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    # User B sets 50s
    api_client.post(
        "/api/v1/progress",
        json={"story_id": story.id, "chapter_id": ch.id, "position_seconds": 50},
        headers={"Authorization": f"Bearer {token_b}"},
    )

    # Check User A's record directly from database
    rec_a = (
        api_db.query(ListeningProgress)
        .filter(
            ListeningProgress.user_id == USER_A_ID,
            ListeningProgress.story_id == story.id,
        )
        .first()
    )
    assert rec_a.position_seconds == 100

    # Check User B's record
    rec_b = (
        api_db.query(ListeningProgress)
        .filter(
            ListeningProgress.user_id == USER_B_ID,
            ListeningProgress.story_id == story.id,
        )
        .first()
    )
    assert rec_b.position_seconds == 50


def test_progress_invalid_story_rejected(api_client, make_token):
    """Submitting progress for an unknown story returns 404."""
    token = _user_token(make_token, USER_A_ID)
    response = api_client.post(
        "/api/v1/progress",
        json={"story_id": "non-existent-uuid", "position_seconds": 100},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
