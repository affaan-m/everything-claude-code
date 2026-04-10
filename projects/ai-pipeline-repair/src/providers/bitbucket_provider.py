"""Bitbucket Cloud provider — implements BaseProvider for Bitbucket Pipelines."""

from __future__ import annotations

from datetime import datetime

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from src.models import PRInfo, PRStatus, PipelineRun, ProviderConfig, ProviderType
from src.providers.base import BaseProvider


class BitbucketProvider(BaseProvider):
    """Bitbucket Cloud REST API v2 implementation."""

    def __init__(self, config: ProviderConfig, owner: str, repo: str) -> None:
        super().__init__(config, owner, repo)
        self._client = httpx.AsyncClient(
            base_url=config.api_url.rstrip("/"),
            headers={
                "Authorization": f"Bearer {config.token}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    @property
    def _repo_path(self) -> str:
        return f"{self._owner}/{self._repo}"

    # ----- Pipeline Logs -----

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def get_failed_run(self, run_id: str) -> PipelineRun:
        resp = await self._client.get(
            f"/repositories/{self._repo_path}/pipelines/{run_id}"
        )
        resp.raise_for_status()
        data = resp.json()

        target = data.get("target", {})
        return PipelineRun(
            run_id=str(data["uuid"].strip("{}")),
            provider=ProviderType.BITBUCKET,
            repo_owner=self._owner,
            repo_name=self._repo,
            branch=target.get("ref_name", ""),
            commit_sha=target.get("commit", {}).get("hash", ""),
            trigger_event=data.get("trigger", {}).get("name", ""),
            status=data.get("state", {}).get("result", {}).get("name", "FAILED").lower(),
            url=data.get("links", {}).get("html", {}).get("href", ""),
            started_at=(
                datetime.fromisoformat(data["created_on"])
                if data.get("created_on")
                else None
            ),
            finished_at=(
                datetime.fromisoformat(data["completed_on"])
                if data.get("completed_on")
                else None
            ),
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def get_run_logs(self, run_id: str) -> str:
        # Get pipeline steps
        steps_resp = await self._client.get(
            f"/repositories/{self._repo_path}/pipelines/{run_id}/steps/"
        )
        steps_resp.raise_for_status()
        steps = steps_resp.json().get("values", [])

        log_parts: list[str] = []
        for step in steps:
            state = step.get("state", {})
            result = state.get("result", {}).get("name", "")
            if result == "FAILED":
                step_uuid = step["uuid"].strip("{}")
                log_resp = await self._client.get(
                    f"/repositories/{self._repo_path}/pipelines/{run_id}/steps/{step_uuid}/log"
                )
                if log_resp.status_code == 200:
                    log_parts.append(
                        f"=== Step: {step.get('name', step_uuid)} ===\n{log_resp.text}"
                    )

        return "\n\n".join(log_parts) if log_parts else ""

    # ----- Branch Operations -----

    async def create_branch(self, branch_name: str, from_sha: str) -> None:
        resp = await self._client.post(
            f"/repositories/{self._repo_path}/refs/branches",
            json={
                "name": branch_name,
                "target": {"hash": from_sha},
            },
        )
        resp.raise_for_status()

    async def branch_exists(self, branch_name: str) -> bool:
        resp = await self._client.get(
            f"/repositories/{self._repo_path}/refs/branches/{branch_name}"
        )
        return resp.status_code == 200

    # ----- Pull Request -----

    async def create_pull_request(
        self,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str,
        labels: list[str] | None = None,
        draft: bool = False,
    ) -> PRInfo:
        resp = await self._client.post(
            f"/repositories/{self._repo_path}/pullrequests",
            json={
                "title": title,
                "description": body,
                "source": {"branch": {"name": head_branch}},
                "destination": {"branch": {"name": base_branch}},
                "close_source_branch": True,
            },
        )
        resp.raise_for_status()
        data = resp.json()

        return PRInfo(
            number=data["id"],
            title=data["title"],
            body=data.get("description", ""),
            url=data["links"]["html"]["href"],
            head_branch=head_branch,
            base_branch=base_branch,
            status=PRStatus.OPEN,
            labels=labels or [],
        )

    async def add_pr_comment(self, pr_number: int, body: str) -> None:
        resp = await self._client.post(
            f"/repositories/{self._repo_path}/pullrequests/{pr_number}/comments",
            json={"content": {"raw": body}},
        )
        resp.raise_for_status()

    async def add_pr_labels(self, pr_number: int, labels: list[str]) -> None:
        # Bitbucket Cloud doesn't have native PR labels; no-op.
        pass

    # ----- Utility -----

    async def get_file_content(self, path: str, ref: str) -> str:
        resp = await self._client.get(
            f"/repositories/{self._repo_path}/src/{ref}/{path}"
        )
        resp.raise_for_status()
        return resp.text

    async def list_changed_files(self, base: str, head: str) -> list[str]:
        resp = await self._client.get(
            f"/repositories/{self._repo_path}/diff/{base}..{head}"
        )
        resp.raise_for_status()
        # Parse diff for file names (simplified)
        files: list[str] = []
        for line in resp.text.splitlines():
            if line.startswith("diff --git"):
                parts = line.split(" b/")
                if len(parts) >= 2:
                    files.append(parts[-1])
        return files

    async def close(self) -> None:
        await self._client.aclose()
