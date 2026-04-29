---
name: plan-orchestrate
description: Read a plan document, decompose it into steps, design a per-step agent chain from the ECC catalogue, and emit ready-to-paste /orchestrate custom prompts. Generative only — never invokes /orchestrate itself. Use when the user has a multi-step plan and wants to drive it through orchestrate without composing chains by hand.
origin: ECC
---

# Plan Orchestrate

Bridge a plan document to `/orchestrate custom` by emitting one ready-to-paste invocation per step. The skill is generative only — it never executes `/orchestrate`. The user pastes each line when ready.

## When to Activate

- User has a multi-step plan document (PRD, RFC, implementation plan) and wants to drive it through `/orchestrate`.
- User says "orchestrate this plan", "give me orchestrate prompts for each step", "compose chains for this plan".
- A step-by-step plan exists but the user does not want to manually pick agents per step.

Skip when:
- The work is one ad-hoc step → call `/orchestrate custom` directly.
- The plan has no structure (no headings, no numbered steps) — ask the user to add structure first.

## Inputs

```
<plan-doc-path> [--lang=python|typescript|go|rust|cpp|java|kotlin|flutter|auto] [--scope=all|step:<n>|range:<a>-<b>] [--dry-run]
```

- `<plan-doc-path>` — required; relative or absolute path (`@docs/...` accepted).
- `--lang` — reviewer language variant; defaults to `auto` (detected from project).
- `--scope` — limits emitted steps; defaults to `all`.
- `--dry-run` — print decomposition + chain rationale only; do not emit final prompts.

## Authoritative `/orchestrate` shape (do not deviate)

```
{ORCH_CMD} custom "<agent1>,<agent2>,...,<agentN>" "<task description>"
```

Where `{ORCH_CMD}` is determined in Phase 0 (see below). The command string in the emitted output **always uses one concrete form** — never both, never a placeholder.

- `custom` is a sequential chain; each agent's HANDOFF feeds the next.
- Comma-separated agent list. No spaces preferred; one space tolerated.
- No `--mode` / `--gate` / `--agents=...` flags exist — never invent them.
- Agent names come from the catalogue in this skill. Embedded double quotes in the task description are escaped as `\"`.

## ECC install form and namespacing

Two install forms determine the prefix on **both** the slash command and every agent name. The two MUST stay in sync — one form per output, never mixed:

| Form | Detection | `{ORCH_CMD}` | Agent name format |
|---|---|---|---|
| Plugin install (1.9.0+) | `~/.claude/plugins/marketplaces/everything-claude-code/` exists | `/everything-claude-code:orchestrate` | `everything-claude-code:<name>` |
| Legacy bare install | Above absent; agent files under `~/.claude/agents/` | `/orchestrate` | `<name>` |

Why this matters: under the plugin install, agents register as `everything-claude-code:tdd-guide`. Bare names force fuzzy matching, which fails intermittently under parallel calls. Under legacy, the prefixed forms are not registered and fail outright.

## Available agent catalogue (must pick from these)

General:
- `planner` — requirement restatement, risk decomposition, step planning
- `architect` — architecture, system design, refactor proposals
- `tdd-guide` — write tests → implement → 80%+ coverage
- `code-reviewer` — generic code review
- `security-reviewer` — security audit, OWASP, secret leakage
- `refactor-cleaner` — dead code, duplicates, knip-class cleanup
- `doc-updater` — documentation, codemap, README
- `docs-lookup` — third-party library API lookups (Context7)
- `e2e-runner` — end-to-end test orchestration
- `database-reviewer` — PostgreSQL schema, migration, performance
- `harness-optimizer` — local agent harness configuration
- `loop-operator` — long-running autonomous loops
- `chief-of-staff` — multi-channel triage (rarely a fit for plan steps)

Build error resolvers:
- `build-error-resolver` (generic) / `cpp-build-resolver` / `go-build-resolver` / `java-build-resolver` / `kotlin-build-resolver` / `rust-build-resolver` / `pytorch-build-resolver`

Code reviewers:
- `python-reviewer` / `typescript-reviewer` / `go-reviewer` / `rust-reviewer` / `cpp-reviewer` / `java-reviewer` / `kotlin-reviewer` / `flutter-reviewer`

A misspelled agent name fails `/orchestrate`. Cross-check against this list before emitting.

## How It Works

### Phase 0 — Detect ECC mode + language

