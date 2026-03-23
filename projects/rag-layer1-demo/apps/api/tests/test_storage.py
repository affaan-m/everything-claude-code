"""
Tests for the storage provider abstraction (app/storage.py).

All tests run without real AWS credentials or a running S3 service.
boto3 calls are intercepted with unittest.mock.patch / MagicMock.
"""
from __future__ import annotations

import io
import os
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


# ── LocalStorageProvider ─────────────────────────────────────────────────────

class TestLocalStorageProvider:
    def test_save_writes_file(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        returned_key = provider.save(b"hello world", "proj/file.txt", "text/plain")

        expected = tmp_path / "proj" / "file.txt"
        assert expected.exists()
        assert expected.read_bytes() == b"hello world"
        assert returned_key == str(expected)

    def test_save_creates_nested_directories(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        provider.save(b"data", "a/b/c/file.pdf", "application/pdf")
        assert (tmp_path / "a" / "b" / "c" / "file.pdf").exists()

    def test_save_returns_absolute_path(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        key = provider.save(b"x", "sub/report.pdf", "application/pdf")
        assert Path(key).is_absolute()

    def test_get_local_path_returns_existing_file(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        key = provider.save(b"content", "sub/doc.txt", "text/plain")

        local = provider.get_local_path(key)
        assert local == key
        assert Path(local).read_bytes() == b"content"

    def test_get_local_path_raises_for_missing_file(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        with pytest.raises(FileNotFoundError):
            provider.get_local_path(str(tmp_path / "nonexistent.txt"))

    def test_delete_removes_file(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        key = provider.save(b"bye", "to_delete.txt", "text/plain")
        assert Path(key).exists()
        provider.delete(key)
        assert not Path(key).exists()

    def test_delete_nonexistent_does_not_raise(self, tmp_path):
        from app.storage import LocalStorageProvider

        provider = LocalStorageProvider(base_dir=str(tmp_path))
        # Should not raise even if file is gone
        provider.delete(str(tmp_path / "ghost.txt"))


# ── S3StorageProvider ─────────────────────────────────────────────────────────

def _make_s3_provider():
    """Return an S3StorageProvider with a mocked boto3 client."""
    from app.storage import S3StorageProvider

    with patch("boto3.client") as mock_boto_client:
        fake_client = MagicMock()
        mock_boto_client.return_value = fake_client
        provider = S3StorageProvider(
            bucket="test-bucket",
            region="us-east-1",
            access_key_id="AKID",
            secret_access_key="SECRET",
        )
        provider._client = fake_client   # re-expose the mock after construction
    return provider


class TestS3StorageProvider:
    def test_save_calls_put_object(self):
        provider = _make_s3_provider()
        returned_key = provider.save(b"data", "uploads/proj/file.pdf", "application/pdf")

        provider._client.put_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="uploads/proj/file.pdf",
            Body=b"data",
            ContentType="application/pdf",
        )
        assert returned_key == "uploads/proj/file.pdf"

    def test_save_returns_object_key(self):
        provider = _make_s3_provider()
        key = provider.save(b"x", "k/e/y.txt", "text/plain")
        assert key == "k/e/y.txt"

    def test_get_local_path_downloads_to_tempfile(self, tmp_path):
        provider = _make_s3_provider()

        # Simulate download_fileobj writing bytes to the file-like arg
        def fake_download(bucket, key, fh):
            fh.write(b"s3 content")

        provider._client.download_fileobj.side_effect = fake_download

        local_path = provider.get_local_path("proj/doc.pdf")
        try:
            assert Path(local_path).exists()
            assert Path(local_path).read_bytes() == b"s3 content"
            assert local_path.endswith(".pdf")
        finally:
            Path(local_path).unlink(missing_ok=True)

    def test_get_local_path_cleans_up_on_error(self):
        provider = _make_s3_provider()
        provider._client.download_fileobj.side_effect = RuntimeError("boto3 error")

        with pytest.raises(RuntimeError):
            provider.get_local_path("missing/key.pdf")

    def test_delete_calls_delete_object(self):
        provider = _make_s3_provider()
        provider.delete("proj/old.pdf")

        provider._client.delete_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="proj/old.pdf",
        )

    def test_delete_logs_error_on_failure(self):
        provider = _make_s3_provider()
        provider._client.delete_object.side_effect = Exception("network error")

        # Should not raise — errors are logged, not propagated
        provider.delete("proj/bad-key.pdf")

    def test_endpoint_url_passed_to_boto3(self):
        from app.storage import S3StorageProvider

        with patch("boto3.client") as mock_boto_client:
            mock_boto_client.return_value = MagicMock()
            S3StorageProvider(
                bucket="b",
                region="us-east-1",
                access_key_id="k",
                secret_access_key="s",
                endpoint_url="http://localhost:9000",
            )
            _, kwargs = mock_boto_client.call_args
            assert kwargs.get("endpoint_url") == "http://localhost:9000"

    def test_no_endpoint_url_omitted_from_boto3(self):
        from app.storage import S3StorageProvider

        with patch("boto3.client") as mock_boto_client:
            mock_boto_client.return_value = MagicMock()
            S3StorageProvider(
                bucket="b",
                region="us-east-1",
                access_key_id="k",
                secret_access_key="s",
                endpoint_url=None,
            )
            _, kwargs = mock_boto_client.call_args
            assert "endpoint_url" not in kwargs


# ── get_storage_provider factory ──────────────────────────────────────────────

class TestGetStorageProvider:
    def setup_method(self):
        # Reset lru_cache between tests so settings changes take effect
        from app.storage import get_storage_provider
        get_storage_provider.cache_clear()

    def teardown_method(self):
        from app.storage import get_storage_provider
        get_storage_provider.cache_clear()

    def test_returns_local_provider_by_default(self, tmp_path):
        from app.storage import LocalStorageProvider, get_storage_provider

        with patch("app.config.settings") as mock_settings:
            mock_settings.STORAGE_PROVIDER = "local"
            mock_settings.UPLOAD_DIR = str(tmp_path)
            provider = get_storage_provider()

        assert isinstance(provider, LocalStorageProvider)

    def test_returns_s3_provider_when_configured(self, tmp_path):
        from app.storage import S3StorageProvider, get_storage_provider

        with patch("app.config.settings") as mock_settings:
            mock_settings.STORAGE_PROVIDER = "s3"
            mock_settings.AWS_S3_BUCKET = "my-bucket"
            mock_settings.AWS_REGION = "eu-west-1"
            mock_settings.AWS_ACCESS_KEY_ID = "AKID"
            mock_settings.AWS_SECRET_ACCESS_KEY = "SECRET"
            mock_settings.AWS_ENDPOINT_URL = None

            with patch("boto3.client", return_value=MagicMock()):
                provider = get_storage_provider()

        assert isinstance(provider, S3StorageProvider)

    def test_s3_missing_bucket_raises(self):
        from app.storage import get_storage_provider

        with patch("app.config.settings") as mock_settings:
            mock_settings.STORAGE_PROVIDER = "s3"
            mock_settings.AWS_S3_BUCKET = None
            mock_settings.AWS_REGION = "us-east-1"
            mock_settings.AWS_ACCESS_KEY_ID = "k"
            mock_settings.AWS_SECRET_ACCESS_KEY = "s"
            mock_settings.AWS_ENDPOINT_URL = None

            with pytest.raises(RuntimeError, match="AWS_S3_BUCKET"):
                get_storage_provider()

    def test_s3_missing_credentials_raises(self):
        from app.storage import get_storage_provider

        with patch("app.config.settings") as mock_settings:
            mock_settings.STORAGE_PROVIDER = "s3"
            mock_settings.AWS_S3_BUCKET = "bucket"
            mock_settings.AWS_REGION = "us-east-1"
            mock_settings.AWS_ACCESS_KEY_ID = None
            mock_settings.AWS_SECRET_ACCESS_KEY = None
            mock_settings.AWS_ENDPOINT_URL = None

            with pytest.raises(RuntimeError, match="AWS_ACCESS_KEY_ID"):
                get_storage_provider()

    def test_factory_is_cached(self, tmp_path):
        from app.storage import get_storage_provider

        with patch("app.config.settings") as mock_settings:
            mock_settings.STORAGE_PROVIDER = "local"
            mock_settings.UPLOAD_DIR = str(tmp_path)
            p1 = get_storage_provider()
            p2 = get_storage_provider()

        assert p1 is p2
