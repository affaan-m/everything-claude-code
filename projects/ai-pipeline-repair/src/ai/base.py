"""Abstract base class for AI clients."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from src.models import AIConfig


class BaseAIClient(ABC):
    """Provider-agnostic AI interface.

    Swap between Claude, OpenAI, or any future model by implementing
    this interface. The repair agent never calls vendor-specific APIs directly.
    """

    def __init__(self, config: AIConfig) -> None:
        self._config = config

    @abstractmethod
    async def analyze_failure(
        self,
        logs: str,
        changed_files: dict[str, str],
        context: str = "",
    ) -> dict[str, Any]:
        """Analyze CI failure logs and return structured diagnosis.

        Returns dict with keys:
        - failure_type: str
        - root_cause: str
        - affected_files: list[str]
        - suggested_fixes: list[dict] each with {file_path, description, code_change}
        - confidence: float (0-1)
        """

    @abstractmethod
    async def generate_fix(
        self,
        file_path: str,
        file_content: str,
        error_context: str,
        instruction: str,
    ) -> str:
        """Generate a fixed version of a file.

        Returns the complete corrected file content.
        """

    @abstractmethod
    async def generate_pr_description(
        self,
        failures: list[dict[str, Any]],
        fixes: list[dict[str, Any]],
        original_branch: str,
    ) -> dict[str, str]:
        """Generate PR title and body from repair context.

        Returns dict with keys:
        - title: str
        - body: str (Markdown)
        """

    async def close(self) -> None:
        """Clean up resources."""
