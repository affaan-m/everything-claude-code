"""Tests for failure handler logic."""

from __future__ import annotations

import pytest

from src.models import FailureType, HandlerConfig, PipelineFailure
from src.handlers.lint_handler import LintHandler
from src.handlers.test_handler import TestHandler, _guess_implementation_file
from src.handlers.coverage_handler import CoverageHandler, _derive_test_path
from src.handlers.validation_handler import ValidationHandler


class FakeAIClient:
    """Minimal mock AI client for handler tests."""

    async def analyze_failure(self, *args, **kwargs):
        return {"failure_type": "unknown", "affected_files": [], "confidence": 0.5}

    async def generate_fix(self, file_path, file_content, error_context, instruction):
        return file_content  # no-op

    async def generate_pr_description(self, *args, **kwargs):
        return {"title": "test", "body": "test"}

    async def close(self):
        pass


def _make_failure(
    ftype: FailureType, file_path: str = "", msg: str = "error"
) -> PipelineFailure:
    return PipelineFailure(
        failure_type=ftype,
        job_name="test-job",
        error_message=msg,
        file_path=file_path,
        confidence=0.8,
    )


# ---------------------------------------------------------------------------
# Handler.can_handle tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_lint_handler_can_handle():
    handler = LintHandler(HandlerConfig(), FakeAIClient())
    assert await handler.can_handle([_make_failure(FailureType.LINT)])
    assert not await handler.can_handle([_make_failure(FailureType.TEST)])


@pytest.mark.asyncio
async def test_test_handler_can_handle():
    handler = TestHandler(HandlerConfig(), FakeAIClient())
    assert await handler.can_handle([_make_failure(FailureType.TEST)])
    assert not await handler.can_handle([_make_failure(FailureType.LINT)])


@pytest.mark.asyncio
async def test_coverage_handler_can_handle():
    handler = CoverageHandler(HandlerConfig(), FakeAIClient())
    assert await handler.can_handle([_make_failure(FailureType.COVERAGE)])


@pytest.mark.asyncio
async def test_validation_handler_can_handle():
    handler = ValidationHandler(HandlerConfig(), FakeAIClient())
    assert await handler.can_handle([_make_failure(FailureType.VALIDATION)])


# ---------------------------------------------------------------------------
# Utility function tests
# ---------------------------------------------------------------------------

class TestGuessImplementationFile:
    def test_jest_test_to_source(self):
        assert _guess_implementation_file("src/utils/helpers.test.ts") == "src/utils/helpers.ts"

    def test_spec_file(self):
        assert _guess_implementation_file("src/api/router.spec.js") == "src/api/router.js"

    def test_pytest(self):
        assert _guess_implementation_file("tests/test_calculator.py") == "src/calculator.py"

    def test_go_test(self):
        assert _guess_implementation_file("pkg/handler_test.go") == "pkg/handler.go"

    def test_tests_dir_to_src(self):
        result = _guess_implementation_file("__tests__/Button.test.tsx")
        assert "Button.tsx" in result

    def test_no_match_returns_empty(self):
        assert _guess_implementation_file("README.md") == ""


class TestDeriveTestPath:
    def test_python(self):
        assert _derive_test_path("src/calculator.py") == "tests/test_calculator.py"

    def test_typescript(self):
        result = _derive_test_path("src/utils/helpers.ts")
        assert "helpers.test" in result

    def test_go(self):
        result = _derive_test_path("pkg/handler.go")
        assert "handler_test" in result
