"""Test failure handler."""

from __future__ import annotations

from pathlib import Path

from src.models import FailureType, HandlerConfig, PipelineFailure, RepairAction
from src.ai.base import BaseAIClient
from src.handlers.base import BaseHandler


class TestHandler(BaseHandler):
    """Handles test failures (Jest, pytest, Go test, etc.).

    Strategy:
    1. Identify failing test files and the implementation files they test
    2. Use AI to analyze the failure and fix the implementation (not the test)
    3. If the test is clearly wrong, fix the test with a note
    """

    def __init__(self, config: HandlerConfig, ai_client: BaseAIClient) -> None:
        super().__init__(config, ai_client)

    @property
    def name(self) -> str:
        return "test"

    async def can_handle(self, failures: list[PipelineFailure]) -> bool:
        return any(f.failure_type == FailureType.TEST for f in failures)

    async def fix(
        self,
        failures: list[PipelineFailure],
        repo_root: Path,
    ) -> list[RepairAction]:
        test_failures = [f for f in failures if f.failure_type == FailureType.TEST]
        if not test_failures:
            return []

        actions: list[RepairAction] = []

        for failure in test_failures:
            # Gather context: the test file and the implementation file
            test_file = failure.file_path
            if not test_file:
                continue

            test_path = repo_root / test_file
            if not test_path.exists():
                continue

            test_content = test_path.read_text(encoding="utf-8")

            # Try to find the implementation file
            impl_file = _guess_implementation_file(test_file)
            impl_content = ""
            impl_path = repo_root / impl_file if impl_file else None
            if impl_path and impl_path.exists():
                impl_content = impl_path.read_text(encoding="utf-8")

            # Build context for AI
            error_context = (
                f"Test failure in {test_file}:\n{failure.error_message}\n\n"
                f"Raw log context:\n{failure.raw_log}"
            )

            if impl_content and impl_path:
                # Fix the implementation, not the test
                fixed = await self._ai.generate_fix(
                    file_path=impl_file,
                    file_content=impl_content,
                    error_context=error_context,
                    instruction=(
                        "Fix the implementation to make the failing test pass. "
                        "Do NOT modify the test expectations. "
                        f"Test file content:\n{test_content[:3000]}"
                    ),
                )

                if fixed and fixed != impl_content:
                    impl_path.write_text(fixed, encoding="utf-8")
                    actions.append(
                        RepairAction(
                            file_path=impl_file,
                            description=f"Fixed implementation to pass {test_file}",
                            handler=self.name,
                        )
                    )
            else:
                # No impl file found — attempt to fix the test file itself
                fixed = await self._ai.generate_fix(
                    file_path=test_file,
                    file_content=test_content,
                    error_context=error_context,
                    instruction=(
                        "This test is failing. Analyze the error carefully. "
                        "If the test assertion is wrong, fix it. "
                        "If the test setup is incorrect, fix that."
                    ),
                )

                if fixed and fixed != test_content:
                    test_path.write_text(fixed, encoding="utf-8")
                    actions.append(
                        RepairAction(
                            file_path=test_file,
                            description=f"Fixed test expectations in {test_file}",
                            handler=self.name,
                        )
                    )

        return actions


def _guess_implementation_file(test_file: str) -> str:
    """Heuristic: map test file path to likely implementation file."""
    # Remove common test suffixes/directories
    result = test_file

    # Handle common patterns:
    # tests/foo.test.js → src/foo.js
    # test_foo.py → foo.py
    # foo_test.go → foo.go

    for pattern, replacement in [
        (".test.ts", ".ts"),
        (".test.tsx", ".tsx"),
        (".test.js", ".js"),
        (".test.jsx", ".jsx"),
        (".spec.ts", ".ts"),
        (".spec.js", ".js"),
        ("_test.go", ".go"),
        ("_test.py", ".py"),
    ]:
        if result.endswith(pattern):
            result = result[: -len(pattern)] + replacement
            break

    # Move from test dirs to src
    for test_dir, src_dir in [
        ("tests/", "src/"),
        ("test/", "src/"),
        ("__tests__/", ""),
    ]:
        if test_dir in result:
            result = result.replace(test_dir, src_dir, 1)
            break

    # Handle Python test_ prefix
    parts = result.rsplit("/", 1)
    if len(parts) == 2 and parts[1].startswith("test_"):
        result = parts[0] + "/" + parts[1][5:]

    return result if result != test_file else ""
