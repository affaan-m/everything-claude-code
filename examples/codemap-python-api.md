# Codemap: Python FastAPI Service

> Stack: FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery

## Project Structure

```
app/
  api/
    v1/
      routes/
        users.py        # User CRUD endpoints
        orders.py       # Order management
        health.py       # Health check
      dependencies.py   # Shared dependencies (auth, db session)
    router.py           # API router aggregation
  core/
    config.py           # Settings from environment
    security.py         # JWT, password hashing
    exceptions.py       # Custom exception handlers
  models/
    user.py             # SQLAlchemy User model
    order.py            # SQLAlchemy Order model
    base.py             # Base model with common fields
  schemas/
    user.py             # Pydantic request/response schemas
    order.py            # Order schemas
    common.py           # Shared schemas (pagination, errors)
  services/
    user_service.py     # User business logic
    order_service.py    # Order business logic
    email_service.py    # Email notifications
  repositories/
    user_repo.py        # User database queries
    order_repo.py       # Order database queries
  tasks/
    email_tasks.py      # Celery email tasks
    report_tasks.py     # Async report generation
  db/
    session.py          # Database session factory
    migrations/         # Alembic migrations
tests/
  conftest.py           # Fixtures
  api/                  # API endpoint tests
  services/             # Service layer tests
  repositories/         # Repository tests
```

## Module Responsibilities

| Module | Purpose |
|--------|---------|
| `api/v1/routes/` | HTTP handlers, request parsing, response formatting |
| `services/` | Business logic, orchestration, validation |
| `repositories/` | Database queries, data access |
| `models/` | SQLAlchemy ORM models, table definitions |
| `schemas/` | Pydantic schemas for serialization/validation |
| `core/` | Cross-cutting: config, security, error handling |
| `tasks/` | Async background jobs via Celery |

## Request Flow

```
HTTP Request
  → FastAPI Router (api/v1/routes/*.py)
  → Dependencies (auth, db session)
  → Service Layer (services/*.py)
  → Repository Layer (repositories/*.py)
  → SQLAlchemy → PostgreSQL
  → Pydantic Schema → HTTP Response
```

## Request Lifecycle

```
1. Request arrives at FastAPI
2. Middleware: CORS, request ID, timing
3. Dependency injection: get_db_session(), get_current_user()
4. Route handler validates input (Pydantic schema)
5. Service method contains business logic
6. Repository executes database query
7. Response serialized through Pydantic schema
8. Exception handlers catch and format errors
```

## Database Models

| Model | Key Fields | Indexes |
|-------|-----------|---------|
| `User` | id, email, name, hashed_password, is_active | email (unique) |
| `Order` | id, user_id, status, total, created_at | user_id, status, created_at |
| `OrderItem` | id, order_id, product_id, quantity, price | order_id |

## Dependency Injection

```python
# api/v1/dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(token)
    user = await user_repo.find_by_id(db, payload.sub)
    if not user:
        raise HTTPException(status_code=401)
    return user

# Usage in routes
@router.get("/me")
async def get_profile(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
```

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/auth/login` | No | Get JWT token |
| POST | `/api/v1/auth/register` | No | Create account |
| GET | `/api/v1/users/me` | Yes | Current user profile |
| PATCH | `/api/v1/users/me` | Yes | Update profile |
| GET | `/api/v1/orders` | Yes | List user orders |
| POST | `/api/v1/orders` | Yes | Create order |
| GET | `/api/v1/orders/{id}` | Yes | Get order details |
| GET | `/api/v1/health` | No | Health check |

## Environment Variables

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/myapp
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=<random-secret>
ALLOWED_ORIGINS=http://localhost:3000
SMTP_HOST=smtp.example.com
```

## Testing Strategy

```
tests/conftest.py     → Test database, fixtures, authenticated client
tests/api/            → Endpoint integration tests (TestClient)
tests/services/       → Service unit tests (mocked repos)
tests/repositories/   → Repository tests (real test DB)
```
