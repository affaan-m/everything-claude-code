---
name: code-tour
origin: community
description: >
  Use this skill to create CodeTour .tour files — persona-targeted, step-by-step walkthroughs
  that link to real files and line numbers. Trigger for: "create a tour", "make a code tour",
  "generate a tour", "onboarding tour", "tour for this PR", "tour for this bug", "RCA tour",
  "architecture tour", "explain how X works", "vibe check", "PR review tour",
  "contributor guide", "help someone ramp up", or any request for a structured walkthrough
  through code. Supports 20 developer personas (new joiner, bug fixer, architect, PR reviewer,
  vibecoder, security reviewer, and more), all CodeTour step types (file/line, selection,
  pattern, uri, commands, view), and tour-level fields (ref, isPrimary, nextTour).
  Works with any repository in any language.
---

# Code Tour Skill

You are creating a **CodeTour** — a persona-targeted, step-by-step walkthrough of a codebase
that links directly to files and line numbers. CodeTour files live in `.tours/` and work with
the [VS Code CodeTour extension](https://github.com/microsoft/codetour).

Two scripts are bundled in `scripts/`:

- **`scripts/validate_tour.py`** — run after writing any tour. Checks JSON validity, file/directory existence, line numbers within bounds, pattern matches, nextTour cross-references, and narrative arc. Run it: `python ~/.agents/skills/code-tour/scripts/validate_tour.py .tours/<name>.tour --repo-root .`
- **`scripts/generate_from_docs.py`** — when the user asks to generate from README/docs, run this first to extract a skeleton, then fill it in. Run it: `python ~/.agents/skills/code-tour/scripts/generate_from_docs.py --persona new-joiner --output .tours/skeleton.tour`

Two reference files are bundled:

- **`references/codetour-schema.json`** — the authoritative JSON schema. Read it to verify any field name or type. Every field you use must conform to it.
- **`references/examples.md`** — 8 real-world CodeTour tours from production repos with annotated techniques. Read it when you want to see how a specific feature (`commands`, `selection`, `view`, `pattern`, `isPrimary`, multi-tour series) is used in practice.

### Real-world `.tour` files on GitHub

These are confirmed production `.tour` files. Fetch one when you need a working example of a specific step type, tour-level field, or narrative structure — don't write from memory when the real thing is one fetch away.

Find more with the GitHub code search: https://github.com/search?q=path%3A**%2F*.tour+&type=code

#### By step type / technique demonstrated

| What to study | File URL |
|---|---|
| `directory` + `file+line` (contributor onboarding) | https://github.com/coder/code-server/blob/main/.tours/contributing.tour |
| `selection` + `file+line` + intro content step (accessibility project) | https://github.com/a11yproject/a11yproject.com/blob/main/.tours/code-tour.tour |
| Minimal tutorial — tight `file+line` narration for interactive learning | https://github.com/lostintangent/rock-paper-scissors/blob/master/main.tour |
| Multi-tour repo with `nextTour` chaining (cloud native OCI walkthroughs) | https://github.com/lucasjellema/cloudnative-on-oci-2021/blob/main/.tours/introduction.tour |
| `isPrimary: true` (marks the onboarding entry point) | https://github.com/nickvdyck/webbundlr/blob/main/.tours/getting-started.tour |
| `pattern` instead of `line` (regex-anchored steps) | https://github.com/nickvdyck/webbundlr/blob/main/.tours/architecture.tour |

#### Notes on each

**`coder/code-server` — Contributing**
Opens with a `directory` step on `src/` that orients with a single sentence, then drives straight into `src/node/entry.ts` line 157. Clean external-contributor structure: orientation → entry point → key subsystems → links to FAQ docs via URI steps. Good model for any contributor tour.

**`a11yproject/a11yproject.com` — Code Tour**
Uses `selection` to highlight a block within `package.json` (start line 1, end varies) alongside a `line` for the same file. Shows how to vary step type on the same file. Note: the intro step in this tour is content-only — in some VS Code versions this renders blank. Prefer anchoring the first step to a file or directory and putting the welcome text in its description.

**`lostintangent/rock-paper-scissors` — main.tour**
Only 4–5 steps. Shows how a minimal tour can be complete: every step tells the reader something actionable, links to a specific line, and ends with a clear call to action ("try changing this and watch it take effect"). Good reference when writing a vibecoder or quick-explainer tour.

**`lucasjellema/cloudnative-on-oci-2021` — multi-tour series**
Multiple `.tour` files in the same repo, each scoped to a different cloud service. Browse the `.tours/` directory to see how a series is organized — separate files, clear scoped titles, and `nextTour` linking between them. Good model for a complex domain with a tour-series strategy.

**Raw content tip:** If GitHub rate-limits the HTML view, prefix `raw.githubusercontent.com` and drop `/blob/`:
```
https://raw.githubusercontent.com/coder/code-server/main/.tours/contributing.tour
https://raw.githubusercontent.com/a11yproject/a11yproject.com/main/.tours/code-tour.tour
https://raw.githubusercontent.com/lostintangent/rock-paper-scissors/master/main.tour
```

A great tour is not just annotated files. It is a **narrative** — a story told to a specific
person about what matters, why it matters, and what to do next. Your goal is to write the tour
that the right person would wish existed when they first opened this repo.

**CRITICAL: Only create `.tour` JSON files. Never create, modify, or scaffold any other files.**

---

## Step 1: Discover the repo

Before asking the user anything, explore the codebase:

- List the root directory, read the README, and check key config files
  (package.json, pyproject.toml, go.mod, Cargo.toml, composer.json, etc.)
- Identify the language(s), framework(s), and what the project does
- Map the folder structure 1–2 levels deep
- Find entry points: main files, index files, app bootstrapping
- **Note which files actually exist** — every path you write in the tour must be real

If the repo is sparse or empty, say so and work with what exists.

**If the user says "generate from README" or "use the docs":** run the skeleton generator first, then fill in every `[TODO: ...]` by reading the actual files:

```bash
python skills/code-tour/scripts/generate_from_docs.py \
  --persona new-joiner \
  --output .tours/skeleton.tour
```

### Entry points by language/framework

Don't read everything — start here, then follow imports.

| Stack | Entry points to read first |
|-------|---------------------------|
| **Node.js / TS** | `index.js/ts`, `server.js`, `app.js`, `src/main.ts`, `package.json` (scripts) |
| **Python** | `main.py`, `app.py`, `__main__.py`, `manage.py` (Django), `app/__init__.py` (Flask/FastAPI) |
| **Go** | `main.go`, `cmd/<name>/main.go`, `internal/` |
| **Rust** | `src/main.rs`, `src/lib.rs`, `Cargo.toml` |
| **Java / Kotlin** | `*Application.java`, `src/main/java/.../Main.java`, `build.gradle` |
| **Ruby** | `config/application.rb`, `config/routes.rb`, `app/controllers/application_controller.rb` |
| **PHP** | `index.php`, `public/index.php`, `bootstrap/app.php` (Laravel) |

### Repo type variants — adjust focus accordingly

The same persona asks for different things depending on what kind of repo this is:

| Repo type | What to emphasize | Typical anchor files |
|-----------|-------------------|----------------------|
| **Service / API** | Request lifecycle, auth, error contracts | router, middleware, handler, schema |
| **Library / SDK** | Public API surface, extension points, versioning | index/exports, types, changelog |
| **CLI tool** | Command parsing, config loading, output formatting | main, commands/, config |
| **Monorepo** | Package boundaries, shared contracts, build graph | root package.json/pnpm-workspace, shared/, packages/ |
| **Framework** | Plugin system, lifecycle hooks, escape hatches | core/, plugins/, lifecycle |
| **Data pipeline** | Source → transform → sink, schema ownership | ingest/, transform/, schema/, dbt models |
| **Frontend app** | Component hierarchy, state management, routing | pages/, store/, router, api/ |

For **monorepos**: identify the 2–3 packages most relevant to the persona's goal. Don't try to tour everything — open the tour with a step that explains how to navigate the workspace, then stay focused.

### Large repo strategy

For repos with 100+ files: don't try to read everything.

1. Read entry points and the README first
2. Build a mental model of the top 5–7 modules
3. For the requested persona, identify the **2–3 modules that matter most** and read those deeply
4. For modules you're not covering, mention them in the intro step as "out of scope for this tour"
5. Use `directory` steps for areas you mapped but didn't read — they orient without requiring full knowledge

A focused 10-step tour of the right files beats a scattered 25-step tour of everything.

---

## Step 2: Read the intent — infer everything you can, ask only what you can't

**One message from the user should be enough.** Read their request and infer persona,
depth, and focus before asking anything.

### Intent map

| User says | → Persona | → Depth | → Action |
|-----------|-----------|---------|----------|
| "tour for this PR" / "PR review" / "#123" | pr-reviewer | standard | Add `uri` step for the PR; use `ref` for the branch |
| "why did X break" / "RCA" / "incident" | rca-investigator | standard | Trace the failure causality chain |
| "debug X" / "bug tour" / "find the bug" | bug-fixer | standard | Entry → fault points → tests |
| "onboarding" / "new joiner" / "ramp up" | new-joiner | standard | Directories, setup, business context |
| "quick tour" / "vibe check" / "just the gist" | vibecoder | quick | 5–8 steps, fast path only |
| "explain how X works" / "feature tour" | feature-explainer | standard | UI → API → backend → storage |
| "architecture" / "tech lead" / "system design" | architect | deep | Boundaries, decisions, tradeoffs |
| "security" / "auth review" / "trust boundaries" | security-reviewer | standard | Auth flow, validation, sensitive sinks |
| "refactor" / "safe to extract?" | refactorer | standard | Seams, hidden deps, extraction order |
| "performance" / "bottlenecks" / "slow path" | performance-optimizer | standard | Hot path, N+1, I/O, caches |
| "contributor" / "open source onboarding" | external-contributor | quick | Safe areas, conventions, landmines |
| "concept" / "explain pattern X" | concept-learner | standard | Concept → implementation → rationale |
| "test coverage" / "where to add tests" | test-writer | standard | Contracts, seams, coverage gaps |
| "how do I call the API" | api-consumer | standard | Public surface, auth, error semantics |

**Infer silently:** persona, depth, focus area, whether to add `uri`/`ref`, `isPrimary`.

**Ask only if you genuinely can't infer:**
- "bug tour" but no bug described → ask for the bug description
- "feature tour" but no feature named → ask which feature
- "specific files" explicitly requested → honor them as required stops

Never ask about `nextTour`, `commands`, `when`, or `stepMarker` unless the user mentioned them.

### PR tour recipe

When the user says "tour for this PR" or pastes a GitHub PR URL:

1. Set `"ref"` to the PR's branch name
2. Open with a `uri` step pointing to the PR itself — this gives the reviewer the full diff context
3. Add a `uri` step for any related issue or RFC if linked in the PR description
4. Cover **changed files first** — what changed and why
5. Then add steps for **files not in the diff** that reviewers must understand to evaluate the change correctly (call sites, dependency files, tests)
6. Flag invariants the change must preserve
7. Close with a reviewer checklist: what to verify, what tests to run, what to watch out for

```json
[
  { "uri": "https://github.com/org/repo/pull/456",
    "title": "The PR", "description": "This PR refactors auth to use refresh tokens. Key concern: session invalidation during migration." },
  { "file": "src/auth/tokenService.ts", "line": 12, "title": "What Changed: Token Issuing", "description": "..." },
  { "file": "src/auth/middleware.ts", "line": 38, "title": "Unchanged But Critical", "description": "This file wasn't touched but depends on the token shape. Verify line 38 still matches." },
  { "title": "Reviewer Checklist", "description": "- [ ] Session invalidation tested?\n- [ ] Old tokens still rejected after migration?\n- [ ] Refresh token rotation tested?" }
]
```

### User-provided customization — always honor these

| User says | What to do |
|-----------|-----------|
| "cover `src/auth.ts` and `config/db.yml`" | Those files are required stops |
| "pin to the `v2.3.0` tag" / "this commit: abc123" | Set `"ref": "v2.3.0"` |
| "link to PR #456" / pastes a URL | Add a `uri` step at the right narrative moment |
| "lead into the security tour when done" | Set `"nextTour": "Security Review"` |
| "make this the main onboarding tour" | Set `"isPrimary": true` |
| "open a terminal at this step" | Add `"commands": ["workbench.action.terminal.focus"]` |
| "deep" / "thorough" / "5 steps" / "quick" | Override depth accordingly |

---

## Step 3: Read the actual files — no exceptions

**Every file path and line number in the tour must be verified by reading the file.**
A tour pointing to the wrong file or a non-existent line is worse than no tour.

For every planned step:
1. Read the file
2. Find the exact line of the code you want to highlight
3. Understand it well enough to explain it to the target persona

If a user-requested file doesn't exist, say so — don't silently substitute another.

---

## Step 4: Write the tour

Save to `.tours/<persona>-<focus>.tour`. Read `references/codetour-schema.json` for the
authoritative field list. Every field you use must appear in that schema.

### Tour root

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "Descriptive Title — Persona / Goal",
  "description": "One sentence: who this is for and what they'll understand after.",
  "ref": "main",
  "isPrimary": false,
  "nextTour": "Title of follow-up tour",
  "steps": []
}
```

Omit any field that doesn't apply to this tour.

**`when`** — conditional display. A JavaScript expression evaluated at runtime. Only show this tour
if the condition is true. Useful for persona-specific auto-launching, or hiding advanced tours
until a simpler one is complete.
```json
{ "when": "workspaceFolders[0].name === 'api'" }
```

**`stepMarker`** — embed step anchors directly in source code comments. When set, CodeTour
looks for `// <stepMarker>` comments in files and uses them as step positions instead of
(or alongside) line numbers. Useful for tours on actively changing code where line numbers
shift constantly. Example: set `"stepMarker": "CT"` and put `// CT` in the source file.
Don't suggest this unless the user asks — it requires editing source files, which is unusual.

