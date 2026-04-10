"""Git operations — clone, branch, commit, push."""

from __future__ import annotations

import asyncio
from pathlib import Path

from src.utils.logger import get_logger

log = get_logger("git")


async def _run(cmd: str, cwd: Path | None = None) -> tuple[int, str, str]:
    """Run a shell command and return (returncode, stdout, stderr)."""
    proc = await asyncio.create_subprocess_shell(
        cmd,
        cwd=str(cwd) if cwd else None,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    return (
        proc.returncode or 0,
        stdout.decode(errors="replace").strip(),
        stderr.decode(errors="replace").strip(),
    )


async def clone_repo(
    clone_url: str,
    dest: Path,
    branch: str = "",
    depth: int = 1,
) -> Path:
    """Shallow-clone a repository."""
    branch_flag = f"--branch {branch}" if branch else ""
    cmd = f"git clone --depth {depth} {branch_flag} {clone_url} {dest}"
    rc, out, err = await _run(cmd)
    if rc != 0:
        raise RuntimeError(f"git clone failed: {err}")
    log.info("cloned_repo", dest=str(dest), branch=branch)
    return dest


async def create_branch(repo_root: Path, branch_name: str) -> None:
    """Create and checkout a new branch."""
    rc, _, err = await _run(f"git checkout -b {branch_name}", cwd=repo_root)
    if rc != 0:
        raise RuntimeError(f"git checkout -b failed: {err}")
    log.info("created_branch", branch=branch_name)


async def stage_all(repo_root: Path) -> None:
    """Stage all changes."""
    await _run("git add -A", cwd=repo_root)


async def commit(repo_root: Path, message: str) -> str:
    """Commit staged changes. Returns the commit SHA."""
    await _run(
        'git -c user.name="AI Repair Agent" '
        '-c user.email="ai-repair@noreply" '
        f'commit -m "{message}"',
        cwd=repo_root,
    )
    rc, sha, _ = await _run("git rev-parse HEAD", cwd=repo_root)
    log.info("committed", sha=sha[:8], message=message)
    return sha


async def push(repo_root: Path, branch: str, token: str = "", remote_url: str = "") -> None:
    """Push a branch to remote."""
    if remote_url and token:
        # Inject token into URL for CI environments
        if remote_url.startswith("https://"):
            auth_url = remote_url.replace("https://", f"https://x-access-token:{token}@")
            await _run(f"git remote set-url origin {auth_url}", cwd=repo_root)

    rc, _, err = await _run(f"git push -u origin {branch}", cwd=repo_root)
    if rc != 0:
        raise RuntimeError(f"git push failed: {err}")
    log.info("pushed_branch", branch=branch)


async def get_diff_stat(repo_root: Path) -> int:
    """Return the total number of changed lines."""
    _, out, _ = await _run("git diff --cached --stat", cwd=repo_root)
    # Last line looks like "3 files changed, 15 insertions(+), 2 deletions(-)"
    for line in out.splitlines()[::-1]:
        if "changed" in line:
            import re
            numbers = re.findall(r"(\d+)\s+(?:insertion|deletion)", line)
            return sum(int(n) for n in numbers)
    return 0


async def has_changes(repo_root: Path) -> bool:
    """Check if there are any uncommitted changes."""
    rc, out, _ = await _run("git status --porcelain", cwd=repo_root)
    return bool(out.strip())
