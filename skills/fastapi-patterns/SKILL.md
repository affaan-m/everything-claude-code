---
name: fastapi-patterns
description: FastAPI patterns for building high-performance async Python APIs — project structure, Pydantic v2 models, dependency injection, SQLAlchemy async, authentication, testing, and production deployment.
---

# FastAPI Development Patterns

Production-grade FastAPI patterns for building high-performance, type-safe Python APIs.

## When to Activate

- Building FastAPI web applications or microservices
- Designing async Python REST APIs
- Working with Pydantic v2 models and validation
- Integrating SQLAlchemy async with FastAPI
- Setting up authentication and authorization
- Writing tests for FastAPI endpoints

## Project Structure

### Recommended Layout

```
app/
├── main.py                  # Application entry point
├── config.py                # Settings via pydantic-settings
├── dependencies.py          # Shared dependencies
├── routers/
│   ├── __init__.py
│   ├── users.py             # /users endpoints
│   ├── items.py             # /items endpoints
│   └── auth.py              # /auth endpoints
├── services/
│   ├── __init__.py
│   ├── user_service.py      # Business logic
│   └── item_service.py
├── models/
│   ├── __init__.py
│   ├── user.py              # SQLAlchemy models
│   └── item.py
├── schemas/
│   ├── __init__.py
│   ├── user.py              # Pydantic schemas
│   └── item.py
├── db/
│   ├── __init__.py
│   ├── session.py           # Database session
│   └── migrations/          # Alembic migrations
├── middleware/
│   ├── __init__.py
│   └── logging.py
└── tests/
    ├── conftest.py
    ├── test_users.py
    └── test_items.py
```

## Application Setup

### Entry Point

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routers import users, items, auth
from app.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="My API",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(items.router, prefix="/items", tags=["items"])
```

### Configuration with pydantic-settings

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env"}

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

## Pydantic v2 Schemas

### Request and Response Models

```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}

class PaginatedResponse[T](BaseModel):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int
```

## Dependency Injection

### Database Session

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

engine = create_async_engine(settings.database_url)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Service Dependencies

```python
from fastapi import Depends

class UserService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def get_user(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_user(self, data: UserCreate) -> User:
        user = User(**data.model_dump(exclude={"password"}))
        user.hashed_password = hash_password(data.password)
        self.db.add(user)
        await self.db.flush()
        return user
```

## Router Patterns

### CRUD Endpoints

```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[UserResponse])
async def list_users(
    page: int = 1,
    size: int = 20,
    service: UserService = Depends(),
):
    return await service.list_users(page=page, size=size)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    service: UserService = Depends(),
):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(),
):
    return await service.create_user(data)
```

## Authentication

### JWT with OAuth2

```python
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(*roles: str):
    async def check_role(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return check_role
```

## Error Handling

### Custom Exception Handlers

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    def __init__(self, status_code: int, detail: str, code: str = "error"):
        self.status_code = status_code
        self.detail = detail
        self.code = code

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.code, "detail": exc.detail},
    )
```

## Background Tasks

```python
from fastapi import BackgroundTasks

async def send_welcome_email(email: str, name: str):
    # async email sending logic
    ...

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    background_tasks: BackgroundTasks,
    service: UserService = Depends(),
):
    user = await service.create_user(data)
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    return user
```

## Middleware

### Request Logging

```python
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start
        logger.info(
            "%s %s %d %.3fs",
            request.method, request.url.path,
            response.status_code, duration,
        )
        return response
```

## Testing

### Test Setup with pytest

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import get_db

@pytest.fixture
async def client(test_db):
    app.dependency_overrides[get_db] = lambda: test_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.anyio
async def test_create_user(client: AsyncClient):
    response = await client.post("/users/", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "securepassword123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"

@pytest.mark.anyio
async def test_get_user_not_found(client: AsyncClient):
    response = await client.get("/users/999")
    assert response.status_code == 404
```

## SQLAlchemy Async Models

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, func

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
```

## Checklist

- [ ] All endpoints have response_model and proper status codes
- [ ] Pydantic schemas separate request (Create/Update) from response models
- [ ] Database sessions use dependency injection, not globals
- [ ] Authentication uses `Depends()` chain — not manual token parsing
- [ ] Background tasks for non-blocking operations (email, notifications)
- [ ] Tests use `dependency_overrides` for isolated database sessions
- [ ] Error responses follow a consistent JSON structure
- [ ] CORS middleware configured for allowed origins
