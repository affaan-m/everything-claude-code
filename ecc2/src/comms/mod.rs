use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::session::store::StateStore;

/// Message types for inter-agent communication.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    /// Task handoff from one agent to another
    TaskHandoff { task: String, context: String },
    /// Agent requesting information from another
    Query { question: String },
    /// Response to a query
    Response { answer: String },
    /// Notification of completion
    Completed {
        summary: String,
        files_changed: Vec<String>,
    },
    /// Conflict detected (e.g., two agents editing the same file)
    Conflict { file: String, description: String },
}

/// Send a structured message between sessions.
pub fn send(db: &StateStore, from: &str, to: &str, msg: &MessageType) -> Result<()> {
    let content = serde_json::to_string(msg)?;
    let msg_type = match msg {
        MessageType::TaskHandoff { .. } => "task_handoff",
        MessageType::Query { .. } => "query",
        MessageType::Response { .. } => "response",
        MessageType::Completed { .. } => "completed",
        MessageType::Conflict { .. } => "conflict",
    };
    db.send_message(from, to, &content, msg_type)?;
    Ok(())
}
