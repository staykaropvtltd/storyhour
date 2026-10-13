# StoryHour Backend API Service

Production-ready FastAPI backend authentication service for StoryHour with Supabase Auth integration, cryptographic JWT verification, and Role-Based Access Control (RBAC).

---

## Architecture & Directory Structure

```text
backend/
├── alembic/                    # Alembic database migrations
│   ├── versions/               # Schema revision migration scripts
│   └── env.py                  # Alembic runtime environment & model metadata
├── app/
│   ├── main.py                 # FastAPI application factory, lifespan, CORS, error handlers
│   ├── config.py               # Pydantic Settings & environment variable validation
│   ├── dependencies.py         # Auth & RBAC dependencies (get_current_user, require_role, etc.)
│   ├── core/
│   │   ├── logging.py          # Structured logging with credential scrubbing filter
│   │   ├── rate_limit.py       # In-memory sliding-window IP rate limiting
│   │   └── caching.py          # ETag response caching middleware
│   ├── database/
│   │   ├── session.py          # SQLAlchemy engine, QueuePool, and SessionLocal factory
│   │   ├── base.py             # Declarative Base and SaaS mixins (UUID, Timestamps, SoftDelete)
│   │   ├── repository.py       # Generic BaseRepository CRUD pattern
│   │   ├── health.py           # Database connectivity probe and diagnostics
│   │   └── init_db.py          # Startup database reachability check
│   ├── models/                 # SQLAlchemy domain models (Stories, Audio, Library, Orders, etc.)
│   ├── schemas/                # Pydantic request/response schemas (Auth, User, Story, Contact, etc.)
│   ├── services/               # Domain services (supabase_service, story_service, etc.)
│   └── routers/                # FastAPI API routers (auth, me, stories, audio, contact, etc.)
├── tests/
│   ├── conftest.py             # Pytest fixtures, in-memory SQLite db, token factory
│   ├── api/                    # API and security regression test suites
│   ├── test_auth.py            # Authentication unit tests
│   ├── test_login.py           # 8-point login test matrix (isolated from live Supabase)
│   ├── test_signup.py          # 4-field signup schema and API tests
│   └── test_database.py        # Database repository and diagnostic tests
├── .env.example                # Environment variables template
├── alembic.ini                 # Alembic configuration
├── pytest.ini                  # Pytest configuration with integration marker isolation
├── requirements.txt            # Python backend dependencies
├── run.py                      # Uvicorn dev server launcher (Port 8001)
└── README.md                   # Backend documentation
```

---

## Configuration & Environment Variables

Create `.env` by copying `.env.example`:
```bash
cp backend/.env.example backend/.env
```

Configure variables by **name only** (never commit secrets to version control):

| Variable Name | Description | Example / Default |
|---|---|---|
| `PROJECT_NAME` | Service display name | `StoryHour Backend API` |
| `VERSION` | Service version | `1.0.0` |
| `ENVIRONMENT` | Runtime mode (`development`, `test`, `production`) | `development` |
| `HOST` | Bind address | `127.0.0.1` |
| `PORT` | Bind port | `8001` |
| `CORS_ORIGINS` | Allowed CORS origins list (No `*` when credentials enabled) | `["http://localhost:3000"]` |
| `DATABASE_URL` | PostgreSQL connection string (`psycopg` driver) | `postgresql+psycopg://postgres:postgres@localhost:5432/storyhour` |
| `DB_POOL_SIZE` | SQLAlchemy steady-state connection pool size | `10` (1–50) |
| `DB_MAX_OVERFLOW` | SQLAlchemy burst connection overflow allowance | `20` (0–50) |
| `DB_CONNECT_TIMEOUT` | PostgreSQL network connect timeout in seconds | `5` (1–30) |
| `DB_POOL_TIMEOUT` | Seconds to wait for available connection from pool | `30` |
| `DB_POOL_RECYCLE` | Stale connection recycle interval in seconds | `1800` (60–7200) |
| `AUTH_MODE` | Token verification mode (`supabase` or `local`) | `supabase` (prod) / `local` (dev/test) |
| `SUPABASE_URL` | Supabase project URL | `https://<project-id>.supabase.co` |
| `SUPABASE_ANON_KEY` | Public anonymous API key | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Administrative service-role key | Private admin key |
| `SUPABASE_JWT_SECRET` | Secret key for local HS256 JWT decoding | Min 32-character secret |
| `SUPABASE_JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_AUDIENCE` | Expected JWT audience claim | `authenticated` |
| `RATE_LIMIT_ENABLED` | Global toggle for rate limiting | `true` |
| `RATE_LIMIT_STORAGE` | Rate limiting backend (`memory` or `redis`) | `memory` |
| `REDIS_URL` | Centralized Redis connection URL for distributed rate limiting | `redis://localhost:6379/0` (Optional) |
| `ENABLE_HSTS` | Strict-Transport-Security header toggle (production only) | `false` |

