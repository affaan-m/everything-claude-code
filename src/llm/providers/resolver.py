"""Provider factory and resolver."""

from __future__ import annotations

import os

from llm.core.interface import LLMProvider
from llm.core.types import ProviderType
from llm.providers.claude import ClaudeProvider
from llm.providers.openai import OpenAIProvider
from llm.providers.ollama import OllamaProvider


_PROVIDER_MAP: dict[ProviderType, type[LLMProvider]] = {
    ProviderType.CLAUDE: ClaudeProvider,
    ProviderType.OPENAI: OpenAIProvider,
    ProviderType.OLLAMA: OllamaProvider,
}


def get_provider(provider_type: ProviderType | str | None = None, **kwargs: str) -> LLMProvider:
    if provider_type is None:
        provider_type = os.environ.get("LLM_PROVIDER", "claude").lower()

    if isinstance(provider_type, str):
        try:
            provider_type = ProviderType(provider_type)
        except ValueError:
            raise ValueError(f"Unknown provider type: {provider_type}. Valid types: {[p.value for p in ProviderType]}")

    provider_cls = _PROVIDER_MAP.get(provider_type)
    if not provider_cls:
        raise ValueError(f"No provider registered for type: {provider_type}")

    return provider_cls(**kwargs)


def register_provider(provider_type: ProviderType, provider_cls: type[LLMProvider]) -> None:
    _PROVIDER_MAP[provider_type] = provider_cls
