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

    let heartbeat_interval = Duration::from_secs(cfg.heartbeat_interval_secs);
    let timeout = Duration::from_secs(cfg.session_timeout_secs);

    loop {
        if let Err(e) = check_sessions(&db, timeout) {
            tracing::error!("Session check failed: {e}");
        }

        time::sleep(heartbeat_interval).await;
    }
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
            db.update_state(&session.id, &SessionState::Failed)?;
        }
    }

    Ok(())
}
