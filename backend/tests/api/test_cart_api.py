from app.models.cart import Cart, CartItem
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


def test_unauthenticated_user_cannot_access_cart(
    api_client,
):
    """Visitors cannot access the cart."""
    response = api_client.get("/api/v1/cart")

    assert response.status_code == 401


def test_customer_can_get_empty_cart(
    api_client,
    api_db,
    make_token,
):
    """A customer receives an empty active cart."""
    token = _customer_token(make_token)

    response = api_client.get(
        "/api/v1/cart",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == CUSTOMER_ID
    assert data["status"] == "active"
    assert data["items"] == []
    assert data["subtotal"] == "0.00"
    assert data["total"] == "0.00"

    cart = (
        api_db.query(Cart)
        .filter(Cart.user_id == CUSTOMER_ID)
        .first()
    )

    assert cart is not None
    assert cart.status == "active"


def test_customer_can_add_product_to_cart(
    api_client,
    api_db,
    make_token,
):
    """A customer can add an active product to their cart."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    response = api_client.post(
        "/api/v1/cart/items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == product.id
    assert data["items"][0]["product_name"] == "Ramayana Hindi"
    assert data["items"][0]["quantity"] == 2
    assert data["items"][0]["unit_price"] == "499.00"
    assert data["items"][0]["line_total"] == "998.00"
    assert data["subtotal"] == "998.00"
    assert data["total"] == "998.00"


def test_adding_same_product_increases_quantity(
    api_client,
    api_db,
    make_token,
):
    """Adding an existing product increases its cart quantity."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    first_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert first_response.status_code == 201

    second_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 3,
        },
    )

    assert second_response.status_code == 201

    data = second_response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 5
    assert data["items"][0]["line_total"] == "2495.00"
    assert data["subtotal"] == "2495.00"


def test_inactive_product_cannot_be_added(
    api_client,
    api_db,
    make_token,
):
    """Inactive products cannot be added to carts."""
    product = _create_product(
        api_db,
        is_active=False,
    )
    token = _customer_token(make_token)

    response = api_client.post(
        "/api/v1/cart/items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    assert response.status_code == 404


def test_missing_product_cannot_be_added(
    api_client,
    make_token,
):
    """Unknown products return 404."""
    token = _customer_token(make_token)

    response = api_client.post(
        "/api/v1/cart/items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_id": "does-not-exist",
            "quantity": 1,
        },
    )

    assert response.status_code == 404


def test_cart_quantity_must_be_positive(
    api_client,
    make_token,
):
    """Cart quantities must be at least one."""
    token = _customer_token(make_token)

    response = api_client.post(
        "/api/v1/cart/items",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_id": "some-product",
            "quantity": 0,
        },
    )

    assert response.status_code == 422


def test_customer_can_update_cart_item_quantity(
    api_client,
    api_db,
    make_token,
):
    """A customer can replace an item's quantity."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert add_response.status_code == 201

    item_id = add_response.json()["items"][0]["id"]

    response = api_client.patch(
        f"/api/v1/cart/items/{item_id}",
        headers=headers,
        json={
            "quantity": 4,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["items"][0]["quantity"] == 4
    assert data["items"][0]["line_total"] == "1996.00"
    assert data["subtotal"] == "1996.00"


def test_customer_cannot_update_another_users_cart_item(
    api_client,
    api_db,
    make_token,
):
    """Cart item ownership is enforced."""
    product = _create_product(api_db)

    owner_token = _customer_token(make_token)

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={
            "product_id": product.id,
            "quantity": 1,
        },
    )

    assert add_response.status_code == 201

    item_id = add_response.json()["items"][0]["id"]

    other_token = make_token(
        sub=OTHER_CUSTOMER_ID,
        email="other@storyhour.com",
        role="authenticated",
    )

    response = api_client.patch(
        f"/api/v1/cart/items/{item_id}",
        headers={"Authorization": f"Bearer {other_token}"},
        json={
            "quantity": 10,
        },
    )

    assert response.status_code == 404


def test_customer_can_remove_cart_item(
    api_client,
    api_db,
    make_token,
):
    """Removing an item soft-deletes the cart item."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert add_response.status_code == 201

    item_id = add_response.json()["items"][0]["id"]

    response = api_client.delete(
        f"/api/v1/cart/items/{item_id}",
        headers=headers,
    )

    assert response.status_code == 204

    get_response = api_client.get(
        "/api/v1/cart",
        headers=headers,
    )

    assert get_response.status_code == 200
    assert get_response.json()["items"] == []

    item = (
        api_db.query(CartItem)
        .filter(CartItem.id == item_id)
        .first()
    )

    assert item is not None
    assert item.is_deleted is True


def test_removed_product_can_be_added_again(
    api_client,
    api_db,
    make_token,
):
    """A soft-deleted cart item can be restored when re-added."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert add_response.status_code == 201

    first_item_id = add_response.json()["items"][0]["id"]

    delete_response = api_client.delete(
        f"/api/v1/cart/items/{first_item_id}",
        headers=headers,
    )

    assert delete_response.status_code == 204

    readd_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 3,
        },
    )

    assert readd_response.status_code == 201

    data = readd_response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 3
    assert data["items"][0]["id"] == first_item_id

    item = (
        api_db.query(CartItem)
        .filter(CartItem.id == first_item_id)
        .first()
    )

    assert item is not None
    assert item.is_deleted is False


def test_customer_can_clear_cart(
    api_client,
    api_db,
    make_token,
):
    """Clearing a cart soft-deletes its items."""
    product = _create_product(api_db)
    token = _customer_token(make_token)

    headers = {"Authorization": f"Bearer {token}"}

    add_response = api_client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={
            "product_id": product.id,
            "quantity": 2,
        },
    )

    assert add_response.status_code == 201

    response = api_client.delete(
        "/api/v1/cart",
        headers=headers,
    )

    assert response.status_code == 204

    get_response = api_client.get(
        "/api/v1/cart",
        headers=headers,
    )

    assert get_response.status_code == 200
    assert get_response.json()["items"] == []

    deleted_items = (
        api_db.query(CartItem)
        .filter(CartItem.is_deleted.is_(True))
        .all()
    )

    assert len(deleted_items) == 1


def test_editor_cannot_access_cart(
    api_client,
    make_token,
):
    """Editors do not have customer cart access."""
    editor_token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )

    response = api_client.get(
        "/api/v1/cart",
        headers={"Authorization": f"Bearer {editor_token}"},
    )

    assert response.status_code == 403


def test_admin_cannot_access_cart(
    api_client,
    admin_token,
):
    """Administrators do not have customer cart access."""
    response = api_client.get(
        "/api/v1/cart",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 403
