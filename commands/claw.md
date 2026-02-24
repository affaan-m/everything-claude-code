---
description: Start the NanoClaw agent REPL — a persistent, session-aware AI assistant powered by the claude CLI.
---

# Claw Command

Start an interactive AI agent session that persists conversation history to disk and optionally loads ECC skill context.

## Usage

```bash
node scripts/claw.js
```

Or via npm:

```bash
npm run claw
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAW_SESSION` | `default` | Session name (alphanumeric + hyphens) |
| `CLAW_SKILLS` | *(empty)* | Comma-separated skill names to load as system context |

## REPL Commands

Inside the REPL, type these commands directly at the prompt:

```
/clear      Clear current session history
/history    Print full conversation history
/sessions   List all saved sessions
/help       Show available commands
exit        Quit the REPL
```

## How It Works

1. Reads `CLAW_SESSION` env var to select a named session (default: `default`)
2. Loads conversation history from `~/.claude/claw/{session}.md`
3. Optionally loads ECC skill context from `CLAW_SKILLS` env var
4. Enters a blocking prompt loop — each user message is sent to `claude -p` with full history
5. Responses are appended to the session file for persistence across restarts

## Session Storage

Sessions are stored as Markdown files in `~/.claude/claw/`:

```
~/.claude/claw/default.md
~/.claude/claw/my-project.md
```

Each turn is formatted as:

```markdown
### [2025-01-15T10:30:00.000Z] User
What does this function do?
---
### [2025-01-15T10:30:05.000Z] Assistant
This function calculates...
---
```

## Examples

```bash
# Start default session
node scripts/claw.js

# Named session
CLAW_SESSION=my-project node scripts/claw.js

# With skill context
CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```
