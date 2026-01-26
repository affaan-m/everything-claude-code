# PostgreSQL Claude Code Kernel & Extension Toolkit

This repository is a **PostgreSQL-first Claude Code configuration set** for engineers working on core internals, extensions, and performance-critical SQL. It codifies an architect-grade workflow for:

- Kernel source navigation, call-chain analysis, and patch design
- Extension lifecycle management (build, upgrade, compatibility)
- SQL/Schema reviews and performance diagnostics
- Security, testing, and release readiness

The tooling remains Claude Code-native (agents/commands/hooks/scripts), but every guideline and example is tailored to **PostgreSQL kernel and extension engineering** with deeper focus on WAL, locking, catalogs, and MVCC invariants.

---

## Core Guide

- **PostgreSQL Kernel & Extension Best Practices**: `docs/postgresql-kernel-plugin-best-practices.md`
- **Contribution Rules**: `CONTRIBUTING.md`

---

## Layout

```
pg-claude-code/
|-- agents/            # PostgreSQL subagents (kernel/extension/SQL/security)
|-- commands/          # PostgreSQL workflows (/plan /tdd /verify)
|-- rules/             # PostgreSQL hard rules (style/security/testing/perf)
|-- contexts/          # PostgreSQL context presets
|-- examples/          # Example CLAUDE.md and configs
|-- docs/              # PostgreSQL kernel & extension documentation
|-- hooks/             # Claude Code hooks (PG-tuned guidance)
|-- scripts/           # Shared hook/tooling scripts
|-- skills/            # PostgreSQL skills (incl. postgres-patterns)
|-- mcp-configs/       # MCP servers (docs/source search)
|-- plugins/           # Plugin guidance for PostgreSQL work
```

---

## Recommended Usage

1. Read `docs/postgresql-kernel-plugin-best-practices.md` to align on architecture and risk posture.
2. Copy `rules/`, `agents/`, `commands/`, and `contexts/` into your `~/.claude/`.
3. Add a project-level `CLAUDE.md` with PostgreSQL scope and constraints (see `examples/`).
4. Use `/plan`, `/tdd`, and `/verify` to drive kernel or extension work.

---

## Why a PostgreSQL-first Toolkit?

PostgreSQL kernel and extension work has non-negotiable constraints:

- C-level memory contexts, lock ordering, and WAL semantics
- Strict version compatibility and upgrade paths
- Catalog and cache consistency rules (syscache/relcache)
- Schema design directly controls latency and operational risk

This toolkit ensures Claude Code behavior matches those realities with:

- PostgreSQL-specific agents and review checklists
- Kernel/extension testing and release gates
- Structured SQL/Schema review patterns

---

## Maintenance

Follow `CONTRIBUTING.md` for PostgreSQL-specific contributions. Extend new domains (logical replication, FDW, parallelism, stats subsystems) by updating rules and agents accordingly.
