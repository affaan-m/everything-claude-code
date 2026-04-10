"""Data models for the AI Pipeline Repair Agent.

All models are immutable (frozen) Pydantic types — never mutate, always create new.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ProviderType(str, Enum):
    GITHUB = "github"
    GITLAB = "gitlab"
    BITBUCKET = "bitbucket"


class AIEngine(str, Enum):
    CLAUDE = "claude"
    OPENAI = "openai"


class FailureType(str, Enum):
    LINT = "lint"
    TEST = "test"
    COVERAGE = "coverage"
    VALIDATION = "validation"
    BUILD = "build"
    UNKNOWN = "unknown"


class RepairStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    FIXING = "fixing"
    VERIFYING = "verifying"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class PRStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    MERGED = "merged"
    CLOSED = "closed"


# ---------------------------------------------------------------------------
# Core Models (all frozen — immutability enforced)
# ---------------------------------------------------------------------------

class PipelineFailure(BaseModel):
    """Represents a single CI pipeline failure parsed from logs."""
    model_config = {"frozen": True}

    failure_type: FailureType
    job_name: str
    step_name: str = ""
    error_message: str
    file_path: str = ""
    line_number: int | None = None
    raw_log: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class PipelineRun(BaseModel):
    """Represents a CI pipeline run (provider-agnostic)."""
    model_config = {"frozen": True}

    run_id: str
    provider: ProviderType
    repo_owner: str
    repo_name: str
    branch: str
    commit_sha: str
    trigger_event: str = ""
    status: str = "failure"
    url: str = ""
    started_at: datetime | None = None
    finished_at: datetime | None = None


class RepairAction(BaseModel):
    """A single repair action applied by the agent."""
    model_config = {"frozen": True}

    file_path: str
    description: str
    diff: str = ""
    handler: str = ""


class RepairResult(BaseModel):
    """Full result of an agent repair attempt."""
    model_config = {"frozen": True}

    pipeline_run: PipelineRun
    status: RepairStatus
    failures_detected: list[PipelineFailure] = Field(default_factory=list)
    actions_taken: list[RepairAction] = Field(default_factory=list)
    fix_branch: str = ""
    pr_url: str = ""
    pr_number: int | None = None
    attempt: int = 1
    error_message: str = ""
    duration_seconds: float = 0.0


class PRInfo(BaseModel):
    """Pull / Merge Request information."""
    model_config = {"frozen": True}

    number: int
    title: str
    body: str
    url: str
    head_branch: str
    base_branch: str
    status: PRStatus = PRStatus.OPEN
    labels: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Configuration Models
# ---------------------------------------------------------------------------

class ProviderConfig(BaseModel):
    model_config = {"frozen": True}

    api_url: str
    token: str = ""  # resolved from env at runtime


class AIConfig(BaseModel):
    model_config = {"frozen": True}

    engine: AIEngine = AIEngine.CLAUDE
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 8192
    temperature: float = 0.0


class RepairConfig(BaseModel):
    model_config = {"frozen": True}

    max_attempts: int = 3
    branch_prefix: str = "ai/fix"
    commit_prefix: str = "fix(ai-repair):"
    pr_label: str = "ai-repair"
    max_diff_lines: int = 500
    re_run_ci_after_fix: bool = True
    auto_merge: bool = False


class HandlerConfig(BaseModel):
    model_config = {"frozen": True}

    enabled: bool = True
    commands: list[str] = Field(default_factory=list)
    rerun_command: str = ""
    threshold: int = 80


class AppConfig(BaseModel):
    """Top-level application configuration."""
    model_config = {"frozen": True}

    provider: ProviderType = ProviderType.GITHUB
    providers: dict[str, ProviderConfig] = Field(default_factory=dict)
    ai: AIConfig = Field(default_factory=AIConfig)
    repository_owner: str = ""
    repository_name: str = ""
    default_branch: str = "main"
    repair: RepairConfig = Field(default_factory=RepairConfig)
    handlers: dict[str, HandlerConfig] = Field(default_factory=dict)
    log_level: str = "INFO"
