# .codex-plugin — Codex Native Plugin for ECC

This directory contains the **Codex plugin manifest** for Everything Claude Code.

## Structure

```
.codex-plugin/
└── plugin.json   — Codex plugin manifest (name, version, skills ref, MCP ref)
.mcp.json         — MCP server configurations at plugin root (NOT inside .codex-plugin/)
```

## What This Provides

- **125 skills** from `./skills/` — reusable Codex workflows for TDD, security,
  code review, architecture, and more
- **6 MCP servers** — GitHub, Context7, Exa, Memory, Playwright, Sequential Thinking

## Installation

Codex plugin support is currently in preview. Once generally available:

```bash
# Install from Codex CLI
codex plugin install affaan-m/everything-claude-code

# Or reference locally during development
codex plugin install ./

Run this from the repository root so `./` points to the repo root and `.mcp.json` resolves correctly.
```

## MCP Servers Included

| Server | Purpose |
|---|---|
| `github` | GitHub API access |
| `context7` | Live documentation lookup |
| `exa` | Neural web search |
| `memory` | Persistent memory across sessions |
| `playwright` | Browser automation & E2E testing |
| `sequential-thinking` | Step-by-step reasoning |

## Notes

- The `skills/` directory at the repo root is shared between Claude Code (`.claude-plugin/`)
  and Codex (`.codex-plugin/`) — same source of truth, no duplication
- MCP server credentials are inherited from the launching environment (env vars)
- This manifest does **not** override `~/.codex/config.toml` settings
