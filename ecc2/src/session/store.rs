use anyhow::{Context, Result};
use rusqlite::{Connection, OptionalExtension};
use std::path::{Path, PathBuf};
use std::time::Duration;

use crate::observability::{ToolLogEntry, ToolLogPage};

use super::output::{OutputLine, OutputStream, OUTPUT_BUFFER_LIMIT};
use super::{Session, SessionMetrics, SessionState};

pub struct StateStore {
    conn: Connection,
}

impl StateStore {
    pub fn open(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;
        conn.busy_timeout(Duration::from_secs(5))?;
        let store = Self { conn };
        store.init_schema()?;
        Ok(store)
    }

    fn init_schema(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                task TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                state TEXT NOT NULL DEFAULT 'pending',
                pid INTEGER,
                worktree_path TEXT,
                worktree_branch TEXT,
                worktree_base TEXT,
                tokens_used INTEGER DEFAULT 0,
                tool_calls INTEGER DEFAULT 0,
                files_changed INTEGER DEFAULT 0,
                duration_secs INTEGER DEFAULT 0,
                cost_usd REAL DEFAULT 0.0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tool_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                tool_name TEXT NOT NULL,
                input_summary TEXT,
                output_summary TEXT,
                duration_ms INTEGER,
                risk_score REAL DEFAULT 0.0,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_session TEXT NOT NULL,
                to_session TEXT NOT NULL,
                content TEXT NOT NULL,
                msg_type TEXT NOT NULL DEFAULT 'info',
                read INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS session_output (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                stream TEXT NOT NULL,
                line TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_state ON sessions(state);
            CREATE INDEX IF NOT EXISTS idx_tool_log_session ON tool_log(session_id);
            CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_session, read);
            CREATE INDEX IF NOT EXISTS idx_session_output_session
                ON session_output(session_id, id);
            ",
        )?;
        self.ensure_session_columns()?;
        Ok(())
    }

    fn ensure_session_columns(&self) -> Result<()> {
        if !self.has_column("sessions", "pid")? {
            self.conn
                .execute("ALTER TABLE sessions ADD COLUMN pid INTEGER", [])
                .context("Failed to add pid column to sessions table")?;
        }

        Ok(())
    }

    fn has_column(&self, table: &str, column: &str) -> Result<bool> {
        let pragma = format!("PRAGMA table_info({table})");
        let mut stmt = self.conn.prepare(&pragma)?;
        let columns = stmt
            .query_map([], |row| row.get::<_, String>(1))?
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(columns.iter().any(|existing| existing == column))
    }

    pub fn insert_session(&self, session: &Session) -> Result<()> {
        self.conn.execute(
            "INSERT INTO sessions (id, task, agent_type, state, pid, worktree_path, worktree_branch, worktree_base, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![
                session.id,
                session.task,
                session.agent_type,
                session.state.to_string(),
                session.pid.map(i64::from),
                session
                    .worktree
                    .as_ref()
                    .map(|w| w.path.to_string_lossy().to_string()),
                session.worktree.as_ref().map(|w| w.branch.clone()),
                session.worktree.as_ref().map(|w| w.base_branch.clone()),
                session.created_at.to_rfc3339(),
                session.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn update_state_and_pid(
        &self,
        session_id: &str,
        state: &SessionState,
        pid: Option<u32>,
    ) -> Result<()> {
        let updated = self.conn.execute(
            "UPDATE sessions SET state = ?1, pid = ?2, updated_at = ?3 WHERE id = ?4",
            rusqlite::params![
                state.to_string(),
                pid.map(i64::from),
                chrono::Utc::now().to_rfc3339(),
                session_id,
            ],
        )?;

        if updated == 0 {
            anyhow::bail!("Session not found: {session_id}");
        }

        Ok(())
    }

    pub fn update_state(&self, session_id: &str, state: &SessionState) -> Result<()> {
        let current_state = self
            .conn
            .query_row(
                "SELECT state FROM sessions WHERE id = ?1",
                [session_id],
                |row| row.get::<_, String>(0),
            )
            .optional()?
            .map(|raw| SessionState::from_db_value(&raw))
            .ok_or_else(|| anyhow::anyhow!("Session not found: {session_id}"))?;

        if !current_state.can_transition_to(state) {
            anyhow::bail!(
                "Invalid session state transition: {} -> {}",
                current_state,
                state
            );
        }

        let updated = self.conn.execute(
            "UPDATE sessions SET state = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![
                state.to_string(),
                chrono::Utc::now().to_rfc3339(),
                session_id,
            ],
        )?;

        if updated == 0 {
            anyhow::bail!("Session not found: {session_id}");
        }

        Ok(())
    }

    pub fn update_pid(&self, session_id: &str, pid: Option<u32>) -> Result<()> {
        let updated = self.conn.execute(
            "UPDATE sessions SET pid = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![
                pid.map(i64::from),
                chrono::Utc::now().to_rfc3339(),
                session_id,
            ],
        )?;

        if updated == 0 {
            anyhow::bail!("Session not found: {session_id}");
        }

        Ok(())
    }

    pub fn update_metrics(&self, session_id: &str, metrics: &SessionMetrics) -> Result<()> {
        self.conn.execute(
            "UPDATE sessions SET tokens_used = ?1, tool_calls = ?2, files_changed = ?3, duration_secs = ?4, cost_usd = ?5, updated_at = ?6 WHERE id = ?7",
            rusqlite::params![
                metrics.tokens_used,
                metrics.tool_calls,
                metrics.files_changed,
                metrics.duration_secs,
                metrics.cost_usd,
                chrono::Utc::now().to_rfc3339(),
                session_id,
            ],
        )?;
        Ok(())
    }

    pub fn increment_tool_calls(&self, session_id: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE sessions SET tool_calls = tool_calls + 1, updated_at = ?1 WHERE id = ?2",
            rusqlite::params![chrono::Utc::now().to_rfc3339(), session_id],
        )?;
        Ok(())
    }

    pub fn list_sessions(&self) -> Result<Vec<Session>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, task, agent_type, state, pid, worktree_path, worktree_branch, worktree_base,
                    tokens_used, tool_calls, files_changed, duration_secs, cost_usd,
                    created_at, updated_at
             FROM sessions ORDER BY updated_at DESC",
        )?;

        let sessions = stmt
            .query_map([], |row| {
                let state_str: String = row.get(3)?;
                let state = SessionState::from_db_value(&state_str);

                let worktree_path: Option<String> = row.get(5)?;
                let worktree = worktree_path.map(|path| super::WorktreeInfo {
                    path: PathBuf::from(path),
                    branch: row.get::<_, String>(6).unwrap_or_default(),
                    base_branch: row.get::<_, String>(7).unwrap_or_default(),
                });

                let created_str: String = row.get(13)?;
                let updated_str: String = row.get(14)?;

                Ok(Session {
                    id: row.get(0)?,
                    task: row.get(1)?,
                    agent_type: row.get(2)?,
                    state,
                    pid: row.get::<_, Option<u32>>(4)?,
                    worktree,
                    created_at: chrono::DateTime::parse_from_rfc3339(&created_str)
                        .unwrap_or_default()
                        .with_timezone(&chrono::Utc),
                    updated_at: chrono::DateTime::parse_from_rfc3339(&updated_str)
                        .unwrap_or_default()
                        .with_timezone(&chrono::Utc),
                    metrics: SessionMetrics {
                        tokens_used: row.get(8)?,
                        tool_calls: row.get(9)?,
                        files_changed: row.get(10)?,
                        duration_secs: row.get(11)?,
                        cost_usd: row.get(12)?,
                    },
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(sessions)
    }

    pub fn get_latest_session(&self) -> Result<Option<Session>> {
        Ok(self.list_sessions()?.into_iter().next())
    }

    pub fn get_session(&self, id: &str) -> Result<Option<Session>> {
        let sessions = self.list_sessions()?;
        Ok(sessions
            .into_iter()
            .find(|session| session.id == id || session.id.starts_with(id)))
    }

    pub fn send_message(&self, from: &str, to: &str, content: &str, msg_type: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO messages (from_session, to_session, content, msg_type, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![from, to, content, msg_type, chrono::Utc::now().to_rfc3339()],
        )?;
        Ok(())
    }

    pub fn append_output_line(
        &self,
        session_id: &str,
        stream: OutputStream,
        line: &str,
    ) -> Result<()> {
        let now = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO session_output (session_id, stream, line, timestamp)
             VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![session_id, stream.as_str(), line, now],
        )?;

        self.conn.execute(
            "DELETE FROM session_output
             WHERE session_id = ?1
               AND id NOT IN (
                   SELECT id
                   FROM session_output
                   WHERE session_id = ?1
                   ORDER BY id DESC
                   LIMIT ?2
               )",
            rusqlite::params![session_id, OUTPUT_BUFFER_LIMIT as i64],
        )?;

        self.conn.execute(
            "UPDATE sessions SET updated_at = ?1 WHERE id = ?2",
            rusqlite::params![chrono::Utc::now().to_rfc3339(), session_id],
        )?;

        Ok(())
    }

    pub fn get_output_lines(&self, session_id: &str, limit: usize) -> Result<Vec<OutputLine>> {
        let mut stmt = self.conn.prepare(
            "SELECT stream, line
             FROM (
                 SELECT id, stream, line
                 FROM session_output
                 WHERE session_id = ?1
                 ORDER BY id DESC
                 LIMIT ?2
             )
             ORDER BY id ASC",
        )?;

        let lines = stmt
            .query_map(rusqlite::params![session_id, limit as i64], |row| {
                let stream: String = row.get(0)?;
                let text: String = row.get(1)?;

                Ok(OutputLine {
                    stream: OutputStream::from_db_value(&stream),
                    text,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(lines)
    }

    pub fn insert_tool_log(
        &self,
        session_id: &str,
        tool_name: &str,
        input_summary: &str,
        output_summary: &str,
        duration_ms: u64,
        risk_score: f64,
        timestamp: &str,
    ) -> Result<ToolLogEntry> {
        self.conn.execute(
            "INSERT INTO tool_log (session_id, tool_name, input_summary, output_summary, duration_ms, risk_score, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                session_id,
                tool_name,
                input_summary,
                output_summary,
                duration_ms,
                risk_score,
                timestamp,
            ],
        )?;

        Ok(ToolLogEntry {
            id: self.conn.last_insert_rowid(),
            session_id: session_id.to_string(),
            tool_name: tool_name.to_string(),
            input_summary: input_summary.to_string(),
            output_summary: output_summary.to_string(),
            duration_ms,
            risk_score,
            timestamp: timestamp.to_string(),
        })
    }

    pub fn query_tool_logs(
        &self,
        session_id: &str,
        page: u64,
        page_size: u64,
    ) -> Result<ToolLogPage> {
        let page = page.max(1);
        let offset = (page - 1) * page_size;

        let total: u64 = self.conn.query_row(
            "SELECT COUNT(*) FROM tool_log WHERE session_id = ?1",
            rusqlite::params![session_id],
            |row| row.get(0),
        )?;

        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, tool_name, input_summary, output_summary, duration_ms, risk_score, timestamp
             FROM tool_log
             WHERE session_id = ?1
             ORDER BY timestamp DESC, id DESC
             LIMIT ?2 OFFSET ?3",
        )?;

        let entries = stmt
            .query_map(rusqlite::params![session_id, page_size, offset], |row| {
                Ok(ToolLogEntry {
                    id: row.get(0)?,
                    session_id: row.get(1)?,
                    tool_name: row.get(2)?,
                    input_summary: row.get::<_, Option<String>>(3)?.unwrap_or_default(),
                    output_summary: row.get::<_, Option<String>>(4)?.unwrap_or_default(),
                    duration_ms: row.get::<_, Option<u64>>(5)?.unwrap_or_default(),
                    risk_score: row.get::<_, Option<f64>>(6)?.unwrap_or_default(),
                    timestamp: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(ToolLogPage {
            entries,
            page,
            page_size,
            total,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Duration as ChronoDuration, Utc};
    use std::fs;

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

    fn build_session(id: &str, state: SessionState) -> Session {
        let now = Utc::now();
        Session {
            id: id.to_string(),
            task: "task".to_string(),
            agent_type: "claude".to_string(),
            state,
            pid: None,
            worktree: None,
            created_at: now - ChronoDuration::minutes(1),
            updated_at: now,
            metrics: SessionMetrics::default(),
        }
    }

    #[test]
    fn update_state_rejects_invalid_terminal_transition() -> Result<()> {
        let tempdir = TestDir::new("store-invalid-transition")?;
        let db = StateStore::open(&tempdir.path().join("state.db"))?;

        db.insert_session(&build_session("done", SessionState::Completed))?;

        let error = db
            .update_state("done", &SessionState::Running)
            .expect_err("completed sessions must not transition back to running");

        assert!(error
            .to_string()
            .contains("Invalid session state transition"));
        Ok(())
    }

    #[test]
    fn open_migrates_existing_sessions_table_with_pid_column() -> Result<()> {
        let tempdir = TestDir::new("store-migration")?;
        let db_path = tempdir.path().join("state.db");

        let conn = Connection::open(&db_path)?;
        conn.execute_batch(
            "
            CREATE TABLE sessions (
                id TEXT PRIMARY KEY,
                task TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                state TEXT NOT NULL DEFAULT 'pending',
                worktree_path TEXT,
                worktree_branch TEXT,
                worktree_base TEXT,
                tokens_used INTEGER DEFAULT 0,
                tool_calls INTEGER DEFAULT 0,
                files_changed INTEGER DEFAULT 0,
                duration_secs INTEGER DEFAULT 0,
                cost_usd REAL DEFAULT 0.0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            ",
        )?;
        drop(conn);

        let db = StateStore::open(&db_path)?;
        let mut stmt = db.conn.prepare("PRAGMA table_info(sessions)")?;
        let column_names = stmt
            .query_map([], |row| row.get::<_, String>(1))?
            .collect::<std::result::Result<Vec<_>, _>>()?;

        assert!(column_names.iter().any(|column| column == "pid"));
        Ok(())
    }

    #[test]
    fn append_output_line_keeps_latest_buffer_window() -> Result<()> {
        let tempdir = TestDir::new("store-output")?;
        let db = StateStore::open(&tempdir.path().join("state.db"))?;
        let now = Utc::now();

        db.insert_session(&Session {
            id: "session-1".to_string(),
            task: "buffer output".to_string(),
            agent_type: "claude".to_string(),
            state: SessionState::Running,
            pid: None,
            worktree: None,
            created_at: now,
            updated_at: now,
            metrics: SessionMetrics::default(),
        })?;

        for index in 0..(OUTPUT_BUFFER_LIMIT + 5) {
            db.append_output_line("session-1", OutputStream::Stdout, &format!("line-{index}"))?;
        }

        let lines = db.get_output_lines("session-1", OUTPUT_BUFFER_LIMIT)?;
        let texts: Vec<_> = lines.iter().map(|line| line.text.as_str()).collect();

        assert_eq!(lines.len(), OUTPUT_BUFFER_LIMIT);
        assert_eq!(texts.first().copied(), Some("line-5"));
        let expected_last_line = format!("line-{}", OUTPUT_BUFFER_LIMIT + 4);
        assert_eq!(texts.last().copied(), Some(expected_last_line.as_str()));

        Ok(())
    }
}
