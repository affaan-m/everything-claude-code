"""CLI entry point for the AI Pipeline Repair Agent."""

from __future__ import annotations

import asyncio
import json
import sys

import click

from src.agent import RepairAgent
from src.config import load_config
from src.utils.logger import setup_logging, get_logger


@click.group()
@click.option("--config", "-c", default=None, help="Path to config.yaml")
@click.option("--provider", "-p", default=None, help="Override provider (github/gitlab/bitbucket)")
@click.option("--log-level", "-l", default=None, help="Log level (DEBUG/INFO/WARNING/ERROR)")
@click.pass_context
def cli(ctx: click.Context, config: str | None, provider: str | None, log_level: str | None) -> None:
    """AI Pipeline Repair Agent — automatically fix CI failures."""
    overrides: dict = {}
    if provider:
        overrides["provider"] = provider
    if log_level:
        overrides["logging"] = {"level": log_level}

    app_config = load_config(config_path=config, overrides=overrides or None)
    setup_logging(level=app_config.log_level)
    ctx.ensure_object(dict)
    ctx.obj["config"] = app_config


@cli.command()
@click.argument("run_id")
@click.option("--owner", "-o", default=None, help="Repository owner")
@click.option("--repo", "-r", default=None, help="Repository name")
@click.pass_context
def repair(ctx: click.Context, run_id: str, owner: str | None, repo: str | None) -> None:
    """Repair a failed CI pipeline run.

    RUN_ID is the pipeline/workflow run identifier from your CI system.
    """
    config = ctx.obj["config"]

    # Allow CLI overrides for owner/repo
    if owner or repo:
        config = config.model_copy(
            update={
                "repository_owner": owner or config.repository_owner,
                "repository_name": repo or config.repository_name,
            }
        )

    log = get_logger("cli")
    log.info("starting_repair", run_id=run_id, provider=config.provider.value)

    result = asyncio.run(_run_repair(config, run_id))

    # Output result as JSON
    output = {
        "status": result.status.value,
        "failures_found": len(result.failures_detected),
        "fixes_applied": len(result.actions_taken),
        "fix_branch": result.fix_branch,
        "pr_url": result.pr_url,
        "pr_number": result.pr_number,
        "duration_seconds": result.duration_seconds,
        "error": result.error_message,
    }
    click.echo(json.dumps(output, indent=2))

    if result.status not in ("success", "skipped"):
        sys.exit(1)


@cli.command()
@click.pass_context
def check_config(ctx: click.Context) -> None:
    """Validate the current configuration."""
    config = ctx.obj["config"]
    click.echo(f"Provider:        {config.provider.value}")
    click.echo(f"AI Engine:       {config.ai.engine.value}")
    click.echo(f"AI Model:        {config.ai.model}")
    click.echo(f"Owner:           {config.repository_owner or '(not set)'}")
    click.echo(f"Repo:            {config.repository_name or '(not set)'}")
    click.echo(f"Max Attempts:    {config.repair.max_attempts}")
    click.echo(f"Max Diff Lines:  {config.repair.max_diff_lines}")
    click.echo(f"Handlers:        {', '.join(config.handlers.keys()) or '(defaults)'}")

    # Check tokens
    provider_cfg = config.providers.get(config.provider.value)
    has_token = bool(provider_cfg and provider_cfg.token)
    click.echo(f"Token ({config.provider.value}): {'✓ set' if has_token else '✗ MISSING'}")

    import os
    has_ai_key = bool(os.getenv("ANTHROPIC_API_KEY"))
    click.echo(f"ANTHROPIC_API_KEY: {'✓ set' if has_ai_key else '✗ MISSING'}")


async def _run_repair(config, run_id: str):
    agent = RepairAgent(config=config)
    try:
        return await agent.run(run_id)
    finally:
        await agent.close()


def main() -> None:
    cli(obj={})


if __name__ == "__main__":
    main()
