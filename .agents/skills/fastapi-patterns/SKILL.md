---
name: fastapi-patterns
description: FastAPI best practices including async patterns, dependency injection, Pydantic models, OpenAPI docs, error handling, testing, and production deployment.
origin: ECC
---

# FastAPI Development Patterns

Production-ready patterns for building scalable, maintainable APIs with FastAPI.

## When to Activate

- Creating new FastAPI endpoints or routers
- Implementing dependency injection patterns
- Defining Pydantic schemas for request/response validation
- Setting up async database operations
- Configuring OpenAPI documentation
- Adding authentication/authorization middleware
- Writing tests for FastAPI applications
- Optimizing FastAPI performance for production

## Project Structure

### Recommended Layout

```
app/
├── __init__.py
├── main.py              # Application entry point
├── config.py            # Settings and configuration
├── dependencies.py      # Reusable dependencies
├── exceptions.py        # Custom exception handlers
├── api/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── items.py
│   │   └── auth.py
│   └── deps.py          # API-specific dependencies
├── core/
│   ├── __init__.py
│   ├── security.py      # JWT, password hashing
│   └── middleware.py    # Custom middleware
├── db/
│   ├── __init__.py
│   ├── session.py       # Database session factory
│   ├── base.py          # Base class for models
│   └── crud.py          # CRUD operations base
├── models/
│   ├── __init__.py
│   ├── user.py
│   └── item.py
├── schemas/
│   ├── __init__.py
│   ├── user.py
│   └── item.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_users.py
    └── test_items.py
```

