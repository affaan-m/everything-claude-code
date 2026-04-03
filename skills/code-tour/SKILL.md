---
name: code-tour
origin: community
description: >
  Create CodeTour .tour files -- persona-targeted, step-by-step walkthroughs
  that link to real files and line numbers. Supports 20 developer personas,
  all CodeTour step types, and tour-level fields (ref, isPrimary, nextTour).
  Works with any repository in any language.
trigger: |
  When the user asks to create a tour, code tour, onboarding tour, PR review tour,
  architecture tour, RCA tour, bug tour, vibe check, contributor guide, or any
  structured walkthrough through code. Phrases: "create a tour", "make a code tour",
  "generate a tour", "onboarding tour", "tour for this PR", "tour for this bug",
  "RCA tour", "architecture tour", "explain how X works", "vibe check",
  "PR review tour", "contributor guide", "help someone ramp up".
---

# Code Tour Skill

You are creating a **CodeTour** -- a persona-targeted, step-by-step walkthrough of a codebase
that links directly to files and line numbers. CodeTour files live in `.tours/` and work with
the [VS Code CodeTour extension](https://github.com/microsoft/codetour).

> For additional tooling (validation scripts, schema, examples): [github.com/vaddisrinivas/code-tour](https://github.com/vaddisrinivas/code-tour)

A great tour is not just annotated files. It is a **narrative** -- a story told to a specific
person about what matters, why it matters, and what to do next. Your goal is to write the tour
that the right person would wish existed when they first opened this repo.

**CRITICAL: Only create `.tour` JSON files in `.tours/`. Never create, modify, or scaffold any other files.**

## When to Use

Activate when the user asks for any kind of guided code walkthrough:
- Onboarding tours for new team members
- PR review tours that tell the "change story"
- Architecture overviews for tech leads
- Bug/RCA investigation trails
- Feature explainers (UI -> API -> backend -> storage)
- Quick "vibe check" tours (5-8 steps, fast path only)
- Security review tours mapping trust boundaries
- Contributor guides for open source repos

## How It Works

1. **Discover the repo** -- explore the codebase structure, read key files, map entry points
2. **Infer the intent** -- determine persona, depth, and focus from the user's request
3. **Read actual files** -- verify every file path and line number before writing them into the tour
4. **Write the tour** -- save to `.tours/<persona>-<focus>.tour` with proper narrative arc
5. **Validate** -- confirm every path exists, every line number is in bounds, narrative flows

No external tools required -- the skill works entirely through file reading and JSON writing.

## Examples

**"Create an onboarding tour for new joiners"**
- Use `new-joiner` persona, standard depth (9-13 steps)
- Start with a directory step on `src/`, cover setup, business context, service boundaries
- Define team terms, explain the key modules, close with suggested next tours

**"Tour for PR #456"**
- Use `pr-reviewer` persona, set `ref` to the PR branch
- Open with a `uri` step linking to the PR, cover changed files with "why" context
- Add steps for unchanged-but-critical dependency files, close with reviewer checklist

**"Quick vibe check of this repo"**
- Use `vibecoder` persona, quick depth (5-8 steps max)
- Entry point, main loop, core modules -- "start here / core loop / ignore for now"
- Cut ruthlessly, no deep dives

---

## Step 1: Discover the repo

Before asking the user anything, explore the codebase:

- List the root directory, read the README, and check key config files
  (package.json, pyproject.toml, go.mod, Cargo.toml, composer.json, etc.)
- Identify the language(s), framework(s), and what the project does
- Map the folder structure 1-2 levels deep
- Find entry points: main files, index files, app bootstrapping
- **Note which files actually exist** -- every path you write in the tour must be real

If the repo is sparse or empty, say so and work with what exists.

### Entry points by language/framework

Don't read everything -- start here, then follow imports.

| Stack | Entry points to read first |
|-------|---------------------------|
| **Node.js / TS** | `index.js/ts`, `server.js`, `app.js`, `src/main.ts`, `package.json` (scripts) |
| **Python** | `main.py`, `app.py`, `__main__.py`, `manage.py` (Django), `app/__init__.py` (Flask/FastAPI) |
| **Go** | `main.go`, `cmd/<name>/main.go`, `internal/` |
| **Rust** | `src/main.rs`, `src/lib.rs`, `Cargo.toml` |
| **Java / Kotlin** | `*Application.java`, `src/main/java/.../Main.java`, `build.gradle` |
| **Ruby** | `config/application.rb`, `config/routes.rb`, `app/controllers/application_controller.rb` |
| **PHP** | `index.php`, `public/index.php`, `bootstrap/app.php` (Laravel) |

### Repo type variants -- adjust focus accordingly

| Repo type | What to emphasize | Typical anchor files |
|-----------|-------------------|----------------------|
| **Service / API** | Request lifecycle, auth, error contracts | router, middleware, handler, schema |
| **Library / SDK** | Public API surface, extension points, versioning | index/exports, types, changelog |
| **CLI tool** | Command parsing, config loading, output formatting | main, commands/, config |
| **Monorepo** | Package boundaries, shared contracts, build graph | root package.json/pnpm-workspace, shared/, packages/ |
| **Frontend app** | Component hierarchy, state management, routing | pages/, store/, router, api/ |

### Large repo strategy

For repos with 100+ files: don't try to read everything.

1. Read entry points and the README first
2. Build a mental model of the top 5-7 modules
3. For the requested persona, identify the **2-3 modules that matter most** and read those deeply
4. For modules you're not covering, mention them in the intro step as "out of scope for this tour"
5. Use `directory` steps for areas you mapped but didn't read -- they orient without requiring full knowledge

A focused 10-step tour of the right files beats a scattered 25-step tour of everything.

---

## Step 2: Read the intent -- infer everything you can, ask only what you can't

**One message from the user should be enough.** Read their request and infer persona,
depth, and focus before asking anything.

### Intent map

| User says | Persona | Depth | Action |
|-----------|---------|-------|--------|
| "tour for this PR" / "PR review" / "#123" | pr-reviewer | standard | Add `uri` step for the PR; use `ref` for the branch |
| "why did X break" / "RCA" / "incident" | rca-investigator | standard | Trace the failure causality chain |
| "debug X" / "bug tour" / "find the bug" | bug-fixer | standard | Entry -> fault points -> tests |
| "onboarding" / "new joiner" / "ramp up" | new-joiner | standard | Directories, setup, business context |
| "quick tour" / "vibe check" / "just the gist" | vibecoder | quick | 5-8 steps, fast path only |
| "explain how X works" / "feature tour" | feature-explainer | standard | UI -> API -> backend -> storage |
| "architecture" / "tech lead" / "system design" | architect | deep | Boundaries, decisions, tradeoffs |
| "security" / "auth review" / "trust boundaries" | security-reviewer | standard | Auth flow, validation, sensitive sinks |
| "refactor" / "safe to extract?" | refactorer | standard | Seams, hidden deps, extraction order |
| "contributor" / "open source onboarding" | external-contributor | quick | Safe areas, conventions, landmines |

**Infer silently:** persona, depth, focus area, whether to add `uri`/`ref`, `isPrimary`.

**Ask only if you genuinely can't infer:**
- "bug tour" but no bug described -> ask for the bug description
- "feature tour" but no feature named -> ask which feature

### PR tour recipe

When the user says "tour for this PR" or pastes a GitHub PR URL:

1. Set `"ref"` to the PR's branch name
2. Open with a `uri` step pointing to the PR itself
3. Cover **changed files first** -- what changed and why
4. Add steps for **files not in the diff** that reviewers must understand
5. Flag invariants the change must preserve
6. Close with a reviewer checklist

---

## Step 3: Read the actual files -- no exceptions

**Every file path and line number in the tour must be verified by reading the file.**
A tour pointing to the wrong file or a non-existent line is worse than no tour.

For every planned step:
1. Read the file
2. Find the exact line of the code you want to highlight
3. Understand it well enough to explain it to the target persona

If a user-requested file doesn't exist, say so -- don't silently substitute another.

---

## Step 4: Write the tour

Save to `.tours/<persona>-<focus>.tour`.

### Tour root

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "Descriptive Title -- Persona / Goal",
  "description": "One sentence: who this is for and what they'll understand after.",
  "ref": "main",
  "isPrimary": false,
  "nextTour": "Title of follow-up tour",
  "steps": []
}
```

Omit any field that doesn't apply to this tour.

---

### Step types -- the full toolkit

**Content step** -- narrative only, no file. Use for intro and closing. Max 2 per tour.
```json
{ "title": "Welcome", "description": "markdown..." }
```

**Directory step** -- orient to a module. "What lives here."
```json
{ "directory": "src/services", "title": "Service Layer", "description": "..." }
```

**File + line step** -- the workhorse. One specific meaningful line.
```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "..." }
```

> **Path rule -- always relative to repo root.** Never use an absolute path and never use a leading `./`.

**Selection step** -- a block of logic. Use when one line isn't enough.
```json
{
  "file": "src/core/pipeline.py",
  "selection": { "start": { "line": 15, "character": 0 }, "end": { "line": 34, "character": 0 } },
  "title": "The Request Pipeline",
  "description": "..."
}
```

**Pattern step** -- match by regex instead of line number. Use when line numbers shift frequently.
```json
{ "file": "src/app.ts", "pattern": "export default class Application", "title": "...", "description": "..." }
```

**URI step** -- link to an external resource: a PR, issue, RFC, ADR, architecture diagram.
```json
{
  "uri": "https://github.com/org/repo/pull/456",
  "title": "The PR That Introduced This Pattern",
  "description": "..."
}
```

**View step** -- auto-focus a VS Code panel (terminal, problems, scm, explorer).
```json
{ "file": "src/server.ts", "line": 1, "view": "terminal", "title": "...", "description": "..." }
```

**Commands step** -- execute VS Code commands when the reader arrives.
```json
{
  "file": "src/server.ts", "line": 1,
  "title": "Run It",
  "description": "Hit the play button.",
  "commands": ["workbench.action.terminal.focus"]
}
```

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

| Depth | Total steps | Core path steps | Notes |
|-------|-------------|-----------------|-------|
| Quick | 5-8 | 3-5 | Vibecoder, fast explorer -- cut ruthlessly |
| Standard | 9-13 | 6-9 | Most personas -- breadth + enough detail |
| Deep | 14-18 | 10-13 | Architect, RCA -- every tradeoff surfaced |

Scale with repo size too:

| Repo size | Recommended standard depth |
|-----------|---------------------------|
| Tiny (< 20 files) | 5-8 steps |
| Small (20-80 files) | 8-11 steps |
| Medium (80-300 files) | 10-13 steps |
| Large (300+ files) | 12-15 steps (scoped to relevant subsystem) |

---

### Writing excellent descriptions -- the SMIG formula

Every description should answer four questions in order:

**S -- Situation**: What is the reader looking at? One sentence grounding them in context.
**M -- Mechanism**: How does this code work? What pattern, rule, or design is in play?
**I -- Implication**: Why does this matter for *this persona's goal specifically*?
**G -- Gotcha**: What would a smart person get wrong here? What's non-obvious or surprising?

### Persona vocabulary cheat sheet

| Persona | Their vocabulary | Avoid |
|---------|-----------------|-------|
| New joiner | "this means", "you'll need to", "the team calls this" | acronyms, assumed context |
| Bug fixer | "failure path", "where this breaks", "repro steps" | architecture history |
| Security reviewer | "trust boundary", "untrusted input", "privilege escalation" | vague "be careful" |
| PR reviewer | "invariant", "this must stay true", "the change story" | unrelated context |
| Architect | "seam", "coupling", "extension point", "decision" | step-by-step walkthroughs |
| Vibecoder | "the main loop", "ignore for now", "start here" | deep explanations |

---

## Narrative arc -- every tour, every persona

1. **Orientation** -- **must be a `file` or `directory` step, never content-only.**
   A content-only first step renders as a blank page in VS Code CodeTour.

2. **High-level map** (1-3 directory or uri steps) -- major modules and how they relate.

3. **Core path** (file/line, selection, pattern, uri steps) -- the specific code that matters.

4. **Closing** (content) -- what the reader now understands, what they can do next,
   2-3 suggested follow-up tours.

### What makes a closing step excellent

Don't summarize -- the reader just read it. Instead tell them:
- What they're now capable of doing
- What danger zones to avoid
- Which tour to read next and why

---

## The 20 personas

| Persona | Goal | Must cover | Avoid |
|---------|------|------------|-------|
| **Vibecoder** | Get the vibe fast | Entry point, request flow, main modules. Max 8 steps. | Deep dives, history, edge cases |
| **New joiner** | Structured ramp-up | Directories, setup, business context, service boundaries. | Advanced internals before basics |
| **Reboarding engineer** | Catch up on changes | What's new vs. what they remember. | Re-explaining known things |
| **Bug fixer** | Root cause fast | Trigger -> fault points -> tests. Repro hints. | Architecture tours |
| **RCA investigator** | Why did it fail | Causality chain. State transitions, side effects, race conditions. | Happy path |
| **Feature explainer** | One feature end-to-end | UI -> API -> backend -> storage. | Unrelated features |
| **Concept learner** | Understand a pattern | Concept -> implementation -> why -> tradeoffs. | Code without framing |
| **PR reviewer** | Review correctly | Change story, invariants, risky areas. URI step for PR. | Unrelated context |
| **Maintainer** | Long-term health | Architectural intent, extension points, invariants. | One-time setup |
| **Refactorer** | Safe restructuring | Seams, hidden deps, safe extraction order. | Feature explanations |
| **Performance optimizer** | Find bottlenecks | Hot paths, N+1, I/O, caches. | Cold paths, setup code |
| **Security reviewer** | Trust boundaries | Auth flow, input validation, secret handling. | Unrelated business logic |
| **Test writer** | Add good tests | Behavior contracts, mocking seams, coverage gaps. | Implementation detail |
| **API consumer** | Call the system correctly | Public surface, auth, error semantics. | Internal implementation |
| **Platform engineer** | Operational understanding | Boot sequence, config, infra deps, graceful shutdown. | Business logic |
| **Data engineer** | Data lineage | Event emission, schemas, source-to-sink path. | UI / request flow |
| **AI agent operator** | Deterministic navigation | Stable anchors, allowed edit zones, validation steps. | Ambiguous structure |
| **Product-minded engineer** | Business rules in code | Domain language, feature toggles, "why this weird code?" | Pure infrastructure |
| **External contributor** | Contribute safely | Safe areas, code style, architecture landmines. | Deep internals |
| **Tech lead / architect** | Shape and rationale | Boundaries, tradeoffs, risk hotspots, future evolution. | Line-by-line walkthroughs |

---

## Designing a tour series

When a codebase is complex enough that one tour can't cover it, design a series.
The `nextTour` field chains them: when the reader finishes one tour, VS Code offers
to launch the next automatically.

**Plan the series before writing any tour.** A good series has:
- A clear escalation path (broad -> narrow, orientation -> deep-dive)
- No duplicate steps between tours
- Each tour standalone enough to be useful on its own

**Common series patterns:**

*Onboarding series:*
1. "Orientation" -> repo structure, how to run it (isPrimary: true)
2. "Core Request Flow" -> entry to response, middleware chain
3. "Data Layer" -> models, migrations, query patterns

*Architecture series:*
1. "Module Boundaries" -> what lives where and why
2. "Extension Points" -> where to add new features
3. "Danger Zones" -> what must never be changed carelessly

Set `nextTour` in each tour to the `title` of the next one (must match exactly).

---

## What CodeTour cannot do

| Request | Reality |
|---|---|
| **Auto-advance after X seconds** | Not supported. Navigation is always manual. |
| **Embed video or GIF** | Not supported. Descriptions are Markdown text only. |
| **Run shell commands** | Not supported. `commands` only executes VS Code commands. |
| **Branch / conditional next step** | Not supported. Tours are linear. |
| **Show step without opening a file** | Partially -- content-only steps work, but step 1 must have a `file` or `directory` anchor. |

---

## Anti-patterns -- what ruins a tour

| Anti-pattern | What it looks like | The fix |
|---|---|---|
| **File listing** | Visiting files in sequence with "this file contains..." | Tell a story -- each step should depend on the previous one |
| **Generic descriptions** | "This is the main entry point." | Name the specific pattern or gotcha unique to this codebase |
| **Line number guessing** | Writing `"line": 42` without reading the file | Never write a line number you didn't verify |
| **Ignoring the persona** | Security reviewer getting a folder structure tour | Cut every step that doesn't serve their goal |
| **Too many steps** | A 20-step "vibecoder" tour | Actually cut steps, don't just label it "quick" |
| **Hallucinated files** | Steps pointing to files that don't exist | If it doesn't exist, skip the step |
| **Recap closing** | "In this tour we covered X, Y, and Z." | Tell the reader what they can now *do* and where to go next |

---

## Quality checklist -- verify before writing the file

- [ ] Every `file` path is **relative to the repo root** (no leading `/` or `./`)
- [ ] Every `file` path read and confirmed to exist
- [ ] Every `line` number verified by reading the file (not guessed)
- [ ] Every `directory` confirmed to exist
- [ ] Every `pattern` regex would match a real line in the file
- [ ] Every `uri` is a complete, real URL (https://...)
- [ ] `ref` is a real branch/tag/commit if set
- [ ] `nextTour` exactly matches the `title` of another `.tour` file if set
- [ ] Only `.tour` JSON files created -- no source code touched
- [ ] First step has a `file` or `directory` anchor (not content-only)
- [ ] Tour ends with a closing step that tells the reader what they can *do* next
- [ ] Every description answers SMIG -- Situation, Mechanism, Implication, Gotcha
- [ ] Persona's priorities drive step selection
- [ ] Step count matches requested depth and repo size
- [ ] At most 2 content-only steps (intro + closing)

---

## Step 5: Validate the tour

After writing the tour, verify manually:
1. Confirm step 1 has a `file` or `directory` field
2. Confirm every `file` path exists by reading it (relative to repo root, no leading `./`)
3. Confirm every `line` is within the file's line count
4. Confirm every `directory` exists
5. Read the step titles in sequence -- do they tell a coherent story?
6. Confirm `nextTour` matches another tour's `title` exactly

---

## Step 6: Summarize

After writing the tour, tell the user:
- File path (`.tours/<name>.tour`)
- One-paragraph summary of what the tour covers and who it's for
- The `vscode.dev` URL if the repo is public (so they can share it immediately):
  `https://vscode.dev/github.com/<owner>/<repo>`
- 2-3 suggested follow-up tours
- Any user-requested files that didn't exist (be explicit)

---

## File naming

`<persona>-<focus>.tour` -- kebab-case:
```
onboarding-new-joiner.tour
bug-fixer-payment-flow.tour
architect-overview.tour
vibecoder-quickstart.tour
pr-review-auth-refactor.tour
security-auth-boundaries.tour
```
