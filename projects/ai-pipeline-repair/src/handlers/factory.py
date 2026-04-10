"""Handler registry and factory."""

from __future__ import annotations

from src.models import AppConfig, FailureType, HandlerConfig
from src.ai.base import BaseAIClient
from src.handlers.base import BaseHandler
from src.handlers.lint_handler import LintHandler
from src.handlers.test_handler import TestHandler
from src.handlers.coverage_handler import CoverageHandler
from src.handlers.validation_handler import ValidationHandler


_HANDLER_REGISTRY: dict[str, type[BaseHandler]] = {
    "lint": LintHandler,
    "test": TestHandler,
    "coverage": CoverageHandler,
    "validation": ValidationHandler,
}


def create_handlers(config: AppConfig, ai_client: BaseAIClient) -> list[BaseHandler]:
    """Create all enabled handlers from config."""
    handlers: list[BaseHandler] = []

    for name, handler_cls in _HANDLER_REGISTRY.items():
        handler_config = config.handlers.get(name, HandlerConfig())
        if handler_config.enabled:
            handlers.append(handler_cls(config=handler_config, ai_client=ai_client))

    return handlers
