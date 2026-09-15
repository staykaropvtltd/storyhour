import pytest
from fastapi import status

from app.models.audio_asset import AudioAccessType, AudioAsset
from app.models.chapter import Chapter
from app.models.library import LibraryItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.story import Story, StoryStatus


USER_A_ID = "11111111-1111-1111-1111-111111111111"
USER_B_ID = "22222222-2222-2222-2222-222222222222"


def _user_token(make_token, user_id):
    return make_token(sub=user_id, email=f"user_{user_id[:8]}@storyhour.com")


def _seed_story_with_audio(api_db, *, status=StoryStatus.PUBLISHED, slug="panchatantra-tales"):
    story = Story(
        title="Panchatantra Tales",
        slug=slug,
        status=status,
        duration=3600,
        short_description="Classic moral tales",
    )
    api_db.add(story)
    api_db.commit()
    api_db.refresh(story)

    # Add chapters
    ch1 = Chapter(
        story_id=story.id,
        title="The Lion and the Hare",
        order=1,
        duration=1800,
        preview_available=True,
    )
    ch2 = Chapter(
        story_id=story.id,
        title="The Monkey and the Crocodile",
        order=2,
        duration=1800,
        preview_available=False,
    )
    api_db.add_all([ch1, ch2])
    api_db.commit()
    api_db.refresh(ch1)
    api_db.refresh(ch2)

    # Preview audio asset linked to ch1
    asset_preview = AudioAsset(
        story_id=story.id,
        chapter_id=ch1.id,
        storage_key="audio/secure/panchatantra/ch1_preview.mp3",
        duration=1800,
        mime_type="audio/mpeg",
        access_type=AudioAccessType.PUBLIC_PREVIEW,
    )
    # Protected audio asset linked to ch2
    asset_protected = AudioAsset(
        story_id=story.id,
        chapter_id=ch2.id,
        storage_key="audio/secure/panchatantra/ch2_protected.mp3",
        duration=1800,
        mime_type="audio/mpeg",
        access_type=AudioAccessType.PROTECTED,
    )
    api_db.add_all([asset_preview, asset_protected])
    api_db.commit()
    api_db.refresh(asset_preview)
    api_db.refresh(asset_protected)

    return story, ch1, ch2, asset_preview, asset_protected


# ==============================================================================
# Public Preview Endpoint Tests
# ==============================================================================

def test_get_audio_preview_success(api_client, api_db):
    """Public preview returns a valid safe descriptor for a published story."""
    story, ch1, ch2, asset_preview, asset_protected = _seed_story_with_audio(api_db)

    response = api_client.get(f"/api/v1/audio/{story.slug}/preview")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["asset_id"] == asset_preview.id
    assert data["story_id"] == story.id
    assert data["is_accessible"] is True
    assert data["stream_url"] is not None
    # Verify raw storage_key is never exposed in descriptor
    assert "storage_key" not in data
    assert "audio/secure" not in str(data)


