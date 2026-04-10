"""Tests for configuration loading."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from src.config import load_config
from src.models import AIEngine, ProviderType


CONFIG_DIR = Path(__file__).resolve().parent.parent


def test_load_default_config():
    """Should load config.yaml without errors."""
    config = load_config(config_path=CONFIG_DIR / "config.yaml")
    assert config.provider == ProviderType.GITHUB
    assert config.ai.engine == AIEngine.CLAUDE
    assert config.repair.max_attempts == 3
    assert config.repair.auto_merge is False


def test_env_override_provider(monkeypatch):
    """REPAIR_PROVIDER env var should override YAML."""
    monkeypatch.setenv("REPAIR_PROVIDER", "gitlab")
    config = load_config(config_path=CONFIG_DIR / "config.yaml")
    assert config.provider == ProviderType.GITLAB


def test_env_override_ai_model(monkeypatch):
    """REPAIR_AI_MODEL env var should override YAML."""
    monkeypatch.setenv("REPAIR_AI_MODEL", "claude-haiku-3-5")
    config = load_config(config_path=CONFIG_DIR / "config.yaml")
    assert config.ai.model == "claude-haiku-3-5"


def test_explicit_overrides():
    """Explicit overrides dict should win over YAML and env."""
    config = load_config(
        config_path=CONFIG_DIR / "config.yaml",
        overrides={"provider": "bitbucket"},
    )
    assert config.provider == ProviderType.BITBUCKET


def test_token_from_env(monkeypatch):
    """Provider tokens should be resolved from environment."""
    monkeypatch.setenv("GITHUB_TOKEN", "ghp_test123")
    config = load_config(config_path=CONFIG_DIR / "config.yaml")
    gh = config.providers.get("github")
    assert gh is not None
    assert gh.token == "ghp_test123"


def test_missing_config_file():
    """Non-existent config file should use defaults."""
    config = load_config(config_path="/nonexistent/path.yaml")
    assert config.provider == ProviderType.GITHUB
    assert config.ai.engine == AIEngine.CLAUDE


def test_handlers_loaded():
    """Handler configs should be loaded from YAML."""
    config = load_config(config_path=CONFIG_DIR / "config.yaml")
    assert "lint" in config.handlers
    assert config.handlers["lint"].enabled is True


def test_repair_config_defaults():
    """Repair config should have safe defaults."""
    config = load_config(config_path=CONFIG_DIR / "config.yaml")
    assert config.repair.max_diff_lines == 500
    assert config.repair.branch_prefix == "ai/fix"
    assert config.repair.pr_label == "ai-repair"
