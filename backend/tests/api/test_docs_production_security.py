import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import create_app


@pytest.fixture(autouse=True)
def restore_environment_settings(monkeypatch):
    """Ensure settings are cleanly restored after each test."""
    orig_env = settings.ENVIRONMENT
    orig_override = getattr(settings, "ENABLE_DOCS_IN_PROD", False)
    yield
    settings.ENVIRONMENT = orig_env
    settings.ENABLE_DOCS_IN_PROD = orig_override


def test_docs_available_in_development_environment(monkeypatch):
    """BT-14: In development, /docs, /redoc, and /openapi.json are accessible."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(settings, "ENABLE_DOCS_IN_PROD", False)

    app = create_app()
    with TestClient(app) as client:
        assert client.get("/docs").status_code == 200
        assert client.get("/redoc").status_code == 200
        assert client.get("/openapi.json").status_code == 200

        root_res = client.get("/")
        assert root_res.status_code == 200
        assert root_res.json().get("docs") == "/docs"
        assert root_res.json().get("redoc") == "/redoc"


def test_docs_available_in_test_environment(monkeypatch):
    """BT-14: In test environment, documentation endpoints remain available."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "test")
    monkeypatch.setattr(settings, "ENABLE_DOCS_IN_PROD", False)

    app = create_app()
    with TestClient(app) as client:
        assert client.get("/docs").status_code == 200
        assert client.get("/redoc").status_code == 200
        assert client.get("/openapi.json").status_code == 200


def test_docs_disabled_in_production_by_default(monkeypatch):
    """BT-14: In production, documentation endpoints return 404 by default."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "ENABLE_DOCS_IN_PROD", False)

    app = create_app()
    with TestClient(app) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/redoc").status_code == 404
        assert client.get("/openapi.json").status_code == 404

        root_res = client.get("/")
        assert root_res.status_code == 200
        data = root_res.json()
        assert "docs" not in data
        assert "redoc" not in data


def test_docs_enabled_in_production_with_explicit_override(monkeypatch):
    """BT-14: When ENABLE_DOCS_IN_PROD=True in production, docs are explicitly enabled."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "ENABLE_DOCS_IN_PROD", True)

    app = create_app()
    with TestClient(app) as client:
        assert client.get("/docs").status_code == 200
        assert client.get("/redoc").status_code == 200
        assert client.get("/openapi.json").status_code == 200


@pytest.mark.parametrize("falsy_value", [False, "false", "0", "no", "", None])
def test_docs_disabled_in_production_with_falsy_override(monkeypatch, falsy_value):
    """BT-14: Falsy string and boolean overrides do not accidentally enable docs."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    parsed_override = settings.parse_enable_docs_in_prod(falsy_value)
    monkeypatch.setattr(settings, "ENABLE_DOCS_IN_PROD", parsed_override)

    app = create_app()
    with TestClient(app) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/redoc").status_code == 404
        assert client.get("/openapi.json").status_code == 404


def test_api_endpoints_work_regardless_of_docs_status(monkeypatch):
    """BT-14: Standard API endpoints continue to work normally when docs are disabled."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "ENABLE_DOCS_IN_PROD", False)
    monkeypatch.setattr("app.routers.health.check_database_health", lambda: True)

    app = create_app()
    with TestClient(app) as client:
        health_res = client.get("/api/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "healthy"

        live_res = client.get("/api/health/live")
        assert live_res.status_code == 200
        assert live_res.json()["status"] == "alive"
