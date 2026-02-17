# ECC Extracted Patterns — Unique & Actionable

> Patterns in ECC files not present in the INFRA system. Generic items skipped.

---

## 1. code-reviewer.md — Domain-Specific Review Checklists

### React/Next.js Checklist (not in INFRA audit skills)
- Missing dependency arrays in `useEffect`/`useMemo`/`useCallback`
- State updates during render (infinite loop risk)
- Array index as key on reorderable lists
- Client-side hooks (`useState`/`useEffect`) inside Server Components
- Stale closures in event handlers

```tsx
// BAD: Missing dep, stale closure
useEffect(() => { fetchData(userId); }, []);

// GOOD: Complete deps
useEffect(() => { fetchData(userId); }, [userId]);
```

### Node.js/Backend Checklist (not in INFRA audit skills)
- Request body/params used without schema validation
- Public endpoints without rate limiting
- N+1 queries: fetching related data in a loop instead of JOIN/batch

```typescript
// BAD: N+1 pattern
for (const user of users) {
  user.posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [user.id]);
}

// GOOD: JOIN
SELECT u.*, json_agg(p.*) as posts
FROM users u LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id
```

### Confidence-Based Filtering Rule
Only report findings with >80% confidence. Consolidate similar issues ("5 functions missing error handling") rather than flooding with noise.

### Review Summary Table Format
```
| Severity | Count | Status |
| CRITICAL | 0     | pass   |
| HIGH     | 2     | warn   |
Verdict: WARNING — 2 HIGH issues should be resolved before merge.
```
Approval gate: CRITICAL = Block, HIGH = Warning (can merge with caution), none = Approve.

---

## 2. refactor-cleaner.md — External Tool Commands + Risk-Categorized Workflow

### Dead Code Detection Toolkit (INFRA has no equivalent)
```bash
npx knip          # Unused files, exports, dependencies
npx depcheck      # Unused npm dependencies
npx ts-prune      # Unused TypeScript exports
npx eslint . --report-unused-disable-directives  # Unused eslint directives
```

### Risk-Categorized Removal Workflow
| Category | Examples | Action |
|----------|----------|--------|
| SAFE | Unused exports, unused deps | Remove first |
| CAREFUL | Dynamic imports, string-referenced | Grep for dynamic refs first |
| RISKY | Public API surface | Verify with git history before removing |

### Ordered Batch Removal Pattern
Remove in this order to minimize risk:
1. deps → 2. exports → 3. files → 4. duplicates

Commit after each batch. Never remove during active feature development or before deploys.

---

## 3. multi-plan.md — Multi-Model Orchestration Paradigm

### Code Sovereignty Principle (unique architectural constraint)
External models (Codex, Gemini) have **zero filesystem write access**. Only Claude applies changes.
All external model output is treated as read-only analysis input.

### MCP ace-tool Pattern (prompt enhancement before analysis)
```
mcp__ace-tool__enhance_prompt({
  prompt: "$ARGUMENTS",
  conversation_history: "<last 5-10 turns>",
  project_root_path: "$PWD"
})
```
Enhanced prompt replaces original for all subsequent phases. Fallback: Glob + Grep.

### Trust-Based Domain Routing Table
| Task Type | Detection | Model Authority |
|-----------|-----------|-----------------|
| Frontend | Pages, components, UI, styles | Gemini |
| Backend | API, database, logic, algorithms | Codex |
| Fullstack | Both frontend + backend | Parallel Codex + Gemini |

### SESSION_ID Handoff Pattern
Plan phase saves `CODEX_SESSION` + `GEMINI_SESSION` IDs. Execute phase resumes with:
```
resume <SESSION_ID>
```
This preserves context between plan and execution phases without reloading.

### Background Task Polling (stop-loss)
```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```
Never kill process on timeout. Use `AskUserQuestion` to ask user whether to continue waiting.

---

## 4. multi-execute.md — Dirty Prototype Refactoring + Multi-Model Audit

### "Dirty Prototype" Concept (unique terminology + workflow)
External model output (Unified Diff Patch) is treated as a **dirty prototype**, not production code.
Claude's Phase 4 responsibility: refactor to "highly readable, maintainable, enterprise-grade code."

