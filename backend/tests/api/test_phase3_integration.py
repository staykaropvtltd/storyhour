"""
Phase 3 End-to-End Integration Compatibility Test Suite.

Validates compatibility between:
PR #9 (Commerce / 3-Stage Payment / Order Confirmation)
   ↓
LibraryItem (user_id, story_id, is_active, source_order_id)
   ↓
PR #8 Library (GET /api/v1/library/me, tenant isolation)
   ↓
PR #8 Audio (GET /api/v1/audio/{story_slug}/stream, entitlement check)
   ↓
PR #8 Listening Progress (POST /api/v1/progress, GET /resume, GET /{story_id})
"""

from fastapi import status
from sqlalchemy.orm import Session

from app.models.audio_asset import AudioAccessType, AudioAsset
from app.models.chapter import Chapter
from app.models.library import LibraryItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.story import Story, StoryStatus
from app.repositories.library import LibraryRepository


USER_A_ID = "aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"
USER_B_ID = "bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"


def _user_token(make_token, user_id: str, email: str):
    return make_token(
        sub=user_id,
        email=email,
        role="authenticated",
    )


def _setup_story_with_product_and_audio(api_db: Session):
    """
    Creates a commercial product, links a published story to it,
    adds chapters and audio assets (preview and protected).
    """
    # 1. Product (PR #9 model)
    product = Product(
        name="The Legend of Ramayana",
        slug="the-legend-of-ramayana",
        description="Complete digital audio experience of Ramayana",
        price="499.00",
        currency="INR",
        product_type="digital",
        is_active=True,
    )
    api_db.add(product)
    api_db.commit()
    api_db.refresh(product)

    # 2. Story linked to product (PR #8 model + PR #9 product linkage)
    story = Story(
        title="Ramayana: The Epic Journey",
        slug="ramayana-epic-journey",
        status=StoryStatus.PUBLISHED,
        duration=3600,
        short_description="An ancient Indian epic poem.",
        product_id=product.id,
    )
    api_db.add(story)
    api_db.commit()
    api_db.refresh(story)

    # 3. Chapters (PR #8)
    ch1 = Chapter(
        story_id=story.id,
        title="Chapter 1: The Birth of Rama",
        order=1,
        duration=1800,
        preview_available=True,
    )
    ch2 = Chapter(
        story_id=story.id,
        title="Chapter 2: The Forest Exile",
        order=2,
        duration=1800,
        preview_available=False,
    )
    api_db.add_all([ch1, ch2])
    api_db.commit()
    api_db.refresh(ch1)
    api_db.refresh(ch2)

    # 4. Audio Assets (PR #8)
    asset_preview = AudioAsset(
        story_id=story.id,
        chapter_id=ch1.id,
        storage_key="audio/secure/ramayana/ch1_preview.mp3",
        duration=1800,
        mime_type="audio/mpeg",
        access_type=AudioAccessType.PUBLIC_PREVIEW,
    )
    asset_protected = AudioAsset(
        story_id=story.id,
        chapter_id=ch2.id,
        storage_key="audio/secure/ramayana/ch2_protected.mp3",
        duration=1800,
        mime_type="audio/mpeg",
        access_type=AudioAccessType.PROTECTED,
    )
    api_db.add_all([asset_preview, asset_protected])
    api_db.commit()
    api_db.refresh(asset_preview)
    api_db.refresh(asset_protected)

    return product, story, ch1, ch2, asset_preview, asset_protected


def _create_pending_order_for_user(api_db: Session, user_id: str, product: Product):
    """Creates a pending order for the specified user and product."""
    order = Order(
        user_id=user_id,
        status=OrderStatus.PENDING.value,
        currency=product.currency,
        subtotal=product.price,
        total=product.price,
    )
    api_db.add(order)
    api_db.flush()

    item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        product_name=product.name,
        unit_price=product.price,
        currency=product.currency,
        quantity=1,
        line_total=product.price,
    )
    api_db.add(item)
    api_db.commit()
    api_db.refresh(order)
    return order


