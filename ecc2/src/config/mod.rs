use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct Config {
    pub db_path: PathBuf,
    pub worktree_root: PathBuf,
    pub max_parallel_sessions: usize,
    pub max_parallel_worktrees: usize,
    pub session_timeout_secs: u64,
    pub heartbeat_interval_secs: u64,
    pub default_agent: String,
    pub cost_budget_usd: f64,
    pub token_budget: u64,
    pub theme: Theme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Theme {
    Dark,
    Light,
}

impl Default for Config {
    fn default() -> Self {
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
        Self {
            db_path: home.join(".claude").join("ecc2.db"),
            worktree_root: PathBuf::from("/tmp/ecc-worktrees"),
            max_parallel_sessions: 8,
            max_parallel_worktrees: 6,
            session_timeout_secs: 3600,
            heartbeat_interval_secs: 30,
            default_agent: "claude".to_string(),
            cost_budget_usd: 10.0,
            token_budget: 500_000,
            theme: Theme::Dark,
        }
    }
}

impl Config {
    pub fn load() -> Result<Self> {
        let config_path = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".claude")
            .join("ecc2.toml");

        if config_path.exists() {
            let content = std::fs::read_to_string(&config_path)?;
            let config: Config = toml::from_str(&content)?;
            Ok(config)
        } else {
            Ok(Config::default())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Config;

    #[test]
    fn default_includes_positive_budget_thresholds() {
        let config = Config::default();

        assert!(config.cost_budget_usd > 0.0);
        assert!(config.token_budget > 0);
    }

    #[test]
    fn missing_budget_fields_fall_back_to_defaults() {
        let legacy_config = r#"
db_path = "/tmp/ecc2.db"
worktree_root = "/tmp/ecc-worktrees"
max_parallel_sessions = 8
max_parallel_worktrees = 6
session_timeout_secs = 3600
heartbeat_interval_secs = 30
default_agent = "claude"
theme = "Dark"
"#;

        let config: Config = toml::from_str(legacy_config).unwrap();
        let defaults = Config::default();

        assert_eq!(config.cost_budget_usd, defaults.cost_budget_usd);
        assert_eq!(config.token_budget, defaults.token_budget);
    }
}
