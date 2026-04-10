"""Lint / formatting failure handler."""

from __future__ import annotations

import asyncio
from pathlib import Path

from src.models import FailureType, HandlerConfig, PipelineFailure, RepairAction
from src.ai.base import BaseAIClient
from src.handlers.base import BaseHandler


class LintHandler(BaseHandler):
    """Handles lint and formatting failures (ESLint, Prettier, ruff, etc.).

    Strategy:
    1. Run configured auto-fix commands (e.g., eslint --fix, prettier --write)
    2. If auto-fix tools aren't available, use AI to fix specific files
    """

    def __init__(self, config: HandlerConfig, ai_client: BaseAIClient) -> None:
        super().__init__(config, ai_client)

    @property
    def name(self) -> str:
        return "lint"

    async def can_handle(self, failures: list[PipelineFailure]) -> bool:
        return any(f.failure_type == FailureType.LINT for f in failures)

    async def fix(
        self,
        failures: list[PipelineFailure],
        repo_root: Path,
    ) -> list[RepairAction]:
        lint_failures = [f for f in failures if f.failure_type == FailureType.LINT]
        if not lint_failures:
            return []

        actions: list[RepairAction] = []

        # Step 1: Try auto-fix commands
        for cmd in self._config.commands:
            try:
                proc = await asyncio.create_subprocess_shell(
                    cmd,
                    cwd=str(repo_root),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, stderr = await proc.communicate()

                actions.append(
                    RepairAction(
                        file_path="(multiple)",
                        description=f"Ran auto-fix: {cmd}",
                        diff=stdout.decode(errors="replace")[:1000],
                        handler=self.name,
                    )
                )
            except FileNotFoundError:
                # Tool not installed — fall through to AI fix
                pass

        # Step 2: For files that still have issues, use AI
        affected_files = {f.file_path for f in lint_failures if f.file_path}
        for file_path in affected_files:
            full_path = repo_root / file_path
            if not full_path.exists():
                continue

            content = full_path.read_text(encoding="utf-8")
            error_context = "\n".join(
                f.error_message for f in lint_failures if f.file_path == file_path
            )

            fixed = await self._ai.generate_fix(
                file_path=file_path,
                file_content=content,
                error_context=error_context,
                instruction="Fix all lint and formatting errors in this file.",
            )

            if fixed and fixed != content:
                full_path.write_text(fixed, encoding="utf-8")
                actions.append(
                    RepairAction(
                        file_path=file_path,
                        description=f"AI-fixed lint errors in {file_path}",
                        handler=self.name,
                    )
                )

        return actions
