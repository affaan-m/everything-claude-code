pub mod daemon;
pub mod manager;
pub mod output;
pub mod runtime;
pub mod store;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fmt;
use std::path::Path;
use std::path::PathBuf;

pub type SessionAgentProfile = crate::config::ResolvedAgentProfile;

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum HarnessKind {
    #[default]
    Unknown,
    Claude,
    Codex,
    OpenCode,
    Gemini,
    Cursor,
    Kiro,
    Trae,
    Zed,
    FactoryDroid,
    Windsurf,
}

impl HarnessKind {
    pub fn from_agent_type(agent_type: &str) -> Self {
        match agent_type.trim().to_ascii_lowercase().as_str() {
            "claude" | "claude-code" => Self::Claude,
            "codex" => Self::Codex,
            "opencode" => Self::OpenCode,
            "gemini" | "gemini-cli" => Self::Gemini,
            "cursor" => Self::Cursor,
            "kiro" => Self::Kiro,
            "trae" => Self::Trae,
            "zed" => Self::Zed,
            "factory-droid" | "factory_droid" | "factorydroid" => Self::FactoryDroid,
            "windsurf" => Self::Windsurf,
            _ => Self::Unknown,
        }
    }

    pub fn from_db_value(value: &str) -> Self {
        match value.trim().to_ascii_lowercase().as_str() {
            "claude" => Self::Claude,
            "codex" => Self::Codex,
            "opencode" => Self::OpenCode,
            "gemini" => Self::Gemini,
            "cursor" => Self::Cursor,
            "kiro" => Self::Kiro,
            "trae" => Self::Trae,
            "zed" => Self::Zed,
            "factory_droid" => Self::FactoryDroid,
            "windsurf" => Self::Windsurf,
            _ => Self::Unknown,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Unknown => "unknown",
            Self::Claude => "claude",
            Self::Codex => "codex",
            Self::OpenCode => "opencode",
            Self::Gemini => "gemini",
            Self::Cursor => "cursor",
            Self::Kiro => "kiro",
            Self::Trae => "trae",
            Self::Zed => "zed",
            Self::FactoryDroid => "factory_droid",
            Self::Windsurf => "windsurf",
        }
    }

    fn project_markers(self) -> &'static [&'static str] {
        match self {
            Self::Claude => &[".claude"],
            Self::Codex => &[".codex", ".codex-plugin"],
            Self::OpenCode => &[".opencode"],
            Self::Gemini => &[".gemini"],
            Self::Cursor => &[".cursor"],
            Self::Kiro => &[".kiro"],
            Self::Trae => &[".trae"],
            Self::Unknown | Self::Zed | Self::FactoryDroid | Self::Windsurf => &[],
        }
    }
}

impl fmt::Display for HarnessKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct SessionHarnessInfo {
    pub primary: HarnessKind,
    pub detected: Vec<HarnessKind>,
}

impl SessionHarnessInfo {
    pub fn detect(agent_type: &str, working_dir: &Path) -> Self {
        let detected = [
            HarnessKind::Claude,
            HarnessKind::Codex,
            HarnessKind::OpenCode,
            HarnessKind::Gemini,
            HarnessKind::Cursor,
            HarnessKind::Kiro,
            HarnessKind::Trae,
        ]
        .into_iter()
        .filter(|harness| {
            harness
                .project_markers()
                .iter()
                .any(|marker| working_dir.join(marker).exists())
        })
        .collect::<Vec<_>>();

        let primary = match HarnessKind::from_agent_type(agent_type) {
            HarnessKind::Unknown => detected.first().copied().unwrap_or(HarnessKind::Unknown),
            harness => harness,
        };

        Self { primary, detected }
    }

    pub fn detected_summary(&self) -> String {
        if self.detected.is_empty() {
            "none detected".to_string()
        } else {
            self.detected
                .iter()
                .map(|harness| harness.to_string())
                .collect::<Vec<_>>()
                .join(", ")
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub task: String,
    pub project: String,
    pub task_group: String,
    pub agent_type: String,
    pub working_dir: PathBuf,
    pub state: SessionState,
    pub pid: Option<u32>,
    pub worktree: Option<WorktreeInfo>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_heartbeat_at: DateTime<Utc>,
    pub metrics: SessionMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SessionState {
    Pending,
    Running,
    Idle,
    Stale,
    Completed,
    Failed,
    Stopped,
}

impl fmt::Display for SessionState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SessionState::Pending => write!(f, "pending"),
            SessionState::Running => write!(f, "running"),
            SessionState::Idle => write!(f, "idle"),
            SessionState::Stale => write!(f, "stale"),
            SessionState::Completed => write!(f, "completed"),
            SessionState::Failed => write!(f, "failed"),
            SessionState::Stopped => write!(f, "stopped"),
        }
    }
}

impl SessionState {
    pub fn can_transition_to(&self, next: &Self) -> bool {
        if self == next {
            return true;
        }

        matches!(
            (self, next),
            (
                SessionState::Pending,
                SessionState::Running | SessionState::Failed | SessionState::Stopped
            ) | (
                SessionState::Running,
                SessionState::Idle
                    | SessionState::Stale
                    | SessionState::Completed
                    | SessionState::Failed
                    | SessionState::Stopped
            ) | (
                SessionState::Idle,
                SessionState::Running
                    | SessionState::Stale
                    | SessionState::Completed
                    | SessionState::Failed
                    | SessionState::Stopped
            ) | (
                SessionState::Stale,
                SessionState::Running
                    | SessionState::Idle
                    | SessionState::Completed
                    | SessionState::Failed
                    | SessionState::Stopped
            ) | (SessionState::Completed, SessionState::Stopped)
                | (SessionState::Failed, SessionState::Stopped)
        )
    }

