use anyhow::{Context, Result};
use std::fmt;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

use super::output::SessionOutputStore;
use super::runtime::capture_command_output;
use super::store::StateStore;
use super::{Session, SessionMetrics, SessionState};
use crate::config::Config;
use crate::observability::{log_tool_call, ToolCallEvent, ToolLogEntry, ToolLogPage, ToolLogger};
use crate::worktree;

pub async fn create_session(
    db: &StateStore,
    cfg: &Config,
    task: &str,
    agent_type: &str,
    use_worktree: bool,
) -> Result<String> {
    let repo_root =
        std::env::current_dir().context("Failed to resolve current working directory")?;
    queue_session_in_dir(db, cfg, task, agent_type, use_worktree, &repo_root).await
}

pub fn list_sessions(db: &StateStore) -> Result<Vec<Session>> {
    db.list_sessions()
}

pub fn get_status(db: &StateStore, id: &str) -> Result<SessionStatus> {
    let session = resolve_session(db, id)?;
    Ok(SessionStatus(session))
}

pub async fn stop_session(db: &StateStore, id: &str) -> Result<()> {
    stop_session_with_options(db, id, true).await
}

pub fn record_tool_call(
    db: &StateStore,
    session_id: &str,
    tool_name: &str,
    input_summary: &str,
    output_summary: &str,
    duration_ms: u64,
) -> Result<ToolLogEntry> {
    let session = db
        .get_session(session_id)?
        .ok_or_else(|| anyhow::anyhow!("Session not found: {session_id}"))?;

    let event = ToolCallEvent::new(
        session.id.clone(),
        tool_name,
        input_summary,
        output_summary,
        duration_ms,
    );
    let entry = log_tool_call(db, &event)?;
    db.increment_tool_calls(&session.id)?;

    Ok(entry)
}

pub fn query_tool_calls(
    db: &StateStore,
    session_id: &str,
    page: u64,
    page_size: u64,
) -> Result<ToolLogPage> {
    let session = db
        .get_session(session_id)?
        .ok_or_else(|| anyhow::anyhow!("Session not found: {session_id}"))?;

    ToolLogger::new(db).query(&session.id, page, page_size)
}

pub async fn resume_session(db: &StateStore, id: &str) -> Result<String> {
    let session = resolve_session(db, id)?;

    if session.state == SessionState::Completed {
        anyhow::bail!("Completed sessions cannot be resumed: {}", session.id);
    }

    if session.state == SessionState::Running {
        anyhow::bail!("Session is already running: {}", session.id);
    }

    db.update_state_and_pid(&session.id, &SessionState::Pending, None)?;
    Ok(session.id)
}

fn agent_program(agent_type: &str) -> Result<PathBuf> {
    match agent_type {
        "claude" => Ok(PathBuf::from("claude")),
        other => anyhow::bail!("Unsupported agent type: {other}"),
    }
}

fn resolve_session(db: &StateStore, id: &str) -> Result<Session> {
    let session = if id == "latest" {
        db.get_latest_session()?
    } else {
        db.get_session(id)?
    };

    session.ok_or_else(|| anyhow::anyhow!("Session not found: {id}"))
}

pub async fn run_session(
    cfg: &Config,
    session_id: &str,
    task: &str,
    agent_type: &str,
    working_dir: &Path,
) -> Result<()> {
    let db = StateStore::open(&cfg.db_path)?;
    let session = resolve_session(&db, session_id)?;

    if session.state != SessionState::Pending {
        tracing::info!(
            "Skipping run_session for {} because state is {}",
            session_id,
            session.state
        );
        return Ok(());
    }

    let agent_program = agent_program(agent_type)?;
    let command = build_agent_command(&agent_program, task, session_id, working_dir);
    capture_command_output(
        cfg.db_path.clone(),
        session_id.to_string(),
        command,
        SessionOutputStore::default(),
    )
    .await?;
    Ok(())
}

