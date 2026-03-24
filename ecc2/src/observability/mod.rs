use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::session::store::StateStore;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCallEvent {
    pub session_id: String,
    pub tool_name: String,
    pub input_summary: String,
    pub output_summary: String,
    pub duration_ms: u64,
    pub risk_score: f64,
}

impl ToolCallEvent {
    /// Compute risk score based on tool type and input patterns.
    pub fn compute_risk(tool_name: &str, input: &str) -> f64 {
        let mut score: f64 = 0.0;

        // Destructive tools get higher base risk
        match tool_name {
            "Bash" => score += 0.3,
            "Write" => score += 0.2,
            "Edit" => score += 0.1,
            _ => score += 0.05,
        }

        // Dangerous patterns in bash commands
        if tool_name == "Bash" {
            if input.contains("rm -rf") || input.contains("--force") {
                score += 0.4;
            }
            if input.contains("git push") || input.contains("git reset") {
                score += 0.3;
            }
            if input.contains("sudo") || input.contains("chmod 777") {
                score += 0.5;
            }
        }

        score.min(1.0)
    }
}

pub fn log_tool_call(db: &StateStore, event: &ToolCallEvent) -> Result<()> {
    db.send_message(
        &event.session_id,
        "observability",
        &serde_json::to_string(event)?,
        "tool_call",
    )?;
    Ok(())
}
