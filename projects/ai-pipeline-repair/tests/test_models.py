"""Tests for data models."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.models import (
    AIConfig,
    AppConfig,
    FailureType,
    HandlerConfig,
    PipelineFailure,
    PipelineRun,
    PRInfo,
    PRStatus,
    ProviderType,
    RepairAction,
    RepairConfig,
    RepairResult,
    RepairStatus,
)


def test_pipeline_failure_immutable():
    """Frozen models should reject mutation."""
    failure = PipelineFailure(
        failure_type=FailureType.LINT,
        job_name="lint",
        error_message="test error",
    )
    with pytest.raises(ValidationError):
        failure.error_message = "changed"  # type: ignore


def test_pipeline_run_defaults():
    run = PipelineRun(
        run_id="123",
        provider=ProviderType.GITHUB,
        repo_owner="owner",
        repo_name="repo",
        branch="main",
        commit_sha="abc123",
    )
    assert run.status == "failure"
    assert run.trigger_event == ""


def test_repair_config_defaults():
    config = RepairConfig()
    assert config.max_attempts == 3
    assert config.auto_merge is False
    assert config.max_diff_lines == 500


def test_pr_info_creation():
    pr = PRInfo(
        number=42,
        title="Fix lint",
        body="Auto-repair",
        url="https://github.com/owner/repo/pull/42",
        head_branch="ai/fix/123",
        base_branch="main",
        labels=["ai-repair"],
    )
    assert pr.status == PRStatus.OPEN
    assert "ai-repair" in pr.labels


def test_repair_result():
    run = PipelineRun(
        run_id="1",
        provider=ProviderType.GITHUB,
        repo_owner="o",
        repo_name="r",
        branch="main",
        commit_sha="abc",
    )
    result = RepairResult(
        pipeline_run=run,
        status=RepairStatus.SUCCESS,
        actions_taken=[
            RepairAction(file_path="a.py", description="fixed", handler="lint")
        ],
        pr_url="https://example.com/pr/1",
        pr_number=1,
    )
    assert result.status == RepairStatus.SUCCESS
    assert len(result.actions_taken) == 1


def test_confidence_validation():
    """Confidence must be between 0 and 1."""
    with pytest.raises(ValidationError):
        PipelineFailure(
            failure_type=FailureType.LINT,
            job_name="test",
            error_message="err",
            confidence=1.5,
        )

    with pytest.raises(ValidationError):
        PipelineFailure(
            failure_type=FailureType.LINT,
            job_name="test",
            error_message="err",
            confidence=-0.1,
        )


def test_app_config_defaults():
    config = AppConfig()
    assert config.provider == ProviderType.GITHUB
    assert config.default_branch == "main"
    assert config.log_level == "INFO"