async fn queue_session_in_dir(
    db: &StateStore,
    cfg: &Config,
    task: &str,
    agent_type: &str,
    use_worktree: bool,
    repo_root: &Path,
) -> Result<String> {
    let session = build_session_record(task, agent_type, use_worktree, cfg, repo_root)?;
    db.insert_session(&session)?;

    let working_dir = session
        .worktree
        .as_ref()
        .map(|worktree| worktree.path.as_path())
        .unwrap_or(repo_root);

    match spawn_session_runner(task, &session.id, agent_type, working_dir).await {
        Ok(()) => Ok(session.id),
        Err(error) => {
            db.update_state(&session.id, &SessionState::Failed)?;

            if let Some(worktree) = session.worktree.as_ref() {
                let _ = crate::worktree::remove(&worktree.path);
            }

            Err(error.context(format!("Failed to queue session {}", session.id)))
        }
    }
}

fn build_session_record(
    task: &str,
    agent_type: &str,
    use_worktree: bool,
    cfg: &Config,
    repo_root: &Path,
) -> Result<Session> {
    let id = uuid::Uuid::new_v4().to_string()[..8].to_string();
    let now = chrono::Utc::now();

    let worktree = if use_worktree {
        Some(worktree::create_for_session_in_repo(&id, cfg, repo_root)?)
    } else {
        None
    };

    Ok(Session {
        id,
        task: task.to_string(),
        agent_type: agent_type.to_string(),
        state: SessionState::Pending,
        pid: None,
        worktree,
        created_at: now,
        updated_at: now,
        metrics: SessionMetrics::default(),
    })
}

async fn create_session_in_dir(
    db: &StateStore,
    cfg: &Config,
    task: &str,
    agent_type: &str,
    use_worktree: bool,
    repo_root: &Path,
    agent_program: &Path,
) -> Result<String> {
    let session = build_session_record(task, agent_type, use_worktree, cfg, repo_root)?;

    db.insert_session(&session)?;

    let working_dir = session
        .worktree
        .as_ref()
        .map(|worktree| worktree.path.as_path())
        .unwrap_or(repo_root);

    match spawn_claude_code(agent_program, task, &session.id, working_dir).await {
        Ok(pid) => {
            db.update_pid(&session.id, Some(pid))?;
            db.update_state(&session.id, &SessionState::Running)?;
            Ok(session.id)
        }
        Err(error) => {
            db.update_state(&session.id, &SessionState::Failed)?;

            if let Some(worktree) = session.worktree.as_ref() {
                let _ = crate::worktree::remove(&worktree.path);
            }

            Err(error.context(format!("Failed to start session {}", session.id)))
        }
    }
}

async fn spawn_session_runner(
    task: &str,
    session_id: &str,
    agent_type: &str,
    working_dir: &Path,
) -> Result<()> {
    let current_exe = std::env::current_exe().context("Failed to resolve ECC executable path")?;
    let child = Command::new(&current_exe)
        .arg("run-session")
        .arg("--session-id")
        .arg(session_id)
        .arg("--task")
        .arg(task)
        .arg("--agent")
        .arg(agent_type)
        .arg("--cwd")
        .arg(working_dir)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .with_context(|| {
            format!(
                "Failed to spawn ECC runner from {}",
                current_exe.display()
            )
        })?;

    child
        .id()
        .ok_or_else(|| anyhow::anyhow!("ECC runner did not expose a process id"))?;
    Ok(())
}

fn build_agent_command(agent_program: &Path, task: &str, session_id: &str, working_dir: &Path) -> Command {
    let mut command = Command::new(agent_program);
    command
        .arg("--print")
        .arg("--name")
        .arg(format!("ecc-{session_id}"))
        .arg(task)
        .current_dir(working_dir)
        .stdin(Stdio::null());
    command
}

