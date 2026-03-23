use ratatui::{
    prelude::*,
    widgets::{Block, Borders, List, ListItem, Paragraph, Tabs, Wrap},
};

use super::widgets::{budget_state, format_currency, format_token_count, BudgetState, TokenMeter};
use crate::config::Config;
use crate::session::store::StateStore;
use crate::session::{Session, SessionState};

pub struct Dashboard {
    db: StateStore,
    cfg: Config,
    sessions: Vec<Session>,
    selected_pane: Pane,
    selected_session: usize,
    show_help: bool,
    scroll_offset: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum Pane {
    Sessions,
    Output,
    Metrics,
}

#[derive(Debug, Clone, Copy)]
struct AggregateUsage {
    total_tokens: u64,
    total_cost_usd: f64,
    token_state: BudgetState,
    cost_state: BudgetState,
    overall_state: BudgetState,
}

impl Dashboard {
    pub fn new(db: StateStore, cfg: Config) -> Self {
        let sessions = db.list_sessions().unwrap_or_default();
        Self {
            db,
            cfg,
            sessions,
            selected_pane: Pane::Sessions,
            selected_session: 0,
            show_help: false,
            scroll_offset: 0,
        }
    }

    pub fn render(&self, frame: &mut Frame) {
        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(3), // Header
                Constraint::Min(10),   // Main content
                Constraint::Length(3), // Status bar
            ])
            .split(frame.area());

        self.render_header(frame, chunks[0]);

