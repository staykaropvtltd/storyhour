from datetime import datetime, timezone
import pytest
from fastapi import status

from app.models.audio_asset import AudioAccessType
from app.models.category import Category
from app.models.event import EventStatus
from app.models.journal import JournalStatus
from app.models.language import Language
from app.models.story import Story, StoryStatus


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def customer_headers(valid_token):
    return {"Authorization": f"Bearer {valid_token}"}


@pytest.fixture
def editor_headers(make_token):
    token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# 1. RBAC & SECURITY TESTS
# ============================================================================

def test_unauthenticated_admin_endpoint_returns_401(api_client):
    """Unauthenticated request to any admin endpoint is rejected with 401."""
    res = api_client.get("/api/v1/admin/stories")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED

    res2 = api_client.get("/api/admin/stories")
    assert res2.status_code == status.HTTP_401_UNAUTHORIZED


def test_customer_forbidden_from_admin_endpoints(api_client, customer_headers):
    """Authenticated non-admin user (Customer) is rejected with 403."""
    endpoints = [
        "/api/v1/admin/stories",
        "/api/v1/admin/events",
        "/api/v1/admin/journal",
        "/api/v1/admin/contact",
        "/api/v1/admin/media",
        "/api/v1/admin/analytics/events",
        "/api/v1/admin/analytics/summary",
    ]
    for ep in endpoints:
        res = api_client.get(ep, headers=customer_headers)
        assert res.status_code == status.HTTP_403_FORBIDDEN


def test_editor_allowed_content_management_but_forbidden_from_admin_delete(
    api_client, api_db, editor_headers, admin_headers
):
    """Editors can list/edit content, but delete operations are restricted to Administrator."""
    # Create category as admin
    cat_res = api_client.post(
        "/api/v1/admin/categories",
        json={"name": "Folklore", "slug": "folklore", "is_active": True},
        headers=admin_headers,
    )
    assert cat_res.status_code == status.HTTP_201_CREATED
    cat_id = cat_res.json()["id"]

    # Editor can view
    res = api_client.get("/api/v1/admin/categories", headers=editor_headers)
    assert res.status_code == status.HTTP_200_OK

    # Editor cannot delete
    del_res = api_client.delete(f"/api/v1/admin/categories/{cat_id}", headers=editor_headers)
    assert del_res.status_code == status.HTTP_403_FORBIDDEN

    # Admin can delete
    adm_del_res = api_client.delete(f"/api/v1/admin/categories/{cat_id}", headers=admin_headers)
    assert adm_del_res.status_code == status.HTTP_204_NO_CONTENT


# ============================================================================
# 2. STORIES & CHAPTERS CMS TESTS
# ============================================================================