1. Read `<plan-doc-path>`. If missing or empty, report and stop.
2. Detect ECC install form once. Set `ECC_MODE` to `plugin` or `legacy`. From this point on, every emitted line uses the matching prefix on **both** the slash command and every agent name. **Never emit both forms in the same output.**
3. Resolve `--lang`. When `auto`, run a polyglot-aware detection:
   - Probe markers: `pyproject.toml` / `uv.lock` / `requirements.txt` → python; `package.json` → typescript; `go.mod` → go; `Cargo.toml` → rust; `CMakeLists.txt` or top-level `*.cpp` → cpp; `pom.xml` / `build.gradle` (Java) → java; `build.gradle.kts` or top-level Kotlin → kotlin; `pubspec.yaml` → flutter.
   - **Polyglot tie-break**: if more than one marker matches, pick the language whose source files outnumber the others (`git ls-files | grep -c <ext>`); on a tie or when no language exceeds 60% of code files, fall back to `code-reviewer`.
   - No marker matched → fall back to `code-reviewer`.

### Phase 1 — Decompose steps

Identify "step units" in priority order:

1. Explicit numbering: `## Step N` / `### Phase N` / `## N. ...` / top-level ordered list.
2. A "Step" column in a table.
3. `---`-separated blocks with verb-led headings.
4. Otherwise treat each H2 as one step.

Per step extract `id` (1-based), `title` (≤ 80 chars), `intent` (1–3 sentences), `tags`.

### Phase 2 — Tag and pick chain

Tag by intent (multi-tag allowed; chain built from primary + stacked secondaries):

| Tag | Trigger words (English + Chinese, since plans are written in either) | Default chain |
|---|---|---|
| `design` | architecture, design, choose, evaluate / 架构、方案、设计、选型、RFC | `planner,architect` |
| `plan` | plan, breakdown, milestone / 计划、拆解、排期、里程碑 | `planner` |
| `impl` | implement, build, add, create, port / 实现、编码、落地、写 | `tdd-guide,<lang>-reviewer` |
| `test` | test, coverage, e2e, integration / 测试、覆盖率、单测、集成、E2E | `tdd-guide,e2e-runner` |
| `refactor` | refactor, cleanup, dedupe, split / 重构、清理、拆分、合并、去重 | `architect,refactor-cleaner,<lang>-reviewer` |
| `migration` | migrate, upgrade, rewrite, port / 迁移、重写、搬运、升级 | `architect,tdd-guide,<lang>-reviewer` |
| `db` | schema, migration, index, SQL, Postgres, alembic, sqlmodel | `database-reviewer,<lang>-reviewer` |
| `security` | encrypt, auth, secret, OWASP, PII / 安全、加密、密钥、认证、授权 | `security-reviewer,<lang>-reviewer` |
| `build` | build, compile, lint failure / 构建、编译、CI、打包错误 | `<lang>-build-resolver` (falls back to `build-error-resolver`) |
| `docs` | docs, readme, codemap, changelog / 文档、README | `doc-updater` |
| `lookup` | lookup, reference, API usage / 调研、文档查询 | `docs-lookup` |
| `review` | review, audit, verify / 评审、审查、check | `<lang>-reviewer,code-reviewer` |
| `loop` | loop, autonomous, watchdog / 长跑、循环、守护 | `loop-operator` |

Chain composition rules:
1. `impl` + `security` → `tdd-guide,<lang>-reviewer,security-reviewer`.
2. `impl` + `db` → `tdd-guide,database-reviewer,<lang>-reviewer`.
3. Chain length ≤ 4. If exceeded, drop weakest tag (`lookup` and `docs` first).
4. `<lang>-reviewer` falls back to `code-reviewer` when language is unknown.
5. `<lang>-build-resolver` falls back to `build-error-resolver`.
6. Do not pair `planner` and `architect` in an `impl` chain (token waste). Pair them only on `design` steps.
7. Code-producing steps end with a reviewer.

### Phase 3 — Compress task description

Each emitted `<task description>` must:
- Be self-contained (the first agent does not need the plan document open).
- Start with `[Plan: <path>#step-<id>]`.
- Include 1–3 verifiable Acceptance criteria.
- Include a Scope guard ("Out of scope: ...") inherited from the plan.
- Be 200–600 characters; one line; embedded `"` escaped as `\"`; no literal newlines.

### Phase 4 — Output

Emit Markdown using **the form determined by `ECC_MODE`**. The output uses one form throughout — every `{ORCH_CMD}` and every agent name is rendered with the matching prefix from Phase 0. **Do not emit both forms; do not include "this is plugin form" / "strip the prefix" instructions in the rendered output.**

Concrete rendering rules:

- `{ORCH_CMD}` = `/everything-claude-code:orchestrate` under `plugin`, `/orchestrate` under `legacy`.
- `{AGENT(name)}` = `everything-claude-code:<name>` under `plugin`, `<name>` under `legacy`.
- The overview-table "Chain" column uses the same `{AGENT(name)}` rendering.
- Per-step bash blocks contain only the runnable command. **No `# plugin form` or `# legacy form` comments** — the form is implicit and uniform across the whole output.

Output structure:

