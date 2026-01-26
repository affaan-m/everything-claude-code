# Hooks Usage (PostgreSQL Focus)

Hooks keep the standard Claude Code scripts, but are configured for PostgreSQL workflows.

## Suggested Hooks

1. **PreToolUse**: preload key excerpts from `docs/postgresql-kernel-plugin-best-practices.md`.
2. **PostToolUse**: log SQL/kernel change summaries.
3. **Stop**: generate regression checklist (e.g., `src/test/regress` or extension tests).

## Current Hook Configuration

`hooks/hooks.json` can remain unchanged, but project-level settings should include:
- PostgreSQL documentation index
- Kernel module mapping (executor, storage, catalogs)
- Extension directory scan and upgrade scripts
- Snapshot/WAL checkpoints for change summaries