        if self.show_help {
            self.render_help(frame, chunks[1]);
        } else {
            let main_chunks = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([
                    Constraint::Percentage(35), // Session list
                    Constraint::Percentage(65), // Output/details
                ])
                .split(chunks[1]);

            self.render_sessions(frame, main_chunks[0]);

            let right_chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Percentage(70), // Output
                    Constraint::Percentage(30), // Metrics
                ])
                .split(main_chunks[1]);

            self.render_output(frame, right_chunks[0]);
            self.render_metrics(frame, right_chunks[1]);
        }

        self.render_status_bar(frame, chunks[2]);
    }

    fn render_header(&self, frame: &mut Frame, area: Rect) {
        let running = self
            .sessions
            .iter()
            .filter(|s| s.state == SessionState::Running)
            .count();
        let total = self.sessions.len();

        let title = format!(" ECC 2.0 | {running} running / {total} total ");
        let tabs = Tabs::new(vec!["Sessions", "Output", "Metrics"])
            .block(Block::default().borders(Borders::ALL).title(title))
            .select(match self.selected_pane {
                Pane::Sessions => 0,
                Pane::Output => 1,
                Pane::Metrics => 2,
            })
            .highlight_style(
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            );

        frame.render_widget(tabs, area);
    }

    fn render_sessions(&self, frame: &mut Frame, area: Rect) {
        let items: Vec<ListItem> = self
            .sessions
            .iter()
            .enumerate()
            .map(|(i, s)| {
                let state_icon = match s.state {
                    SessionState::Running => "●",
                    SessionState::Idle => "○",
                    SessionState::Completed => "✓",
                    SessionState::Failed => "✗",
                    SessionState::Stopped => "■",
                    SessionState::Pending => "◌",
                };
                let style = if i == self.selected_session {
                    Style::default()
                        .fg(Color::Cyan)
                        .add_modifier(Modifier::BOLD)
                } else {
                    Style::default()
                };
                let text = format!(
                    "{state_icon} {} [{}] {}",
                    &s.id[..8.min(s.id.len())],
                    s.agent_type,
                    s.task
                );
                ListItem::new(text).style(style)
            })
            .collect();

        let border_style = if self.selected_pane == Pane::Sessions {
            Style::default().fg(Color::Cyan)
        } else {
            Style::default()
        };

        let list = List::new(items).block(
            Block::default()
                .borders(Borders::ALL)
                .title(" Sessions ")
                .border_style(border_style),
        );
        frame.render_widget(list, area);
    }

    fn render_output(&self, frame: &mut Frame, area: Rect) {
        let content = if let Some(session) = self.sessions.get(self.selected_session) {
            format!(
                "Agent output for session {}...\n\n(Live streaming coming soon)",
                session.id
            )
        } else {
            "No sessions. Press 'n' to start one.".to_string()
        };

        let border_style = if self.selected_pane == Pane::Output {
            Style::default().fg(Color::Cyan)
        } else {
            Style::default()
        };

        let paragraph = Paragraph::new(content).block(
            Block::default()
                .borders(Borders::ALL)
                .title(" Output ")
                .border_style(border_style),
        );
        frame.render_widget(paragraph, area);
    }

    fn render_metrics(&self, frame: &mut Frame, area: Rect) {
        let border_style = if self.selected_pane == Pane::Metrics {
            Style::default().fg(Color::Cyan)
        } else {
            Style::default()
        };

        let block = Block::default()
            .borders(Borders::ALL)
            .title(" Metrics ")
            .border_style(border_style);
        let inner = block.inner(area);
        frame.render_widget(block, area);

        if inner.is_empty() {
            return;
        }

        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(2),
                Constraint::Length(2),
                Constraint::Min(1),
            ])
            .split(inner);

        let aggregate = self.aggregate_usage();
        frame.render_widget(
            TokenMeter::tokens(
                "Token Budget",
                aggregate.total_tokens,
                self.cfg.token_budget,
            ),
            chunks[0],
        );
        frame.render_widget(
            TokenMeter::currency(
                "Cost Budget",
                aggregate.total_cost_usd,
                self.cfg.cost_budget_usd,
            ),
            chunks[1],
        );
        frame.render_widget(
            Paragraph::new(self.selected_session_metrics_text()).wrap(Wrap { trim: true }),
            chunks[2],
        );
    }

    fn render_status_bar(&self, frame: &mut Frame, area: Rect) {
        let text = " [n]ew session  [s]top  [Tab] switch pane  [j/k] scroll  [?] help  [q]uit ";
        let aggregate = self.aggregate_usage();
        let (summary_text, summary_style) = self.aggregate_cost_summary();
        let block = Block::default()
            .borders(Borders::ALL)
            .border_style(aggregate.overall_state.style());
        let inner = block.inner(area);
        frame.render_widget(block, area);

        if inner.is_empty() {
            return;
        }

        let summary_width = summary_text
            .len()
            .min(inner.width.saturating_sub(1) as usize) as u16;
        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Min(1), Constraint::Length(summary_width)])
            .split(inner);

        frame.render_widget(
            Paragraph::new(text).style(Style::default().fg(Color::DarkGray)),
            chunks[0],
        );
        frame.render_widget(
            Paragraph::new(summary_text)
                .style(summary_style)
                .alignment(Alignment::Right),
            chunks[1],
        );
    }

    fn render_help(&self, frame: &mut Frame, area: Rect) {
        let help = vec![
            "Keyboard Shortcuts:",
            "",
            "  n       New session",
            "  s       Stop selected session",
            "  Tab     Next pane",
            "  S-Tab   Previous pane",
            "  j/↓     Scroll down",
            "  k/↑     Scroll up",
            "  r       Refresh",
            "  ?       Toggle help",
            "  q/C-c   Quit",
        ];

        let paragraph = Paragraph::new(help.join("\n")).block(
            Block::default()
                .borders(Borders::ALL)
                .title(" Help ")
                .border_style(Style::default().fg(Color::Yellow)),
        );
        frame.render_widget(paragraph, area);
    }

    pub fn next_pane(&mut self) {
        self.selected_pane = match self.selected_pane {
            Pane::Sessions => Pane::Output,
            Pane::Output => Pane::Metrics,
            Pane::Metrics => Pane::Sessions,
        };
    }

    pub fn prev_pane(&mut self) {
        self.selected_pane = match self.selected_pane {
            Pane::Sessions => Pane::Metrics,
            Pane::Output => Pane::Sessions,
            Pane::Metrics => Pane::Output,
        };
    }

    pub fn scroll_down(&mut self) {
        if self.selected_pane == Pane::Sessions && !self.sessions.is_empty() {
            self.selected_session = (self.selected_session + 1).min(self.sessions.len() - 1);
        } else {
            self.scroll_offset = self.scroll_offset.saturating_add(1);
        }
    }

    pub fn scroll_up(&mut self) {
        if self.selected_pane == Pane::Sessions {
            self.selected_session = self.selected_session.saturating_sub(1);
        } else {
            self.scroll_offset = self.scroll_offset.saturating_sub(1);
        }
    }

    pub fn new_session(&mut self) {
        // TODO: Open a dialog to create a new session
        tracing::info!("New session dialog requested");
    }

    pub fn stop_selected(&mut self) {
        if let Some(session) = self.sessions.get(self.selected_session) {
            let _ = self.db.update_state(&session.id, &SessionState::Stopped);
            self.refresh();
        }
    }

    pub fn refresh(&mut self) {
        self.sessions = self.db.list_sessions().unwrap_or_default();
    }

    pub fn toggle_help(&mut self) {
        self.show_help = !self.show_help;
    }

    pub async fn tick(&mut self) {
        // Periodic refresh every few ticks
        self.sessions = self.db.list_sessions().unwrap_or_default();
    }

    fn aggregate_usage(&self) -> AggregateUsage {
        let total_tokens = self
            .sessions
            .iter()
            .map(|session| session.metrics.tokens_used)
            .sum();
        let total_cost_usd = self
            .sessions
            .iter()
            .map(|session| session.metrics.cost_usd)
            .sum::<f64>();
        let token_state = budget_state(total_tokens as f64, self.cfg.token_budget as f64);
        let cost_state = budget_state(total_cost_usd, self.cfg.cost_budget_usd);

        AggregateUsage {
            total_tokens,
            total_cost_usd,
            token_state,
            cost_state,
            overall_state: token_state.max(cost_state),
        }
    }

    fn selected_session_metrics_text(&self) -> String {
        if let Some(session) = self.sessions.get(self.selected_session) {
            let metrics = &session.metrics;
            format!(
                "Selected {} [{}]\nTokens {} | Tools {} | Files {}\nCost ${:.4} | Duration {}s",
                &session.id[..8.min(session.id.len())],
                session.state,
                format_token_count(metrics.tokens_used),
                metrics.tool_calls,
                metrics.files_changed,
                metrics.cost_usd,
                metrics.duration_secs
            )
        } else {
            "No metrics available".to_string()
        }
    }

    fn aggregate_cost_summary(&self) -> (String, Style) {
        let aggregate = self.aggregate_usage();
        let mut text = if self.cfg.cost_budget_usd > 0.0 {
            format!(
                "Aggregate cost {} / {}",
                format_currency(aggregate.total_cost_usd),
                format_currency(self.cfg.cost_budget_usd),
            )
        } else {
            format!(
                "Aggregate cost {} (no budget)",
                format_currency(aggregate.total_cost_usd)
            )
        };

        match aggregate.overall_state {
            BudgetState::Warning => text.push_str(" | Budget warning"),
            BudgetState::OverBudget => text.push_str(" | Budget exceeded"),
            _ => {}
        }

        (text, aggregate.overall_state.style())
    }

    fn aggregate_cost_summary_text(&self) -> String {
        self.aggregate_cost_summary().0
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use chrono::Utc;

    use super::Dashboard;
    use crate::config::Config;
    use crate::session::store::StateStore;
    use crate::session::{Session, SessionMetrics, SessionState};
    use crate::tui::widgets::BudgetState;

    #[test]
    fn aggregate_usage_sums_tokens_and_cost_with_warning_state() {
        let db = StateStore::open(Path::new(":memory:")).unwrap();
        let mut cfg = Config::default();
        cfg.token_budget = 10_000;
        cfg.cost_budget_usd = 10.0;

        let mut dashboard = Dashboard::new(db, cfg);
        dashboard.sessions = vec![
            session("sess-1", 4_000, 3.50),
            session("sess-2", 4_500, 4.80),
        ];

        let aggregate = dashboard.aggregate_usage();

        assert_eq!(aggregate.total_tokens, 8_500);
        assert!((aggregate.total_cost_usd - 8.30).abs() < 1e-9);
        assert_eq!(aggregate.token_state, BudgetState::Warning);
        assert_eq!(aggregate.cost_state, BudgetState::Warning);
        assert_eq!(aggregate.overall_state, BudgetState::Warning);
    }

    #[test]
    fn aggregate_cost_summary_mentions_total_cost() {
        let db = StateStore::open(Path::new(":memory:")).unwrap();
        let mut cfg = Config::default();
        cfg.cost_budget_usd = 10.0;

        let mut dashboard = Dashboard::new(db, cfg);
        dashboard.sessions = vec![session("sess-1", 3_500, 8.25)];

        assert_eq!(
            dashboard.aggregate_cost_summary_text(),
            "Aggregate cost $8.25 / $10.00 | Budget warning"
        );
    }

    fn session(id: &str, tokens_used: u64, cost_usd: f64) -> Session {
        let now = Utc::now();
        Session {
            id: id.to_string(),
            task: "Budget tracking".to_string(),
            agent_type: "claude".to_string(),
            state: SessionState::Running,
            worktree: None,
            created_at: now,
            updated_at: now,
            metrics: SessionMetrics {
                tokens_used,
                tool_calls: 0,
                files_changed: 0,
                duration_secs: 0,
                cost_usd,
            },
        }
    }
}
