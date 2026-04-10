"""Validation failure handler (schema validation, agent format, etc.)."""

from __future__ import annotations

from pathlib import Path

from src.models import FailureType, HandlerConfig, PipelineFailure, RepairAction
from src.ai.base import BaseAIClient
from src.handlers.base import BaseHandler


class ValidationHandler(BaseHandler):
    """Handles validation failures (JSON schema, YAML frontmatter, etc.).

    Strategy: Use AI to fix structural / format issues in affected files.
    """

    def __init__(self, config: HandlerConfig, ai_client: BaseAIClient) -> None:
        super().__init__(config, ai_client)

    @property
    def name(self) -> str:
        return "validation"

    async def can_handle(self, failures: list[PipelineFailure]) -> bool:
        return any(f.failure_type == FailureType.VALIDATION for f in failures)

    async def fix(
        self,
        failures: list[PipelineFailure],
        repo_root: Path,
    ) -> list[RepairAction]:
        val_failures = [f for f in failures if f.failure_type == FailureType.VALIDATION]
        if not val_failures:
            return []

        actions: list[RepairAction] = []

        for failure in val_failures:
            if not failure.file_path:
                continue

            full_path = repo_root / failure.file_path
            if not full_path.exists():
                continue

            content = full_path.read_text(encoding="utf-8")

            fixed = await self._ai.generate_fix(
                file_path=failure.file_path,
                file_content=content,
                error_context=f"{failure.error_message}\n\n{failure.raw_log}",
                instruction=(
                    "Fix the validation error in this file. "
                    "Ensure the file conforms to the expected schema or format. "
                    "Preserve all content — only fix structural issues."
                ),
            )

            if fixed and fixed != content:
                full_path.write_text(fixed, encoding="utf-8")
                actions.append(
                    RepairAction(
                        file_path=failure.file_path,
                        description=f"Fixed validation error: {failure.error_message[:100]}",
                        handler=self.name,
                    )
                )

        return actions