async fn spawn_claude_code(
    agent_program: &Path,
    task: &str,
    session_id: &str,
    working_dir: &Path,
) -> Result<u32> {
    let mut command = build_agent_command(agent_program, task, session_id, working_dir);
    let child = command
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .with_context(|| {
            format!(
                "Failed to spawn Claude Code from {}",
                agent_program.display()
            )
        })?;

    child
        .id()
        .ok_or_else(|| anyhow::anyhow!("Claude Code did not expose a process id"))
}

async fn stop_session_with_options(
    db: &StateStore,
    id: &str,
    cleanup_worktree: bool,
) -> Result<()> {
    let session = resolve_session(db, id)?;

    if let Some(pid) = session.pid {
        kill_process(pid).await?;
    }

    db.update_pid(&session.id, None)?;
    db.update_state(&session.id, &SessionState::Stopped)?;

    if cleanup_worktree {
        if let Some(worktree) = session.worktree.as_ref() {
            crate::worktree::remove(&worktree.path)?;
        }
    }

    Ok(())
}

#[cfg(unix)]
async fn kill_process(pid: u32) -> Result<()> {
    send_signal(pid, libc::SIGTERM)?;
    tokio::time::sleep(std::time::Duration::from_millis(1200)).await;
    send_signal(pid, libc::SIGKILL)?;
    Ok(())
}

#[cfg(unix)]
fn send_signal(pid: u32, signal: i32) -> Result<()> {
    let outcome = unsafe { libc::kill(pid as i32, signal) };
    if outcome == 0 {
        return Ok(());
    }

    let error = std::io::Error::last_os_error();
    if error.raw_os_error() == Some(libc::ESRCH) {
        return Ok(());
    }

    Err(error).with_context(|| format!("Failed to kill process {pid}"))
}

#[cfg(not(unix))]
async fn kill_process(pid: u32) -> Result<()> {
    let status = Command::new("taskkill")
        .args(["/F", "/PID", &pid.to_string()])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .await
        .with_context(|| format!("Failed to invoke taskkill for process {pid}"))?;

    if status.success() {
        Ok(())
    } else {
        anyhow::bail!("taskkill failed for process {pid}");
    }
}

pub struct SessionStatus(Session);