def test_get_audio_preview_chapter_specific(api_client, api_db):
    """Preview request specifying a previewable chapter succeeds."""
    story, ch1, ch2, asset_preview, asset_protected = _seed_story_with_audio(api_db)

    response = api_client.get(f"/api/v1/audio/{story.slug}/preview?chapter_order=1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["chapter_id"] == ch1.id


def test_get_audio_preview_non_preview_chapter_returns_404(api_client, api_db):
    """Preview request specifying a protected non-preview chapter returns 404."""
    story, ch1, ch2, asset_preview, asset_protected = _seed_story_with_audio(api_db)

    response = api_client.get(f"/api/v1/audio/{story.slug}/preview?chapter_order=2")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_audio_preview_unpublished_story_returns_404(api_client, api_db):
    """Unpublished story audio previews return 404."""
    story, *_ = _seed_story_with_audio(api_db, status=StoryStatus.DRAFT, slug="draft-panchatantra")

    response = api_client.get(f"/api/v1/audio/{story.slug}/preview")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_audio_preview_unknown_story_returns_404(api_client):
    """Non-existent story returns 404."""
    response = api_client.get("/api/v1/audio/non-existent-story-slug/preview")
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================================
# Protected Audio Stream Endpoint Tests
# ==============================================================================

def test_protected_audio_requires_authentication(api_client, api_db):
    """Unauthenticated visitor cannot access protected audio stream."""
    story, *_ = _seed_story_with_audio(api_db)

    response = api_client.get(f"/api/v1/audio/{story.slug}/stream")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_protected_audio_unentitled_user_forbidden(api_client, api_db, make_token):
    """Authenticated user without library/order entitlement receives 403."""
    story, *_ = _seed_story_with_audio(api_db)
    token = _user_token(make_token, USER_A_ID)

    response = api_client.get(
        f"/api/v1/audio/{story.slug}/stream",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_protected_audio_entitled_via_library_success(api_client, api_db, make_token):
    """User with active library entitlement receives safe stream descriptor."""
    story, ch1, ch2, asset_preview, asset_protected = _seed_story_with_audio(api_db)
    token = _user_token(make_token, USER_A_ID)

    # Grant library item to User A
    lib_item = LibraryItem(
        user_id=USER_A_ID,
        story_id=story.id,
        access_type="purchased",
        is_active=True,
    )
    api_db.add(lib_item)
    api_db.commit()

    response = api_client.get(
        f"/api/v1/audio/{story.slug}/stream?chapter_order=2",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["asset_id"] == asset_protected.id
    assert data["chapter_id"] == ch2.id
    assert data["is_accessible"] is True
    assert data["stream_url"] is not None
    # Security: raw storage key is never exposed
    assert "storage_key" not in data


def test_protected_audio_entitled_via_commerce_order(api_client, api_db, make_token):
    """User with confirmed commerce Order containing story product receives access."""
    product = Product(
        name="Panchatantra Audiobook",
        slug="panchatantra-audiobook",
        price="299.00",
        currency="INR",
        product_type="digital",
        is_active=True,
    )
    api_db.add(product)
    api_db.commit()

    story, ch1, ch2, asset_preview, asset_protected = _seed_story_with_audio(api_db)
    story.product_id = product.id
    api_db.commit()

    # User A has confirmed order for this product
    order = Order(
        user_id=USER_A_ID,
        status=OrderStatus.CONFIRMED.value,
        currency="INR",
        total="299.00",
    )
    api_db.add(order)
    api_db.commit()

    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        product_name=product.name,
        unit_price=product.price,
        currency="INR",
        quantity=1,
        line_total=product.price,
    )
    api_db.add(order_item)
    api_db.commit()

    token = _user_token(make_token, USER_A_ID)
    response = api_client.get(
        f"/api/v1/audio/{story.slug}/stream",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["is_accessible"] is True


def test_protected_audio_cross_user_isolation(api_client, api_db, make_token):
    """User B cannot access protected content using User A's entitlement."""
    story, *_ = _seed_story_with_audio(api_db)

    # Entitle only User A
    lib_item = LibraryItem(
        user_id=USER_A_ID,
        story_id=story.id,
        access_type="purchased",
        is_active=True,
    )
    api_db.add(lib_item)
    api_db.commit()

    # User B requests the stream
    token_b = _user_token(make_token, USER_B_ID)
    response = api_client.get(
        f"/api/v1/audio/{story.slug}/stream",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_protected_audio_unpublished_story_returns_404(api_client, api_db, make_token):
    """Unpublished story stream returns 404 even for an entitled user."""
    story, *_ = _seed_story_with_audio(api_db, status=StoryStatus.DRAFT, slug="draft-protected-story")
    token = _user_token(make_token, USER_A_ID)

    lib_item = LibraryItem(
        user_id=USER_A_ID,
        story_id=story.id,
        access_type="purchased",
        is_active=True,
    )
    api_db.add(lib_item)
    api_db.commit()

    response = api_client.get(
        f"/api/v1/audio/{story.slug}/stream",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