---

### Database Connection Pool Budgeting (DB-04)

The theoretical maximum database connection budget is calculated as:
$$\text{Max Connections} = \text{Worker Processes} \times \text{Container Replicas} \times (\text{DB\_POOL\_SIZE} + \text{DB\_MAX\_OVERFLOW})$$

- **Direct PostgreSQL Connections (Port 5432):**
  - Supabase Free / Nano tier allows ~60 direct connections. Micro tier allows ~120 connections.
  - For multi-worker deployments (e.g. 4 Uvicorn workers × 2 replicas = 8 processes), set `DB_POOL_SIZE=5` and `DB_MAX_OVERFLOW=5` so maximum connections remain $\le 80$.
- **Supabase Transaction Pooler (Port 6543 / Supavisor):**
  - When connecting to Supavisor, connection pooling is handled externally by Supavisor. Client-side pool sizes can be reduced accordingly.

### Database Connection Timeout & Degraded Startup (DB-03)

- PostgreSQL connections enforce an explicit network connect timeout (`DB_CONNECT_TIMEOUT=5` seconds) via `psycopg` `connect_args`.
- If PostgreSQL is unreachable at application startup, the startup probe aborts after 5 seconds instead of hanging. The service boots in degraded mode, reporting `503 Service Unavailable` on `/health/ready` while keeping `/health/live` responsive.

---

## Database Setup & Alembic Migrations

The application manages PostgreSQL database schemas exclusively via **Alembic**. Tables are never created or altered automatically during startup.

### 1. Local Database Setup (Docker)
Start a local PostgreSQL container:
```bash
docker run -d --name storyhour-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=storyhour \
  -p 5432:5432 postgres:15-alpine
```

### 2. Inspect Migration Status
From the `backend/` directory:
```bash
cd backend
alembic current
```

### 3. Apply Migrations
Apply all pending schema migrations up to the latest revision (`head`):
```bash
cd backend
alembic upgrade head
```

### 4. Rollback Migrations
Roll back the most recent migration:
```bash
cd backend
alembic downgrade -1
```

### 5. Generate New Migrations (Schema Changes)
When modifying SQLAlchemy models under `backend/app/models/`:
```bash
cd backend
alembic revision --autogenerate -m "describe_model_changes_here"
```
Review the generated file under `backend/alembic/versions/` before applying.

> [!WARNING]
> **Production Safety Rule**: Never run migrations automatically on application startup. In production or staging deployments, run `alembic upgrade head` as a separate, pre-deployment task in your CI/CD pipeline.

---

## Automated Testing

The test suite is partitioned into **isolated unit tests** (default) and **optional integration tests** via `pytest.ini`.

### 1. Run Isolated Unit Tests (Default)
Runs all unit, schema, service, and security regression tests against an in-memory SQLite database without network access:
```bash
python -m pytest backend/tests/ -v
```
All external Supabase API calls and PostgreSQL connections are mocked or bypassed.

### 2. Run Optional Live Integration Tests
Runs tests that connect to a live PostgreSQL instance configured in `DATABASE_URL`:
```bash
python -m pytest backend/tests/ -v -m integration
```

---

## Running the Application

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Start Uvicorn Server
```bash
python backend/run.py
```
The API is available at `http://127.0.0.1:8001`. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8001/docs`.