---

### Step types — the full toolkit

**Content step** — narrative only, no file. Use for intro and closing. Max 2 per tour.
```json
{ "title": "Welcome", "description": "markdown..." }
```

**Directory step** — orient to a module. "What lives here."
```json
{ "directory": "src/services", "title": "Service Layer", "description": "..." }
```

**File + line step** — the workhorse. One specific meaningful line.
```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "..." }
```

> **Path rule — always relative to repo root.** `"file"` and `"directory"` values must be relative to the repository root (the directory that contains `.tours/`). Never use an absolute path (`/Users/...`) and never use a leading `./`. If the repo root is `/projects/myapp` and the file is at `/projects/myapp/src/auth.ts`, write `"src/auth.ts"` — not `./src/auth.ts`, not `/projects/myapp/src/auth.ts`, not `auth.ts` (unless it's actually at the root).

**Selection step** — a block of logic. Use when one line isn't enough (a function body, a config block, a type definition).
```json
{
  "file": "src/core/pipeline.py",
  "selection": { "start": { "line": 15, "character": 0 }, "end": { "line": 34, "character": 0 } },
  "title": "The Request Pipeline",
  "description": "..."
}
```

**Pattern step** — match by regex instead of line number. Use when line numbers shift frequently (actively changing files, generated code).
```json
{ "file": "src/app.ts", "pattern": "export default class Application", "title": "...", "description": "..." }
```

**URI step** — link to an external resource: a PR, issue, RFC, ADR, architecture diagram, Notion doc. Use to bring in context that lives outside the codebase.
```json
{
  "uri": "https://github.com/org/repo/pull/456",
  "title": "The PR That Introduced This Pattern",
  "description": "This design was debated in PR #456. The key tradeoff was..."
}
```

**View step** — auto-focus a VS Code panel at this step (terminal, problems, scm, explorer).
```json
{ "file": "src/server.ts", "line": 1, "view": "terminal", "title": "...", "description": "..." }
```

**Commands step** — execute VS Code commands when the reader arrives. Add to any file step.
```json
{
  "file": "src/server.ts", "line": 1,
  "title": "Run It",
  "description": "Hit the play button — you'll see the server boot sequence here.",
  "commands": ["workbench.action.terminal.focus"]
}
```

Useful commands:
| Command | What it does |
|---------|-------------|
| `editor.action.goToDeclaration` | Jump to definition |
| `editor.action.showHover` | Show type hover |
| `references-view.findReferences` | Show all references |
| `workbench.action.terminal.focus` | Open terminal |
| `workbench.action.tasks.runTask` | Run a task |
| `workbench.view.scm` | Open source control panel |
| `workbench.view.explorer` | Open file explorer |

---

### When to use each step type

| Situation | Step type |
|-----------|-----------|
| Tour intro or closing | content |
| "Here's what lives in this folder" | directory |
| One line tells the whole story | file + line |
| A function/class body is the point | selection |
| Line numbers shift, file is volatile | pattern |
| PR / issue / doc gives the "why" | uri |
| Reader should open terminal or explorer | view or commands |

---

### Step count calibration

Match steps to depth and persona. These are targets, not hard limits.

| Depth | Total steps | Core path steps | Notes |
|-------|-------------|-----------------|-------|
| Quick | 5–8 | 3–5 | Vibecoder, fast explorer — cut ruthlessly |
| Standard | 9–13 | 6–9 | Most personas — breadth + enough detail |
| Deep | 14–18 | 10–13 | Architect, RCA — every tradeoff surfaced |

Scale with repo size too. A 3-file CLI doesn't get 15 steps. A 200-file monolith shouldn't be squeezed into 5.

| Repo size | Recommended standard depth |
|-----------|---------------------------|
| Tiny (< 20 files) | 5–8 steps |
| Small (20–80 files) | 8–11 steps |
| Medium (80–300 files) | 10–13 steps |
| Large (300+ files) | 12–15 steps (scoped to relevant subsystem) |

---

### Writing excellent descriptions — the SMIG formula

Every description should answer four questions in order. You don't need four paragraphs — but every description needs all four elements, even briefly.

**S — Situation**: What is the reader looking at? One sentence grounding them in context.
**M — Mechanism**: How does this code work? What pattern, rule, or design is in play?
**I — Implication**: Why does this matter for *this persona's goal specifically*?
**G — Gotcha**: What would a smart person get wrong here? What's non-obvious, fragile, or surprising?

**Bad description** (generic — could apply to any codebase):
> "This is the authentication middleware. It checks if the user is authenticated before allowing access to protected routes."

**Good description** (SMIG applied):
> **S:** Every HTTP request passes through this file before reaching any controller — it's the sole auth checkpoint.
>
> **M:** Notice the **dual-check pattern** on line 42: it validates the JWT signature *and* does a Redis lookup for the session. Both must pass. A valid JWT alone isn't enough if the session was revoked (logout, password reset, force-expire).
>
> **I:** For a bug fixer: if a user reports being logged out unexpectedly, this is your first stop. Redis miss → 401 → silent logout is the most common failure path.
>
> **G:** If Redis is down, line 53 propagates the error as a 401 — meaning a Redis outage silently logs everyone out. There's no circuit breaker here. This is tracked in ISSUE-4421, and the workaround is in `config/redis.ts` line 18.

The good description tells the reader something they couldn't learn by reading the file themselves. It names the pattern, explains the design decision, flags the failure mode, and cross-references related context.

**Persona vocabulary cheat sheet** — speak their language, not generic developer-speak:

| Persona | Their vocabulary | Avoid |
|---------|-----------------|-------|
| New joiner | "this means", "you'll need to", "the team calls this" | acronyms, assumed context |
| Bug fixer | "failure path", "where this breaks", "repro steps" | architecture history |
| Security reviewer | "trust boundary", "untrusted input", "privilege escalation" | vague "be careful" |
| PR reviewer | "invariant", "this must stay true", "the change story" | unrelated context |
| Architect | "seam", "coupling", "extension point", "decision" | step-by-step walkthroughs |
| Vibecoder | "the main loop", "ignore for now", "start here" | deep explanations |

---

## Narrative arc — every tour, every persona

1. **Orientation** — **must be a `file` or `directory` step, never content-only.**
   Use `"file": "README.md", "line": 1` or `"directory": "src"` and put your welcome text in the description.
   A content-only first step (no `file`, `directory`, or `uri`) renders as a blank page in VS Code CodeTour — this is a known VS Code extension behaviour, not configurable.

2. **High-level map** (1–3 directory or uri steps) — major modules and how they relate.
   Not every folder — just what this persona needs to know.

3. **Core path** (file/line, selection, pattern, uri steps) — the specific code that matters.
   This is the heart of the tour. Read and narrate. Don't skim.

4. **Closing** (content) — what the reader now understands, what they can do next,
   2–3 suggested follow-up tours. If `nextTour` is set, reference it by name here.

### What makes a closing step excellent

The closing is frequently the weakest step. Don't summarize — the reader just read it.
Instead:

❌ Bad closing (recap):
> "In this tour we covered the entry point, the middleware stack, and the database layer."

✅ Good closing (action + next):
> "You now know enough to safely add a new route without breaking auth or session handling.
> The danger zones to stay away from are `src/auth/tokenService.ts` (don't change the token shape without a migration plan) and `src/db/pool.ts` (connection limits are load-tested at current values).
>
> **What's next:**
> - If you're fixing a bug → jump to the **Bug Fixer: Payment Flow** tour for the specific path
> - If you're adding a feature → the **Feature Explainer: Notifications** tour shows the full pattern
> - If something's on fire → the **RCA: Incident Guide** tour maps the observability anchors"

The good closing tells the reader what they're now capable of, what to avoid, and gives them a map of where to go next.

---

## The 20 personas

| Persona | Goal | Must cover | Avoid |
|---------|------|------------|-------|
| **Vibecoder** | Get the vibe fast | Entry point, request flow, main modules. "Start here / Core loop / Ignore for now." Max 8 steps. | Deep dives, history, edge cases |
| **New joiner** | Structured ramp-up | Directories, setup/run instructions, business context, service boundaries, team terms defined. | Advanced internals before basics |
| **Reboarding engineer** | Catch up on what changed | What's new vs. what they remember. "This used to be X, now it's Y." | Re-explaining things they knew |
| **Bug fixer** | Root cause fast | User action → trigger → fault points. Validation, branching, error handling. Repro hints + test locations. | Architecture tours, business context |
| **RCA / incident investigator** | Why did it fail | Causality chain. State transitions, side effects, race conditions. Observability anchors. | Happy path |
| **Feature explainer** | One feature end-to-end | UI → API → backend → storage. Feature flags, auth, edge cases, scope. | Unrelated features |
| **Concept learner** | Understand a pattern | Concept intro → implementation → why this design → tradeoffs → common misunderstanding. | Code without conceptual framing |
| **PR reviewer** | Review the change correctly | The change story, not just changed files. Invariants. Risky areas. Reviewer checklist. URI step for the PR. | Unrelated context |
| **Maintainer** | Long-term health | Architectural intent. Extension points. "Do not bypass this layer." Long-lived invariants. | One-time setup concerns |
| **Refactorer** | Safe restructuring | Seams, hidden deps, implicit contracts, coupling hotspots, safe extraction order. | Feature explanations |
| **Performance optimizer** | Find bottlenecks | Hot paths, N+1, I/O, serialization. Caches, batching. Existing benchmarks. | Cold paths, setup code |
| **Security reviewer** | Trust boundaries + abuse paths | Auth flow. Input validation. Secret handling. Sensitive sinks. Safe failure modes. | Unrelated business logic |
| **Test writer** | Add good tests | Behavior contracts. Existing patterns. Mocking seams. Coverage gaps. High-value scenarios. | Implementation detail |
| **API consumer** | Call the system correctly | Public surface, request/response shapes, auth, error semantics, stable vs. internal. | Internal implementation |
| **Platform / infra engineer** | Operational understanding | Boot sequence, config loading, infra deps, background jobs, graceful shutdown. | Business logic |
| **Data engineer** | Data lineage + schemas | Event emission, schema definitions, source-to-sink path, data quality, backfill. | UI / request flow |
| **AI agent operator** | Deterministic navigation | Stable anchors, allowed edit zones, required validation steps. "Do not infer — read this file first." | Ambiguous or implied structure |
| **Product-minded engineer** | Business rules in code | Domain language, business rules, feature toggles, "why does this weird code exist?" | Pure infrastructure |
| **External contributor** | Contribute without breaking | Contribution-safe areas, code style, architecture landmines, typical first-timer mistakes. | Deep internals |
| **Tech lead / architect** | Shape and rationale | Module boundaries, design tradeoffs, risk hotspots, future evolution. | Line-by-line walkthroughs |

---

## Designing a tour series

When a codebase is complex enough that one tour can't cover it well, design a series.
The `nextTour` field chains them: when the reader finishes one tour, VS Code offers to
launch the next automatically.

**Plan the series before writing any tour.** A good series has:
- A clear escalation path (broad → narrow, orientation → deep-dive)
- No duplicate steps between tours
- Each tour standalone enough to be useful on its own

**Common series patterns:**

*Onboarding series (new joiner):*
1. "Orientation" → repo structure, how to run it (isPrimary: true)
2. "Core Request Flow" → entry to response, middleware chain
3. "Data Layer" → models, migrations, query patterns
4. "Testing Patterns" → how to write and run tests

*Incident / debug series (bug fixer + RCA):*
1. "Happy Path" → normal flow from trigger to response
2. "Failure Modes" → where it can break and why
3. "Observability Map" → logs, metrics, traces to look at

*Architecture series (tech lead):*
1. "Module Boundaries" → what lives where and why
2. "Extension Points" → where to add new features
3. "Danger Zones" → what must never be changed carelessly

**When writing a series:** set `nextTour` in each tour to the `title` of the next one.
The value must match exactly. Tell the reader in the closing step which tour comes next
and why they should read it.

### Hot files — anchor the series

Some files deserve a step in almost every tour because they're where the system's core rules live. Identify 2–3 of these early and treat them as anchors:

- The **main entry point** — every persona needs to see this
- The **central router or dispatcher** — where requests branch
- The **primary config loader** — where behavior is controlled
- The **auth boundary** — the single place permissions are checked

When the same file appears in multiple tours, give it a *different* framing each time — new joiners get "this is where the server starts", security reviewers get "this is the only place secrets are loaded".

---

## What CodeTour cannot do

If asked for any of these, say clearly that it's not supported — do not suggest a workaround that doesn't exist:

| Request | Reality |
|---|---|
| **Auto-advance to next step after X seconds** | Not supported. Navigation is always manual — the reader clicks Next. There is no timer, delay, or autoplay step mechanic in CodeTour. |
| **Embed a video or GIF in a step** | Not supported. Descriptions are Markdown text only. |
| **Run arbitrary shell commands** | Not supported. `commands` only executes VS Code commands (e.g. `workbench.action.terminal.focus`), not shell commands. |
| **Branch / conditional next step** | Not supported. Tours are linear. `when` controls whether a tour is shown, not which step follows which. |
| **Show a step without opening a file** | Partially — content-only steps work, but step 1 must have a `file` or `directory` anchor or VS Code shows a blank page. |

---

## Anti-patterns — what ruins a tour

Avoid these. They are the most common failures.

| Anti-pattern | What it looks like | The fix |
|---|---|---|
| **File listing** | Visiting `models.py`, `routes.py`, `utils.py` in sequence with descriptions like "this file contains the models" | Tell a story — each step should depend on having seen the previous one. Ask: "why does this step come after the last one?" |
| **Generic descriptions** | "This is the main entry point of the application." | If your description would make sense for any repo, rewrite it. Name the specific pattern, decision, or gotcha that's unique to *this* codebase. |
| **Line number guessing** | Writing `"line": 42` without reading the file | Never write a line number you didn't verify. Off-by-one lands the cursor on the wrong code and breaks trust instantly. |
| **Ignoring the persona** | Security reviewer getting a folder structure tour | Step selection must reflect what this specific person is trying to accomplish. Cut every step that doesn't serve their goal. |
| **Too many steps** | A 20-step "vibecoder" tour | Respecting depth means *actually cutting steps* — not just labeling it "quick." |
| **Hallucinated files** | Steps pointing to files that don't exist | If a file doesn't exist in the repo, skip the step. Never use a placeholder. |
| **Recap closing** | "In this tour we covered X, Y, and Z." | The closing should tell the reader what they can now *do*, what to watch out for, and where to go next. |
| **Persona vocabulary mismatch** | Explaining JWTs to a security reviewer | Meet each persona where they are. Security reviewers know what a JWT is — tell them what's *wrong* with this implementation. |
| **Broken `nextTour`** | `"nextTour"` value doesn't exactly match any tour title | Always copy the title string verbatim. A typo silently breaks the chain. |

---

## Quality checklist — verify before writing the file

- [ ] Every `file` path is **relative to the repo root** (no leading `/` or `./`)
- [ ] Every `file` path read and confirmed to exist
- [ ] Every `line` number verified by reading the file (not guessed)
- [ ] Every `directory` is **relative to the repo root** and confirmed to exist
- [ ] Every `pattern` regex would match a real line in the file
- [ ] Every `uri` is a complete, real URL (https://...)
- [ ] `ref` is a real branch/tag/commit if set
- [ ] `nextTour` exactly matches the `title` of another `.tour` file if set
- [ ] Only `.tour` JSON files created — no source code touched
- [ ] First step has a `file` or `directory` anchor (content-only first step = blank page in VS Code)
- [ ] Tour ends with a closing content step that tells the reader what they can *do* next
- [ ] Every description answers SMIG — Situation, Mechanism, Implication, Gotcha
- [ ] Persona's priorities drive step selection (cut everything that doesn't serve their goal)
- [ ] Step count matches requested depth and repo size (see calibration table)
- [ ] At most 2 content-only steps (intro + closing)
- [ ] All fields conform to `references/codetour-schema.json`

---

## Step 5: Validate the tour

**Always run the validator immediately after writing the tour file. Do not skip this step.**

```bash
python ~/.agents/skills/code-tour/scripts/validate_tour.py .tours/<name>.tour --repo-root .
```

The validator checks:
- JSON validity
- Every `file` path exists and every `line` is within file bounds
- Every `directory` exists
- Every `pattern` regex compiles and matches at least one line in the file
- Every `uri` starts with `https://`
- `nextTour` matches an existing tour title in `.tours/`
- Content-only step count (warns if > 2)
- Narrative arc (warns if no orientation or closing step)

**Fix every error before proceeding.** Re-run until the validator reports ✓ or only warnings. Warnings are advisory — use your judgment. Do not show the user the tour until validation passes.

**What actually breaks VS Code CodeTour** (the real causes of blank/broken steps):
- **Content-only first step** — step 1 has no `file`, `directory`, or `uri`. VS Code opens to a blank page. Fix: anchor step 1 to a file or directory and put the intro text in its description.
- **File path not relative to repo root** — absolute paths or `./`-prefixed paths silently fail to open. Fix: always use paths relative to where `.tours/` lives (e.g. `src/auth.ts`, not `./src/auth.ts`).
- **Line number out of bounds** — VS Code opens the file but scrolls nowhere. The validator catches this.

These are the only structural issues that cause VS Code rendering failures. Description length, markdown formatting, and use of `\n` in JSON strings do NOT affect rendering.

If you can't run scripts, do the equivalent check manually:
1. Confirm step 1 has a `file` or `directory` field
2. Confirm every `file` path exists by reading it (relative to repo root, no leading `./`)
3. Confirm every `line` is within the file's line count
4. Confirm every `directory` exists
5. Read the step titles in sequence — do they tell a coherent story?
6. Confirm `nextTour` matches another tour's `title` exactly

**Autoplay on repo open** — `isPrimary: true` makes CodeTour show a "Start Tour?" prompt when the repo opens in VS Code. To make this reliable for everyone who clones the repo, also write `.vscode/settings.json`:

```json
{ "codetour.promptForPrimaryTour": true }
```

Without this file, the prompt depends on each user's global VS Code config. Committed to the repo, it fires for everyone automatically. Create this file whenever you set `isPrimary: true`.

**`ref` and autoplay:** if the tour has `"ref": "main"`, CodeTour only prompts when the user is on that exact branch or tag. For tours that should appear on any branch, omit `ref`.

**Share via vscode.dev** — the fastest way for someone to use the tour without
cloning the repo. For any public GitHub repo with tours committed to `.tours/`,
they can open it directly in the browser:

```
https://vscode.dev/github.com/<owner>/<repo>
```

VS Code Web will detect the `.tours/` directory and offer to start the tour.
No install needed. Tell the user this URL in your summary when the repo is public.

---

## Step 6: Summarize

After writing the tour, tell the user:
- File path (`.tours/<name>.tour`)
- One-paragraph summary of what the tour covers and who it's for
- The `vscode.dev` URL if the repo is public (so they can share it immediately)
- 2–3 suggested follow-up tours (or the next tour in the series if one was planned)
- Any user-requested files that didn't exist (be explicit — don't quietly substitute)

---

## File naming

`<persona>-<focus>.tour` — kebab-case, communicates both:
```
onboarding-new-joiner.tour
bug-fixer-payment-flow.tour
architect-overview.tour
vibecoder-quickstart.tour
pr-review-auth-refactor.tour
security-auth-boundaries.tour
concept-dependency-injection.tour
rca-login-outage.tour
```