"""Abstract base class for Git providers (GitHub, GitLab, Bitbucket)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from src.models import PRInfo, PRStatus, PipelineRun, ProviderConfig


class BaseProvider(ABC):
    """Provider-agnostic interface for CI/CD platform operations.

    Every concrete provider (GitHub, GitLab, Bitbucket) must implement
    all abstract methods. The repair agent only talks to this interface.
    """

    def __init__(self, config: ProviderConfig, owner: str, repo: str) -> None:
        self._config = config
        self._owner = owner
        self._repo = repo

    # ----- Pipeline Logs -----

    @abstractmethod
    async def get_failed_run(self, run_id: str) -> PipelineRun:
        """Fetch metadata for a specific failed pipeline run."""

    @abstractmethod
    async def get_run_logs(self, run_id: str) -> str:
        """Download the full text logs for a pipeline run."""

    # ----- Branch Operations -----

    @abstractmethod
    async def create_branch(self, branch_name: str, from_sha: str) -> None:
        """Create a new branch from the given commit SHA."""

    @abstractmethod
    async def branch_exists(self, branch_name: str) -> bool:
        """Check if a branch already exists."""

    # ----- Pull / Merge Request -----

    @abstractmethod
    async def create_pull_request(
        self,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str,
        labels: list[str] | None = None,
        draft: bool = False,
    ) -> PRInfo:
        """Open a pull/merge request."""

    @abstractmethod
    async def add_pr_comment(self, pr_number: int, body: str) -> None:
        """Add a comment to an existing PR."""

    @abstractmethod
    async def add_pr_labels(self, pr_number: int, labels: list[str]) -> None:
        """Add labels to a PR."""

    # ----- Utility -----

    @abstractmethod
    async def get_file_content(self, path: str, ref: str) -> str:
        """Read a file from the repository at a given ref."""

    @abstractmethod
    async def list_changed_files(self, base: str, head: str) -> list[str]:
        """List files changed between two refs."""

    async def close(self) -> None:
        """Clean up resources (HTTP clients, etc.)."""
