import pytest
from app.models.language import Language


def test_list_languages_active_only(api_client, api_db):
    """Verify language listing returns active languages and excludes inactive ones."""
    lang_active = Language(name="Telugu", code="te", native_name="తెలుగు", is_active=True)
    lang_inactive = Language(name="Latin", code="la", native_name="Latina", is_active=False)
    api_db.add_all([lang_active, lang_inactive])
    api_db.commit()

    res = api_client.get("/api/v1/languages")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["code"] == "te"
    assert data[0]["is_active"] is True


def test_list_languages_alphabetical_ordering(api_client, api_db):
    """Verify languages are ordered alphabetically by name."""
    l_te = Language(name="Telugu", code="te")
    l_en = Language(name="English", code="en")
    l_hi = Language(name="Hindi", code="hi")
    api_db.add_all([l_te, l_en, l_hi])
    api_db.commit()

    res = api_client.get("/api/v1/languages")
    assert res.status_code == 200
    data = res.json()
    names = [l["name"] for l in data]
    assert names == ["English", "Hindi", "Telugu"]


def test_list_languages_pagination(api_client, api_db):
    """Verify limit and skip pagination on languages endpoint."""
    langs = [Language(name=f"Lang {i:02d}", code=f"l{i:02d}") for i in range(5)]
    api_db.add_all(langs)
    api_db.commit()

    res1 = api_client.get("/api/v1/languages?limit=2")
    assert res1.status_code == 200
    assert len(res1.json()) == 2

    res2 = api_client.get("/api/v1/languages?skip=2&limit=2")
    assert res2.status_code == 200
    assert len(res2.json()) == 2
    assert res2.json()[0]["code"] != res1.json()[0]["code"]


def test_get_language_by_code_success(api_client, api_db):
    """Verify retrieving language details by ISO code."""
    lang = Language(name="Tamil", code="ta", native_name="தமிழ்")
    api_db.add(lang)
    api_db.commit()

    res = api_client.get("/api/v1/languages/ta")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Tamil"
    assert data["code"] == "ta"
    assert data["native_name"] == "தமிழ்"
    assert "id" in data
    assert "created_at" in data


def test_get_language_by_code_not_found(api_client):
    """Verify 404 response when querying non-existent language code."""
    res = api_client.get("/api/v1/languages/zz")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_languages_api_convenience_alias(api_client, api_db):
    """Verify both /api/v1/languages and /api/languages work identically."""
    lang = Language(name="Sanskrit", code="sa", native_name="संस्कृतम्")
    api_db.add(lang)
    api_db.commit()

    res_v1 = api_client.get("/api/v1/languages")
    res_root = api_client.get("/api/languages")
    assert res_v1.status_code == 200
    assert res_root.status_code == 200
    assert res_v1.json() == res_root.json()
