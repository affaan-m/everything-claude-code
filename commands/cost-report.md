---
description: Generate a cost report showing Claude Code token usage and spending by project, tool, and date. Requires the claude-cost-tracker plugin.
argument-hint: [csv]
---

# Cost Report

Query the local cost tracking database and present a formatted spending report.

## What This Command Does

1. **Check Prerequisites** - Verify the cost tracker database exists
2. **Gather Data** - Run aggregate queries against the SQLite database
3. **Present Report** - Format results as a structured cost report
4. **Export (optional)** - Output raw CSV if requested

## When to Use

Use `/cost-report` when:
- You want a full breakdown of Claude Code spending
- You need to compare costs across projects or tools
- You want to check daily spending trends
- You need to export usage data for accounting

## Prerequisites

This command requires the `claude-cost-tracker` plugin to be installed and active. The plugin records token usage after every tool call via a PostToolUse hook.

Install:

```
/plugin install claude-cost-tracker@claude-plugins-official
```

Or from GitHub:

```
/plugin install https://github.com/MayurBhavsar/claude-cost-tracker-plugin
```

## How It Works

First, verify the database exists:

```bash
test -f ~/.claude-cost-tracker/usage.db && echo "Database found" || echo "Database not found -- install the claude-cost-tracker plugin first"
```

Then run these queries against `~/.claude-cost-tracker/usage.db`:

### Summary

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT
    COALESCE(SUM(CASE WHEN date(timestamp) = date('now') THEN cost_usd END), 0) as today_cost,
    COALESCE(SUM(CASE WHEN date(timestamp) = date('now', '-1 day') THEN cost_usd END), 0) as yesterday_cost,
    ROUND(SUM(cost_usd), 4) as total_cost,
    COUNT(*) as total_calls,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(DISTINCT developer) as developers
  FROM usage;
"
```

### By Project

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT project, ROUND(SUM(cost_usd), 4) as cost, COUNT(*) as calls
  FROM usage GROUP BY project ORDER BY cost DESC;
"
```

### By Tool

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT tool_name, ROUND(SUM(cost_usd), 4) as cost, COUNT(*) as calls
  FROM usage GROUP BY tool_name ORDER BY cost DESC;
"
```

### Last 7 Days

```bash
sqlite3 -header -column ~/.claude-cost-tracker/usage.db "
  SELECT date(timestamp) as date, ROUND(SUM(cost_usd), 4) as cost, COUNT(*) as calls
  FROM usage GROUP BY date(timestamp) ORDER BY date DESC LIMIT 7;
"
```

Present the results as a formatted report with:

1. **Summary** -- today's spend, yesterday's spend, trend direction (up/down), total spend
2. **By Project** -- table of projects ranked by cost
3. **By Tool** -- table of tools ranked by cost
4. **Last 7 Days** -- daily cost trend

## Example Usage

```
User: /cost-report

Agent:
# Claude Code Cost Report

## Summary
| Metric | Value |
|--------|-------|
| Today | $2.4312 |
| Yesterday | $1.8756 (+29.6%) |
| Total | $47.2891 |
| Sessions | 23 |
| Tool Calls | 1,847 |

## By Project
| Project | Cost | Calls |
|---------|------|-------|
| my-saas-app | $28.1234 | 1,102 |
| claude-cost-tracker | $12.4567 | 489 |
| side-project | $6.7090 | 256 |

## By Tool
| Tool | Cost | Calls |
|------|------|-------|
| Edit | $22.3456 | 612 |
| Bash | $14.8901 | 534 |
| Read | $6.2345 | 445 |
| Write | $3.8189 | 256 |

## Last 7 Days
| Date | Cost | Calls |
|------|------|-------|
| 2026-04-06 | $2.4312 | 89 |
| 2026-04-05 | $1.8756 | 76 |
| ... | ... | ... |
```

## CSV Export

If the user includes "csv" in their request:

```
User: /cost-report csv
```

Also run:

```bash
sqlite3 -csv -header ~/.claude-cost-tracker/usage.db "SELECT * FROM usage ORDER BY timestamp DESC LIMIT 100;"
```

## Integration with Other Commands

- Use `/cost` (built-in) for quick session-level cost -- use `/cost-report` for historical cross-session analytics
- Use the `cost-tracking` skill for conversational cost queries ("how much have I spent today?")
- Pair with `strategic-compact` to reduce token consumption when costs are high

## Source

Plugin: [claude-cost-tracker-plugin](https://github.com/MayurBhavsar/claude-cost-tracker-plugin)