def _execute_three_stage_payment(api_client, headers, order_id):
    """Executes the full 3-stage payment lifecycle from PR #9."""
    # Create payment record
    create_res = api_client.post(f"/api/v1/payments/{order_id}", headers=headers)
    assert create_res.status_code == status.HTTP_201_CREATED

    # Stage 1: Initiation
    s1_res = api_client.post(
        f"/api/v1/payments/{order_id}/stage/1",
        headers=headers,
        json={"provider_reference": "prov-ref-stage1"},
    )
    assert s1_res.status_code == status.HTTP_200_OK

    # Stage 2: Authorization
    s2_res = api_client.post(f"/api/v1/payments/{order_id}/stage/2", headers=headers)
    assert s2_res.status_code == status.HTTP_200_OK

    # Stage 3: Completion & Entitlement Grant
    s3_res = api_client.post(
        f"/api/v1/payments/{order_id}/stage/3",
        headers=headers,
        json={"provider_reference": "prov-ref-final"},
    )
    assert s3_res.status_code == status.HTTP_200_OK
    return s3_res.json()


# ==============================================================================
# Integration Test A — LibraryItem → Library
# ==============================================================================

def test_integration_a_library_item_to_library(api_client, api_db, make_token):
    """
    Test A: Verify that PR #9 successful 3-stage payment creates a valid
    LibraryItem that is recognized and returned by the PR #8 Library API.
    """
    product, story, _, _, _, _ = _setup_story_with_product_and_audio(api_db)
    token_a = _user_token(make_token, USER_A_ID, "user_a@storyhour.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    order = _create_pending_order_for_user(api_db, USER_A_ID, product)

    # Execute Stage 1 -> 2 -> 3
    payment_data = _execute_three_stage_payment(api_client, headers_a, order.id)
    assert payment_data["status"] == "confirmed"
    assert payment_data["stage_3_status"] == "completed"

    # Direct database inspection of LibraryItem
    lib_item = (
        api_db.query(LibraryItem)
        .filter(
            LibraryItem.user_id == USER_A_ID,
            LibraryItem.story_id == story.id,
        )
        .first()
    )
    assert lib_item is not None
    assert lib_item.user_id == USER_A_ID
    assert lib_item.story_id == story.id
    assert lib_item.is_active is True
    assert lib_item.access_type == "purchased"
    assert lib_item.source_order_id == order.id

    # Call GET /api/v1/library/me
    lib_res = api_client.get("/api/v1/library/me", headers=headers_a)
    assert lib_res.status_code == status.HTTP_200_OK

    lib_data = lib_res.json()
    assert lib_data["user_id"] == USER_A_ID
    assert lib_data["total_count"] == 1
    assert len(lib_data["items"]) == 1

    entry = lib_data["items"][0]
    assert entry["id"] == lib_item.id
    assert entry["story_id"] == story.id
    assert entry["access_type"] == "purchased"
    assert entry["is_active"] is True
    assert entry["story"]["id"] == story.id
    assert entry["story"]["title"] == "Ramayana: The Epic Journey"
    assert entry["story"]["slug"] == "ramayana-epic-journey"


# ==============================================================================
# Integration Test B — Library → Audio
# ==============================================================================

def test_integration_b_library_to_audio(api_client, api_db, make_token):
    """
    Test B: Verify that a user entitled via PR #9 payment can stream protected audio,
    while chapter-specific audio behavior works and no secrets/keys are exposed.
    """
    product, story, ch1, ch2, asset_preview, asset_protected = _setup_story_with_product_and_audio(api_db)
    token_a = _user_token(make_token, USER_A_ID, "user_a@storyhour.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    order = _create_pending_order_for_user(api_db, USER_A_ID, product)
    _execute_three_stage_payment(api_client, headers_a, order.id)

    # 1. Story-level protected stream access
    stream_res = api_client.get(
        f"/api/v1/audio/{story.slug}/stream",
        headers=headers_a,
    )
    assert stream_res.status_code == status.HTTP_200_OK
    stream_data = stream_res.json()
    assert stream_data["is_accessible"] is True
    assert stream_data["stream_url"] is not None
    # Security: Ensure storage key / provider secrets are never leaked
    assert "storage_key" not in stream_data
    assert "audio/secure" not in str(stream_data)

    # 2. Chapter-specific protected stream access (Chapter 2)
    ch2_stream_res = api_client.get(
        f"/api/v1/audio/{story.slug}/stream?chapter_order=2",
        headers=headers_a,
    )
    assert ch2_stream_res.status_code == status.HTTP_200_OK
    ch2_data = ch2_stream_res.json()
    assert ch2_data["asset_id"] == asset_protected.id
    assert ch2_data["chapter_id"] == ch2.id
    assert ch2_data["is_accessible"] is True
    assert ch2_data["stream_url"] is not None
    assert "storage_key" not in ch2_data


# ==============================================================================
# Integration Test C — Audio → Listening Progress
# ==============================================================================

def test_integration_c_audio_to_listening_progress(api_client, api_db, make_token):
    """
    Test C: Verify that the entitled user can record, update, retrieve,
    and resume listening progress on the purchased story.
    """
    product, story, ch1, ch2, _, _ = _setup_story_with_product_and_audio(api_db)
    token_a = _user_token(make_token, USER_A_ID, "user_a@storyhour.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    order = _create_pending_order_for_user(api_db, USER_A_ID, product)
    _execute_three_stage_payment(api_client, headers_a, order.id)

    # 1. Create progress record
    create_prog = api_client.post(
        "/api/v1/progress",
        headers=headers_a,
        json={
            "story_id": story.id,
            "chapter_id": ch1.id,
            "position_seconds": 300,
        },
    )
    assert create_prog.status_code == status.HTTP_200_OK
    prog_data = create_prog.json()
    assert prog_data["user_id"] == USER_A_ID
    assert prog_data["story_id"] == story.id
    assert prog_data["chapter_id"] == ch1.id
    assert prog_data["position_seconds"] == 300
    assert prog_data["is_completed"] is False

    # 2. Update progress record (upsert idempotency)
    update_prog = api_client.post(
        "/api/v1/progress",
        headers=headers_a,
        json={
            "story_id": story.id,
            "chapter_id": ch1.id,
            "position_seconds": 900,
        },
    )
    assert update_prog.status_code == status.HTTP_200_OK
    assert update_prog.json()["position_seconds"] == 900
    assert update_prog.json()["is_completed"] is False

    # 3. Retrieve story progress
    get_prog = api_client.get(
        f"/api/v1/progress/{story.id}",
        headers=headers_a,
    )
    assert get_prog.status_code == status.HTTP_200_OK
    items = get_prog.json()
    assert len(items) == 1
    assert items[0]["chapter_id"] == ch1.id
    assert items[0]["position_seconds"] == 900

    # 4. Resume points
    resume_res = api_client.get(
        "/api/v1/progress/resume",
        headers=headers_a,
    )
    assert resume_res.status_code == status.HTTP_200_OK
    resume_items = resume_res.json()
    assert len(resume_items) == 1
    assert resume_items[0]["story_id"] == story.id
    assert resume_items[0]["chapter_id"] == ch1.id
    assert resume_items[0]["position_seconds"] == 900

    # 5. Auto-completion threshold (> 90% of chapter duration 1800s -> 1700s)
    complete_prog = api_client.post(
        "/api/v1/progress",
        headers=headers_a,
        json={
            "story_id": story.id,
            "chapter_id": ch1.id,
            "position_seconds": 1700,
        },
    )
    assert complete_prog.status_code == status.HTTP_200_OK
    assert complete_prog.json()["is_completed"] is True


# ==============================================================================
# Integration Test D — Access Boundary (User A vs User B)
# ==============================================================================

def test_integration_d_access_boundary(api_client, api_db, make_token):
    """
    Test D: Verify strict tenant/user boundary:
    - User A (purchased): Allowed to stream protected audio and record progress.
    - User B (unentitled): Denied protected audio (403), empty library,
      and cannot read or tamper with User A's listening progress.
    """
    product, story, ch1, ch2, _, _ = _setup_story_with_product_and_audio(api_db)
    token_a = _user_token(make_token, USER_A_ID, "user_a@storyhour.com")
    token_b = _user_token(make_token, USER_B_ID, "user_b@storyhour.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A purchases the product
    order_a = _create_pending_order_for_user(api_db, USER_A_ID, product)
    _execute_three_stage_payment(api_client, headers_a, order_a.id)

    # User A records progress
    api_client.post(
        "/api/v1/progress",
        headers=headers_a,
        json={
            "story_id": story.id,
            "chapter_id": ch1.id,
            "position_seconds": 450,
        },
    )

    # Verify User A has access
    a_stream = api_client.get(f"/api/v1/audio/{story.slug}/stream", headers=headers_a)
    assert a_stream.status_code == status.HTTP_200_OK

    # Verify User B has NO access (403 Forbidden)
    b_stream = api_client.get(f"/api/v1/audio/{story.slug}/stream", headers=headers_b)
    assert b_stream.status_code == status.HTTP_403_FORBIDDEN
    assert "User is not entitled to access this protected audio content" in b_stream.json()["detail"]

    # Verify User B library is empty
    b_lib = api_client.get("/api/v1/library/me", headers=headers_b)
    assert b_lib.status_code == status.HTTP_200_OK
    assert b_lib.json()["total_count"] == 0
    assert b_lib.json()["items"] == []

    # Verify User B cannot access User A's progress
    b_prog = api_client.get(f"/api/v1/progress/{story.id}", headers=headers_b)
    assert b_prog.status_code == status.HTTP_200_OK
    assert b_prog.json() == []

    b_resume = api_client.get("/api/v1/progress/resume", headers=headers_b)
    assert b_resume.status_code == status.HTTP_200_OK
    assert b_resume.json() == []

    # Verify unauthenticated access is rejected (401)
    unauth_stream = api_client.get(f"/api/v1/audio/{story.slug}/stream")
    assert unauth_stream.status_code == status.HTTP_401_UNAUTHORIZED


# ==============================================================================
# Duplicate LibraryItem / Repeated Completion Test
# ==============================================================================

def test_duplicate_library_item_and_reactivation_prevention(api_client, api_db, make_token):
    """
    Test: Verify that repeated Stage 3 completion or reactivation
    does not create duplicate LibraryItems and library API returns exactly 1 item.
    """
    product, story, _, _, _, _ = _setup_story_with_product_and_audio(api_db)
    token_a = _user_token(make_token, USER_A_ID, "user_a@storyhour.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    order = _create_pending_order_for_user(api_db, USER_A_ID, product)
    _execute_three_stage_payment(api_client, headers_a, order.id)

    # 1. Repeat Stage 3 payment completion
    repeated_res = api_client.post(
        f"/api/v1/payments/{order.id}/stage/3",
        headers=headers_a,
        json={"provider_reference": "prov-ref-final"},
    )
    assert repeated_res.status_code == status.HTTP_200_OK

    # 2. Check DB row count: exactly 1 LibraryItem exists
    count = (
        api_db.query(LibraryItem)
        .filter(
            LibraryItem.user_id == USER_A_ID,
            LibraryItem.story_id == story.id,
        )
        .count()
    )
    assert count == 1

    # 3. Test Reactivation behavior:
    # Deactivate the item manually
    lib_repo = LibraryRepository()
    item = (
        api_db.query(LibraryItem)
        .filter(
            LibraryItem.user_id == USER_A_ID,
            LibraryItem.story_id == story.id,
        )
        .first()
    )
    item.is_active = False
    api_db.commit()

    # Re-grant using add_to_library_without_commit (as used in Stage 3)
    reactivated = lib_repo.add_to_library_without_commit(
        api_db,
        user_id=USER_A_ID,
        story_id=story.id,
        access_type="purchased",
        source_order_id=order.id,
    )
    api_db.commit()

    assert reactivated.id == item.id
    assert reactivated.is_active is True

    # Check DB row count again: still exactly 1
    count_after = (
        api_db.query(LibraryItem)
        .filter(
            LibraryItem.user_id == USER_A_ID,
            LibraryItem.story_id == story.id,
        )
        .count()
    )
    assert count_after == 1

    # 4. Existing Library API still returns exactly one active item
    lib_res = api_client.get("/api/v1/library/me", headers=headers_a)
    assert lib_res.status_code == status.HTTP_200_OK
    assert lib_res.json()["total_count"] == 1
    assert len(lib_res.json()["items"]) == 1
