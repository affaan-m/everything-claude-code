use ratatui::{
    prelude::*,
    text::{Line, Span},
    widgets::{Gauge, Paragraph, Widget},
};

pub(crate) const WARNING_THRESHOLD: f64 = 0.8;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub(crate) enum BudgetState {
    Unconfigured,
    Normal,
    Warning,
    OverBudget,
}

impl BudgetState {
    pub(crate) const fn is_warning(self) -> bool {
        matches!(self, Self::Warning | Self::OverBudget)
    }

    fn badge(self) -> Option<&'static str> {
        match self {
            Self::Warning => Some("warning"),
            Self::OverBudget => Some("over budget"),
            Self::Unconfigured => Some("no budget"),
            Self::Normal => None,
        }
    }

    pub(crate) fn style(self) -> Style {
        let base = Style::default().fg(match self {
            Self::Unconfigured => Color::DarkGray,
            Self::Normal => Color::DarkGray,
            Self::Warning => Color::Yellow,
            Self::OverBudget => Color::Red,
        });

        if self.is_warning() {
            base.add_modifier(Modifier::BOLD)
        } else {
            base
        }
    }
}

#[derive(Debug, Clone, Copy)]
enum MeterFormat {
    Tokens,
    Currency,
}

#[derive(Debug, Clone)]
pub(crate) struct TokenMeter<'a> {
    title: &'a str,
    used: f64,
    budget: f64,
    format: MeterFormat,
}

impl<'a> TokenMeter<'a> {
    pub(crate) fn tokens(title: &'a str, used: u64, budget: u64) -> Self {
        Self {
            title,
            used: used as f64,
            budget: budget as f64,
            format: MeterFormat::Tokens,
        }
    }

    pub(crate) fn currency(title: &'a str, used: f64, budget: f64) -> Self {
        Self {
            title,
            used,
            budget,
            format: MeterFormat::Currency,
        }
    }

    pub(crate) fn state(&self) -> BudgetState {
        budget_state(self.used, self.budget)
    }

    fn ratio(&self) -> f64 {
        budget_ratio(self.used, self.budget)
    }

    fn clamped_ratio(&self) -> f64 {
        self.ratio().clamp(0.0, 1.0)
    }

    fn title_line(&self) -> Line<'static> {
        let mut spans = vec![Span::styled(
            self.title.to_string(),
            Style::default()
                .fg(Color::Gray)
                .add_modifier(Modifier::BOLD),
        )];

        if let Some(badge) = self.state().badge() {
            spans.push(Span::raw(" "));
            spans.push(Span::styled(format!("[{badge}]"), self.state().style()));
        }

        Line::from(spans)
    }

    fn display_label(&self) -> String {
        if self.budget <= 0.0 {
            return match self.format {
                MeterFormat::Tokens => format!("{} tok used | no budget", self.used_label()),
                MeterFormat::Currency => format!("{} spent | no budget", self.used_label()),
            };
        }

        format!(
            "{} / {}{} ({}%)",
            self.used_label(),
            self.budget_label(),
            self.unit_suffix(),
            (self.ratio() * 100.0).round() as u64
        )
    }

    fn used_label(&self) -> String {
        match self.format {
            MeterFormat::Tokens => format_token_count(self.used.max(0.0).round() as u64),
            MeterFormat::Currency => format_currency(self.used.max(0.0)),
        }
    }

    fn budget_label(&self) -> String {
        match self.format {
            MeterFormat::Tokens => format_token_count(self.budget.max(0.0).round() as u64),
            MeterFormat::Currency => format_currency(self.budget.max(0.0)),
        }
    }

    fn unit_suffix(&self) -> &'static str {
        match self.format {
            MeterFormat::Tokens => " tok",
            MeterFormat::Currency => "",
        }
    }
}

