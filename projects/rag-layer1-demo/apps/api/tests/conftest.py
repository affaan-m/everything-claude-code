"""
Pytest configuration and shared fixtures.
Uses a dedicated test database (DATABASE_URL_TEST env or in-memory SQLite fallback).
"""

import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import sessionmaker
from pgvector.sqlalchemy import VECTOR

from app.database import Base, get_db
from app.core.rate_limit import limiter
from app.main import app

TEST_DATABASE_URL = os.getenv(
    "DATABASE_URL_TEST",
    "sqlite:///./.pytest_rag_layer1.db",
)


# Compile PostgreSQL-only types to SQLite-compatible equivalents in tests.
@compiles(UUID, "sqlite")
def _compile_uuid_for_sqlite(_type, _compiler, **_kw):
    return "CHAR(36)"


@compiles(JSONB, "sqlite")
def _compile_jsonb_for_sqlite(_type, _compiler, **_kw):
    return "JSON"


@compiles(VECTOR, "sqlite")
def _compile_vector_for_sqlite(_type, _compiler, **_kw):
    return "BLOB"


@pytest.fixture(scope="session")
def engine():
    engine_kwargs = {"pool_pre_ping": True}
    if TEST_DATABASE_URL.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}

    _engine = create_engine(TEST_DATABASE_URL, **engine_kwargs)
    Base.metadata.create_all(bind=_engine)
    yield _engine
    Base.metadata.drop_all(bind=_engine)
    _engine.dispose()


@pytest.fixture(scope="function")
def db_session(engine):
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def _toggle_rate_limiter_for_tests(request):
    """Enable limiter only for dedicated rate-limit tests."""
    previous = getattr(limiter, "enabled", True)
    limiter.enabled = request.module.__name__.endswith("test_rate_limits")
    try:
        yield
    finally:
        limiter.enabled = previous


@pytest.fixture
def registered_user(client):
    test_ip = f"10.250.{uuid.uuid4().int % 255}.{uuid.uuid4().int % 255}"
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "password123"},
        headers={"X-Forwarded-For": test_ip},
    )
    assert resp.status_code == 201
    return resp.json()["data"]


@pytest.fixture
def auth_headers(client, registered_user):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def project(client, auth_headers):
    resp = client.post(
        "/api/v1/projects",
        json={"name": "Test Project"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()["data"]
