use anyhow::Result;
use std::fmt;

use super::{Session, SessionMetrics, SessionState};
use super::store::StateStore;
use crate::config::Config;
use crate::worktree;

pub async fn create_session(
    db: &StateStore,
    cfg: &Config,
    task: &str,
    agent_type: &str,
    use_worktree: bool,
) -> Result<String> {
    let id = uuid::Uuid::new_v4().to_string()[..8].to_string();
    let now = chrono::Utc::now();

    let wt = if use_worktree {
        Some(worktree::create_for_session(&id, cfg)?)
    } else {
        None
    };

    let session = Session {
        id: id.clone(),
        task: task.to_string(),
        agent_type: agent_type.to_string(),
        state: SessionState::Pending,
        worktree: wt,
        created_at: now,
        updated_at: now,
        metrics: SessionMetrics::default(),
    };

    db.insert_session(&session)?;
    Ok(id)
}

pub fn list_sessions(db: &StateStore) -> Result<Vec<Session>> {
    db.list_sessions()
}

pub fn get_status(db: &StateStore, id: &str) -> Result<SessionStatus> {
    let session = db
        .get_session(id)?
        .ok_or_else(|| anyhow::anyhow!("Session not found: {id}"))?;
    Ok(SessionStatus(session))
}

pub async fn stop_session(db: &StateStore, id: &str) -> Result<()> {
    db.update_state(id, &SessionState::Stopped)?;
    Ok(())
}

pub struct SessionStatus(Session);

impl fmt::Display for SessionStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = &self.0;
        writeln!(f, "Session: {}", s.id)?;
        writeln!(f, "Task:    {}", s.task)?;
        writeln!(f, "Agent:   {}", s.agent_type)?;
        writeln!(f, "State:   {}", s.state)?;
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