### Application Factory Pattern

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import users, items, auth
from app.core.middleware import RateLimitMiddleware
from app.db.session import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Application factory for creating configured FastAPI instances."""
    app = FastAPI(
        title="My API",
        description="Production API with FastAPI",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure per environment
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware)

    # Routes
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(items.router, prefix="/api/v1/items", tags=["items"])

    return app


app = create_app()
```

## Pydantic Schemas

### Request/Response Models

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional
from uuid import UUID


# Base schema with shared fields
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    is_active: bool = True


# Schema for creating users
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


# Schema for updating users
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None


# Schema for database responses
class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime


# Schema for nested responses
class UserWithItemsResponse(UserResponse):
    items: list["ItemResponse"] = []


# Import to resolve forward references
from app.schemas.item import ItemResponse
```

### Validation with Field Constraints

```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    price: float = Field(..., gt=0)  # greater than 0
    quantity: int = Field(default=0, ge=0, le=10000)  # 0 to 10000
    category: Literal["electronics", "clothing", "books"]
    tags: list[str] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name cannot be empty or whitespace")
        return v.strip()

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("price must be positive")
        return v
```

### Nested Schema Validation

```python
class AddressCreate(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "US"


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    customer_id: UUID
    items: list[OrderItemCreate] = Field(..., min_length=1)
    shipping_address: AddressCreate
    notes: Optional[str] = Field(None, max_length=500)
```

## Dependency Injection

### Basic Dependency Pattern

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db_session
from app.models.user import User
from app.core.security import decode_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_db() -> AsyncSession:
    """Dependency for database session."""
    async with get_db_session() as session:
        yield session


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency for authenticated user."""
    try:
        payload = decode_token(token)
        user_id = UUID(payload["sub"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user from database
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
        )

    return user


def require_role(required_role: str):
    """Dependency factory for role-based access control."""
    async def has_role(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return has_role


# Usage in routes
from app.dependencies import get_db, get_current_user, require_role

@router.get("/admin-only")
async def admin_endpoint(
    user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    return {"message": "Admin access granted", "user": user}
```

### Class-Based Dependencies

```python
from dataclasses import dataclass
from typing import Optional


@dataclass
class PaginationParams:
    """Reusable pagination dependency."""
    page: int = 1
    page_size: int = 20
    sort_by: Optional[str] = None
    sort_order: Literal["asc", "desc"] = "asc"

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @classmethod
    def as_depends(
        cls,
        page: int = 1,
        page_size: int = Query(20, le=100),
        sort_by: Optional[str] = None,
        sort_order: Literal["asc", "desc"] = "asc",
    ):
        return cls(
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )


# Usage
@router.get("/items")
async def list_items(
    pagination: PaginationParams = Depends(PaginationParams.as_depends),
):
    items = await get_items(
        offset=pagination.offset,
        limit=pagination.page_size,
        sort_by=pagination.sort_by,
        sort_order=pagination.sort_order,
    )
    return items
```

### Override Dependencies in Tests

```python
# app/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool

from app.main import create_app
from app.db.session import get_db_session


@pytest.fixture
async def client():
    """Test client with overridden dependencies."""
    # Use in-memory SQLite for tests
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async def override_get_db():
        async with AsyncSession(engine) as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app = create_app()
    app.dependency_overrides[get_db_session] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
```

## Async Patterns

### Async Database with SQLAlchemy

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncSession:
    """Get async database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    await engine.dispose()
```

### Async CRUD Operations

```python
# app/db/crud.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import TypeVar, Generic, Type, Optional, List

from app.models.base import BaseModel

T = TypeVar("T", bound=BaseModel)


class CRUDBase(Generic[T]):
    """Base CRUD operations for async SQLAlchemy."""

    def __init__(self, model: Type[T]):
        self.model = model

    async def get(self, db: AsyncSession, id: str) -> Optional[T]:
        result = await db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        offset: int = 0,
        limit: int = 100,
    ) -> List[T]:
        result = await db.execute(
            select(self.model).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, *, obj_in: dict
    ) -> T:
        obj_in_dict = obj_in.model_dump() if hasattr(obj_in, "model_dump") else obj_in
        obj = self.model(**obj_in_dict)
        db.add(obj)
        await db.flush()
        await db.refresh(obj)
        return obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: T,
        obj_in: dict,
    ) -> T:
        obj_in_dict = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, "model_dump") else obj_in
        for field, value in obj_in_dict.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: str) -> None:
        obj = await self.get(db, id=id)
        if obj:
            await db.delete(obj)

    async def count(self, db: AsyncSession) -> int:
        result = await db.execute(
            select(func.count()).select_from(self.model)
        )
        return result.scalar()
```

### Async Context Managers

```python
# app/core/external.py
import httpx
from contextlib import asynccontextmanager


class ExternalAPIClient:
    """Async HTTP client for external APIs."""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=30.0,
            )
        return self._client

    async def get(self, endpoint: str, params: Optional[dict] = None):
        client = await self._get_client()
        response = await client.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()

    async def post(self, endpoint: str, json: dict):
        client = await self._get_client()
        response = await client.post(endpoint, json=json)
        response.raise_for_status()
        return response.json()

    async def close(self):
        if self._client:
            await self._client.aclose()


@asynccontextmanager
async def get_external_client():
    """Dependency for external API client."""
    client = ExternalAPIClient(
        base_url=settings.EXTERNAL_API_URL,
        api_key=settings.EXTERNAL_API_KEY,
    )
    try:
        yield client
    finally:
        await client.close()
```

## Error Handling

### Custom Exception Handlers

```python
# app/exceptions.py
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError


class APIException(Exception):
    """Base exception for API errors."""

    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[dict] = None,
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}


class NotFoundException(APIException):
    def __init__(self, resource: str, id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="not_found",
            message=f"{resource} with id {id} not found",
        )


class ConflictException(APIException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error_code="conflict",
            message=message,
        )


async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                **exc.details,
            }
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "details": exc.errors(),
            }
        },
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": {
                "code": "integrity_error",
                "message": "Database integrity constraint violated",
            }
        },
    )


# Register in app/main.py
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
```

### Raise Exceptions in Routes

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.exceptions import NotFoundException, ConflictException
from app.schemas.user import UserCreate, UserResponse
from app.db.crud import user_crud

router = APIRouter()


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check for existing email
    existing = await user_crud.get_by_email(db, email=user_in.email)
    if existing:
        raise ConflictException("Email already registered")

    # Create user
    user = await user_crud.create(db, obj_in=user_in)
    return user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    user = await user_crud.get(db, id=user_id)
    if not user:
        raise NotFoundException("User", user_id)
    return user
```

## Authentication

### JWT Token Handling

```python
# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
```

### OAuth2 Password Flow

```python
# app/api/routes/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.dependencies import get_db
from app.schemas.token import Token
from app.core.security import verify_password, create_access_token
from app.db.session import AsyncSession
from app.db.crud import user_crud

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """OAuth2 password flow for token-based authentication."""
    user = await user_crud.get_by_email(db, email=form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
        )

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {"access_token": access_token, "token_type": "bearer"}
```

## Testing

### Pytest Fixtures and Tests

```python
# app/tests/test_users.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.tests.utils import create_test_user, get_auth_headers


class TestUserEndpoints:
    """Test user API endpoints."""

    @pytest.mark.asyncio
    async def test_create_user(self, client: TestClient):
        response = client.post(
            "/api/v1/users",
            json={
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "testpass123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data
        assert "password" not in data

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(
        self, client: TestClient, db: AsyncSession
    ):
        # Create existing user
        await create_test_user(db, email="existing@example.com")

        response = client.post(
            "/api/v1/users",
            json={
                "email": "existing@example.com",
                "full_name": "Duplicate User",
                "password": "testpass123",
            },
        )
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "conflict"

    @pytest.mark.asyncio
    async def test_get_user_authenticated(
        self, client: TestClient, db: AsyncSession
    ):
        user = await create_test_user(db)
        headers = get_auth_headers(user.id)

        response = client.get(f"/api/v1/users/{user.id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["id"] == str(user.id)

    @pytest.mark.asyncio
    async def test_get_user_unauthenticated(self, client: TestClient):
        response = client.get("/api/v1/users/some-id")
        assert response.status_code == 401
```

### Test Utilities

```python
# app/tests/utils.py
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import get_password_hash
from app.core.security import create_access_token


def get_auth_headers(user_id: str) -> dict:
    """Generate authenticated headers for testing."""
    token = create_access_token(subject=user_id)
    return {"Authorization": f"Bearer {token}"}


async def create_test_user(
    db: AsyncSession,
    email: str = "test@example.com",
    full_name: str = "Test User",
    password: str = "testpass123",
) -> User:
    """Create a test user in the database."""
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
```

## OpenAPI Documentation

### Customizing OpenAPI Schema

```python
# app/main.py
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi


def custom_openapi(app: FastAPI):
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="My API",
        version="1.0.0",
        description="Production API documentation",
        routes=app.routes,
    )

    # Add custom components
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Add tags metadata
    openapi_schema["tags"] = [
        {"name": "users", "description": "User management"},
        {"name": "auth", "description": "Authentication"},
        {"name": "items", "description": "Item operations"},
    ]

    app.openapi_schema = openapi_schema
    return openapi_schema


app = create_app()
custom_openapi(app)
```

### Response Documentation

```python
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="Retrieve a single user by their unique identifier",
    responses={
        200: {
            "description": "User found",
            "model": UserResponse,
        },
        404: {
            "description": "User not found",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "not_found",
                            "message": "User with id abc-123 not found",
                        }
                    }
                }
            },
        },
    },
    tags=["users"],
)
async def get_user(user_id: str):
    ...
