"""
Tests for production security guards in app.config.Settings.

Settings instantiated directly with explicit kwargs (highest priority in
pydantic-settings) to test the model_validator without touching .env.
"""
import warnings

import pytest

from app.config import Settings


def test_default_secret_key_emits_warning():
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        Settings(SECRET_KEY="change-me-in-production", ENVIRONMENT="dev")
    runtime_warnings = [w for w in caught if issubclass(w.category, RuntimeWarning)]
    assert len(runtime_warnings) == 1
    assert "SECRET_KEY" in str(runtime_warnings[0].message)


def test_prod_default_secret_key_raises():
    with pytest.raises(ValueError, match="SECRET_KEY"):
        Settings(
            SECRET_KEY="change-me-in-production",
            ENVIRONMENT="prod",
            ALLOWED_ORIGINS="https://example.com",
        )


def test_prod_wildcard_origins_raises():
    with pytest.raises(ValueError, match="ALLOWED_ORIGINS"):
        Settings(
            SECRET_KEY="strong-production-secret-xyz!",
            ENVIRONMENT="prod",
            ALLOWED_ORIGINS="*",
        )


def test_gemini_provider_without_api_key_raises():
    with pytest.raises(ValueError, match="GOOGLE_API_KEY"):
        Settings(EMBEDDING_PROVIDER="gemini", GOOGLE_API_KEY=None)


def test_valid_prod_config_passes():
    s = Settings(
        SECRET_KEY="strong-production-secret-xyz!",
        ENVIRONMENT="prod",
        ALLOWED_ORIGINS="https://app.example.com",
    )
    assert s.ENVIRONMENT == "prod"
    assert s.ALLOWED_ORIGINS == "https://app.example.com"
