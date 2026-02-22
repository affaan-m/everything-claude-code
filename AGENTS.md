<!-- ECC_CODEX_AGENTS_TEMPLATE -->
# Everything Claude Code - Codex Adapter

Use this workspace with Codex CLI or the Codex macOS app while preserving ECC behavior.

## Context Loading Order

1. Load `.codex/rules/common/*.md` when present. Fall back to `rules/common/*.md`.
2. Load `.codex/rules/<language>/*.md` for languages touched. Fall back to `rules/<language>/*.md`.
3. When the user asks for an ECC workflow (`plan`, `tdd`, `code-review`, `build-fix`, etc.), apply the matching file from `commands/*.md`.
4. When the task needs a specialist role, apply the matching file from `agents/*.md`.
5. When a request clearly matches a skill, open and follow `skills/*/SKILL.md`.

## Execution Rules

- Keep edits focused and minimal.
- Do not change `.cursor/` or `.opencode/` unless the user explicitly asks.
- Emulate `hooks/hooks.json` intent: run relevant formatter, lint, typecheck, and tests before finishing.
- Prefer `rg` for search and targeted checks before full-suite runs.
- Use `.codex/mcp-servers.json` (or `mcp-configs/mcp-servers.json`) as the MCP reference config.
