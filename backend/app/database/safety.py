import re
from urllib.parse import urlparse
from typing import Optional


# Forbidden cloud host patterns that must NEVER be accessed by integration tests
DISALLOWED_HOST_PATTERNS = [
    re.compile(r"supabase\.(co|in|com)", re.IGNORECASE),
    re.compile(r"amazonaws\.com", re.IGNORECASE),
    re.compile(r"rds\.amazonaws\.com", re.IGNORECASE),
    re.compile(r"azure\.com", re.IGNORECASE),
    re.compile(r"cloudsql", re.IGNORECASE),
    re.compile(r"elephantsql\.com", re.IGNORECASE),
    re.compile(r"neon\.tech", re.IGNORECASE),
    re.compile(r"render\.com", re.IGNORECASE),
]

# Disallowed production or non-test database names
DISALLOWED_DATABASE_NAMES = {
    "postgres",
    "production",
    "prod",
    "storyhour",
    "storyhour_prod",
    "storyhour_production",
    "main",
    "live",
}

# Approved local/container hostnames for test execution
APPROVED_TEST_HOSTS = {
    "localhost",
    "127.0.0.1",
    "postgres",
    "test-postgres",
    "storyhour-postgres",
    "0.0.0.0",
}


def validate_test_database_target(url: Optional[str], environment: str) -> None:
    """
    Validates that a database connection target is safe and approved for integration testing (DB-01).

    Enforces:
    1. Runtime environment must be explicitly 'test'.
    2. Connection URL must not be empty.
    3. Hostname must not match any production cloud providers.
    4. Database name must not be a production or default database.
    5. For PostgreSQL, target must be local/containerized with a dedicated test database name.
    6. Never exposes secrets or connection URLs in error messages.

    Raises:
        RuntimeError: If the configuration fails safety validation.
    """
    # 1. Environment validation
    env_clean = (environment or "").strip().lower()
    if env_clean != "test":
        raise RuntimeError(
            "Unsafe database target rejected: Integration tests can only execute when ENVIRONMENT='test'."
        )

    # 2. URL presence validation
    if not url or not str(url).strip():
        raise RuntimeError(
            "Unsafe database target rejected: No database connection URL provided for testing."
        )

    url_str = str(url).strip()

    # 3. SQLite in-memory or test file targets are inherently isolated
    if url_str.startswith("sqlite"):
        if ":memory:" in url_str or url_str in ("sqlite://", "sqlite:///:memory:"):
            return
        if "test" in url_str.lower():
            return
        raise RuntimeError(
            "Unsafe database target rejected: SQLite target must be in-memory or a dedicated test database."
        )

    # 4. Parse PostgreSQL or other networked database URL safely
    # Convert custom dialects (e.g. postgresql+psycopg://) to standard URI for parsing
    parseable_url = re.sub(r"^[a-zA-Z0-9_+]+://", "http://", url_str)
    try:
        parsed = urlparse(parseable_url)
    except Exception:
        raise RuntimeError(
            "Unsafe database target rejected: Malformed database connection target."
        )

    hostname = (parsed.hostname or "").strip().lower()
    db_name = (parsed.path or "").strip("/").strip().lower()

    # 5. Check against cloud host patterns
    for pattern in DISALLOWED_HOST_PATTERNS:
        if pattern.search(hostname):
            raise RuntimeError(
                "Unsafe database target rejected: Target matches prohibited production cloud host."
            )

    # 6. Check host authorization
    if hostname not in APPROVED_TEST_HOSTS:
        raise RuntimeError(
            "Unsafe database target rejected: Host is not in the approved test database hosts list."
        )

    # 7. Disallow production / default database names
    if db_name in DISALLOWED_DATABASE_NAMES:
        raise RuntimeError(
            f"Unsafe database target rejected: Database name '{db_name}' is forbidden for test execution."
        )

    # 8. Must explicitly be a dedicated test database
    if "test" not in db_name:
        raise RuntimeError(
            "Unsafe database target rejected: Test database name must contain 'test' to guarantee isolation."
        )
