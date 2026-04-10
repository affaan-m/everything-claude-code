"""Tests for the CI log parser."""

from __future__ import annotations

import pytest

from src.models import FailureType
from src.parser.log_parser import classify_failure_type, parse_logs


# ---------------------------------------------------------------------------
# ESLint log samples
# ---------------------------------------------------------------------------

ESLINT_LOG = """\
> eslint .

src/utils/helpers.ts:15:5 error  Unexpected var, use let or const instead  no-var
src/utils/helpers.ts:23:1 error  Missing return type on function  @typescript-eslint/explicit-function-return-type
src/components/App.tsx:8:10 error  'useState' is defined but never used  no-unused-vars

✖ 3 problems (3 errors, 0 warnings)
"""

PRETTIER_LOG = """\
Checking formatting...
[warn] Code style issues found in the following files:
[warn]   src/index.ts
[warn]   src/utils/format.ts
[error] Prettier check failed
"""


def test_parse_eslint_errors():
    failures = parse_logs(ESLINT_LOG, job_name="lint")
    assert len(failures) >= 2
    assert all(f.failure_type == FailureType.LINT for f in failures)

    # Check first error is parsed correctly
    first = failures[0]
    assert "helpers.ts" in first.file_path
    assert first.confidence >= 0.8


def test_parse_prettier_errors():
    failures = parse_logs(PRETTIER_LOG, job_name="lint")
    assert len(failures) >= 1
    lint_failures = [f for f in failures if f.failure_type == FailureType.LINT]
    assert len(lint_failures) >= 1


# ---------------------------------------------------------------------------
# Test failure log samples
# ---------------------------------------------------------------------------

JEST_LOG = """\
 FAIL  src/utils/helpers.test.ts
  ● Math utilities › should add two numbers

    expect(received).toBe(expected) // Object.is equality

    Expected: 5
    Received: 4

      12 |   it('should add two numbers', () => {
      13 |     expect(add(2, 3)).toBe(5);
         |                       ^
      14 |   });

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 12 passed, 13 total
"""

PYTEST_LOG = """\
============================= test session starts ==============================
FAILED tests/test_calculator.py::test_addition - assert 4 == 5
FAILED tests/test_parser.py::test_parse_json - json.decoder.JSONDecodeError
========================= 2 failed, 15 passed =====================================
"""


def test_parse_jest_failures():
    failures = parse_logs(JEST_LOG, job_name="test")
    test_failures = [f for f in failures if f.failure_type == FailureType.TEST]
    assert len(test_failures) >= 1
    assert any("helpers.test" in f.file_path for f in test_failures)


def test_parse_pytest_failures():
    failures = parse_logs(PYTEST_LOG, job_name="test")
    test_failures = [f for f in failures if f.failure_type == FailureType.TEST]
    assert len(test_failures) >= 1
    assert any("test_calculator" in f.file_path for f in test_failures)


# ---------------------------------------------------------------------------
# Coverage log samples
# ---------------------------------------------------------------------------

COVERAGE_LOG = """\
ERROR: Coverage for lines (72.5%) does not meet global threshold (80%)
ERROR: Coverage for branches (65.0%) does not meet global threshold (80%)
"""

ISTANBUL_LOG = """\
ERROR  Coverage for statements (74%) does not meet threshold of (80%) specified in coverage config
"""


def test_parse_coverage_failures():
    failures = parse_logs(COVERAGE_LOG, job_name="coverage")
    coverage_failures = [f for f in failures if f.failure_type == FailureType.COVERAGE]
    assert len(coverage_failures) >= 1


def test_parse_istanbul_coverage():
    failures = parse_logs(ISTANBUL_LOG, job_name="coverage")
    coverage_failures = [f for f in failures if f.failure_type == FailureType.COVERAGE]
    assert len(coverage_failures) >= 1


# ---------------------------------------------------------------------------
# TypeScript / Build failures
# ---------------------------------------------------------------------------

TS_LOG = """\
src/api/router.ts(42,15): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/models/user.ts(18,3): error TS2564: Property 'email' has no initializer and is not definitely assigned.
"""

GO_LOG = """\
./main.go:25:12: undefined: processData
./handler.go:15:8: cannot convert result (variable of type string) to type int
"""


def test_parse_typescript_errors():
    failures = parse_logs(TS_LOG, job_name="build")
    build_failures = [f for f in failures if f.failure_type == FailureType.BUILD]
    assert len(build_failures) >= 2
    assert any("router.ts" in f.file_path for f in build_failures)


def test_parse_go_errors():
    failures = parse_logs(GO_LOG, job_name="build")
    build_failures = [f for f in failures if f.failure_type == FailureType.BUILD]
    assert len(build_failures) >= 2
    assert any("main.go" in f.file_path for f in build_failures)


# ---------------------------------------------------------------------------
# Python lint (ruff/flake8)
# ---------------------------------------------------------------------------

RUFF_LOG = """\
src/api/views.py:12:1: E302 expected 2 blank lines, got 1
src/api/views.py:45:80: E501 line too long (92 > 79 characters)
src/models/user.py:8:1: F401 'os' imported but unused
"""


def test_parse_ruff_errors():
    failures = parse_logs(RUFF_LOG, job_name="lint")
    lint_failures = [f for f in failures if f.failure_type == FailureType.LINT]
    assert len(lint_failures) >= 2
    assert any("views.py" in f.file_path for f in lint_failures)


# ---------------------------------------------------------------------------
# classify_failure_type
# ---------------------------------------------------------------------------

def test_classify_mixed_failures():
    all_logs = ESLINT_LOG + "\n" + JEST_LOG + "\n" + COVERAGE_LOG
    failures = parse_logs(all_logs)
    # Should have multiple types
    types = {f.failure_type for f in failures}
    assert len(types) >= 2


def test_classify_empty():
    assert classify_failure_type([]) == FailureType.UNKNOWN


def test_parse_empty_logs():
    failures = parse_logs("")
    assert failures == []


def test_deduplication():
    """Same error appearing twice should be deduplicated."""
    doubled = ESLINT_LOG + "\n" + ESLINT_LOG
    failures_single = parse_logs(ESLINT_LOG)
    failures_double = parse_logs(doubled)
    assert len(failures_double) == len(failures_single)
