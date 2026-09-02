# StoryHour Backend API

Backend authentication service built with FastAPI, SQLAlchemy, and JWT.

---

## Features

- **User Registration (`/api/auth/signup`)**: Supports first name, last name, email, password, and password confirmation with automated matching validation.
- **User Authentication (`/api/auth/signin`)**: Secure login with email and password using `bcrypt` password hashing.
- **Token Authorization (`/api/auth/me`)**: Protected endpoints utilizing JWT Bearer tokens.
- **Interactive Documentation**: Auto-generated Swagger UI and ReDoc.
- **Testing**: Pytest test suite covering positive and negative test cases.

---

## Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database / ORM**: SQLite (SQLAlchemy)
- **Data Validation**: Pydantic V2
- **Security**: `bcrypt`, `PyJWT`
- **Testing**: `pytest`, `httpx`

---

## Installation & Setup

1. **Clone the repository and checkout the branch:**
   ```bash
   git checkout palamooradithyagoud
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   python run.py
   ```
   *The server runs by default at `http://127.0.0.1:8001`.*

---

## API Reference

### Interactive Docs
- **Swagger UI**: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **ReDoc**: [http://127.0.0.1:8001/redoc](http://127.0.0.1:8001/redoc)

### Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Health check & API status | No |
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/signin` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |

#### Sign Up Request (`POST /api/auth/signup`)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!"
}
```

#### Sign In Request (`POST /api/auth/signin`)
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### Token Response (Sign Up / Sign In)
```json
{
  "access_token": "<jwt_token>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "is_active": true,
    "created_at": "2026-09-02T22:00:00Z"
  }
}
```

---

## Running Tests

Run the test suite with:
```bash
pytest -v
```
