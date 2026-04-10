"""Provider factory — instantiates the correct provider from config."""

from __future__ import annotations

from src.models import AppConfig, ProviderType
from src.providers.base import BaseProvider
from src.providers.bitbucket_provider import BitbucketProvider
from src.providers.github_provider import GitHubProvider
from src.providers.gitlab_provider import GitLabProvider

_REGISTRY: dict[ProviderType, type[BaseProvider]] = {
    ProviderType.GITHUB: GitHubProvider,
    ProviderType.GITLAB: GitLabProvider,
    ProviderType.BITBUCKET: BitbucketProvider,
}


def create_provider(config: AppConfig) -> BaseProvider:
    """Factory: return a concrete provider instance based on config."""
    provider_cls = _REGISTRY.get(config.provider)
    if provider_cls is None:
        raise ValueError(f"Unsupported provider: {config.provider}")

    provider_config = config.providers.get(config.provider.value)
    if provider_config is None:
        raise ValueError(
            f"No provider config for '{config.provider.value}'. "
            f"Check config.yaml or set the appropriate token env var."
        )

    if not provider_config.token:
        raise ValueError(
            f"No API token found for '{config.provider.value}'. "
            f"Set the appropriate environment variable."
        )

    return provider_cls(
        config=provider_config,
        owner=config.repository_owner,
        repo=config.repository_name,
    )
