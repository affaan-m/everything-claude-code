"""GitLab provider — implements BaseProvider for GitLab CI/CD."""

from __future__ import annotations

from datetime import datetime
from urllib.parse import quote

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from src.models import PRInfo, PRStatus, PipelineRun, ProviderConfig, ProviderType
from src.providers.base import BaseProvider


class GitLabProvider(BaseProvider):
    """GitLab REST API v4 implementation."""

    def __init__(self, config: ProviderConfig, owner: str, repo: str) -> None:
        super().__init__(config, owner, repo)
        self._project_path = quote(f"{owner}/{repo}", safe="")
        self._client = httpx.AsyncClient(
            base_url=config.api_url.rstrip("/"),
            headers={
                "PRIVATE-TOKEN": config.token,
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    # ----- Pipeline Logs -----

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def get_failed_run(self, run_id: str) -> PipelineRun:
        resp = await self._client.get(
            f"/projects/{self._project_path}/pipelines/{run_id}"
        )
        resp.raise_for_status()
        data = resp.json()

        return PipelineRun(
            run_id=str(data["id"]),
            provider=ProviderType.GITLAB,
            repo_owner=self._owner,
            repo_name=self._repo,
            branch=data.get("ref", ""),
            commit_sha=data.get("sha", ""),
            trigger_event=data.get("source", ""),
            status=data.get("status", "failed"),
            url=data.get("web_url", ""),
            started_at=(
                datetime.fromisoformat(data["started_at"])
                if data.get("started_at")
                else None
            ),
            finished_at=(
                datetime.fromisoformat(data["finished_at"])
                if data.get("finished_at")
                else None
            ),
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def get_run_logs(self, run_id: str) -> str:
        # Get all jobs for this pipeline
        jobs_resp = await self._client.get(
            f"/projects/{self._project_path}/pipelines/{run_id}/jobs"
        )
        jobs_resp.raise_for_status()
        jobs = jobs_resp.json()

        log_parts: list[str] = []
        for job in jobs:
            if job.get("status") == "failed":
                job_id = job["id"]
                log_resp = await self._client.get(
                    f"/projects/{self._project_path}/jobs/{job_id}/trace"
                )
                if log_resp.status_code == 200:
                    log_parts.append(
                        f"=== Job: {job.get('name', job_id)} ===\n{log_resp.text}"
                    )

        return "\n\n".join(log_parts) if log_parts else ""

    # ----- Branch Operations -----

    async def create_branch(self, branch_name: str, from_sha: str) -> None:
        resp = await self._client.post(
            f"/projects/{self._project_path}/repository/branches",
            json={"branch": branch_name, "ref": from_sha},
        )
        resp.raise_for_status()

    async def branch_exists(self, branch_name: str) -> bool:
        encoded = quote(branch_name, safe="")
        resp = await self._client.get(
            f"/projects/{self._project_path}/repository/branches/{encoded}"
        )
        return resp.status_code == 200

    # ----- Merge Request -----

    async def create_pull_request(
        self,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str,
        labels: list[str] | None = None,
        draft: bool = False,
    ) -> PRInfo:
        payload: dict = {
            "source_branch": head_branch,
            "target_branch": base_branch,
            "title": f"Draft: {title}" if draft else title,
            "description": body,
        }
        if labels:
            payload["labels"] = ",".join(labels)

        resp = await self._client.post(
            f"/projects/{self._project_path}/merge_requests",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

        return PRInfo(
            number=data["iid"],
            title=data["title"],
            body=data.get("description", ""),
            url=data["web_url"],
            head_branch=head_branch,
            base_branch=base_branch,
            status=PRStatus.DRAFT if draft else PRStatus.OPEN,
            labels=labels or [],
        )

    async def add_pr_comment(self, pr_number: int, body: str) -> None:
        resp = await self._client.post(
            f"/projects/{self._project_path}/merge_requests/{pr_number}/notes",
            json={"body": body},
        )
        resp.raise_for_status()

    async def add_pr_labels(self, pr_number: int, labels: list[str]) -> None:
        resp = await self._client.put(
            f"/projects/{self._project_path}/merge_requests/{pr_number}",
            json={"labels": ",".join(labels)},
        )
        resp.raise_for_status()

    # ----- Utility -----

    async def get_file_content(self, path: str, ref: str) -> str:
        encoded_path = quote(path, safe="")
        resp = await self._client.get(
            f"/projects/{self._project_path}/repository/files/{encoded_path}/raw",
            params={"ref": ref},
        )
        resp.raise_for_status()
        return resp.text

    async def list_changed_files(self, base: str, head: str) -> list[str]:
        resp = await self._client.get(
            f"/projects/{self._project_path}/repository/compare",
            params={"from": base, "to": head},
        )
        resp.raise_for_status()
        return [d["new_path"] for d in resp.json().get("diffs", [])]

    async def close(self) -> None:
        await self._client.aclose()
