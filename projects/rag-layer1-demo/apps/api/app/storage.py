"""
Storage provider abstraction.

Two implementations:
  - LocalStorageProvider  — writes to/reads from the local filesystem
  - S3StorageProvider     — writes to/reads from an Amazon S3 (or compatible) bucket

Both share the same interface so callers (document_service, extractor) are
completely decoupled from the underlying medium.

Usage
-----
    from app.storage import get_storage_provider

    storage = get_storage_provider()
    key = storage.save(file_bytes, "projects/abc/uuid_report.pdf", "application/pdf")
    # ↑ key is what you store in documents.storage_key

    # When the Celery worker needs the file:
    local_path = storage.get_local_path(key)
    # For local: same path passed straight through.
    # For S3: downloads to a temp file, returns that path.

    storage.delete(key)
"""

from __future__ import annotations

import logging
import os
import tempfile
from abc import ABC, abstractmethod
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)


# ── Abstract base ─────────────────────────────────────────────────────────────

class StorageProvider(ABC):
    """Common interface for all storage backends."""

    @abstractmethod
    def save(self, data: bytes, key: str, content_type: str) -> str:
        """
        Persist *data* under *key* and return the storage key.
        The returned key is what gets stored in documents.storage_key.
        """

    @abstractmethod
    def get_local_path(self, key: str) -> str:
        """
        Return a local filesystem path to the file identified by *key*.
        For local storage this is the key itself.
        For S3 this downloads the object to a temp file and returns that path.
        Callers are responsible for cleaning up temp files when finished.
        """

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete the object identified by *key*. Errors are logged, not raised."""


# ── Local implementation ──────────────────────────────────────────────────────

class LocalStorageProvider(StorageProvider):
    """Stores files on the local filesystem under UPLOAD_DIR."""

    def __init__(self, base_dir: str) -> None:
        self._base = Path(base_dir)

    def save(self, data: bytes, key: str, content_type: str) -> str:
        path = self._base / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return str(path)

    def get_local_path(self, key: str) -> str:
        # For local storage the key IS the absolute path (stored that way by save())
        if not Path(key).exists():
            raise FileNotFoundError(f"File not found: {key}")
        return key

    def delete(self, key: str) -> None:
        try:
            Path(key).unlink(missing_ok=True)
        except OSError as exc:
            logger.error("LocalStorage: failed to delete %s: %s", key, exc)


# ── S3 implementation ─────────────────────────────────────────────────────────

class S3StorageProvider(StorageProvider):
    """
    Stores files in an S3 bucket (or any S3-compatible service such as
    MinIO, Cloudflare R2, DigitalOcean Spaces).

    The storage_key format is the S3 object key (e.g. "projects/abc/uuid_file.pdf").
    It does NOT include the bucket name so the bucket can be changed without
    re-migrating database rows.
    """

    def __init__(
        self,
        bucket: str,
        region: str,
        access_key_id: str,
        secret_access_key: str,
        endpoint_url: str | None = None,
    ) -> None:
        import boto3

        self._bucket = bucket
        self._client = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            **({"endpoint_url": endpoint_url} if endpoint_url else {}),
        )

    def save(self, data: bytes, key: str, content_type: str) -> str:
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        logger.debug("S3: uploaded s3://%s/%s", self._bucket, key)
        return key

    def get_local_path(self, key: str) -> str:
        """
        Download the S3 object to a NamedTemporaryFile and return its path.
        The caller must delete the file when finished (pass delete=False so
        the Celery worker can read it after this method returns).
        """
        suffix = Path(key).suffix or ".tmp"
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        try:
            self._client.download_fileobj(self._bucket, key, tmp)
            tmp.flush()
        except Exception:
            tmp.close()
            os.unlink(tmp.name)
            raise
        tmp.close()
        logger.debug("S3: downloaded s3://%s/%s → %s", self._bucket, key, tmp.name)
        return tmp.name

    def delete(self, key: str) -> None:
        try:
            self._client.delete_object(Bucket=self._bucket, Key=key)
            logger.debug("S3: deleted s3://%s/%s", self._bucket, key)
        except Exception as exc:
            logger.error("S3: failed to delete s3://%s/%s: %s", self._bucket, key, exc)


# ── Factory ───────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def get_storage_provider() -> StorageProvider:
    """
    Return the configured StorageProvider singleton.
    Reads settings at first call and caches the result.
    """
    from app.config import settings  # deferred import avoids circular dependency

    if settings.STORAGE_PROVIDER == "s3":
        missing = [
            name for name, val in [
                ("AWS_S3_BUCKET", settings.AWS_S3_BUCKET),
                ("AWS_REGION", settings.AWS_REGION),
                ("AWS_ACCESS_KEY_ID", settings.AWS_ACCESS_KEY_ID),
                ("AWS_SECRET_ACCESS_KEY", settings.AWS_SECRET_ACCESS_KEY),
            ]
            if not val
        ]
        if missing:
            raise RuntimeError(
                f"STORAGE_PROVIDER=s3 but the following required vars are missing: "
                f"{', '.join(missing)}"
            )
        return S3StorageProvider(
            bucket=settings.AWS_S3_BUCKET,  # type: ignore[arg-type]
            region=settings.AWS_REGION,  # type: ignore[arg-type]
            access_key_id=settings.AWS_ACCESS_KEY_ID,  # type: ignore[arg-type]
            secret_access_key=settings.AWS_SECRET_ACCESS_KEY,  # type: ignore[arg-type]
            endpoint_url=settings.AWS_ENDPOINT_URL or None,
        )

    return LocalStorageProvider(base_dir=settings.UPLOAD_DIR)
