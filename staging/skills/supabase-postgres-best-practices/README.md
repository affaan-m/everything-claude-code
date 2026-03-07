# Supabase Postgres Best Practices - Contributor Guide

This skill contains Postgres performance optimization references optimized for
AI agents and LLMs. It follows the [Agent Skills Open Standard](https://agentskills.io/).

## Creating a New Reference

1. **Choose a section prefix** based on the category:
   - `conn-` Connection Management (CRITICAL)
   - `security-` Security & RLS (CRITICAL)
   - `lock-` Concurrency & Locking (MEDIUM-HIGH)
   - `monitor-` Monitoring & Diagnostics (LOW-MEDIUM)

2. **Create a new reference file** in `references/` with the appropriate prefix.

3. **Fill in the content** following the structure of existing reference files.

4. **Review** the result and update `SKILL.md` if needed.

## Skill Structure

```
skills/supabase-postgres-best-practices/
├── SKILL.md           # Agent-facing skill manifest (read this first)
├── AGENTS.md          # Navigation guide
├── CLAUDE.md          # Navigation guide (copy of AGENTS.md)
├── README.md          # This file
└── references/
    └── *.md              # Individual reference files by category
```

## Reference File Structure

Key elements for each reference file:

````markdown
---
title: Clear, Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified benefit (e.g., "10-100x faster")
tags: relevant, keywords
---

## [Title]

[1-2 sentence explanation]

**Incorrect (description):**

```sql
-- Comment explaining what's wrong
[Bad SQL example]
```
````

**Correct (description):**

```sql
-- Comment explaining why this is better
[Good SQL example]
```

```
## Writing Guidelines

Key principles:

1. **Show concrete transformations** - "Change X to Y", not abstract advice
2. **Error-first structure** - Show the problem before the solution
3. **Quantify impact** - Include specific metrics (10x faster, 50% smaller)
4. **Self-contained examples** - Complete, runnable SQL
5. **Semantic naming** - Use meaningful names (users, email), not (table1, col1)

## Impact Levels

| Level | Improvement | Examples |
|-------|-------------|----------|
| CRITICAL | 10-100x | Missing indexes, connection exhaustion |
| HIGH | 5-20x | Wrong index types, poor partitioning |
| MEDIUM-HIGH | 2-5x | N+1 queries, RLS optimization |
| MEDIUM | 1.5-3x | Redundant indexes, stale statistics |
| LOW-MEDIUM | 1.2-2x | VACUUM tuning, config tweaks |
| LOW | Incremental | Advanced patterns, edge cases |
```