```

## Production Deployment

### Configuration Management

```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Application
    APP_NAME: str = "My API"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

### Uvicorn/Gunicorn Configuration

```python
# gunicorn.conf.py
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "fastapi-app"

# Server mechanics
preload_app = False
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run with gunicorn
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/mydb
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Performance Optimization

### Response Compression

```python
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = create_app()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Caching with Redis

```python
import redis.asyncio as redis
from fastapi import Request
from functools import wraps
import json


class RedisCache:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)

    async def get(self, key: str) -> Optional[any]:
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set(self, key: str, value: any, expire: int = 300):
        await self.redis.setex(key, expire, json.dumps(value))

    async def delete(self, key: str):
        await self.redis.delete(key)


cache = RedisCache(settings.REDIS_URL)


def cached(expire: int = 300):
    """Decorator for caching endpoint responses."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, request: Request = None, **kwargs):
            cache_key = f"{func.__name__}:{request.url.path}:{request.query_params}"
            
            cached_data = await cache.get(cache_key)
            if cached_data:
                return cached_data

            result = await func(*args, **kwargs)
            
            if hasattr(result, "model_dump"):
                await cache.set(cache_key, result.model_dump(), expire)
            else:
                await cache.set(cache_key, result, expire)

            return result
        return wrapper
    return decorator


# Usage
@router.get("/expensive-operation")
@cached(expire=600)
async def expensive_operation():
    # Expensive computation
    return {"result": "cached"}
```

## FastAPI Checklist

Before deploying:

- [ ] Pydantic schemas validate all inputs
- [ ] Dependencies properly injected and testable
- [ ] Async database operations used throughout
- [ ] Custom exception handlers registered
- [ ] Authentication/authorization working
- [ ] OpenAPI docs customized and complete
- [ ] Rate limiting configured
- [ ] CORS properly configured for environment
- [ ] Logging configured (structlog or similar)
- [ ] Health check endpoint added
- [ ] Tests passing with good coverage
- [ ] Docker/production config ready