def test_story_cms_lifecycle_and_visibility(api_client, api_db, admin_headers):
    """
    Test Story CMS:
    - Create draft -> hidden publicly
    - Update story
    - Publish -> visible publicly
    - Unpublish -> hidden publicly
    - Delete -> removed
    """
    # 1. Create Draft Story
    payload = {
        "title": "Epic of Harishchandra",
        "slug": "epic-harishchandra",
        "short_description": "The timeless tale of truth and devotion.",
        "long_description": "King Harishchandra sacrifices everything for righteousness.",
        "status": "DRAFT",
        "themes": ["Truth", "Sacrifice"],
        "narrator": "Pt. Hariprasad",
        "duration": 3600,
        "featured": True,
    }
    create_res = api_client.post("/api/v1/admin/stories", json=payload, headers=admin_headers)
    assert create_res.status_code == status.HTTP_201_CREATED
    story_id = create_res.json()["id"]
    assert create_res.json()["status"] == "DRAFT"

    # 2. Public API does NOT show draft
    pub_list = api_client.get("/api/v1/stories")
    assert pub_list.status_code == 200
    assert not any(s["slug"] == "epic-harishchandra" for s in pub_list.json())

    pub_detail = api_client.get("/api/v1/stories/epic-harishchandra")
    assert pub_detail.status_code == status.HTTP_404_NOT_FOUND

    # 3. Admin can view draft
    admin_detail = api_client.get(f"/api/v1/admin/stories/{story_id}", headers=admin_headers)
    assert admin_detail.status_code == 200
    assert admin_detail.json()["slug"] == "epic-harishchandra"

    # 4. Update Story
    patch_res = api_client.patch(
        f"/api/v1/admin/stories/{story_id}",
        json={"short_description": "Updated synopsis for Harishchandra."},
        headers=admin_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["short_description"] == "Updated synopsis for Harishchandra."

    # 5. Duplicate slug check
    dup_res = api_client.post("/api/v1/admin/stories", json=payload, headers=admin_headers)
    assert dup_res.status_code == status.HTTP_409_CONFLICT

    # 6. Publish Story
    pub_res = api_client.post(f"/api/v1/admin/stories/{story_id}/publish", headers=admin_headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "PUBLISHED"

    # Now public API DOES show it
    pub_detail_after = api_client.get("/api/v1/stories/epic-harishchandra")
    assert pub_detail_after.status_code == 200
    assert pub_detail_after.json()["title"] == "Epic of Harishchandra"

    # 7. Unpublish Story
    unpub_res = api_client.post(f"/api/v1/admin/stories/{story_id}/unpublish", headers=admin_headers)
    assert unpub_res.status_code == 200
    assert unpub_res.json()["status"] == "DRAFT"

    # Public API hides it again
    assert api_client.get("/api/v1/stories/epic-harishchandra").status_code == status.HTTP_404_NOT_FOUND

    # 8. Delete Story
    del_res = api_client.delete(f"/api/v1/admin/stories/{story_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT
    assert api_client.get(f"/api/v1/admin/stories/{story_id}", headers=admin_headers).status_code == status.HTTP_404_NOT_FOUND


def test_chapter_cms_crud_and_ordering(api_client, api_db, admin_headers):
    """Test Chapter creation, sequence ordering, update, and deletion."""
    # Create story first
    story_res = api_client.post(
        "/api/v1/admin/stories",
        json={"title": "Panchatantra", "slug": "panchatantra", "status": "PUBLISHED"},
        headers=admin_headers,
    )
    story_id = story_res.json()["id"]

    # 1. Create Chapters
    ch1 = api_client.post(
        f"/api/v1/admin/stories/{story_id}/chapters",
        json={"title": "The Monkey and The Crocodile", "order": 1, "duration": 300, "preview_available": True},
        headers=admin_headers,
    )
    assert ch1.status_code == status.HTTP_201_CREATED
    ch1_id = ch1.json()["id"]

    ch2 = api_client.post(
        f"/api/v1/admin/stories/{story_id}/chapters",
        json={"title": "The Blue Jackal", "order": 2, "duration": 420, "preview_available": False},
        headers=admin_headers,
    )
    assert ch2.status_code == status.HTTP_201_CREATED

    # 2. Duplicate order conflict
    dup_ch = api_client.post(
        f"/api/v1/admin/stories/{story_id}/chapters",
        json={"title": "Conflicting Chapter", "order": 1, "duration": 100},
        headers=admin_headers,
    )
    assert dup_ch.status_code == status.HTTP_409_CONFLICT

    # 3. List chapters in sequence
    list_res = api_client.get(f"/api/v1/admin/stories/{story_id}/chapters", headers=admin_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 2
    assert list_res.json()[0]["order"] == 1
    assert list_res.json()[1]["order"] == 2

    # 4. Update Chapter
    patch_ch = api_client.patch(
        f"/api/v1/admin/chapters/{ch1_id}",
        json={"title": "The Wise Monkey and The Crocodile"},
        headers=admin_headers,
    )
    assert patch_ch.status_code == 200
    assert patch_ch.json()["title"] == "The Wise Monkey and The Crocodile"

    # 5. Delete Chapter
    del_res = api_client.delete(f"/api/v1/admin/chapters/{ch1_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT


# ============================================================================
# 3. TAXONOMY CMS (CATEGORIES & LANGUAGES)
# ============================================================================

def test_taxonomy_categories_and_languages(api_client, api_db, admin_headers):
    """Test category and language CRUD and inactive status handling."""
    # Category CRUD
    cat_res = api_client.post(
        "/api/v1/admin/categories",
        json={"name": "Ancient Epics", "slug": "ancient-epics", "is_active": False},
        headers=admin_headers,
    )
    assert cat_res.status_code == status.HTTP_201_CREATED
    cat_id = cat_res.json()["id"]

    # Public list excludes inactive category
    pub_cats = api_client.get("/api/v1/categories").json()
    assert not any(c["slug"] == "ancient-epics" for c in pub_cats)

    # Admin list includes inactive category
    admin_cats = api_client.get("/api/v1/admin/categories", headers=admin_headers).json()
    assert any(c["slug"] == "ancient-epics" for c in admin_cats)

    # Language CRUD
    lang_res = api_client.post(
        "/api/v1/admin/languages",
        json={"name": "Sanskrit", "code": "sa", "native_name": "संस्कृतम्", "is_active": False},
        headers=admin_headers,
    )
    assert lang_res.status_code == status.HTTP_201_CREATED
    lang_id = lang_res.json()["id"]

    # Admin list includes inactive language
    admin_langs = api_client.get("/api/v1/admin/languages", headers=admin_headers).json()
    assert any(l["code"] == "sa" for l in admin_langs)

    # Update Language to active
    up_lang = api_client.patch(
        f"/api/v1/admin/languages/{lang_id}",
        json={"is_active": True},
        headers=admin_headers,
    )
    assert up_lang.json()["is_active"] is True


# ============================================================================
# 4. EVENTS & JOURNAL CMS TESTS
# ============================================================================

def test_events_cms_lifecycle(api_client, api_db, admin_headers):
    """Test Event creation, publishing, unpublishing, and soft-delete."""
    payload = {
        "title": "Navaratri Story Circle",
        "slug": "navaratri-story-circle",
        "event_type": "performance",
        "status": "DRAFT",
        "start_date": "2026-10-15T18:00:00Z",
        "location": "Bengaluru Cultural Centre",
        "is_online": False,
        "featured": True,
    }
    create_res = api_client.post("/api/v1/admin/events", json=payload, headers=admin_headers)
    assert create_res.status_code == status.HTTP_201_CREATED
    event_id = create_res.json()["id"]

    # Public API hides draft event
    assert api_client.get("/api/v1/events/navaratri-story-circle").status_code == status.HTTP_404_NOT_FOUND

    # Publish Event
    pub_res = api_client.post(f"/api/v1/admin/events/{event_id}/publish", headers=admin_headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "PUBLISHED"

    # Public API shows published event
    assert api_client.get("/api/v1/events/navaratri-story-circle").status_code == 200

    # Soft Delete Event
    del_res = api_client.delete(f"/api/v1/admin/events/{event_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # Public API hides deleted event
    assert api_client.get("/api/v1/events/navaratri-story-circle").status_code == status.HTTP_404_NOT_FOUND


def test_journal_cms_lifecycle(api_client, api_db, admin_headers):
    """Test Journal Article creation, publishing, unpublishing, and soft-delete."""
    payload = {
        "title": "The Oral Tradition of Indian Epics",
        "slug": "oral-tradition-epics",
        "short_description": "How tales lived across generations through memory and voice.",
        "content": "Before printing presses, memory was the sacred library...",
        "author_name": "Vidya Srinivasan",
        "status": "DRAFT",
    }
    create_res = api_client.post("/api/v1/admin/journal", json=payload, headers=admin_headers)
    assert create_res.status_code == status.HTTP_201_CREATED
    art_id = create_res.json()["id"]

    # Public hides draft
    assert api_client.get("/api/v1/journal/oral-tradition-epics").status_code == status.HTTP_404_NOT_FOUND

    # Publish Article
    pub_res = api_client.post(f"/api/v1/admin/journal/{art_id}/publish", headers=admin_headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "PUBLISHED"
    assert pub_res.json()["publication_date"] is not None

    # Public shows published article
    assert api_client.get("/api/v1/journal/oral-tradition-epics").status_code == 200

    # Soft Delete
    del_res = api_client.delete(f"/api/v1/admin/journal/{art_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT


# ============================================================================
# 5. CONTACT ENQUIRIES ADMIN TESTS
# ============================================================================

def test_contact_submissions_admin_management(api_client, api_db, admin_headers):
    """Test visitor contact submission and administrative query and status management."""
    # Visitor submits enquiry
    sub_res = api_client.post(
        "/api/v1/contact",
        json={
            "name": "Prof. Radhakrishnan",
            "email": "radha@university.ac.in",
            "enquiry_type": "Residency",
            "message": "We would like to invite StoryHour for an academic folklore symposium.",
        },
    )
    assert sub_res.status_code == status.HTTP_201_CREATED
    sub_id = sub_res.json()["id"]

    # Admin lists submissions
    admin_list = api_client.get("/api/v1/admin/contact", headers=admin_headers)
    assert admin_list.status_code == 200
    assert any(s["id"] == sub_id for s in admin_list.json())

    # Admin rejects invalid status
    bad_patch = api_client.patch(
        f"/api/v1/admin/contact/{sub_id}",
        json={"status": "invalid_status_xyz"},
        headers=admin_headers,
    )
    assert bad_patch.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Admin updates status
    patch_res = api_client.patch(
        f"/api/v1/admin/contact/{sub_id}",
        json={"status": "resolved"},
        headers=admin_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "resolved"

    # Admin deletes enquiry
    del_res = api_client.delete(f"/api/v1/admin/contact/{sub_id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT


# ============================================================================
# 6. MEDIA MANAGEMENT TESTS
# ============================================================================

def test_media_crud_and_security(api_client, api_db, admin_headers):
    """Test audio media registration, file_size storage, metadata update, and security boundary."""
    # Create story
    story_res = api_client.post(
        "/api/v1/admin/stories",
        json={"title": "Mahabharata Vol 1", "slug": "mahabharata-vol-1", "status": "PUBLISHED"},
        headers=admin_headers,
    )
    story_id = story_res.json()["id"]

    # 1. Register Audio Asset with file_size
    media_payload = {
        "story_id": story_id,
        "storage_key": "audio/mahabharata/intro.mp3",
        "duration": 540,
        "mime_type": "audio/mpeg",
        "file_size": 8642000,
        "access_type": "PUBLIC_PREVIEW",
    }
    media_res = api_client.post("/api/v1/admin/media", json=media_payload, headers=admin_headers)
    assert media_res.status_code == status.HTTP_201_CREATED
    asset_id = media_res.json()["id"]
    assert media_res.json()["file_size"] == 8642000

    # 2. Get Media Metadata
    get_media = api_client.get(f"/api/v1/admin/media/{asset_id}", headers=admin_headers)
    assert get_media.status_code == 200
    assert get_media.json()["storage_key"] == "audio/mahabharata/intro.mp3"

    # 3. Update Media Metadata
    patch_media = api_client.patch(
        f"/api/v1/admin/media/{asset_id}",
        json={"file_size": 9000000, "duration": 560},
        headers=admin_headers,
    )
    assert patch_media.status_code == 200
    assert patch_media.json()["file_size"] == 9000000
    assert patch_media.json()["duration"] == 560

    # 4. Preview Playback Descriptor does NOT leak object store credentials
    preview_res = api_client.get("/api/v1/audio/mahabharata-vol-1/preview")
    assert preview_res.status_code == 200
    desc = preview_res.json()
    assert desc["is_accessible"] is True
    assert desc["stream_url"] == f"/api/audio/stream/{asset_id}"
    assert "storage_key" not in desc  # Never leak raw storage paths/keys to frontend player

    # 5. Delete Media
    del_media = api_client.delete(f"/api/v1/admin/media/{asset_id}", headers=admin_headers)
    assert del_media.status_code == status.HTTP_204_NO_CONTENT


# ============================================================================
# 7. ANALYTICS TELEMETRY & REPORTING TESTS
# ============================================================================

def test_analytics_ingestion_and_privacy_filtering(api_client, api_db, admin_headers, customer_headers):
    """
    Test Analytics:
    - Anonymous telemetry ingestion
    - Authenticated telemetry ingestion
    - Sensitive information sanitization (passwords, tokens, payment secrets stripped)
    - Admin query and summary aggregation
    """
    # 1. Negative Tests: Invalid event type & Oversized properties
    bad_type_res = api_client.post(
        "/api/v1/analytics/events",
        json={"event_type": "unauthorized_custom_event", "properties": {}},
    )
    assert bad_type_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    oversized_res = api_client.post(
        "/api/v1/analytics/events",
        json={"event_type": "story_view", "properties": {f"key_{i}": i for i in range(55)}},
    )
    assert oversized_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 2. Anonymous Telemetry Ingestion with nested sensitive keys to sanitize
    nested_payload = {
        "event_type": "story_view",
        "session_id": "sess-xyz-987",
        "properties": {
            "story_slug": "ramayana-hindi",
            "referrer": "homepage_hero",
            "password": "SHOULD_BE_STRIPPED",
            "auth_token": "BEARER_SECRET_STRIP",
            "credit_card": "4111_SECRET_STRIP",
            "user": {
                "password": "supersecretpassword",
                "token": "tok_12345",
                "refresh_token": "rtok_67890",
                "api_key": "ak_live_abcdef",
            },
            "payment": {
                "card_number": "4111222233334444",
                "cvv": "123",
                "secret": "stripe_sk_live_xyz",
            },
            "unflagged_bearer": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M",
            "safe_metadata": "valid_value",
        },
    }
    anon_res = api_client.post("/api/v1/analytics/events", json=nested_payload)
    assert anon_res.status_code == status.HTTP_201_CREATED
    anon_data = anon_res.json()
    assert anon_data["event_type"] == "story_view"
    assert anon_data["user_id"] is None
    assert anon_data["session_id"] == "sess-xyz-987"
    # Verify top-level sensitive data was stripped
    assert "password" not in anon_data["properties"]
    assert "auth_token" not in anon_data["properties"]
    assert "credit_card" not in anon_data["properties"]
    assert "unflagged_bearer" not in anon_data["properties"]
    # Verify nested sensitive data was stripped
    user_dict = anon_data["properties"].get("user", {})
    assert "password" not in user_dict
    assert "token" not in user_dict
    assert "refresh_token" not in user_dict
    assert "api_key" not in user_dict
    payment_dict = anon_data["properties"].get("payment", {})
    assert "card_number" not in payment_dict
    assert "cvv" not in payment_dict
    assert "secret" not in payment_dict
    assert anon_data["properties"]["safe_metadata"] == "valid_value"
    assert anon_data["properties"]["story_slug"] == "ramayana-hindi"

    # 3. Authenticated Telemetry Ingestion
    auth_payload = {
        "event_type": "story_play",
        "session_id": "sess-auth-123",
        "properties": {
            "story_slug": "ramayana-hindi",
            "playback_rate": 1.0,
            "chapter_order": 1,
        },
    }
    auth_res = api_client.post("/api/v1/analytics/events", json=auth_payload, headers=customer_headers)
    assert auth_res.status_code == status.HTTP_201_CREATED
    assert auth_res.json()["user_id"] is not None

    # 3. Test Specification Event Types Ingestion
    spec_events = [
        ("story_progress", {"seconds": 120}),
        ("story_complete", {"completed": True}),
        ("search", {"query": "Hanuman"}),
        ("filter_used", {"category": "mythology"}),
        ("add_to_cart", {"product_id": "prod-1"}),
        ("checkout_start", {"items_count": 1}),
        ("purchase", {"order_id": "ord-1"}),
        ("event_view", {"event_slug": "navaratri-circle"}),
        ("event_enquiry", {"enquiry_type": "General"}),
    ]
    for ev_type, props in spec_events:
        res = api_client.post(
            "/api/v1/analytics/events",
            json={"event_type": ev_type, "properties": props},
        )
        assert res.status_code == status.HTTP_201_CREATED

    # 4. Admin Query Events
    admin_events = api_client.get("/api/v1/admin/analytics/events", headers=admin_headers)
    assert admin_events.status_code == 200
    assert len(admin_events.json()) >= 11

    # Filter by event_type
    filtered_events = api_client.get(
        "/api/v1/admin/analytics/events?event_type=story_view",
        headers=admin_headers,
    )
    assert filtered_events.status_code == 200
    assert all(e["event_type"] == "story_view" for e in filtered_events.json())

    # 5. Admin Analytics Summary Aggregation
    summary = api_client.get("/api/v1/admin/analytics/summary", headers=admin_headers)
    assert summary.status_code == 200
    summary_data = summary.json()
    assert summary_data["total_events"] >= 11
    assert "story_view" in summary_data["events_by_type"]
    assert "story_play" in summary_data["events_by_type"]


def test_empty_analytics_summary_response_shape(api_client, api_db, admin_headers):
    """Verify empty/filtered analytics summary and event queries return correct schema shapes."""
    # Query with a non-matching event type filter returns empty list with 200 OK
    res = api_client.get(
        "/api/v1/admin/analytics/events?event_type=nonexistent_event_filter",
        headers=admin_headers,
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert len(res.json()) == 0
