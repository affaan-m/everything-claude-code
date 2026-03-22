from pydantic_settings import BaseSettings
from pydantic import field_validator
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

    # ── Upload limits ─────────────────────────
    MAX_FILE_SIZE_MB: int = 25
    MAX_FILES_PER_PROJECT: int = 50

    @field_validator("GOOGLE_API_KEY", mode="before")
    @classmethod
    def check_google_key(cls, v: str | None) -> str | None:
        return v if v else None

    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
