"""Coverage failure handler."""

from __future__ import annotations

from pathlib import Path

from src.models import FailureType, HandlerConfig, PipelineFailure, RepairAction
from src.ai.base import BaseAIClient
from src.handlers.base import BaseHandler


class CoverageHandler(BaseHandler):
    """Handles code coverage threshold failures.

    Strategy:
    1. Identify under-covered files from the coverage report
    2. Use AI to generate missing tests for those files
    """

    def __init__(self, config: HandlerConfig, ai_client: BaseAIClient) -> None:
        super().__init__(config, ai_client)

    @property
    def name(self) -> str:
        return "coverage"

    async def can_handle(self, failures: list[PipelineFailure]) -> bool:
        return any(f.failure_type == FailureType.COVERAGE for f in failures)

    async def fix(
        self,
        failures: list[PipelineFailure],
        repo_root: Path,
    ) -> list[RepairAction]:
        coverage_failures = [f for f in failures if f.failure_type == FailureType.COVERAGE]
        if not coverage_failures:
            return []

        actions: list[RepairAction] = []

        # Extract affected files from logs
        affected_files: set[str] = set()
        for failure in coverage_failures:
            if failure.file_path:
                affected_files.add(failure.file_path)

        # If no specific files identified, use AI to analyze the coverage report
        if not affected_files:
            error_context = "\n".join(f.raw_log for f in coverage_failures)
            diagnosis = await self._ai.analyze_failure(
                logs=error_context,
                changed_files={},
                context="Focus on identifying which files need more test coverage.",
            )
            affected_files = set(diagnosis.get("affected_files", []))

        for file_path in affected_files:
            full_path = repo_root / file_path
            if not full_path.exists():
                continue

            source_content = full_path.read_text(encoding="utf-8")
            error_context = "\n".join(
                f.error_message for f in coverage_failures
            )

            # Generate test file
            test_file_path = _derive_test_path(file_path)
            test_full_path = repo_root / test_file_path

            existing_tests = ""
            if test_full_path.exists():
                existing_tests = test_full_path.read_text(encoding="utf-8")

            new_tests = await self._ai.generate_fix(
                file_path=test_file_path,
                file_content=existing_tests,
                error_context=error_context,
                instruction=(
                    f"Generate or extend tests for {file_path} to improve coverage.\n\n"
                    f"Source file content:\n{source_content[:4000]}\n\n"
                    f"{'Existing test file content:' + chr(10) + existing_tests[:2000] if existing_tests else 'No existing test file — create one from scratch.'}\n\n"
                    "Write thorough tests covering untested branches and edge cases. "
                    "Follow existing test patterns if present."
                ),
            )

            if new_tests:
                test_full_path.parent.mkdir(parents=True, exist_ok=True)
                test_full_path.write_text(new_tests, encoding="utf-8")
                actions.append(
                    RepairAction(
                        file_path=test_file_path,
                        description=f"Generated/updated tests for {file_path}",
                        handler=self.name,
                    )
                )

        return actions


def _derive_test_path(source_path: str) -> str:
    """Derive a test file path from a source file path."""
    path = Path(source_path)
    stem = path.stem
    suffix = path.suffix

    # Python: foo.py → tests/test_foo.py
    if suffix == ".py":
        return f"tests/test_{stem}{suffix}"

    # JS/TS: foo.ts → foo.test.ts
    if suffix in (".ts", ".tsx", ".js", ".jsx"):
        return str(path.with_stem(f"{stem}.test"))

    # Go: foo.go → foo_test.go
    if suffix == ".go":
        return str(path.with_stem(f"{stem}_test"))

    # Fallback
    return f"tests/test_{stem}{suffix}"
