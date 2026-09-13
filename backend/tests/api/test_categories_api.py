import pytest
from app.models.category import Category


def test_list_categories_active_only(api_client, api_db):
    """Verify category listing returns active categories and excludes inactive ones."""
    cat_active = Category(name="Active Cat", slug="active-cat", is_active=True)
    cat_inactive = Category(name="Inactive Cat", slug="inactive-cat", is_active=False)
    api_db.add_all([cat_active, cat_inactive])
    api_db.commit()

    res = api_client.get("/api/v1/categories")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["slug"] == "active-cat"
    assert data[0]["is_active"] is True


def test_list_categories_alphabetical_ordering(api_client, api_db):
    """Verify categories are ordered alphabetically by name."""
    c_z = Category(name="Zenith", slug="zenith")
    c_a = Category(name="Apex", slug="apex")
    c_m = Category(name="Middle", slug="middle")
    api_db.add_all([c_z, c_a, c_m])
    api_db.commit()

    res = api_client.get("/api/v1/categories")
    assert res.status_code == 200
    data = res.json()
    names = [c["name"] for c in data]
    assert names == ["Apex", "Middle", "Zenith"]


def test_list_categories_pagination(api_client, api_db):
    """Verify limit and skip pagination on categories endpoint."""
    cats = [Category(name=f"Cat {i:02d}", slug=f"cat-{i:02d}") for i in range(5)]
    api_db.add_all(cats)
    api_db.commit()

    res1 = api_client.get("/api/v1/categories?limit=2")
    assert res1.status_code == 200
    assert len(res1.json()) == 2

    res2 = api_client.get("/api/v1/categories?skip=2&limit=2")
    assert res2.status_code == 200
    assert len(res2.json()) == 2
    assert res2.json()[0]["slug"] != res1.json()[0]["slug"]


def test_get_category_by_slug_success(api_client, api_db):
    """Verify retrieving a category by its slug."""
    cat = Category(
        name="Folklore & Fables",
        slug="folklore-fables",
        description="Traditional stories and bedtime tales.",
    )
    api_db.add(cat)
    api_db.commit()

    res = api_client.get("/api/v1/categories/folklore-fables")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Folklore & Fables"
    assert data["slug"] == "folklore-fables"
    assert data["description"] == "Traditional stories and bedtime tales."
    assert "id" in data
    assert "created_at" in data


def test_get_category_by_slug_not_found(api_client):
    """Verify 404 response when querying non-existent category slug."""
    res = api_client.get("/api/v1/categories/unknown-category-slug")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_categories_api_convenience_alias(api_client, api_db):
    """Verify both /api/v1/categories and /api/categories work identically."""
    cat = Category(name="Aliased Cat", slug="aliased-cat")
    api_db.add(cat)
    api_db.commit()

    res_v1 = api_client.get("/api/v1/categories")
    res_root = api_client.get("/api/categories")
    assert res_v1.status_code == 200
    assert res_root.status_code == 200
    assert res_v1.json() == res_root.json()
