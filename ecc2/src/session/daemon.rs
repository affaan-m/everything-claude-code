use anyhow::Result;
use std::time::Duration;
use tokio::time;

use super::store::StateStore;
use super::SessionState;
use crate::config::Config;

/// Background daemon that monitors sessions, handles heartbeats,
/// and cleans up stale resources.
pub async fn run(db: StateStore, cfg: Config) -> Result<()> {
    tracing::info!("ECC daemon started");
    resume_crashed_sessions(&db)?;

    let heartbeat_interval = Duration::from_secs(cfg.heartbeat_interval_secs);
    let timeout = Duration::from_secs(cfg.session_timeout_secs);

    loop {
        if let Err(e) = check_sessions(&db, timeout) {
            tracing::error!("Session check failed: {e}");
        }

        time::sleep(heartbeat_interval).await;
    }
}

pub fn resume_crashed_sessions(db: &StateStore) -> Result<()> {
    let failed_sessions = resume_crashed_sessions_with(db, pid_is_alive)?;
    if failed_sessions > 0 {
        tracing::warn!("Marked {failed_sessions} crashed sessions as failed during daemon startup");
    }
    Ok(())
}

fn resume_crashed_sessions_with<F>(db: &StateStore, is_pid_alive: F) -> Result<usize>
where
    F: Fn(u32) -> bool,
{
    let sessions = db.list_sessions()?;
    let mut failed_sessions = 0;

    for session in sessions {
        if session.state != SessionState::Running {
            continue;
        }

        let is_alive = session.pid.is_some_and(&is_pid_alive);
        if is_alive {
            continue;
        }

        tracing::warn!(
            "Session {} was left running with stale pid {:?}; marking it failed",
            session.id,
            session.pid
        );
        db.update_state_and_pid(&session.id, &SessionState::Failed, None)?;
        failed_sessions += 1;
    }

    Ok(failed_sessions)
}

fn check_sessions(db: &StateStore, timeout: Duration) -> Result<()> {
    let sessions = db.list_sessions()?;

    for session in sessions {
        if session.state != SessionState::Running {
            continue;
        }

        let elapsed = chrono::Utc::now()
            .signed_duration_since(session.updated_at)
            .to_std()
            .unwrap_or(Duration::ZERO);

        if elapsed > timeout {
            tracing::warn!("Session {} timed out after {:?}", session.id, elapsed);
            db.update_state_and_pid(&session.id, &SessionState::Failed, None)?;
        }
    }

    Ok(())
}

#[cfg(unix)]
fn pid_is_alive(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }

    // SAFETY: kill(pid, 0) probes process existence without delivering a signal.
    let result = unsafe { libc::kill(pid as libc::pid_t, 0) };
    if result == 0 {
        return true;
    }

    matches!(
        std::io::Error::last_os_error().raw_os_error(),
        Some(code) if code == libc::EPERM
    )
}

#[cfg(not(unix))]
fn pid_is_alive(_pid: u32) -> bool {
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::{Session, SessionMetrics, SessionState};
    use std::path::PathBuf;

    fn temp_db_path() -> PathBuf {
        std::env::temp_dir().join(format!("ecc2-daemon-test-{}.db", uuid::Uuid::new_v4()))
    }

    fn sample_session(id: &str, state: SessionState, pid: Option<u32>) -> Session {
        let now = chrono::Utc::now();
        Session {
            id: id.to_string(),
            task: "Recover crashed worker".to_string(),
            agent_type: "claude".to_string(),
            state,
            pid,
            worktree: None,
            created_at: now,
            updated_at: now,
            metrics: SessionMetrics::default(),
        }
    }

    #[test]
    fn resume_crashed_sessions_marks_dead_running_sessions_failed() -> Result<()> {
        let path = temp_db_path();
        let store = StateStore::open(&path)?;
        store.insert_session(&sample_session(
            "deadbeef",
            SessionState::Running,
            Some(4242),
        ))?;

        resume_crashed_sessions_with(&store, |_| false)?;

        let session = store
            .get_session("deadbeef")?
            .expect("session should still exist");
        assert_eq!(session.state, SessionState::Failed);
        assert_eq!(session.pid, None);

        let _ = std::fs::remove_file(path);
        Ok(())
    }

    #[test]
    fn resume_crashed_sessions_keeps_live_running_sessions_running() -> Result<()> {
        let path = temp_db_path();
        let store = StateStore::open(&path)?;
        store.insert_session(&sample_session(
            "alive123",
            SessionState::Running,
            Some(7777),
        ))?;

        resume_crashed_sessions_with(&store, |_| true)?;

        let session = store
            .get_session("alive123")?
            .expect("session should still exist");
        assert_eq!(session.state, SessionState::Running);
        assert_eq!(session.pid, Some(7777));

        let _ = std::fs::remove_file(path);
        Ok(())
    }
}
