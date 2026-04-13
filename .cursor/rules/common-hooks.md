---
description: "Hooks system: types, auto-accept permissions, TodoWrite best practices"
alwaysApply: true
---
# Hooks System (Cursor)

ECC registers hooks in **`.cursor/hooks.json`**. Implementations live under **`.cursor/hooks/`** and reuse shared logic via **`adapter.js`** and **`scripts/hooks/`** where applicable.

## Hook events (examples)

- **sessionStart** / **sessionEnd** — restore or persist session context
- **beforeShellExecution** / **afterShellExecution** — shell safety, logging, git flow guardrails
- **afterFileEdit** — auto-format, type checks, edit-time warnings
- **beforeSubmitPrompt** — secret patterns in prompts
- **beforeReadFile** / **beforeTabFileRead** — sensitive path warnings
- **beforeMCPExecution** / **afterMCPExecution** — MCP audit logging

See **`.cursor/hooks.json`** for the authoritative list wired for this project.

## Auto-run and permissions

Use with caution:
- Enable auto-run only for trusted, well-defined plans
- Prefer stricter approval for exploratory work
- Use **Cursor Settings** (Chat / Agent approval, sandbox, and tool permissions) instead of Claude Code’s `~/.claude.json` `allowedTools`

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements
