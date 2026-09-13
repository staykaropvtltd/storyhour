from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product


CUSTOMER_ID = "d486d34e-0a56-4293-85f2-2b6b15801c80"
OTHER_CUSTOMER_ID = "11111111-1111-1111-1111-111111111111"


def _create_product(
    api_db,
    *,
    name="Ramayana Hindi",
    slug="ramayana-hindi",
    price="499.00",
    currency="INR",
    is_active=True,
):
    product = Product(
        name=name,
        slug=slug,
        description="Hindi Ramayana audiobook",
        price=price,
        currency=currency,
        product_type="digital",
        is_active=is_active,
    )
    api_db.add(product)
    api_db.commit()
    api_db.refresh(product)
    return product


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


def test_unauthenticated_user_cannot_create_order(
    api_client,
):
    """Visitors cannot create orders."""
    response = api_client.post("/api/v1/orders")

    assert response.status_code == 401


def test_unauthenticated_user_cannot_list_orders(
    api_client,
):
    """Visitors cannot list orders."""
    response = api_client.get("/api/v1/orders")

    assert response.status_code == 401


def test_customer_cannot_create_order_from_empty_cart(
    api_client,
    make_token,
):
    """An empty cart cannot become an order."""
    token = _customer_token(make_token)

    response = api_client.post(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Cart not found"


def test_customer_can_create_pending_order_from_cart(
    api_client,
    api_db,
    make_token,
):
    """A customer's cart can be converted into a pending order foundation."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    cart_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert cart_response.status_code == 201

    response = api_client.post(
        "/api/v1/orders",
        headers=headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] == CUSTOMER_ID
    assert data["status"] == "pending"
    assert data["currency"] == "INR"
    assert data["subtotal"] == "998.00"
    assert data["total"] == "998.00"

    assert len(data["items"]) == 1

    item = data["items"][0]

    assert item["product_id"] == product.id
    assert item["product_name"] == "Ramayana Hindi"
    assert item["unit_price"] == "499.00"
    assert item["currency"] == "INR"
    assert item["quantity"] == 2
    assert item["line_total"] == "998.00"

    order = (
        api_db.query(Order)
        .filter(Order.id == data["id"])
        .first()
    )

    assert order is not None
    assert order.user_id == CUSTOMER_ID
    assert order.status == "pending"

    order_items = (
        api_db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    assert len(order_items) == 1


def test_order_snapshots_product_details(
    api_client,
    api_db,
    make_token,
):
    """Changing a product does not change the historical order snapshot."""
    product = _create_product(
        api_db,
        name="Original Ramayana",
        price="499.00",
    )

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    assert add_response.status_code == 201

    order_response = api_client.post(
        "/api/v1/orders",
        headers=headers,
    )

    assert order_response.status_code == 201

    order_data = order_response.json()

    assert order_data["items"][0]["product_name"] == "Original Ramayana"
    assert order_data["items"][0]["unit_price"] == "499.00"

    product.name = "Renamed Ramayana"
    product.price = "799.00"

    api_db.commit()

    get_response = api_client.get(
        f"/api/v1/orders/{order_data['id']}",
        headers=headers,
    )

    assert get_response.status_code == 200

    data = get_response.json()

    assert data["items"][0]["product_name"] == "Original Ramayana"
    assert data["items"][0]["unit_price"] == "499.00"
    assert data["items"][0]["line_total"] == "499.00"


def test_customer_can_list_own_orders(
    api_client,
    api_db,
    make_token,
):
    """Customers can list their own orders."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    create_response = api_client.post(
        "/api/v1/orders",
        headers=headers,
    )

    assert create_response.status_code == 201

    response = api_client.get(
        "/api/v1/orders",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["orders"]) == 1
    assert data["orders"][0]["user_id"] == CUSTOMER_ID


def test_customer_can_get_own_order(
    api_client,
    api_db,
    make_token,
):
    """Customers can retrieve their own order."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    create_response = api_client.post(
        "/api/v1/orders",
        headers=headers,
    )

    assert create_response.status_code == 201

    order_id = create_response.json()["id"]

    response = api_client.get(
        f"/api/v1/orders/{order_id}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["id"] == order_id


def test_customer_cannot_get_another_users_order(
    api_client,
    api_db,
    make_token,
):
    """Order ownership is enforced."""
    product = _create_product(api_db)

    owner_token = _customer_token(make_token)
    owner_headers = {
        "Authorization": f"Bearer {owner_token}",
    }

    api_client.post(
        "/api/v1/cart/items",
        headers=owner_headers,
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    create_response = api_client.post(
        "/api/v1/orders",
        headers=owner_headers,
    )

    assert create_response.status_code == 201

    order_id = create_response.json()["id"]

    other_token = _other_customer_token(make_token)

    response = api_client.get(
        f"/api/v1/orders/{order_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )

    assert response.status_code == 404


def test_unknown_order_returns_404(
    api_client,
    make_token,
):
    """Unknown order IDs return 404."""
    token = _customer_token(make_token)

    response = api_client.get(
        "/api/v1/orders/does-not-exist",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_editor_cannot_access_orders(
    api_client,
    make_token,
):
    """Editors do not have customer order access."""
    editor_token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )

    response = api_client.get(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {editor_token}"},
    )

    assert response.status_code == 403


def test_admin_cannot_access_orders(
    api_client,
    admin_token,
):
    """Administrators do not have customer order access."""
    response = api_client.get(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 403


def test_order_created_from_cart_does_not_modify_cart(
    api_client,
    api_db,
    make_token,
):
    """Order foundation does not consume the cart before checkout/payment exists."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    cart_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert cart_response.status_code == 201

    order_response = api_client.post(
        "/api/v1/orders",
        headers=headers,
    )

    assert order_response.status_code == 201

    cart_after_order = api_client.get(
        "/api/v1/cart",
        headers=headers,
    )

    assert cart_after_order.status_code == 200

    cart_data = cart_after_order.json()

    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["product_id"] == product.id
    assert cart_data["items"][0]["quantity"] == 2

def test_inactive_product_prevents_new_order(
    api_client,
    api_db,
    make_token,
):
    """An inactive product prevents order creation."""
    product = _create_product(
        api_db,
        is_active=True,
    )

    token = _customer_token(make_token)
    headers = {"Authorization": f"Bearer {token}"}

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    assert add_response.status_code == 201

    product.is_active = False
    api_db.commit()

    response = api_client.post(
        "/api/v1/orders",
        headers=headers,
    )

    assert response.status_code == 400
    assert "inactive product" in response.json()["detail"].lower()

    order_count = (
        api_db.query(Order)
        .filter(Order.user_id == CUSTOMER_ID)
        .count()
    )

    assert order_count == 0
