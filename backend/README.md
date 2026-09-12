# StoryHour Backend API Service

Production-ready FastAPI backend authentication service for StoryHour with Supabase Auth integration, cryptographic JWT verification, and Role-Based Access Control (RBAC).

---

## Architecture & Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app factory, CORS, exception handlers
│   ├── config.py                   # Pydantic Settings & environment variables
│   ├── dependencies.py             # Auth dependencies (get_current_user, require_role, etc.)
│   ├── core/
│   │   ├── __init__.py
│   │   └── logging.py              # Structured logging with credential scrubbing filter
│   ├── services/
│   │   ├── __init__.py
│   │   └── supabase_service.py     # Supabase client manager & JWT verification
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                 # JWT token claims and error schemas
│   │   └── user.py                 # AuthenticatedUser and UserProfileResponse schemas
│   ├── models/
│   │   └── __init__.py             # Database models (for future library/entitlements)
│   └── routers/
│       ├── __init__.py
│       ├── me.py                   # GET /api/me and GET /api/auth/me
│       ├── health.py               # GET /api/health and /
│       └── entitlements.py         # GET /api/library/me & /api/library/admin/overview
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures and token generators
│   └── test_auth.py                # 12 automated unit and integration tests
├── .env.example                    # Environment variables template
├── requirements.txt                # Python backend dependencies
├── run.py                          # Uvicorn dev server launcher (Port 8001)
└── README.md                       # Backend documentation
```

---

## Getting Started

### 1. Install Dependencies
From the repository root or `backend/` folder:
```bash
pip install -r backend/requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```
Fill in your Supabase credentials from your Supabase dashboard (**Project Settings -> API**):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

### 3. Run Automated Tests
```bash
pytest backend/tests/ -v
```

### 4. Start the Backend Server
```bash
python backend/run.py
```
Or navigate into `backend/`:
```bash
cd backend
python run.py
```
The server runs by default at `http://127.0.0.1:8001`.

---

## API Endpoints

- **Discovery**: `GET http://127.0.0.1:8001/`
- **Health Check**: `GET http://127.0.0.1:8001/api/health`
- **User Sign Up**: `POST http://127.0.0.1:8001/api/auth/signup` (Strictly 4 fields: `Name:`, `email id :`, `password :`, `confirm the password :`)
- **User Login**: `POST http://127.0.0.1:8001/api/auth/login` (with email and password)
- **Swagger Docs**: `GET http://127.0.0.1:8001/docs`
- **ReDoc**: `GET http://127.0.0.1:8001/redoc`
- **Current User Profile**: `GET http://127.0.0.1:8001/api/me` (requires `Authorization: Bearer <token>`)
- **User Library Entitlements**: `GET http://127.0.0.1:8001/api/library/me` (requires `Authorization: Bearer <token>`)
- **Admin Dashboard**: `GET http://127.0.0.1:8001/api/library/admin/overview` (requires `admin` role)
