"""Abstract base class for failure handlers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from src.models import HandlerConfig, PipelineFailure, RepairAction
from src.ai.base import BaseAIClient


class BaseHandler(ABC):
    """Each handler knows how to fix one category of CI failure.

    Handlers are stateless — they receive everything they need via parameters.
    """

    def __init__(self, config: HandlerConfig, ai_client: BaseAIClient) -> None:
        self._config = config
        self._ai = ai_client

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable handler name."""

    @abstractmethod
    async def can_handle(self, failures: list[PipelineFailure]) -> bool:
        """Return True if this handler can address any of the given failures."""

    @abstractmethod
    async def fix(
        self,
        failures: list[PipelineFailure],
        repo_root: Path,
    ) -> list[RepairAction]:
        """Apply fixes and return a list of actions taken.

        Must be idempotent — running twice should not cause damage.
        """
