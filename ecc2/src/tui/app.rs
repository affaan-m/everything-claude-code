use anyhow::Result;
use crossterm::{
    event::{self, Event, KeyCode, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::prelude::*;
use std::io;
use std::time::Duration;

use super::dashboard::Dashboard;
use crate::config::Config;
use crate::session::store::StateStore;

pub async fn run(db: StateStore, cfg: Config) -> Result<()> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;

    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let mut dashboard = Dashboard::new(db, cfg);

    loop {
        terminal.draw(|frame| dashboard.render(frame))?;

        if event::poll(Duration::from_millis(250))? {
            if let Event::Key(key) = event::read()? {
                match (key.modifiers, key.code) {
                    (KeyModifiers::CONTROL, KeyCode::Char('c')) => break,
                    (_, KeyCode::Char('q')) => break,
                    (_, KeyCode::Tab) => dashboard.next_pane(),
                    (KeyModifiers::SHIFT, KeyCode::BackTab) => dashboard.prev_pane(),
                    (_, KeyCode::Char('j')) | (_, KeyCode::Down) => dashboard.scroll_down(),
                    (_, KeyCode::Char('k')) | (_, KeyCode::Up) => dashboard.scroll_up(),
                    (_, KeyCode::Char('n')) => dashboard.new_session(),
                    (_, KeyCode::Char('s')) => dashboard.stop_selected(),
                    (_, KeyCode::Char('r')) => dashboard.refresh(),
                    (_, KeyCode::Char('?')) => dashboard.toggle_help(),
                    _ => {}
                }
            }
        }

        dashboard.tick().await;
    }

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    Ok(())
}