impl fmt::Display for SessionStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = &self.0;
        writeln!(f, "Session: {}", s.id)?;
        writeln!(f, "Task:    {}", s.task)?;
        writeln!(f, "Agent:   {}", s.agent_type)?;
        writeln!(f, "State:   {}", s.state)?;
        if let Some(pid) = s.pid {
            writeln!(f, "PID:     {}", pid)?;
        }
        if let Some(ref wt) = s.worktree {
            writeln!(f, "Branch:  {}", wt.branch)?;
            writeln!(f, "Worktree: {}", wt.path.display())?;
        }
        writeln!(f, "Tokens:  {}", s.metrics.tokens_used)?;
        writeln!(f, "Tools:   {}", s.metrics.tool_calls)?;
        writeln!(f, "Files:   {}", s.metrics.files_changed)?;
        writeln!(f, "Cost:    ${:.4}", s.metrics.cost_usd)?;
        writeln!(f, "Created: {}", s.created_at)?;
        write!(f, "Updated: {}", s.updated_at)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::{Config, PaneLayout, Theme};
    use crate::session::{Session, SessionMetrics, SessionState};
    use anyhow::{Context, Result};
    use chrono::{Duration, Utc};
    use std::fs;
    use std::os::unix::fs::PermissionsExt;
    use std::path::{Path, PathBuf};
    use std::process::Command as StdCommand;
    use std::thread;
    use std::time::Duration as StdDuration;

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(label: &str) -> Result<Self> {
            let path =
                std::env::temp_dir().join(format!("ecc2-{}-{}", label, uuid::Uuid::new_v4()));
            fs::create_dir_all(&path)?;
            Ok(Self { path })
        }

        fn path(&self) -> &Path {
            &self.path
        }
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    fn build_config(root: &Path) -> Config {
        Config {
            db_path: root.join("state.db"),
            worktree_root: root.join("worktrees"),
            max_parallel_sessions: 4,
            max_parallel_worktrees: 4,
            session_timeout_secs: 60,
            heartbeat_interval_secs: 5,
            default_agent: "claude".to_string(),
            cost_budget_usd: 10.0,
            token_budget: 500_000,
            theme: Theme::Dark,
            pane_layout: PaneLayout::Horizontal,
            risk_thresholds: Config::RISK_THRESHOLDS,
        }
    }

    fn build_session(id: &str, state: SessionState, updated_at: chrono::DateTime<Utc>) -> Session {
        Session {
            id: id.to_string(),
            task: format!("task-{id}"),
            agent_type: "claude".to_string(),
            state,
            pid: None,
            worktree: None,
            created_at: updated_at - Duration::minutes(1),
            updated_at,
            metrics: SessionMetrics::default(),
        }
    }

    fn init_git_repo(path: &Path) -> Result<()> {
        fs::create_dir_all(path)?;
        run_git(path, ["init", "-q"])?;
        fs::write(path.join("README.md"), "hello\n")?;
        run_git(path, ["add", "README.md"])?;
        run_git(
            path,
            [
                "-c",
                "user.name=ECC Tests",
                "-c",
                "user.email=ecc-tests@example.com",
                "commit",
                "-qm",
                "init",
            ],
        )?;
        Ok(())
    }

    fn run_git<const N: usize>(path: &Path, args: [&str; N]) -> Result<()> {
        let status = StdCommand::new("git")
            .args(args)
            .current_dir(path)
            .status()
            .with_context(|| format!("failed to run git in {}", path.display()))?;

        if !status.success() {
            anyhow::bail!("git command failed in {}", path.display());
        }

        Ok(())
    }

    fn write_fake_claude(root: &Path) -> Result<(PathBuf, PathBuf)> {
        let script_path = root.join("fake-claude.sh");
        let log_path = root.join("fake-claude.log");
        let script = format!(
            "#!/usr/bin/env python3\nimport os\nimport pathlib\nimport signal\nimport sys\nimport time\n\nlog_path = pathlib.Path(r\"{}\")\nlog_path.write_text(os.getcwd() + \"\\n\", encoding=\"utf-8\")\nwith log_path.open(\"a\", encoding=\"utf-8\") as handle:\n    handle.write(\" \".join(sys.argv[1:]) + \"\\n\")\n\ndef handle_term(signum, frame):\n    raise SystemExit(0)\n\nsignal.signal(signal.SIGTERM, handle_term)\nwhile True:\n    time.sleep(0.1)\n",
            log_path.display()
        );

        fs::write(&script_path, script)?;
        let mut permissions = fs::metadata(&script_path)?.permissions();
        permissions.set_mode(0o755);
        fs::set_permissions(&script_path, permissions)?;

        Ok((script_path, log_path))
    }

    fn wait_for_file(path: &Path) -> Result<String> {
        for _ in 0..50 {
            if path.exists() {
                return fs::read_to_string(path)
                    .with_context(|| format!("failed to read {}", path.display()));
            }

            thread::sleep(StdDuration::from_millis(20));
        }

        anyhow::bail!("timed out waiting for {}", path.display());
    }

    #[tokio::test(flavor = "current_thread")]
    async fn create_session_spawns_process_and_marks_session_running() -> Result<()> {
        let tempdir = TestDir::new("manager-create-session")?;
        let repo_root = tempdir.path().join("repo");
        init_git_repo(&repo_root)?;

        let cfg = build_config(tempdir.path());
        let db = StateStore::open(&cfg.db_path)?;
        let (fake_claude, log_path) = write_fake_claude(tempdir.path())?;

        let session_id = create_session_in_dir(
            &db,
            &cfg,
            "implement lifecycle",
            "claude",
            false,
            &repo_root,
            &fake_claude,
        )
        .await?;

        let session = db
            .get_session(&session_id)?
            .context("session should exist")?;
        assert_eq!(session.state, SessionState::Running);
        assert!(
            session.pid.is_some(),
            "spawned session should persist a pid"
        );

        let log = wait_for_file(&log_path)?;
        assert!(log.contains(repo_root.to_string_lossy().as_ref()));
        assert!(log.contains("--print"));
        assert!(log.contains("implement lifecycle"));

        stop_session_with_options(&db, &session_id, false).await?;
        Ok(())
    }

    #[tokio::test(flavor = "current_thread")]
    async fn stop_session_kills_process_and_optionally_cleans_worktree() -> Result<()> {
        let tempdir = TestDir::new("manager-stop-session")?;
        let repo_root = tempdir.path().join("repo");
        init_git_repo(&repo_root)?;

        let cfg = build_config(tempdir.path());
        let db = StateStore::open(&cfg.db_path)?;
        let (fake_claude, _) = write_fake_claude(tempdir.path())?;

        let keep_id = create_session_in_dir(
            &db,
            &cfg,
            "keep worktree",
            "claude",
            true,
            &repo_root,
            &fake_claude,
        )
        .await?;
        let keep_session = db.get_session(&keep_id)?.context("keep session missing")?;
        keep_session.pid.context("keep session pid missing")?;
        let keep_worktree = keep_session
            .worktree
            .clone()
            .context("keep session worktree missing")?
            .path;

        stop_session_with_options(&db, &keep_id, false).await?;

        let stopped_keep = db
            .get_session(&keep_id)?
            .context("stopped keep session missing")?;
        assert_eq!(stopped_keep.state, SessionState::Stopped);
        assert_eq!(stopped_keep.pid, None);
        assert!(
            keep_worktree.exists(),
            "worktree should remain when cleanup is disabled"
        );

        let cleanup_id = create_session_in_dir(
            &db,
            &cfg,
            "cleanup worktree",
            "claude",
            true,
            &repo_root,
            &fake_claude,
        )
        .await?;
        let cleanup_session = db
            .get_session(&cleanup_id)?
            .context("cleanup session missing")?;
        let cleanup_worktree = cleanup_session
            .worktree
            .clone()
            .context("cleanup session worktree missing")?
            .path;

        stop_session_with_options(&db, &cleanup_id, true).await?;
        assert!(
            !cleanup_worktree.exists(),
            "worktree should be removed when cleanup is enabled"
        );

        Ok(())
    }

    #[tokio::test(flavor = "current_thread")]
    async fn resume_session_requeues_failed_session() -> Result<()> {
        let tempdir = TestDir::new("manager-resume-session")?;
        let cfg = build_config(tempdir.path());
        let db = StateStore::open(&cfg.db_path)?;
        let now = Utc::now();

        db.insert_session(&Session {
            id: "deadbeef".to_string(),
            task: "resume previous task".to_string(),
            agent_type: "claude".to_string(),
            state: SessionState::Failed,
            pid: Some(31337),
            worktree: None,
            created_at: now - Duration::minutes(1),
            updated_at: now,
            metrics: SessionMetrics::default(),
        })?;

        let resumed_id = resume_session(&db, "deadbeef").await?;
        let resumed = db
            .get_session(&resumed_id)?
            .context("resumed session should exist")?;

        assert_eq!(resumed.state, SessionState::Pending);
        assert_eq!(resumed.pid, None);

        Ok(())
    }

    #[test]
    fn get_status_supports_latest_alias() -> Result<()> {
        let tempdir = TestDir::new("manager-latest-status")?;
        let cfg = build_config(tempdir.path());
        let db = StateStore::open(&cfg.db_path)?;
        let older = Utc::now() - Duration::minutes(2);
        let newer = Utc::now();

        db.insert_session(&build_session("older", SessionState::Running, older))?;
        db.insert_session(&build_session("newer", SessionState::Idle, newer))?;

        let status = get_status(&db, "latest")?;
        assert_eq!(status.0.id, "newer");

        Ok(())
    }
}
