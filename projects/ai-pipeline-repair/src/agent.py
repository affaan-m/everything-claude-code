"""Repair Agent Orchestrator — the main engine.

Coordinates: log fetching → parsing → handler dispatch → branch/PR creation.
"""

from __future__ import annotations

import tempfile
import time
from pathlib import Path
from typing import Any

from src.config import load_config
from src.models import (
    AppConfig,
    PipelineRun,
    RepairAction,
    RepairResult,
    RepairStatus,
)
from src.providers.base import BaseProvider
from src.providers.factory import create_provider
from src.ai.base import BaseAIClient
from src.ai.factory import create_ai_client
from src.handlers.factory import create_handlers
from src.parser.log_parser import classify_failure_type, parse_logs
from src.utils import git
from src.utils.logger import get_logger

log = get_logger("agent")


class RepairAgent:
    """Stateless orchestrator — call .run() with a pipeline run ID."""

    def __init__(
        self,
        config: AppConfig | None = None,
        provider: BaseProvider | None = None,
        ai_client: BaseAIClient | None = None,
    ) -> None:
        self._config = config or load_config()
        self._provider = provider or create_provider(self._config)
        self._ai = ai_client or create_ai_client(self._config.ai)
        self._handlers = create_handlers(self._config, self._ai)

    async def run(self, run_id: str) -> RepairResult:
        """Full repair pipeline for a single failed CI run."""
        start = time.monotonic()
        log.info("repair_started", run_id=run_id)

        # 1. Fetch pipeline metadata
        pipeline_run = await self._provider.get_failed_run(run_id)
        log.info(
            "pipeline_fetched",
            branch=pipeline_run.branch,
            sha=pipeline_run.commit_sha[:8],
        )

        # 2. Download failure logs
        raw_logs = await self._provider.get_run_logs(run_id)
        if not raw_logs:
            log.warning("no_logs_found", run_id=run_id)
            return self._result(pipeline_run, RepairStatus.SKIPPED, error="No logs found")

        # 3. Parse logs into structured failures
        failures = parse_logs(raw_logs)
        if not failures:
            log.warning("no_failures_parsed", run_id=run_id)
            return self._result(
                pipeline_run, RepairStatus.SKIPPED, error="Could not parse failures from logs"
            )

        dominant_type = classify_failure_type(failures)
        log.info(
            "failures_parsed",
            count=len(failures),
            dominant_type=dominant_type.value,
        )

        # 4. Enrich with AI analysis
        changed_files = await self._get_changed_files_content(pipeline_run)
        diagnosis = await self._ai.analyze_failure(
            logs=raw_logs,
            changed_files=changed_files,
        )
        log.info("ai_diagnosis", confidence=diagnosis.get("confidence", 0))

        if diagnosis.get("confidence", 0) < 0.3:
            log.warning("low_confidence", diagnosis=diagnosis)
            return self._result(
                pipeline_run,
                RepairStatus.SKIPPED,
                failures_detected=failures,
                error="AI confidence too low to attempt repair",
            )

        # 5. Clone repo and create fix branch
        with tempfile.TemporaryDirectory(prefix="ai-repair-") as tmpdir:
            repo_root = Path(tmpdir) / pipeline_run.repo_name
            clone_url = self._build_clone_url(pipeline_run)

            await git.clone_repo(
                clone_url=clone_url,
                dest=repo_root,
                branch=pipeline_run.branch,
            )

            fix_branch = (
                f"{self._config.repair.branch_prefix}/"
                f"{run_id}-{pipeline_run.commit_sha[:7]}"
            )
            await git.create_branch(repo_root, fix_branch)

            # 6. Run handlers
            all_actions: list[RepairAction] = []
            for handler in self._handlers:
                if await handler.can_handle(failures):
                    log.info("running_handler", handler=handler.name)
                    actions = await handler.fix(failures, repo_root)
                    all_actions.extend(actions)

            if not all_actions:
                log.info("no_fixes_applied", run_id=run_id)
                return self._result(
                    pipeline_run,
                    RepairStatus.SKIPPED,
                    failures_detected=failures,
                    error="Handlers produced no fixes",
                )

            # 7. Check diff size guardrail
            if not await git.has_changes(repo_root):
                return self._result(
                    pipeline_run,
                    RepairStatus.SKIPPED,
                    failures_detected=failures,
                    error="No file changes detected after handlers ran",
                )

            await git.stage_all(repo_root)
            diff_lines = await git.get_diff_stat(repo_root)
            if diff_lines > self._config.repair.max_diff_lines:
                log.warning("diff_too_large", lines=diff_lines)
                return self._result(
                    pipeline_run,
                    RepairStatus.FAILED,
                    failures_detected=failures,
                    actions_taken=all_actions,
                    error=f"Diff too large ({diff_lines} lines > {self._config.repair.max_diff_lines} max)",
                )

            # 8. Commit and push
            commit_msg = (
                f"{self._config.repair.commit_prefix} "
                f"auto-fix {dominant_type.value} failures from run #{run_id}"
            )
            await git.commit(repo_root, commit_msg)
            await git.push(
                repo_root,
                fix_branch,
                token=self._get_provider_token(),
                remote_url=clone_url,
            )

            # 9. Create PR
            pr_content = await self._ai.generate_pr_description(
                failures=[
                    {"type": f.failure_type.value, "message": f.error_message, "file": f.file_path}
                    for f in failures
                ],
                fixes=[
                    {"file": a.file_path, "description": a.description, "handler": a.handler}
                    for a in all_actions
                ],
                original_branch=pipeline_run.branch,
            )

            pr_info = await self._provider.create_pull_request(
                title=pr_content["title"],
                body=pr_content["body"],
                head_branch=fix_branch,
                base_branch=pipeline_run.branch,
                labels=[self._config.repair.pr_label],
            )

            log.info("pr_created", pr_url=pr_info.url, pr_number=pr_info.number)

            elapsed = time.monotonic() - start
            return RepairResult(
                pipeline_run=pipeline_run,
                status=RepairStatus.SUCCESS,
                failures_detected=failures,
                actions_taken=all_actions,
                fix_branch=fix_branch,
                pr_url=pr_info.url,
                pr_number=pr_info.number,
                duration_seconds=round(elapsed, 2),
            )

    async def close(self) -> None:
        """Clean up provider and AI client resources."""
        await self._provider.close()
        await self._ai.close()

    # ----- Private helpers -----

    async def _get_changed_files_content(
        self, run: PipelineRun
    ) -> dict[str, str]:
        """Get content of files changed in the failing commit."""
        try:
            files = await self._provider.list_changed_files(
                self._config.default_branch, run.commit_sha
            )
            contents: dict[str, str] = {}
            for f in files[:20]:  # limit to avoid token explosion
                try:
                    content = await self._provider.get_file_content(f, run.commit_sha)
                    contents[f] = content
                except Exception:
                    pass
            return contents
        except Exception:
            return {}

    def _build_clone_url(self, run: PipelineRun) -> str:
        """Build HTTPS clone URL for the repo."""
        token = self._get_provider_token()
        base = self._config.providers.get(self._config.provider.value)
        api_url = base.api_url if base else ""

        if self._config.provider.value == "github":
            return f"https://x-access-token:{token}@github.com/{run.repo_owner}/{run.repo_name}.git"
        elif self._config.provider.value == "gitlab":
            host = api_url.replace("/api/v4", "").replace("https://", "")
            return f"https://oauth2:{token}@{host}/{run.repo_owner}/{run.repo_name}.git"
        elif self._config.provider.value == "bitbucket":
            return f"https://x-token-auth:{token}@bitbucket.org/{run.repo_owner}/{run.repo_name}.git"
        else:
            raise ValueError(f"Unsupported provider: {self._config.provider}")

    def _get_provider_token(self) -> str:
        provider_cfg = self._config.providers.get(self._config.provider.value)
        return provider_cfg.token if provider_cfg else ""

    def _result(
        self,
        run: PipelineRun,
        status: RepairStatus,
        *,
        failures_detected: list | None = None,
        actions_taken: list | None = None,
        error: str = "",
    ) -> RepairResult:
        return RepairResult(
            pipeline_run=run,
            status=status,
            failures_detected=failures_detected or [],
            actions_taken=actions_taken or [],
            error_message=error,
        )
