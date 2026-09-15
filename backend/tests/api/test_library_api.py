import pytest
from fastapi import status

from app.models.library import LibraryItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.story import Story, StoryStatus


USER_A_ID = "33333333-3333-3333-3333-333333333333"
USER_B_ID = "44444444-4444-4444-4444-444444444444"


def _user_token(make_token, user_id):
    return make_token(sub=user_id, email=f"user_{user_id[:8]}@storyhour.com")


def _seed_story(api_db, *, title="Mahabharata Epic", slug="mahabharata-epic"):
    story = Story(
        title=title,
        slug=slug,
        status=StoryStatus.PUBLISHED,
        duration=7200,
        short_description="Epic of the Bharatas",
    )
    api_db.add(story)
    api_db.commit()
    api_db.refresh(story)
    return story


def test_library_endpoint_requires_authentication(api_client):
    """Unauthenticated visitor cannot access personal library."""
    response = api_client.get("/api/v1/library/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_empty_library(api_client, make_token):
    """Authenticated user with no purchases receives empty library container."""
    token = _user_token(make_token, USER_A_ID)
    response = api_client.get(
        "/api/v1/library/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == USER_A_ID
    assert data["items"] == []
    assert data["total_count"] == 0


def test_get_library_with_items(api_client, api_db, make_token):
    """Authenticated user retrieves their personal active library items."""
    story = _seed_story(api_db)
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
        "/api/v1/library/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_count"] == 1
    assert len(data["items"]) == 1
    item = data["items"][0]
    assert item["story_id"] == story.id
    assert item["story"]["title"] == "Mahabharata Epic"
    assert item["story"]["slug"] == "mahabharata-epic"


def test_cross_user_library_isolation(api_client, api_db, make_token):
    """User B cannot see stories in User A's library."""
    story = _seed_story(api_db)
    token_a = _user_token(make_token, USER_A_ID)
    token_b = _user_token(make_token, USER_B_ID)

    # Entitle only User A
    lib_item = LibraryItem(
        user_id=USER_A_ID,
        story_id=story.id,
        access_type="purchased",
        is_active=True,
    )
    api_db.add(lib_item)
    api_db.commit()

    # User B queries their library
    response = api_client.get(
        "/api/v1/library/me",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == USER_B_ID
    assert data["items"] == []
    assert data["total_count"] == 0


def test_duplicate_library_grants_handled_cleanly(api_db):
    """Adding an existing library item reactivates it idempotently rather than duplicating."""
    from app.repositories.library import LibraryRepository
    story = _seed_story(api_db, title="Jataka Tales", slug="jataka-tales")
    repo = LibraryRepository()

    # First grant
    item1 = repo.add_to_library(api_db, user_id=USER_A_ID, story_id=story.id)
    assert item1.is_active is True

    # Second grant (idempotent)
    item2 = repo.add_to_library(api_db, user_id=USER_A_ID, story_id=story.id)
    assert item2.id == item1.id

    # Verify count is 1
    count = (
        api_db.query(LibraryItem)
        .filter(LibraryItem.user_id == USER_A_ID, LibraryItem.story_id == story.id)
        .count()
    )
    assert count == 1


def test_commerce_order_entitlement_integration(api_client, api_db, make_token):
    """User with a confirmed Order containing story product resolves entitlement."""
    from app.services.library_service import LibraryService

    product = Product(
        name="Mahabharata Audio",
        slug="mahabharata-audio",
        price="499.00",
        currency="INR",
        product_type="digital",
        is_active=True,
    )
    api_db.add(product)
    api_db.commit()

    story = _seed_story(api_db, title="Mahabharata", slug="mahabharata-ordered")
    story.product_id = product.id
    api_db.commit()

    # User A buys the product
    order = Order(
        user_id=USER_A_ID,
        status=OrderStatus.CONFIRMED.value,
        currency="INR",
        total="499.00",
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

    # LibraryService verifies entitlement
    service = LibraryService()
    has_access = service.check_user_entitlement(api_db, user_id=USER_A_ID, story=story)
    assert has_access is True

    # And User B does NOT have access
    has_access_b = service.check_user_entitlement(api_db, user_id=USER_B_ID, story=story)
    assert has_access_b is False
