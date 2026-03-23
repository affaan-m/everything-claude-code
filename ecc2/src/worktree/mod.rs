use anyhow::{Context, Result};
use std::path::PathBuf;
use std::process::Command;

use crate::config::Config;
use crate::session::WorktreeInfo;

/// Create a new git worktree for an agent session.
pub fn create_for_session(session_id: &str, cfg: &Config) -> Result<WorktreeInfo> {
    let branch = format!("ecc/{session_id}");
    let path = cfg.worktree_root.join(session_id);

    // Get current branch as base
    let base = get_current_branch()?;

    std::fs::create_dir_all(&cfg.worktree_root)
        .context("Failed to create worktree root directory")?;

    let output = Command::new("git")
        .args(["worktree", "add", "-b", &branch])
        .arg(&path)
        .arg("HEAD")
        .output()
        .context("Failed to run git worktree add")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("git worktree add failed: {stderr}");
    }

    tracing::info!(
        "Created worktree at {} on branch {}",
        path.display(),
        branch
    );

    Ok(WorktreeInfo {
        path,
        branch,
        base_branch: base,
    })
}

/// Remove a worktree and its branch.
pub fn remove(path: &PathBuf) -> Result<()> {
    let output = Command::new("git")
        .args(["worktree", "remove", "--force"])
        .arg(path)
        .output()
        .context("Failed to remove worktree")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        tracing::warn!("Worktree removal warning: {stderr}");
    }

    Ok(())
}

/// List all active worktrees.
pub fn list() -> Result<Vec<String>> {
    let output = Command::new("git")
        .args(["worktree", "list", "--porcelain"])
        .output()
        .context("Failed to list worktrees")?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let worktrees: Vec<String> = stdout
        .lines()
        .filter(|l| l.starts_with("worktree "))
        .map(|l| l.trim_start_matches("worktree ").to_string())
        .collect();

    Ok(worktrees)
}

fn get_current_branch() -> Result<String> {
    let output = Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .output()
        .context("Failed to get current branch")?;

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
