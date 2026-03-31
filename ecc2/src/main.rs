mod comms;
mod config;
mod observability;
mod session;
mod tui;
mod worktree;

use anyhow::Result;
use clap::Parser;
use std::path::PathBuf;
use tracing_subscriber::EnvFilter;

#[derive(Parser, Debug)]
#[command(name = "ecc", version, about = "ECC 2.0 — Agentic IDE control plane")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(clap::Subcommand, Debug)]
enum Commands {
    /// Launch the TUI dashboard
    Dashboard,
    /// Start a new agent session
    Start {
        /// Task description for the agent
        #[arg(short, long)]
        task: String,
        /// Agent type (claude, codex, custom)
        #[arg(short, long, default_value = "claude")]
        agent: String,
        /// Create a dedicated worktree for this session
        #[arg(short, long)]
        worktree: bool,
    },
    /// List active sessions
    Sessions,
    /// Show session details
    Status {
        /// Session ID or alias
        session_id: Option<String>,
    },
    /// Stop a running session
    Stop {
        /// Session ID or alias
        session_id: String,
    },
    /// Resume a failed or stopped session
    Resume {
        /// Session ID or alias
        session_id: String,
    },
    /// Run as background daemon
    Daemon,
    #[command(hide = true)]
    RunSession {
        #[arg(long)]
        session_id: String,
        #[arg(long)]
        task: String,
        #[arg(long)]
        agent: String,
        #[arg(long)]
        cwd: PathBuf,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let cli = Cli::parse();

    let cfg = config::Config::load()?;
    let db = session::store::StateStore::open(&cfg.db_path)?;

    match cli.command {
        Some(Commands::Dashboard) | None => {
            tui::app::run(db, cfg).await?;
        }
        Some(Commands::Start {
            task,
            agent,
            worktree: use_worktree,
        }) => {
            let session_id =
                session::manager::create_session(&db, &cfg, &task, &agent, use_worktree).await?;
            println!("Session started: {session_id}");
        }
        Some(Commands::Sessions) => {
            let sessions = session::manager::list_sessions(&db)?;
            for s in sessions {
                println!("{} [{}] {}", s.id, s.state, s.task);
            }
        }
        Some(Commands::Status { session_id }) => {
            let id = session_id.unwrap_or_else(|| "latest".to_string());
            let status = session::manager::get_status(&db, &id)?;
            println!("{status}");
        }
        Some(Commands::Stop { session_id }) => {
            session::manager::stop_session(&db, &session_id).await?;
            println!("Session stopped: {session_id}");
        }
        Some(Commands::Resume { session_id }) => {
            let resumed_id = session::manager::resume_session(&db, &session_id).await?;
            println!("Session resumed: {resumed_id}");
        }
        Some(Commands::Daemon) => {
            println!("Starting ECC daemon...");
            session::daemon::run(db, cfg).await?;
        }
        Some(Commands::RunSession {
            session_id,
            task,
            agent,
            cwd,
        }) => {
            session::manager::run_session(&cfg, &session_id, &task, &agent, &cwd).await?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cli_parses_resume_command() {
        let cli = Cli::try_parse_from(["ecc", "resume", "deadbeef"])
            .expect("resume subcommand should parse");

        match cli.command {
            Some(Commands::Resume { session_id }) => assert_eq!(session_id, "deadbeef"),
            _ => panic!("expected resume subcommand"),
        }
    }
}
