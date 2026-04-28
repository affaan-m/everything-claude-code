---
description: Read a plan document, decompose it into steps, design a custom agent chain per step, and return ready-to-paste /orchestrate custom prompts.
---

# Plan-Orchestrate Command

Given a plan document, design a `/orchestrate custom` invocation per step and **return one ready-to-paste prompt for each step**. This command itself **does not** call `/orchestrate` — it only emits executable strings. Under the plugin install form the command itself must be written as `/everything-claude-code:orchestrate`; see Phase 0.

## Usage

```
/plan-orchestrate <plan-doc-path> [--lang=python|typescript|go|rust|cpp|java|kotlin|flutter|auto] [--scope=all|step:<n>|range:<a>-<b>] [--dry-run]
```

- `<plan-doc-path>`: required. Relative or absolute path to the plan document (`@docs/...` is supported).
- `--lang`: reviewer language variant. Defaults to `auto` (detected from the project's primary language).
- `--scope`: limits which steps are emitted. Defaults to `all`. `step:3` emits only step 3; `range:2-4` emits steps 2 through 4.
- `--dry-run`: print step decomposition and chain selection rationale only; do not emit final `/orchestrate` prompts.

## Authoritative orchestrate format (do not deviate)

```
# plugin form (recommended, 1.9.0+)
/everything-claude-code:orchestrate custom "<agent1>,<agent2>,...,<agentN>" "<task description>"

# legacy bare-install form
/orchestrate custom "<agent1>,<agent2>,...,<agentN>" "<task description>"
```

- The command prefix itself follows the `ECC_MODE` detected in Phase 0: plugin form prepends `/everything-claude-code:`; legacy form is bare.
- `custom` denotes a **sequential chain**; each agent's HANDOFF feeds the next.
- The agent list is comma-separated. No spaces is most reliable; a single space is also accepted.
- There is no `--mode` / `--gate` / `--agents=...` field. **Do not invent flags.**
- Agent names must come from the catalogue below. The task description is double-quoted; embedded double quotes must be escaped.

## ECC install form and agent namespacing (important)

ECC has two install forms, which determine whether the **slash command itself** and the **agent names** are prefixed (the two must stay in sync — never prefix one without the other):

| Form | Detection | Slash command | Agent name format |
|---|---|---|---|
| **Plugin install** (recommended, 1.9.0+) | `~/.claude/plugins/marketplaces/everything-claude-code/` exists | **Prefixed** `/everything-claude-code:orchestrate` | **Prefixed** `everything-claude-code:<name>` |
| **Legacy bare install** | The directory above is absent; agent files live directly under `~/.claude/agents/` | Bare `/orchestrate` | Bare `<name>` |

**Phase 0 must detect the install form first**, then apply the matching command prefix and agent name format consistently across the entire output. The two forms differ only in command prefix and agent name prefix; the task description body is identical.

> Why this matters: under the plugin install, agents register as `everything-claude-code:tdd-guide` (and so on). Emitting bare `tdd-guide` forces `/orchestrate custom` into LLM-style fuzzy matching, which usually works for a single step but can fail intermittently across batched or parallel calls. Prefixed names eliminate the ambiguity. The same applies to the slash command itself: under the plugin install, bare `/orchestrate` is not registered, so a pasted bare command will fail with "command not found".

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
- `chief-of-staff` — multi-channel message triage (rarely a fit for plan steps)

Build error resolvers (per language):
- `build-error-resolver` (generic) / `cpp-build-resolver` / `go-build-resolver` / `java-build-resolver` / `kotlin-build-resolver` / `rust-build-resolver` / `pytorch-build-resolver`

Code reviewers (per language):
- `python-reviewer` / `typescript-reviewer` / `go-reviewer` / `rust-reviewer` / `cpp-reviewer` / `java-reviewer` / `kotlin-reviewer` / `flutter-reviewer`

> A misspelled agent name causes `/orchestrate` to fail outright. **Always cross-check against the catalogue before emitting output.**

## Execution flow (Claude follows this on receipt)

### Phase 0: Parse arguments + detect language + detect ECC install form

1. Read `<plan-doc-path>` with the Read tool. If the file is missing or empty, report the error to the user and stop immediately.
2. **Detect the ECC install form** (this determines whether the slash command and agent names carry a prefix):
   - If `~/.claude/plugins/marketplaces/everything-claude-code/` exists → `ECC_MODE=plugin`; write the command as `/everything-claude-code:orchestrate` and prefix every agent name with `everything-claude-code:`.
   - Otherwise, if `~/.claude/agents/planner.md` and similar files exist → `ECC_MODE=legacy`; write the bare `/orchestrate` and emit bare agent names.
   - Neither matched → warn the user "ECC not detected; the chain may not execute" but still emit using `legacy` form.
   - Detect once. Use the same form for the entire output. **Command prefix and agent name prefix must stay in sync — never mix.**
3. Resolve `--lang`. When `auto`, probe in this order:
   - `pyproject.toml` / `uv.lock` / `requirements.txt` → `python`
   - `package.json` → `typescript`
   - `go.mod` → `go`
   - `Cargo.toml` → `rust`
   - `CMakeLists.txt` or top-level `*.cpp` → `cpp`
   - `pom.xml` or `build.gradle` containing Java → `java`
   - `build.gradle.kts` or top-level Kotlin → `kotlin`
   - `pubspec.yaml` → `flutter`
   - None matched → leave empty (the language reviewer falls back to `code-reviewer`).

### Phase 1: Step decomposition

Identify "step units" in the plan document, in priority order:

1. Explicit numbering: `## Step N` / `### Phase N` / `## N. ...` / a top-level ordered list `1. ... 2. ...`.
2. A "Step" column in a table.
3. Explicit blocks separated by `---`, where each block has a verb-led heading.
4. None of the above → treat each H2 as one step.

For each step, extract:
- `id`: 1-based index
- `title`: step title (≤ 80 characters)
- `intent`: 1–3 sentence summary of the step's goal (compressed from the body)
- `tags`: from the "step classification" table below

### Phase 2: Step classification (drives chain selection)

Tag each step by **intent** (a step may carry multiple tags; the chain is built from the primary tag and stacked as needed):

| Tag | Trigger words (English + Chinese, since plans are often written in either language) | Default chain |
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
3. Chain length is capped at 4. If exceeded, drop the weakest tag (`lookup` and `docs` go first).
4. If `--lang=auto` failed, `<lang>-reviewer` falls back to `code-reviewer`.
5. If `<lang>-build-resolver` does not exist, fall back to `build-error-resolver`.
6. **Do not** put both `planner` and `architect` in an `impl` chain — that wastes tokens. Pair them only on `design` steps.
7. Any step that produces code must end the chain with a reviewer.

### Phase 3: Task description compression

The `<task description>` emitted for `/orchestrate custom` per step must satisfy:
- Self-contained: the first agent can begin without re-reading the plan document.
- Plan reference: starts with `[Plan: <path>#step-<id>]`.
- Acceptance: 1–3 verifiable completion criteria.
- Scope guard: explicitly state "out of scope" items inherited from the plan.
- Length: 200–600 characters; keep it short.
- Escape inner double quotes as `\"`. Never insert literal newlines — collapse to one line, separating clauses with `;` or `|`.

### Phase 4: Output format (final deliverable)

Emit the following Markdown structure. **Do not** invoke `/orchestrate` yourself. The command prefix (`/orchestrate` vs `/everything-claude-code:orchestrate`) and the agent names in each chain are both governed by the `ECC_MODE` detected in Phase 0; **they must stay in sync**:

```markdown
# Plan-Orchestrate Result

**Plan**: `<path>`
**Lang**: `<detected-or-given>`
**ECC mode**: `<plugin | legacy>`
**Steps**: <N>
**Scope**: <all | step:n | range:a-b>

## Steps overview

| # | Title | Tags | Chain |
|---|---|---|---|
| 1 | ... | impl, db | `everything-claude-code:tdd-guide,everything-claude-code:database-reviewer,everything-claude-code:python-reviewer` |
| ... | | | |

> The table above shows the `plugin` form. Under `legacy`, strip every `everything-claude-code:` prefix from the chain **and** rewrite the command itself from `/everything-claude-code:orchestrate` to bare `/orchestrate`.

---

## Step 1 — <title>

**Intent**: <1–3 sentences>
**Tags**: <a, b>
**Chain rationale**: <why this chain; which agent closes the loop>

```bash
# plugin form
/everything-claude-code:orchestrate custom "everything-claude-code:tdd-guide,everything-claude-code:database-reviewer,everything-claude-code:python-reviewer" "[Plan: docs/foo.md#step-1] <compressed task description>; Acceptance: <1–3 items>; Out of scope: <…>"
```

---

## Step 2 — <title>

...
```

Append a "batch execution block" at the end that aggregates every step's command in order inside one fenced block, so the user can copy them all at once (the command prefix follows `ECC_MODE`):

```markdown
## Batch execution (paste in order)

```text
# plugin form example
/everything-claude-code:orchestrate custom "..." "..."
/everything-claude-code:orchestrate custom "..." "..."
...
```
```

### Phase 5: Self-check (run before emitting)

Verify each item; fix any failure before output:

- [ ] Every agent in every chain comes from the catalogue.
- [ ] **Agent name prefix matches `ECC_MODE`**: under `plugin`, every agent name carries the `everything-claude-code:` prefix; under `legacy`, none do — **never mix within a single output**.
- [ ] **Slash command prefix matches `ECC_MODE`**: under `plugin`, the command is written as `/everything-claude-code:orchestrate`; under `legacy`, bare `/orchestrate` — **synchronised with the agent name prefix**, never one and not the other.
- [ ] No invented `--mode` / `--gate` / `--agents=...` fields.
- [ ] The task description is a single-line, double-quoted string; embedded quotes are escaped.
- [ ] Each task description begins with `[Plan: <path>#step-<id>]`.
- [ ] Each task description includes Acceptance (1–3 items).
- [ ] Chain length ≤ 4.
- [ ] Code-producing steps end with a reviewer.
- [ ] The overview table and per-step sections agree on count.
- [ ] `--scope` is honoured (e.g. `step:3` emits one detail block, but the overview table still lists the full plan).

## Edge cases

- **Plan has no clear steps**: prefer H2/H3 splitting; if still ambiguous, report "no structured steps detected" with the document outline and ask the user to confirm running by outline.
- **Plan is very large (> 1500 lines)**: emit the overview table first, then ask the user to narrow down with `--scope` before generating details.
- **A step is overly broad** (e.g. "complete all backend work"): do not force a single chain. Suggest splitting the step into N.a / N.b and propose a split.
- **The plan already declares agents** (rare): respect the declaration but still validate against the catalogue. Replace invalid agents and explain the substitution under "Chain rationale".

## Example

Input:
```
/plan-orchestrate @docs/plan/example-feature.md --lang=python
```

Excerpt of expected output (plugin form, prefixed agent names):
```markdown
## Step 2 — Encrypt sensitive UserProfile fields

**Intent**: Introduce an `EncryptedString` SQLAlchemy type and AES-GCM encrypt `birth_datetime` / `location` before persistence; load the key from an environment variable.
**Tags**: impl, security, db
**Chain rationale**: The step writes security-sensitive data, so `security-reviewer` closes the chain; `database-reviewer` validates the alembic migration; `python-reviewer` covers typing and PEP 8.

```bash
/everything-claude-code:orchestrate custom "everything-claude-code:tdd-guide,everything-claude-code:database-reviewer,everything-claude-code:python-reviewer,everything-claude-code:security-reviewer" "[Plan: docs/plan/example-feature.md#step-2] Implement EncryptedString SQLAlchemy type and migrate UserProfile.birth_datetime/location columns; key from ENV APP_DB_KEY; Acceptance: encrypt/decrypt roundtrip tests pass; alembic upgrade/downgrade clean on empty DB; no plaintext in DB after migrate; Out of scope: cross-tenant profile sharing logic"
```

> Equivalent `legacy` form: drop the command prefix and every `everything-claude-code:` namespace prefix from the chain:
>
> ```bash
> /orchestrate custom "tdd-guide,database-reviewer,python-reviewer,security-reviewer" "..."
> ```
```

## Important reminders

- This command **only emits prompts**; never invoke `/orchestrate` itself. Let the user decide when to execute each step.
- If the plan document is in Chinese, write the task description in Chinese as well (except code identifiers). Agent names are always English.
- If the user asks to "run step 1 first to see how it goes", direct them to paste the corresponding `/orchestrate custom ...` line themselves; do not execute on their behalf.
- Do not insert "Co-Authored-By" lines or emoji in the output unless the user explicitly asks.

## Arguments

`$ARGUMENTS`:
- `<plan-doc-path>` — required
- `--lang=<...>` — optional
- `--scope=<...>` — optional
- `--dry-run` — optional