    pub fn from_db_value(value: &str) -> Self {
        match value {
            "running" => SessionState::Running,
            "idle" => SessionState::Idle,
            "stale" => SessionState::Stale,
            "completed" => SessionState::Completed,
            "failed" => SessionState::Failed,
            "stopped" => SessionState::Stopped,
            _ => SessionState::Pending,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorktreeInfo {
    pub path: PathBuf,
    pub branch: String,
    pub base_branch: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SessionMetrics {
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub tokens_used: u64,
    pub tool_calls: u64,
    pub files_changed: u32,
    pub duration_secs: u64,
    pub cost_usd: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMessage {
    pub id: i64,
    pub from_session: String,
    pub to_session: String,
    pub content: String,
    pub msg_type: String,
    pub read: bool,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FileActivityEntry {
    pub session_id: String,
    pub action: FileActivityAction,
    pub path: String,
    pub summary: String,
    pub diff_preview: Option<String>,
    pub patch_preview: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DecisionLogEntry {
    pub id: i64,
    pub session_id: String,
    pub decision: String,
    pub alternatives: Vec<String>,
    pub reasoning: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphEntity {
    pub id: i64,
    pub session_id: Option<String>,
    pub entity_type: String,
    pub name: String,
    pub path: Option<String>,
    pub summary: String,
    pub metadata: BTreeMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphRelation {
    pub id: i64,
    pub session_id: Option<String>,
    pub from_entity_id: i64,
    pub from_entity_type: String,
    pub from_entity_name: String,
    pub to_entity_id: i64,
    pub to_entity_type: String,
    pub to_entity_name: String,
    pub relation_type: String,
    pub summary: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphEntityDetail {
    pub entity: ContextGraphEntity,
    pub outgoing: Vec<ContextGraphRelation>,
    pub incoming: Vec<ContextGraphRelation>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphObservation {
    pub id: i64,
    pub session_id: Option<String>,
    pub entity_id: i64,
    pub entity_type: String,
    pub entity_name: String,
    pub observation_type: String,
    pub priority: ContextObservationPriority,
    pub pinned: bool,
    pub summary: String,
    pub details: BTreeMap<String, String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphRecallEntry {
    pub entity: ContextGraphEntity,
    pub score: u64,
    pub matched_terms: Vec<String>,
    pub relation_count: usize,
    pub observation_count: usize,
    pub max_observation_priority: ContextObservationPriority,
    pub has_pinned_observation: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum ContextObservationPriority {
    Low,
    Normal,
    High,
    Critical,
}

impl Default for ContextObservationPriority {
    fn default() -> Self {
        Self::Normal
    }
}

impl fmt::Display for ContextObservationPriority {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Low => write!(f, "low"),
            Self::Normal => write!(f, "normal"),
            Self::High => write!(f, "high"),
            Self::Critical => write!(f, "critical"),
        }
    }
}

impl ContextObservationPriority {
    pub fn from_db_value(value: i64) -> Self {
        match value {
            0 => Self::Low,
            2 => Self::High,
            3 => Self::Critical,
            _ => Self::Normal,
        }
    }

    pub fn as_db_value(self) -> i64 {
        match self {
            Self::Low => 0,
            Self::Normal => 1,
            Self::High => 2,
            Self::Critical => 3,
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphSyncStats {
    pub sessions_scanned: usize,
    pub decisions_processed: usize,
    pub file_events_processed: usize,
    pub messages_processed: usize,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContextGraphCompactionStats {
    pub entities_scanned: usize,
    pub duplicate_observations_deleted: usize,
    pub overflow_observations_deleted: usize,
    pub observations_retained: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum FileActivityAction {
    Read,
    Create,
    Modify,
    Move,
    Delete,
    Touch,
}

pub fn normalize_group_label(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

pub fn default_project_label(working_dir: &Path) -> String {
    working_dir
        .file_name()
        .and_then(|value| value.to_str())
        .and_then(normalize_group_label)
        .unwrap_or_else(|| "workspace".to_string())
}

pub fn default_task_group_label(task: &str) -> String {
    normalize_group_label(task).unwrap_or_else(|| "general".to_string())
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct SessionGrouping {
    pub project: Option<String>,
    pub task_group: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(label: &str) -> Result<Self, Box<dyn std::error::Error>> {
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

    #[test]
    fn detect_session_harness_prefers_agent_type_and_collects_project_markers(
    ) -> Result<(), Box<dyn std::error::Error>> {
        let repo = TestDir::new("session-harness-detect")?;
        fs::create_dir_all(repo.path().join(".codex"))?;
        fs::create_dir_all(repo.path().join(".claude"))?;

        let harness = SessionHarnessInfo::detect("claude", repo.path());
        assert_eq!(harness.primary, HarnessKind::Claude);
        assert_eq!(
            harness.detected,
            vec![HarnessKind::Claude, HarnessKind::Codex]
        );
        assert_eq!(harness.detected_summary(), "claude, codex");
        Ok(())
    }

    #[test]
    fn detect_session_harness_falls_back_to_project_markers_for_unknown_agent(
    ) -> Result<(), Box<dyn std::error::Error>> {
        let repo = TestDir::new("session-harness-markers")?;
        fs::create_dir_all(repo.path().join(".gemini"))?;

        let harness = SessionHarnessInfo::detect("custom-runner", repo.path());
        assert_eq!(harness.primary, HarnessKind::Gemini);
        assert_eq!(harness.detected, vec![HarnessKind::Gemini]);
        Ok(())
    }
}
