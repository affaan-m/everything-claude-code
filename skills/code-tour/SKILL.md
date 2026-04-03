---
name: code-tour
description: Create CodeTour .tour files — persona-targeted, step-by-step walkthroughs that link to real files and line numbers. Activate for "create a tour", "onboarding tour", "architecture tour", "PR review tour", "explain how X works", "vibe check", "RCA tour", or any structured code walkthrough request.
origin: community
---

# Code Tour

Create **CodeTour** files — persona-targeted, step-by-step walkthroughs of a codebase that link directly to files and line numbers. Tours live in `.tours/` and work with the [VS Code CodeTour extension](https://github.com/microsoft/codetour).

A great tour is a **narrative** — a story told to a specific person about what matters, why it matters, and what to do next. Only create `.tour` JSON files. Never modify source code.

## When to Use

- User asks to create a code tour, onboarding tour, or architecture walkthrough
- User says "tour for this PR", "explain how X works", "vibe check", "RCA tour"
- User wants a contributor guide, security review, or bug investigation walkthrough
- Any request for a structured walkthrough with file/line anchors
- User says "make a code tour", "generate a tour", "help someone ramp up"

## How It Works

### The Workflow

1. **Discover** — explore the repo before asking anything (README, config, entry points, folder structure)
2. **Infer** — read the user's intent and silently determine persona, depth, and focus
3. **Read** — verify every file path and line number by actually reading the files
4. **Write** — save to `.tours/<persona>-<focus>.tour`
5. **Validate** — check all paths exist, lines are in bounds, first step is anchored

### Personas

| User says | Persona | Depth |
|-----------|---------|-------|
| "onboarding" / "new joiner" | new-joiner | standard (9-13 steps) |
| "quick tour" / "vibe check" | vibecoder | quick (5-8 steps) |
| "architecture" | architect | deep (14-18 steps) |
| "tour for this PR" | pr-reviewer | standard |
| "why did X break" | rca-investigator | standard |
| "security" / "auth review" | security-reviewer | standard |
| "explain how X works" | feature-explainer | standard |
| "debug X" / "find the bug" | bug-fixer | standard |

### Step Types

**Content** — narrative only, max 2 per tour (intro + closing):
```json
{ "title": "Welcome", "description": "markdown..." }
```

**Directory** — orient to a module:
```json
{ "directory": "src/services", "title": "Service Layer", "description": "..." }
```

**File + line** — the workhorse:
```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "..." }
```

**Selection** — highlight a code block:
```json
{
  "file": "src/core/pipeline.py",
  "selection": { "start": { "line": 15, "character": 0 }, "end": { "line": 34, "character": 0 } },
  "title": "Request Pipeline"
}
```

**Pattern** — regex match for volatile files:
```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "..." }
```

**URI** — link to PRs, issues, docs:
```json
{ "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
```

### Writing Descriptions — SMIG Formula

Every description answers:
- **S — Situation**: What is the reader looking at?
- **M — Mechanism**: How does this code work?
- **I — Implication**: Why does this matter for this persona?
- **G — Gotcha**: What would a smart person get wrong?

### Narrative Arc

1. **Orientation** — `file` or `directory` step (never content-only — renders blank in VS Code)
2. **High-level map** — 1-3 directory steps showing major modules
3. **Core path** — file/line steps, the heart of the tour
4. **Closing** — what the reader can now do, suggested follow-ups

## Examples

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "New Joiner — API Service",
  "description": "Onboarding walkthrough for the payments API service.",
  "ref": "main",
  "steps": [
    { "directory": "src", "title": "Source Root", "description": "All application code lives here." },
    { "file": "src/server.ts", "line": 12, "title": "Entry Point", "description": "Express app boots here." },
    { "file": "src/routes/payments.ts", "line": 8, "title": "Payment Routes", "description": "All /api/payments/* endpoints." },
    { "title": "Next Steps", "description": "You can now trace any payment request end-to-end." }
  ]
}
```

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| **File listing** — "this contains the models" | Tell a story. Each step depends on seeing the previous. |
| **Generic descriptions** | Name the specific pattern unique to this codebase. |
| **Line number guessing** | Never write a line you didn't verify. |
| **Too many steps** for quick depth | Actually cut steps. |
| **Hallucinated files** | If it doesn't exist, skip the step. |
| **Recap closing** — "we covered X, Y, Z" | Tell the reader what they can now *do*. |
| **Content-only first step** | Anchor step 1 to a file or directory. |
| **Persona vocabulary mismatch** | Don't explain JWTs to a security reviewer. |

## Best Practices

- Always verify file paths and line numbers before writing
- Scale step count with repo size (tiny <20 files: 5-8 steps; large 300+: 12-15 scoped)
- Use `directory` steps for areas you mapped but didn't read deeply
- For PR tours: add a `uri` step for the PR itself, cover changed files first
- For monorepos: focus on 2-3 relevant packages, don't tour everything
- Share tours via `https://vscode.dev/github.com/<owner>/<repo>`

## Related Skills

- `codebase-onboarding` — broader onboarding beyond tour files
- `coding-standards` — code conventions that tours can reference
- Full skill with validation scripts: [code-tour repo](https://github.com/vaddisrinivas/code-tour)
