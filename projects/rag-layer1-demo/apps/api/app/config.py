import warnings
from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Literal


class Settings(BaseSettings):
    # ── Database ──────────────────────────────
    DATABASE_URL: str = "postgresql://rag:ragpassword@localhost:5432/rag_layer1"

    # ── Redis ─────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Security ──────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALLOWED_ORIGINS: str = "*"  # Tighten in production

    # ── Environment ───────────────────────────
    ENVIRONMENT: Literal["dev", "prod"] = "dev"

    # ── Embedding ─────────────────────────────
    EMBEDDING_PROVIDER: Literal["mock", "gemini"] = "mock"
    EMBEDDING_MODEL: str = "text-embedding-004"
    EMBEDDING_DIMENSIONS: int = 768
    EMBEDDING_BATCH_SIZE: int = 256

    GOOGLE_API_KEY: str | None = None

    # ── Storage ───────────────────────────────
    STORAGE_PROVIDER: Literal["local", "s3"] = "local"
    UPLOAD_DIR: str = "./uploads"

    # ── S3 / S3-compatible storage ─────────────────────────────────────────
    # Required when STORAGE_PROVIDER=s3.
    # For local MinIO / LocalStack set AWS_ENDPOINT_URL (e.g. http://localhost:9000)
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str | None = None
    AWS_ENDPOINT_URL: str | None = None   # optional: MinIO, LocalStack, R2 …
    AWS_S3_KEY_PREFIX: str = "uploads"    # optional prefix for all S3 object keys

    # ── Upload limits ─────────────────────────
    MAX_FILE_SIZE_MB: int = 25
    MAX_FILES_PER_PROJECT: int = 50

    @model_validator(mode="after")
    def validate_security_settings(self) -> "Settings":
        if self.SECRET_KEY == "change-me-in-production":
            warnings.warn(
                "SECRET_KEY is using default value. Set a strong SECRET_KEY in .env!",
                RuntimeWarning,
                stacklevel=2,
            )
            if self.ENVIRONMENT == "prod":
                raise ValueError("SECRET_KEY must be set explicitly in production environment")

        if self.ENVIRONMENT == "prod" and self.ALLOWED_ORIGINS.strip() == "*":
            raise ValueError("ALLOWED_ORIGINS cannot be '*' in production")

        if self.EMBEDDING_PROVIDER == "gemini" and not self.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is required when EMBEDDING_PROVIDER=gemini")

        if self.STORAGE_PROVIDER == "s3" and not self.AWS_S3_BUCKET:
            raise ValueError("AWS_S3_BUCKET is required when STORAGE_PROVIDER=s3")

        return self

    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
