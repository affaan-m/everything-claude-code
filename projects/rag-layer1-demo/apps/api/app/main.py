import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from redis import Redis
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.core.rate_limit import limiter
from app.database import SessionLocal
from app.routers import api_keys, auth, documents, projects, retrieve, sessions


logger = logging.getLogger("app.request")

app = FastAPI(
    title="RAG Layer 1 API",
    description="Headless RAG ingestion and retrieval service",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "prod" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "prod" else None,
)

parsed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=parsed_origins if settings.ALLOWED_ORIGINS != "*" else ["*"],
    allow_credentials=bool(settings.ALLOWED_ORIGINS != "*"),  # Only with credentials if restricted
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    started_at = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = (time.perf_counter() - started_at) * 1000
        logger.exception(
            "request_failed request_id=%s method=%s path=%s client_ip=%s duration_ms=%.2f",
            request_id,
            request.method,
            request.url.path,
            client_ip,
            elapsed_ms,
        )
        raise

    elapsed_ms = (time.perf_counter() - started_at) * 1000
    logger.info(
        "request request_id=%s method=%s path=%s status_code=%s client_ip=%s duration_ms=%.2f",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        client_ip,
        elapsed_ms,
    )
    response.headers["X-Request-ID"] = request_id
    return response

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(api_keys.router, prefix=API_PREFIX)
app.include_router(documents.router, prefix=API_PREFIX)
app.include_router(retrieve.router, prefix=API_PREFIX)
app.include_router(sessions.router, prefix=API_PREFIX)


@app.get("/health")
def health():
    services = {
        "api": "ok",
        "db": "ok",
        "redis": "ok",
    }
    status_code = 200

    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        services["db"] = "error"
        status_code = 503
    finally:
        db.close()

    try:
        Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1, socket_timeout=1).ping()
    except Exception:
        services["redis"] = "error"
        status_code = 503

    payload = {
        "status": "ok" if status_code == 200 else "degraded",
        "services": services,
    }
    return JSONResponse(status_code=status_code, content=payload)