````markdown
# Plan-Orchestrate Result

**Plan**: `<path>`
**Lang**: `<detected-or-given>`
**ECC mode**: `<plugin | legacy>`
**Steps**: <N>
**Scope**: <all | step:n | range:a-b>

## Steps overview

| # | Title | Tags | Chain |
|---|---|---|---|
| 1 | ... | impl, db | `{AGENT(tdd-guide)},{AGENT(database-reviewer)},{AGENT(python-reviewer)}` |
| ... | | | |

---

## Step 1 — <title>

**Intent**: <1–3 sentences>
**Tags**: <a, b>
**Chain rationale**: <why this chain; which agent closes the loop>

```bash
{ORCH_CMD} custom "{AGENT(tdd-guide)},{AGENT(database-reviewer)},{AGENT(python-reviewer)}" "[Plan: docs/foo.md#step-1] <compressed task description>; Acceptance: <1–3 items>; Out of scope: <…>"
```
````

> The `{ORCH_CMD}` and `{AGENT(...)}` notation above describes the substitution this skill performs at runtime. The actual emitted Markdown contains the resolved strings, never the placeholders.

Append a final "Batch execution" block aggregating every step's command in order so the user can paste them all at once.

### Phase 5 — Self-check (run before emitting)

- [ ] Every agent in every chain comes from the catalogue.
- [ ] Resolved `{ORCH_CMD}` and every resolved `{AGENT(...)}` use the **same** form (`plugin` or `legacy`) — never mixed in one output.
- [ ] No `# plugin form` / `# legacy form` annotations and no "strip the prefix" instructions remain in the rendered output.
- [ ] No invented `--mode` / `--gate` / `--agents=...` fields.
- [ ] Each task description is single-line, double-quoted, with embedded `"` escaped.
- [ ] Each task description begins with `[Plan: <path>#step-<id>]` and includes Acceptance (1–3 items).
- [ ] Chain length ≤ 4.
- [ ] Code-producing steps end with a reviewer.
- [ ] Overview table count matches per-step section count.
- [ ] `--scope` honoured (e.g. `step:3` emits one detail block but the overview still lists every step).

## Edge cases

- **No clear steps**: prefer H2/H3 splitting; if still ambiguous, report "no structured steps detected" with the document outline and ask the user to confirm running by outline.
- **Very large plan (>1500 lines)**: emit the overview table first and ask the user to narrow with `--scope` before generating details.
- **Step too broad** (e.g. "complete all backend work"): do not force a single chain. Suggest splitting into N.a / N.b and propose a split.
- **Plan declares agents** (rare): respect the declaration but validate against the catalogue. Replace invalid agents and explain under "Chain rationale".
- **Polyglot project where `--lang=auto` cannot pick a winner**: fall back to `code-reviewer`; mention the fallback under "Chain rationale".

## Examples

### Example 1 — Plugin mode, Python plan

Input:
```
plan-orchestrate @docs/plan/example-feature.md --lang=python
```

Excerpt of expected output:
```markdown
## Step 2 — Encrypt sensitive UserProfile fields

**Intent**: Introduce an `EncryptedString` SQLAlchemy type and AES-GCM encrypt `birth_datetime` / `location` before persistence; load the key from an environment variable.
**Tags**: impl, security, db
**Chain rationale**: Security-sensitive write path, so `security-reviewer` closes the chain; `database-reviewer` validates the alembic migration; `python-reviewer` covers typing and PEP 8.

​```bash
/everything-claude-code:orchestrate custom "everything-claude-code:tdd-guide,everything-claude-code:database-reviewer,everything-claude-code:python-reviewer,everything-claude-code:security-reviewer" "[Plan: docs/plan/example-feature.md#step-2] Implement EncryptedString SQLAlchemy type and migrate UserProfile.birth_datetime/location columns; key from ENV APP_DB_KEY; Acceptance: encrypt/decrypt roundtrip tests pass; alembic upgrade/downgrade clean on empty DB; no plaintext in DB after migrate; Out of scope: cross-tenant profile sharing logic"
​```
```

### Example 2 — Legacy mode, same step

If `ECC_MODE=legacy` were detected, the same step would be emitted as a single uniform command (no plugin-prefixed forms anywhere in the output):

```bash
/orchestrate custom "tdd-guide,database-reviewer,python-reviewer,security-reviewer" "[Plan: docs/plan/example-feature.md#step-2] ..."
```

The two examples above illustrate **the two possible outputs** for two different environments. A single skill invocation produces only one of them, end to end.

## Notes

- Generative only. Never invoke `/orchestrate` from inside this skill.
- If the plan document is in Chinese, write task descriptions in Chinese (except code identifiers). Agent names are always English.
- Do not insert "Co-Authored-By" lines or emoji in the output unless the user explicitly asks.