impl Widget for TokenMeter<'_> {
    fn render(self, area: Rect, buf: &mut Buffer) {
        if area.is_empty() {
            return;
        }

        let mut gauge_area = area;
        if area.height > 1 {
            let chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([Constraint::Length(1), Constraint::Min(1)])
                .split(area);
            Paragraph::new(self.title_line()).render(chunks[0], buf);
            gauge_area = chunks[1];
        }

        Gauge::default()
            .ratio(self.clamped_ratio())
            .label(self.display_label())
            .gauge_style(
                Style::default()
                    .fg(gradient_color(self.ratio()))
                    .add_modifier(Modifier::BOLD),
            )
            .style(Style::default().fg(Color::DarkGray))
            .use_unicode(true)
            .render(gauge_area, buf);
    }
}

pub(crate) fn budget_ratio(used: f64, budget: f64) -> f64 {
    if budget <= 0.0 {
        0.0
    } else {
        used / budget
    }
}

pub(crate) fn budget_state(used: f64, budget: f64) -> BudgetState {
    if budget <= 0.0 {
        BudgetState::Unconfigured
    } else if used / budget >= 1.0 {
        BudgetState::OverBudget
    } else if used / budget >= WARNING_THRESHOLD {
        BudgetState::Warning
    } else {
        BudgetState::Normal
    }
}

pub(crate) fn gradient_color(ratio: f64) -> Color {
    const GREEN: (u8, u8, u8) = (34, 197, 94);
    const YELLOW: (u8, u8, u8) = (234, 179, 8);
    const RED: (u8, u8, u8) = (239, 68, 68);

    let clamped = ratio.clamp(0.0, 1.0);
    if clamped <= WARNING_THRESHOLD {
        interpolate_rgb(GREEN, YELLOW, clamped / WARNING_THRESHOLD)
    } else {
        interpolate_rgb(
            YELLOW,
            RED,
            (clamped - WARNING_THRESHOLD) / (1.0 - WARNING_THRESHOLD),
        )
    }
}

pub(crate) fn format_currency(value: f64) -> String {
    format!("${value:.2}")
}

pub(crate) fn format_token_count(value: u64) -> String {
    let digits = value.to_string();
    let mut formatted = String::with_capacity(digits.len() + digits.len() / 3);

    for (index, ch) in digits.chars().rev().enumerate() {
        if index != 0 && index % 3 == 0 {
            formatted.push(',');
        }
        formatted.push(ch);
    }

    formatted.chars().rev().collect()
}

fn interpolate_rgb(from: (u8, u8, u8), to: (u8, u8, u8), ratio: f64) -> Color {
    let ratio = ratio.clamp(0.0, 1.0);
    let channel = |start: u8, end: u8| -> u8 {
        (f64::from(start) + (f64::from(end) - f64::from(start)) * ratio).round() as u8
    };

    Color::Rgb(
        channel(from.0, to.0),
        channel(from.1, to.1),
        channel(from.2, to.2),
    )
}

#[cfg(test)]
mod tests {
    use ratatui::{buffer::Buffer, layout::Rect, style::Color, widgets::Widget};

    use super::{gradient_color, BudgetState, TokenMeter};

    #[test]
    fn warning_state_starts_at_eighty_percent() {
        let meter = TokenMeter::tokens("Token Budget", 80, 100);

        assert_eq!(meter.state(), BudgetState::Warning);
    }

    #[test]
    fn gradient_runs_from_green_to_yellow_to_red() {
        assert_eq!(gradient_color(0.0), Color::Rgb(34, 197, 94));
        assert_eq!(gradient_color(0.8), Color::Rgb(234, 179, 8));
        assert_eq!(gradient_color(1.0), Color::Rgb(239, 68, 68));
    }

    #[test]
    fn token_meter_renders_compact_usage_label() {
        let meter = TokenMeter::tokens("Token Budget", 4_000, 10_000);
        let area = Rect::new(0, 0, 48, 2);
        let mut buffer = Buffer::empty(area);

        meter.render(area, &mut buffer);

        let rendered = buffer
            .content()
            .chunks(area.width as usize)
            .flat_map(|row| row.iter().map(|cell| cell.symbol()))
            .collect::<String>();

        assert!(rendered.contains("4,000 / 10,000 tok (40%)"));
    }
}
