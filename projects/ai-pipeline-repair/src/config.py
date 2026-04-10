"""Configuration loader — merges YAML defaults with environment overrides."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml

from src.models import (
    AIConfig,
    AIEngine,
    AppConfig,
    HandlerConfig,
    ProviderConfig,
    ProviderType,
    RepairConfig,
)

_DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.yaml"

# Env-var prefix
_ENV_PREFIX = "REPAIR_"

# Token env var mapping per provider
_TOKEN_ENV_VARS: dict[str, str] = {
    "github": "GITHUB_TOKEN",
    "gitlab": "GITLAB_TOKEN",
    "bitbucket": "BITBUCKET_TOKEN",
}


def _deep_merge(base: dict, overrides: dict) -> dict:
    """Recursively merge *overrides* into a **copy** of *base* (immutable)."""
    merged = dict(base)
    for key, value in overrides.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def _apply_env_overrides(raw: dict[str, Any]) -> dict[str, Any]:
    """Override top-level scalar keys via REPAIR_* environment variables."""
    result = dict(raw)
    if provider_env := os.getenv(f"{_ENV_PREFIX}PROVIDER"):
        result["provider"] = provider_env.lower()
    if model_env := os.getenv(f"{_ENV_PREFIX}AI_MODEL"):
        result.setdefault("ai", {})["model"] = model_env
    if engine_env := os.getenv(f"{_ENV_PREFIX}AI_ENGINE"):
        result.setdefault("ai", {})["engine"] = engine_env.lower()
    if max_attempts := os.getenv(f"{_ENV_PREFIX}MAX_ATTEMPTS"):
        result.setdefault("repair", {})["max_attempts"] = int(max_attempts)
    if log_level := os.getenv(f"{_ENV_PREFIX}LOG_LEVEL"):
        result["logging"] = {"level": log_level}
    return result


def _resolve_provider_tokens(providers: dict[str, Any]) -> dict[str, ProviderConfig]:
    """Inject tokens from environment variables into provider configs."""
    resolved: dict[str, ProviderConfig] = {}
    for name, cfg in providers.items():
        token_env = _TOKEN_ENV_VARS.get(name, "")
        token = os.getenv(token_env, "")
        api_url = cfg.get("api_url", "") if isinstance(cfg, dict) else ""
        resolved[name] = ProviderConfig(api_url=api_url, token=token)
    return resolved


def load_config(
    config_path: Path | str | None = None,
    overrides: dict[str, Any] | None = None,
) -> AppConfig:
    """Load and validate application configuration.

    Priority (highest → lowest):
    1. Explicit *overrides* dict
    2. Environment variables (REPAIR_*)
    3. YAML config file
    4. Built-in defaults
    """
    path = Path(config_path) if config_path else _DEFAULT_CONFIG_PATH

    # Load YAML
    raw: dict[str, Any] = {}
    if path.exists():
        with open(path, encoding="utf-8") as fh:
            raw = yaml.safe_load(fh) or {}

    # Apply env overrides
    raw = _apply_env_overrides(raw)

    # Apply explicit overrides
    if overrides:
        raw = _deep_merge(raw, overrides)

    # Build typed config
    provider_type = ProviderType(raw.get("provider", "github"))

    providers_raw = raw.get("providers", {})
    providers = _resolve_provider_tokens(providers_raw)

    ai_raw = raw.get("ai", {})
    ai_config = AIConfig(
        engine=AIEngine(ai_raw.get("engine", "claude")),
        model=ai_raw.get("model", "claude-sonnet-4-20250514"),
        max_tokens=ai_raw.get("max_tokens", 8192),
        temperature=ai_raw.get("temperature", 0.0),
    )

    repair_raw = raw.get("repair", {})
    repair_config = RepairConfig(**{k: v for k, v in repair_raw.items() if v is not None})

    handlers_raw = raw.get("handlers", {})
    handler_configs: dict[str, HandlerConfig] = {}
    for name, hcfg in handlers_raw.items():
        if isinstance(hcfg, dict):
            handler_configs[name] = HandlerConfig(**hcfg)

    repo_raw = raw.get("repository", {})
    logging_raw = raw.get("logging", {})

    return AppConfig(
        provider=provider_type,
        providers=providers,
        ai=ai_config,
        repository_owner=repo_raw.get("owner", os.getenv("REPO_OWNER", "")),
        repository_name=repo_raw.get("name", os.getenv("REPO_NAME", "")),
        default_branch=repo_raw.get("default_branch", "main"),
        repair=repair_config,
        handlers=handler_configs,
        log_level=logging_raw.get("level", "INFO"),
    )
