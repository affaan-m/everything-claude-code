"""AI client factory."""

from __future__ import annotations

from src.models import AIConfig, AIEngine
from src.ai.base import BaseAIClient
from src.ai.claude_client import ClaudeClient


_REGISTRY: dict[AIEngine, type[BaseAIClient]] = {
    AIEngine.CLAUDE: ClaudeClient,
}


def create_ai_client(config: AIConfig) -> BaseAIClient:
    """Factory: return a concrete AI client based on config."""
    client_cls = _REGISTRY.get(config.engine)
    if client_cls is None:
        raise ValueError(
            f"Unsupported AI engine: {config.engine}. "
            f"Available: {', '.join(e.value for e in _REGISTRY)}"
        )
    return client_cls(config)
