"""Tests for the provider factory and base interface."""

from __future__ import annotations

import pytest

from src.models import AIEngine, AppConfig, ProviderConfig, ProviderType, AIConfig, RepairConfig
from src.providers.factory import create_provider
from src.providers.github_provider import GitHubProvider
from src.providers.gitlab_provider import GitLabProvider
from src.providers.bitbucket_provider import BitbucketProvider


def _make_config(provider: ProviderType, token: str = "test-token") -> AppConfig:
    """Helper to create a minimal AppConfig for testing."""
    providers = {
        provider.value: ProviderConfig(
            api_url={
                "github": "https://api.github.com",
                "gitlab": "https://gitlab.com/api/v4",
                "bitbucket": "https://api.bitbucket.org/2.0",
            }[provider.value],
            token=token,
        )
    }
    return AppConfig(
        provider=provider,
        providers=providers,
        ai=AIConfig(),
        repository_owner="test-owner",
        repository_name="test-repo",
        repair=RepairConfig(),
    )


def test_create_github_provider():
    config = _make_config(ProviderType.GITHUB)
    provider = create_provider(config)
    assert isinstance(provider, GitHubProvider)


def test_create_gitlab_provider():
    config = _make_config(ProviderType.GITLAB)
    provider = create_provider(config)
    assert isinstance(provider, GitLabProvider)


def test_create_bitbucket_provider():
    config = _make_config(ProviderType.BITBUCKET)
    provider = create_provider(config)
    assert isinstance(provider, BitbucketProvider)


def test_missing_provider_config():
    """Should raise if provider config section is missing."""
    config = AppConfig(
        provider=ProviderType.GITHUB,
        providers={},  # no github config
        repository_owner="test",
        repository_name="test",
    )
    with pytest.raises(ValueError, match="No provider config"):
        create_provider(config)


def test_missing_token():
    """Should raise if token is empty."""
    config = _make_config(ProviderType.GITHUB, token="")
    with pytest.raises(ValueError, match="No API token"):
        create_provider(config)
