"""GitHub provider — implements BaseProvider for GitHub Actions."""

from __future__ import annotations

from datetime import datetime, timezone

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from src.models import PRInfo, PRStatus, PipelineRun, ProviderConfig, ProviderType
from src.providers.base import BaseProvider


class GitHubProvider(BaseProvider):
    """GitHub REST API v3 implementation."""

    def __init__(self, config: ProviderConfig, owner: str, repo: str) -> None:
        super().__init__(config, owner, repo)
        self._client = httpx.AsyncClient(
            base_url=config.api_url.rstrip("/"),
            headers={
                "Authorization": f"Bearer {config.token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            timeout=30.0,
        )

    # ----- Pipeline Logs -----

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def get_failed_run(self, run_id: str) -> PipelineRun:
        resp = await self._client.get(
            f"/repos/{self._owner}/{self._repo}/actions/runs/{run_id}"
        )
        resp.raise_for_status()
        data = resp.json()

        started = data.get("run_started_at")
        updated = data.get("updated_at")

        return PipelineRun(
            run_id=str(data["id"]),
            provider=ProviderType.GITHUB,
            repo_owner=self._owner,
            repo_name=self._repo,
            branch=data.get("head_branch", ""),
            commit_sha=data.get("head_sha", ""),
            trigger_event=data.get("event", ""),
            status=data.get("conclusion", "failure"),
            url=data.get("html_url", ""),
            started_at=datetime.fromisoformat(started) if started else None,
            finished_at=datetime.fromisoformat(updated) if updated else None,
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def get_run_logs(self, run_id: str) -> str:
        # First get all jobs for this run
        jobs_resp = await self._client.get(
            f"/repos/{self._owner}/{self._repo}/actions/runs/{run_id}/jobs"
        )
        jobs_resp.raise_for_status()
        jobs = jobs_resp.json().get("jobs", [])

        log_parts: list[str] = []
        for job in jobs:
            if job.get("conclusion") != "success":
                job_id = job["id"]
                log_resp = await self._client.get(
                    f"/repos/{self._owner}/{self._repo}/actions/jobs/{job_id}/logs",
                    follow_redirects=True,
                )
                if log_resp.status_code == 200:
                    log_parts.append(
                        f"=== Job: {job.get('name', job_id)} ===\n{log_resp.text}"
                    )

        return "\n\n".join(log_parts) if log_parts else ""

    # ----- Branch Operations -----

    async def create_branch(self, branch_name: str, from_sha: str) -> None:
        resp = await self._client.post(
            f"/repos/{self._owner}/{self._repo}/git/refs",
            json={"ref": f"refs/heads/{branch_name}", "sha": from_sha},
        )
        resp.raise_for_status()

    async def branch_exists(self, branch_name: str) -> bool:
        resp = await self._client.get(
            f"/repos/{self._owner}/{self._repo}/branches/{branch_name}"
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
            f"/repos/{self._owner}/{self._repo}/pulls",
            json={
                "title": title,
                "body": body,
                "head": head_branch,
                "base": base_branch,
                "draft": draft,
            },
        )
        resp.raise_for_status()
        data = resp.json()

        pr_number = data["number"]
        if labels:
            await self.add_pr_labels(pr_number, labels)

        return PRInfo(
            number=pr_number,
            title=data["title"],
            body=data.get("body", ""),
            url=data["html_url"],
            head_branch=head_branch,
            base_branch=base_branch,
            status=PRStatus.DRAFT if draft else PRStatus.OPEN,
            labels=labels or [],
        )

    async def add_pr_comment(self, pr_number: int, body: str) -> None:
        resp = await self._client.post(
            f"/repos/{self._owner}/{self._repo}/issues/{pr_number}/comments",
            json={"body": body},
        )
        resp.raise_for_status()

    async def add_pr_labels(self, pr_number: int, labels: list[str]) -> None:
        resp = await self._client.post(
            f"/repos/{self._owner}/{self._repo}/issues/{pr_number}/labels",
            json={"labels": labels},
        )
        resp.raise_for_status()

    # ----- Utility -----

    async def get_file_content(self, path: str, ref: str) -> str:
        resp = await self._client.get(
            f"/repos/{self._owner}/{self._repo}/contents/{path}",
            params={"ref": ref},
            headers={"Accept": "application/vnd.github.raw+json"},
        )
        resp.raise_for_status()
        return resp.text

    async def list_changed_files(self, base: str, head: str) -> list[str]:
        resp = await self._client.get(
            f"/repos/{self._owner}/{self._repo}/compare/{base}...{head}"
        )
        resp.raise_for_status()
        return [f["filename"] for f in resp.json().get("files", [])]

    async def close(self) -> None:
        await self._client.aclose()