Refactoring steps:
1. Parse Unified Diff from Codex/Gemini
2. Mental sandbox: simulate applying diff, check logical consistency
3. Refactor: remove redundant code, enforce project standards, make self-explanatory
4. Apply with Edit/Write (minimal scope only)
5. Self-verify: run lint/typecheck/tests

### Parallel Multi-Model Audit Pattern
After implementation, IMMEDIATELY parallel-call both models for review:
```
Codex review: Security, performance, error handling, logic correctness
Gemini review: Accessibility, design consistency, user experience
```
Weigh feedback by trust rules: Backend follows Codex, Frontend follows Gemini.

---

## 5. strategic-compact/SKILL.md — Compaction Decision Guide

### Phase Transition Compaction Table (not in INFRA's compaction guidance)
| Phase Transition | Compact? | Why |
|-----------------|----------|-----|
| Research → Planning | Yes | Research context is bulky; plan is the distilled output |
| Planning → Implementation | Yes | Plan is in TodoWrite or a file; free up context for code |
| Implementation → Testing | Maybe | Keep if tests reference recent code |
| Debugging → Next feature | Yes | Debug traces pollute context for unrelated work |
| Mid-implementation | No | Losing variable names, file paths, partial state is costly |
| After a failed approach | Yes | Clear dead-end reasoning before trying new approach |

### What Survives Compaction (reference table)
| Persists | Lost |
|----------|------|
| CLAUDE.md instructions | Intermediate reasoning and analysis |
| TodoWrite task list | File contents previously read |
| Memory files (`~/.claude/memory/`) | Multi-step conversation context |
| Git state (commits, branches) | Tool call history and counts |
| Files on disk | Nuanced user preferences stated verbally |

### Hook-Based Tool Counting Pattern
PreToolUse hook on Edit/Write calls:
```json
{
  "PreToolUse": [{
    "matcher": "Edit",
    "hooks": [{ "type": "command", "command": "node suggest-compact.js" }]
  }]
}
```
Configurable: `COMPACT_THRESHOLD=50` (env var). Suggests at threshold, reminds every 25 calls after.

### `/compact` with Custom Summary
```
/compact Focus on implementing auth middleware next
```
Write important context to files/memory BEFORE compacting.

---

## 6. database-reviewer.md — PostgreSQL + Supabase RLS Patterns

### Diagnostic Commands (operational, not in INFRA)
```bash
psql -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
psql -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
psql -c "SELECT indexrelname, idx_scan, idx_tup_read FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

### PostgreSQL Optimization Principles
- `SKIP LOCKED` for queue patterns (10x throughput for worker patterns)
- Cursor pagination: `WHERE id > $last` instead of `OFFSET` on large tables
- Covering indexes: `INCLUDE (col)` to avoid table lookups
- Partial indexes: `WHERE deleted_at IS NULL` for soft deletes
- Short transactions: never hold locks during external API calls
- Consistent lock ordering: `ORDER BY id FOR UPDATE` to prevent deadlocks
- Batch inserts: multi-row `INSERT` or `COPY`, never individual inserts in loops

### Supabase RLS Pattern
```sql
-- CORRECT: Wrap auth.uid() in SELECT to avoid per-row function calls
CREATE POLICY "user_access" ON table
  USING ((SELECT auth.uid()) = user_id);

-- WRONG: Called per-row (no SELECT wrapper)
USING (auth.uid() = user_id);
```
Also: index RLS policy columns. Enable RLS on all multi-tenant tables.

### Anti-Pattern Table
| Anti-Pattern | Use Instead |
|---|---|
| `int` for IDs | `bigint` |
| `varchar(255)` | `text` |
| `timestamp` | `timestamptz` |
| Random UUIDs as PKs | UUIDv7 or IDENTITY |
| `OFFSET` pagination | `WHERE id > $last` cursor |
| `GRANT ALL` to app users | Least privilege |
| `SELECT *` in production | Named columns |

### Data Type Standards
- IDs: `bigint`
- Strings: `text` (not `varchar(N)` without reason)
- Timestamps: `timestamptz`
- Money: `numeric`
- Flags: `boolean`
- Identifiers: `lowercase_snake_case` (no quoted mixed-case)
