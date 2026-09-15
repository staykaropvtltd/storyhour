from app.models.library import LibraryItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.story import Story


CUSTOMER_ID = "d486d34e-0a56-4293-85f2-2b6b15801c80"
OTHER_CUSTOMER_ID = "11111111-1111-1111-1111-111111111111"


def _customer_token(make_token):
    return make_token(
        sub=CUSTOMER_ID,
        email="customer@storyhour.com",
        role="authenticated",
    )


def _other_customer_token(make_token):
    return make_token(
        sub=OTHER_CUSTOMER_ID,
        email="other@storyhour.com",
        role="authenticated",
    )


def _create_product(api_db, *, name="Ramayana Hindi", price="499.00"):
    product = Product(
        name=name,
        slug=name.lower().replace(" ", "-"),
        description="Digital StoryHour product",
        price=price,
        currency="INR",
        product_type="digital",
        is_active=True,
    )
    api_db.add(product)
    api_db.commit()
    api_db.refresh(product)
    return product


def _create_story(api_db, product, *, title="Ramayana"):
    story = Story(
        title=title,
        slug=title.lower().replace(" ", "-"),
        product_id=product.id,
    )
    api_db.add(story)
    api_db.commit()
    api_db.refresh(story)
    return story


def _create_pending_order(api_db, *, user_id=CUSTOMER_ID, product=None):
    if product is None:
        product = _create_product(api_db)

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

    return order, product


def test_unauthenticated_user_cannot_create_payment(api_client, api_db):
    order, _ = _create_pending_order(api_db)

    response = api_client.post(
        f"/api/v1/payments/{order.id}",
    )

    assert response.status_code == 401


def test_customer_can_create_payment(
    api_client,
    api_db,
    make_token,
):
    order, product = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    response = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["order_id"] == order.id
    assert data["status"] == "pending"
    assert data["stage_1_status"] == "pending"
    assert data["stage_2_status"] == "pending"
    assert data["stage_3_status"] == "pending"
    assert data["amount"] == "499.00"
    assert data["currency"] == product.currency


def test_customer_cannot_create_duplicate_payment(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    first = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert first.status_code == 201

    second = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert second.status_code == 400
    assert second.json()["detail"] == "Payment already exists for this order"


def test_other_customer_cannot_access_payment(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    owner_token = _customer_token(make_token)

    create_response = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    assert create_response.status_code == 201

    other_token = _other_customer_token(make_token)

    response = api_client.get(
        f"/api/v1/payments/{order.id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Order not found"


def test_customer_can_get_payment(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert create_response.status_code == 201

    response = api_client.get(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["order_id"] == order.id


def test_stage_2_cannot_complete_before_stage_1(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert create_response.status_code == 201

    response = api_client.post(
        f"/api/v1/payments/{order.id}/stage/2",
        headers=headers,
    )

    assert response.status_code == 400
    assert "stage 2 cannot be completed before stage 1" in response.json()["detail"]


def test_stage_3_cannot_complete_before_stage_2(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    api_client.post(
        f"/api/v1/payments/{order.id}/stage/1",
        headers=headers,
    )

    response = api_client.post(
        f"/api/v1/payments/{order.id}/stage/3",
        headers=headers,
    )

    assert response.status_code == 400
    assert "stage 3 cannot be completed before stage 2" in response.json()["detail"]


def test_customer_can_complete_three_stage_payment_and_receive_library_access(
    api_client,
    api_db,
    make_token,
):
    order, product = _create_pending_order(api_db)
    story = _create_story(api_db, product)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    assert create_response.status_code == 201

    stage_1_response = api_client.post(
        f"/api/v1/payments/{order.id}/stage/1",
        headers=headers,
        json={"provider_reference": "provider-stage-1"},
    )

    assert stage_1_response.status_code == 200
    assert stage_1_response.json()["stage_1_status"] == "completed"

    stage_2_response = api_client.post(
        f"/api/v1/payments/{order.id}/stage/2",
        headers=headers,
    )

    assert stage_2_response.status_code == 200
    assert stage_2_response.json()["stage_2_status"] == "completed"

    stage_3_response = api_client.post(
        f"/api/v1/payments/{order.id}/stage/3",
        headers=headers,
        json={"provider_reference": "provider-final"},
    )

    assert stage_3_response.status_code == 200

    payment = stage_3_response.json()

    assert payment["status"] == "confirmed"
    assert payment["stage_1_status"] == "completed"
    assert payment["stage_2_status"] == "completed"
    assert payment["stage_3_status"] == "completed"
    assert payment["provider_reference"] == "provider-final"

    api_db.refresh(order)

    assert order.status == OrderStatus.CONFIRMED.value

    library_item = (
        api_db.query(LibraryItem)
        .filter(
            LibraryItem.user_id == CUSTOMER_ID,
            LibraryItem.story_id == story.id,
        )
        .first()
    )

    assert library_item is not None
    assert library_item.is_active is True
    assert library_item.access_type == "purchased"
    assert library_item.source_order_id == order.id


def test_repeating_completed_stage_is_idempotent(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    first = api_client.post(
        f"/api/v1/payments/{order.id}/stage/1",
        headers=headers,
        json={"provider_reference": "stage-one"},
    )

    second = api_client.post(
        f"/api/v1/payments/{order.id}/stage/1",
        headers=headers,
        json={"provider_reference": "different-reference"},
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert second.json()["stage_1_status"] == "completed"
    assert second.json()["provider_reference"] == "stage-one"


def test_stage_3_rolls_back_when_product_has_no_story_mapping(
    api_client,
    api_db,
    make_token,
):
    order, _ = _create_pending_order(api_db)

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    api_client.post(
        f"/api/v1/payments/{order.id}",
        headers=headers,
    )

    api_client.post(
        f"/api/v1/payments/{order.id}/stage/1",
        headers=headers,
    )

    api_client.post(
        f"/api/v1/payments/{order.id}/stage/2",
        headers=headers,
    )

    response = api_client.post(
        f"/api/v1/payments/{order.id}/stage/3",
        headers=headers,
    )

    assert response.status_code == 400
    assert "No story is mapped to product" in response.json()["detail"]

    api_db.refresh(order)

    assert order.status == OrderStatus.PENDING.value
