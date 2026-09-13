from app.models.product import Product


TEST_PRODUCT_SLUG = "ramayana-hindi"
TEST_PRODUCT_NAME = "Ramayana Hindi"


def _create_product(
    api_db,
    *,
    name=TEST_PRODUCT_NAME,
    slug=TEST_PRODUCT_SLUG,
    description="Hindi Ramayana audiobook",
    price="499.00",
    currency="INR",
    product_type="digital",
    is_active=True,
):
    product = Product(
        name=name,
        slug=slug,
        description=description,
        price=price,
        currency=currency,
        product_type=product_type,
        is_active=is_active,
    )
    api_db.add(product)
    api_db.commit()
    api_db.refresh(product)
    return product


def test_list_products_returns_active_products(
    api_client,
    api_db,
):
    """Public product listing returns active products."""
    _create_product(api_db)

    _create_product(
        api_db,
        name="Inactive Product",
        slug="inactive-product",
        is_active=False,
    )

    response = api_client.get("/api/v1/products")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == TEST_PRODUCT_NAME
    assert data[0]["slug"] == TEST_PRODUCT_SLUG
    assert data[0]["price"] == "499.00"
    assert data[0]["currency"] == "INR"
    assert data[0]["product_type"] == "digital"
    assert data[0]["is_active"] is True


def test_get_product_by_slug_returns_active_product(
    api_client,
    api_db,
):
    """Public product lookup returns an active product."""
    _create_product(api_db)

    response = api_client.get(
        f"/api/v1/products/{TEST_PRODUCT_SLUG}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == TEST_PRODUCT_NAME
    assert data["slug"] == TEST_PRODUCT_SLUG


def test_get_product_by_slug_returns_404_for_missing_product(
    api_client,
):
    """Unknown product slugs return 404."""
    response = api_client.get(
        "/api/v1/products/does-not-exist"
    )

    assert response.status_code == 404


def test_get_product_by_slug_does_not_return_inactive_product(
    api_client,
    api_db,
):
    """Inactive products are not publicly accessible."""
    _create_product(
        api_db,
        is_active=False,
    )

    response = api_client.get(
        f"/api/v1/products/{TEST_PRODUCT_SLUG}"
    )

    assert response.status_code == 404


def test_editor_can_create_product(
    api_client,
    api_db,
    make_token,
):
    """Editors can create products."""
    editor_token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )

    response = api_client.post(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={
            "name": "Ramayana English",
            "slug": "ramayana-english",
            "description": "English Ramayana audiobook",
            "price": "599.00",
            "currency": "INR",
            "product_type": "digital",
            "is_active": True,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Ramayana English"
    assert data["slug"] == "ramayana-english"

    product = (
        api_db.query(Product)
        .filter(Product.slug == "ramayana-english")
        .first()
    )

    assert product is not None
    assert product.price == 599


def test_customer_cannot_create_product(
    api_client,
    valid_token,
):
    """Customers cannot create products."""
    response = api_client.post(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={
            "name": "Unauthorized Product",
            "slug": "unauthorized-product",
            "price": "100.00",
            "currency": "INR",
            "product_type": "digital",
        },
    )

    assert response.status_code == 403


def test_unauthenticated_user_cannot_create_product(
    api_client,
):
    """Unauthenticated users cannot create products."""
    response = api_client.post(
        "/api/v1/products",
        json={
            "name": "Unauthorized Product",
            "slug": "unauthorized-product",
            "price": "100.00",
            "currency": "INR",
            "product_type": "digital",
        },
    )

    assert response.status_code == 401


def test_admin_can_delete_product(
    api_client,
    api_db,
    admin_token,
):
    """Administrators can soft-delete products."""
    product = _create_product(api_db)

    response = api_client.delete(
        f"/api/v1/products/{product.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 204

    api_db.expire_all()

    deleted_product = (
        api_db.query(Product)
        .filter(Product.id == product.id)
        .first()
    )

    assert deleted_product is not None
    assert deleted_product.is_deleted is True


def test_editor_cannot_delete_product(
    api_client,
    api_db,
    make_token,
):
    """Editors cannot delete products."""
    product = _create_product(api_db)

    editor_token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )

    response = api_client.delete(
        f"/api/v1/products/{product.id}",
        headers={"Authorization": f"Bearer {editor_token}"},
    )

    assert response.status_code == 403


def test_duplicate_product_slug_returns_409(
    api_client,
    api_db,
    make_token,
):
    """Duplicate product slugs are rejected."""
    _create_product(api_db)

    editor_token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )

    response = api_client.post(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={
            "name": "Another Ramayana",
            "slug": TEST_PRODUCT_SLUG,
            "price": "399.00",
            "currency": "INR",
            "product_type": "digital",
        },
    )

    assert response.status_code == 409


def test_product_update_by_editor(
    api_client,
    api_db,
    make_token,
):
    """Editors can update products."""
    product = _create_product(api_db)

    editor_token = make_token(
        role="editor",
        app_metadata={"role": "editor", "provider": "email"},
        email="editor@storyhour.com",
    )

    response = api_client.patch(
        f"/api/v1/products/{product.id}",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={
            "name": "Updated Ramayana Hindi",
            "price": "549.00",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Updated Ramayana Hindi"
    assert data["price"] == "549.00"


def test_product_update_requires_role(
    api_client,
    api_db,
    valid_token,
):
    """Customers cannot update products."""
    product = _create_product(api_db)

    response = api_client.patch(
        f"/api/v1/products/{product.id}",
        headers={"Authorization": f"Bearer {valid_token}"},
        json={"name": "Unauthorized Update"},
    )

    assert response.status_code == 403
