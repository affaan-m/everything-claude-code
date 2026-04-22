"""CI log parser — extracts structured failure information from raw logs."""

from __future__ import annotations

import re
from dataclasses import dataclass

from src.models import FailureType, PipelineFailure


# ---------------------------------------------------------------------------
# Pattern registry — add new patterns here to support more CI tools
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class FailurePattern:
    """A regex pattern that identifies a specific type of CI failure."""
    failure_type: FailureType
    pattern: re.Pattern[str]
    extract_file: bool = True
    extract_line: bool = True
    confidence: float = 0.8


_PATTERNS: list[FailurePattern] = [
    # ESLint errors
    FailurePattern(
        failure_type=FailureType.LINT,
        pattern=re.compile(
            r"(?P<file>[\w./\\-]+\.\w+):(?P<line>\d+):\d+\s+error\s+(?P<msg>.+?)(?:\s{2,}|\n)",
        ),
        confidence=0.9,
    ),
    # Prettier check failures
    FailurePattern(
        failure_type=FailureType.LINT,
        pattern=re.compile(
            r"\[warn\]\s+(?P<file>[\w./\\-]+\.\w+)",
        ),
        extract_line=False,
        confidence=0.85,
    ),
    # Python flake8 / ruff
    FailurePattern(
        failure_type=FailureType.LINT,
        pattern=re.compile(
            r"(?P<file>[\w./\\-]+\.py):(?P<line>\d+):\d+:\s+(?P<msg>[A-Z]\d+\s.+)",
        ),
        confidence=0.9,
    ),
    # Jest / Vitest test failures
    FailurePattern(
        failure_type=FailureType.TEST,
        pattern=re.compile(
            r"(?:FAIL|●)\s+(?P<file>[\w./\\-]+\.(?:test|spec)\.\w+).*?\n.*?(?P<msg>Expected|Received|Error:.+)",
            re.DOTALL,
        ),
        extract_line=False,
        confidence=0.85,
    ),
    # pytest failures
    FailurePattern(
        failure_type=FailureType.TEST,
        pattern=re.compile(
            r"FAILED\s+(?P<file>[\w./\\-]+\.py)::(?P<msg>\w+)",
        ),
        extract_line=False,
        confidence=0.85,
    ),
    # Coverage threshold failures
    FailurePattern(
        failure_type=FailureType.COVERAGE,
        pattern=re.compile(
            r"(?:Coverage|coverage).*?(?:below|under|threshold|minimum).*?(?P<msg>\d+(?:\.\d+)?%)",
        ),
        extract_file=False,
        extract_line=False,
        confidence=0.8,
    ),
    # Istanbul / c8 coverage
    FailurePattern(
        failure_type=FailureType.COVERAGE,
        pattern=re.compile(
            r"ERROR.*?Coverage for (?:lines|branches|functions|statements).*?(?P<msg>\d+(?:\.\d+)?%.*?threshold.*?\d+(?:\.\d+)?%)",
        ),
        extract_file=False,
        extract_line=False,
        confidence=0.85,
    ),
    # TypeScript compiler errors
    FailurePattern(
        failure_type=FailureType.BUILD,
        pattern=re.compile(
            r"(?P<file>[\w./\\-]+\.tsx?)\((?P<line>\d+),\d+\):\s+error\s+(?P<msg>TS\d+:.+)",
        ),
        confidence=0.9,
    ),
    # Go build errors
    FailurePattern(
        failure_type=FailureType.BUILD,
        pattern=re.compile(
            r"(?P<file>[\w./\\-]+\.go):(?P<line>\d+):\d+:\s+(?P<msg>.+)",
        ),
        confidence=0.85,
    ),
    # Generic "Error:" pattern (low confidence fallback)
    FailurePattern(
        failure_type=FailureType.UNKNOWN,
        pattern=re.compile(
            r"(?:Error|ERROR|error):\s+(?P<msg>.+)",
        ),
        extract_file=False,
        extract_line=False,
        confidence=0.3,
    ),
]


def parse_logs(raw_logs: str, job_name: str = "") -> list[PipelineFailure]:
    """Parse raw CI logs and return a list of structured failures.

    Tries all registered patterns; returns matches sorted by confidence (desc).
    """
    failures: list[PipelineFailure] = []
    seen: set[str] = set()  # dedup key: (type, file, msg)

    for fp in _PATTERNS:
        for match in fp.pattern.finditer(raw_logs):
            groups = match.groupdict()

            file_path = groups.get("file", "") if fp.extract_file else ""
            msg = groups.get("msg", "").strip()

            line_str = groups.get("line", "") if fp.extract_line else ""
            line_num = int(line_str) if line_str.isdigit() else None

            dedup_key = f"{fp.failure_type}:{file_path}:{msg[:80]}"
            if dedup_key in seen:
                continue
            seen.add(dedup_key)

            # Extract surrounding context from raw log
            start = max(0, match.start() - 200)
            end = min(len(raw_logs), match.end() + 200)
            context = raw_logs[start:end]

            failures.append(
                PipelineFailure(
                    failure_type=fp.failure_type,
                    job_name=job_name,
                    error_message=msg,
                    file_path=file_path,
                    line_number=line_num,
                    raw_log=context,
                    confidence=fp.confidence,
                )
            )

    # Sort: highest confidence first
    return sorted(failures, key=lambda f: f.confidence, reverse=True)


def classify_failure_type(failures: list[PipelineFailure]) -> FailureType:
    """Determine the dominant failure type from a list of failures."""
    if not failures:
        return FailureType.UNKNOWN

    # Count by type, weighted by confidence
    scores: dict[FailureType, float] = {}
    for f in failures:
        scores[f.failure_type] = scores.get(f.failure_type, 0.0) + f.confidence

    return max(scores, key=scores.get)  # type: ignore[arg-type]
