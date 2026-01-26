# PostgreSQL Claude Code Kernel & Extension Toolkit

This repository is a PostgreSQL-first Claude Code configuration set for engineers working on core internals, extensions, and performance-critical SQL. It is written for architects who need repeatable, high-assurance workflows that align with PostgreSQL’s invariants: MVCC visibility, WAL durability, lock ordering, and catalog/cache coherence.

## What This Toolkit Optimizes For

- **Kernel reasoning**: call-chain reconstruction, subsystem boundaries, and invariants
- **Extension governance**: ABI safety, upgrade chains, and compatibility envelopes
- **Operational correctness**: regression safety, WAL replay, and cache invalidation
- **Claude Code leverage**: structured planning, review gates, and verification loops

## Core Guide

- **PostgreSQL Kernel & Extension Best Practices**: `docs/postgresql-kernel-plugin-best-practices.md`
- **Contribution Rules**: `CONTRIBUTING.md`

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

## Recommended Workflow

1. **Plan** with `/plan` to map modules, risks, and tests.
2. **Test-first** with `/tdd` to define regressions before implementation.
3. **Review** with `/code-review` for locking, memory contexts, WAL, and compatibility.
4. **Verify** with `/verify` for performance and release readiness.

## Why Claude Code for PostgreSQL

Claude Code is most effective when constraints are explicit and review gates are codified. This repository encodes PostgreSQL-specific invariants and audit checklists so that Claude Code’s planning and verification steps mirror the reality of kernel and extension work.

## Maintenance

Follow `CONTRIBUTING.md` for PostgreSQL-specific contributions. Extend new domains (logical replication, FDW, parallelism, stats subsystems) by updating rules and agents accordingly.
