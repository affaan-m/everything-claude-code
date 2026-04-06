---
name: cost-tracking
description: Track and report Claude Code token usage, spending, and budgets. Use when the user asks about costs, spending, usage, tokens, budgets, or wants to monitor their Claude Code expenses.
origin: community
---

# Cost Tracking

Real-time token usage and cost analytics for Claude Code. Query a local SQLite database to report spending by developer, project, session, tool, and date -- with budget enforcement and multi-model pricing.

## When to Use

- User asks "how much have I spent?" or "what's my cost?"
- User mentions budgets, spending limits, or cost overruns
- User wants to compare costs across projects or sessions
- User asks about token usage or model pricing
- User wants a cost breakdown by tool, project, or date

## How It Works

This skill queries a local SQLite database at `~/.claude-cost-tracker/usage.db`, populated by the `claude-cost-tracker` plugin. The plugin records token usage after every tool call via a PostToolUse hook.

### Prerequisites

Install the plugin from the official directory:

```
/plugin install claude-cost-tracker@claude-plugins-official
```

If the database file does not exist, tell the user the cost tracker is not set up and suggest installing the plugin from the official directory.

### Database Schema

The `usage` table stores one row per tool call:

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | TEXT | ISO 8601 timestamp |
| `developer` | TEXT | OS username |
| `developer_email` | TEXT | From `git config user.email` |
| `project` | TEXT | Git repo basename |
| `tool_name` | TEXT | Claude Code tool (Edit, Bash, Read, Write, etc.) |
| `file_path` | TEXT | File operated on (nullable) |
| `input_tokens` | INTEGER | Input tokens consumed |
| `output_tokens` | INTEGER | Output tokens consumed |
| `cache_read_tokens` | INTEGER | Prompt cache read tokens |
| `cache_creation_tokens` | INTEGER | Prompt cache creation tokens |
| `cost_usd` | REAL | Calculated cost in USD |
| `session_id` | TEXT | Claude Code session identifier |
| `model` | TEXT | Active model (sonnet-4.6, opus-4.5, haiku-4.5) |

Supporting tables: `alerts` (spend thresholds), `budgets` (daily/weekly/monthly caps).

### Multi-Model Pricing

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Cache Read ($/1M) | Cache Create ($/1M) |
|-------|---------------------|----------------------|---------------------|---------------------|
| Sonnet 4.6 (default) | $3.00 | $15.00 | $0.30 | $3.75 |
| Opus 4.5 | $15.00 | $75.00 | $1.50 | $18.75 |
| Haiku 4.5 | $0.80 | $4.00 | $0.08 | $1.00 |

## Examples

### Quick Summary

```bash
sqlite3 ~/.claude-cost-tracker/usage.db "
  SELECT
    'Today: $' || ROUND(COALESCE(SUM(CASE WHEN date(timestamp) = date('now') THEN cost_usd END), 0), 4) ||
    ' | Total: $' || ROUND(COALESCE(SUM(cost_usd), 0), 4) ||
    ' | Calls: ' || COUNT(*) ||
    ' | Sessions: ' || COUNT(DISTINCT session_id)
  FROM usage;
"
```

### Cost by Project

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT project, ROUND(SUM(cost_usd), 4) as cost, COUNT(*) as calls
  FROM usage GROUP BY project ORDER BY cost DESC LIMIT 10;
"
```

### Cost by Tool

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT tool_name, ROUND(SUM(cost_usd), 4) as cost, COUNT(*) as calls
  FROM usage GROUP BY tool_name ORDER BY cost DESC;
"
```

### Last 7 Days Trend

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT date(timestamp) as date, ROUND(SUM(cost_usd), 4) as cost, COUNT(*) as calls
  FROM usage GROUP BY date(timestamp) ORDER BY date DESC LIMIT 7;
"
```

### Today vs Yesterday Comparison

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT
    COALESCE(SUM(CASE WHEN date(timestamp) = date('now') THEN cost_usd END), 0) as today_cost,
    COALESCE(SUM(CASE WHEN date(timestamp) = date('now', '-1 day') THEN cost_usd END), 0) as yesterday_cost,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(DISTINCT developer) as developers
  FROM usage;
"
```

### Budget Status

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT type, limit_usd FROM budgets;
"
```

### Session Drill-Down

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT session_id,
    MIN(timestamp) as started,
    MAX(timestamp) as ended,
    ROUND(SUM(cost_usd), 4) as cost,
    COUNT(*) as calls
  FROM usage
  GROUP BY session_id
  ORDER BY started DESC LIMIT 10;
"
```

## What to Report

When presenting cost data, include:

1. **Today's spend** and comparison to yesterday (up/down trend)
2. **Total all-time spend** across all projects
3. **Top projects** ranked by cost
4. **Top tools** ranked by cost (Edit and Bash are typically highest)
5. **Active budgets** and whether any are close to being exceeded
6. **Session count** and average cost per session

Format currency with 4 decimal places for small amounts (under $1) and 2 decimal places for larger amounts.

## Anti-Patterns

- Do NOT estimate costs from token counts alone without using the pricing table -- cache tokens have different rates than regular tokens
- Do NOT assume the database exists without checking -- always verify `~/.claude-cost-tracker/usage.db` is present before querying
- Do NOT query with `SELECT *` on large databases -- always use `LIMIT` and aggregate functions
- Do NOT hardcode model pricing in queries -- the `cost_usd` column is pre-calculated by the hook with the correct model pricing
- Do NOT suggest manual token counting as an alternative -- the PostToolUse hook captures usage data automatically and accurately

## Best Practices

- Use `/cost` for quick session-level costs (built-in), use this skill for historical and cross-session analytics
- Recommend setting daily budgets early -- use a transaction that enforces a single row: `BEGIN; DELETE FROM budgets WHERE type = 'daily'; INSERT INTO budgets (type, limit_usd, created_at) VALUES ('daily', 10.00, datetime('now')); COMMIT;`
- For team environments, mention the optional team server for multi-developer aggregation
- When costs seem high, check which tool and project are the biggest contributors before suggesting optimizations
- Suggest `/model sonnet` for routine tasks and `/model opus` only for complex reasoning to reduce costs

## Related Skills

- `cost-aware-llm-pipeline` -- Decision framework for model routing and budget tracking at the API level
- `strategic-compact` -- Context management to reduce token consumption in long sessions
