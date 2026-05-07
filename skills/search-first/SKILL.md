---
name: search-first
description: "Research-before-coding workflow. Search for existing tools, libraries, and patterns before writing custom code. Includes a tool-availability preflight so the skill degrades gracefully when expected MCPs (Context7, Exa) or CLIs (gh, package managers) aren't installed."
origin: ECC
---

# /search-first — Research Before You Code

Systematizes the "search for existing solutions before implementing"
workflow. Sound default for any non-trivial new feature.

> ⚠️ **Drift-prone skill.** The "Search Shortcuts by Category"
> section names specific packages (`ruff`, `httpx`, `zod`, etc.) —
> those are illustrative examples at write time, **not** a maintained
> directory. Before recommending one, verify it is still published
> and healthy (`npm view <pkg> version` / `pip show <pkg>` + a quick
> deprecation / last-publish check). The workflow itself
> (need analysis → parallel search → evaluate → decide) is stable;
> the example list is not. See
> [`~/.claude/rules/drift-proof.md`](~/.claude/rules/drift-proof.md).

## Trigger

Use this skill when:

- Starting a new feature that likely has existing solutions
- Adding a dependency or integration
- The user asks "add X functionality" and you're about to write code
- Before creating a new utility, helper, or abstraction

## Step 0 — Tool availability preflight

Don't assume — check first. Each search channel has its own
prerequisites; degrading gracefully is better than silently skipping.

| Channel | Check | If missing |
|---------|-------|------------|
| Repo grep | `git rev-parse --is-inside-work-tree` | not in a git repo → use `find` / direct read |
| Package registries | `npm --version` / `pip --version` / `cargo --version` for the project's stack | tell the user which manager is missing |
| GitHub code/repo search | `gh auth status` | ask user to `gh auth login` rather than skipping silently |
| Library docs | Look for the Context7 MCP in the session's available-tools list | fall back to `WebFetch` of the official docs site |
| Neural web search | Look for Exa MCP entries (`mcp__exa__*`) | fall back to `WebSearch` |
| Skills directory | `ls ~/.claude/skills/` (always available) | n/a |

If an expected channel is unavailable, **say so** rather than acting
as if you searched it. "I checked npm and the repo; Context7 isn't
connected so I couldn't verify the latest API surface" is honest;
silently skipping is not.

## Workflow

```
┌─────────────────────────────────────────────┐
│  0. TOOL PREFLIGHT (above)                  │
├─────────────────────────────────────────────┤
│  1. NEED ANALYSIS                           │
│     Define what functionality is needed     │
│     Identify language / framework / license │
│     constraints                             │
├─────────────────────────────────────────────┤
│  2. PARALLEL SEARCH (Agent tool)            │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│     │  npm /   │ │  MCP /   │ │  GitHub /│  │
│     │  PyPI /  │ │  Skills  │ │  Web     │  │
│     │  cargo   │ │          │ │          │  │
│     └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────┤
│  3. EVALUATE                                │
│     Score candidates: functionality, last   │
│     release date, weekly downloads, open    │
│     issues, license, transitive deps        │
├─────────────────────────────────────────────┤
│  4. DECIDE                                  │
│     ┌─────────┐ ┌──────────┐ ┌─────────┐    │
│     │  Adopt  │ │  Extend  │ │  Build  │    │
│     │  as-is  │ │  / Wrap  │ │  Custom │    │
│     └─────────┘ └──────────┘ └─────────┘    │
├─────────────────────────────────────────────┤
│  5. IMPLEMENT                               │
│     Install / configure / write minimal     │
│     glue code                               │
└─────────────────────────────────────────────┘
```

## Decision Matrix

| Signal | Action |
|--------|--------|
| Exact match, well-maintained, MIT/Apache, recent release | **Adopt** — install and use directly |
| Partial match, good foundation, healthy maintainership | **Extend** — install + write thin wrapper |
| Multiple weak matches, each covering ~30-40% | **Compose** — combine 2-3 small packages |
| Nothing suitable, OR all candidates abandoned/insecure | **Build** — write custom, but informed by what you found and didn't find |

## How to Use

### Quick Mode (inline)

Before writing a utility or adding functionality, walk:

0. **Repo first.** Does this already exist in the codebase?
   `rg`/`grep` through relevant modules and tests before assuming
   greenfield.
1. **Common problem?** Search the project's package registry (npm,
   PyPI, crates.io, Maven Central, etc., matching the stack).
2. **MCP exists?** Check the session's available-tools list and
   `~/.claude/settings.json` for an MCP that already provides the
   capability.
3. **Skill exists?** `ls ~/.claude/skills/` — there may be a
   ready-made workflow.
4. **OSS implementation?** GitHub code/repo search for a
   maintained reference.

### Full Mode (Agent tool)

For non-trivial functionality, delegate to a research agent so the
side searches don't bloat the main context:

```
Agent({
  subagent_type: "general-purpose",  // or "Explore" for code-only lookups
  description: "Research existing tools for <feature>",
  prompt: `
    Research existing tools for: <DESCRIPTION>
    Language / framework: <LANG>
    Constraints: <license, runtime, footprint, etc>

    Search channels (use whichever are available; report which were skipped):
      - <project's package registry>
      - MCP servers (Context7 for docs, Exa for neural search)
      - ~/.claude/skills/ for matching workflows
      - GitHub code/repo search (via gh)
    Return: structured comparison of top 3 candidates (name, version,
    last release, weekly downloads, license, fit), plus a one-line
    recommendation (adopt / extend / compose / build).
  `,
})
```

The agent name is `Agent`, not `Task`; `Task` was the legacy harness
name and is no longer the canonical tool. If the harness exposes
neither, the prompt above can be sent inline as Quick Mode.

## Search Shortcuts by Category

> Illustrative — verify currency before quoting.

### Development tooling

- Linting → `eslint`, `ruff`, `golangci-lint`, `clippy`
- Formatting → `prettier`, `black`, `gofmt`, `rustfmt`
- Testing → `jest` / `vitest`, `pytest`, `go test`, `cargo test`
- Pre-commit → `husky`, `lefthook`, `pre-commit`

### AI / LLM integration

- Anthropic SDK → see `claude-api` skill (drift-prone — verify
  current model IDs against the session's system prompt)
- Library docs → Context7 MCP (verify it's installed first)
- Document parsing → `unstructured`, `pdfplumber`, `mammoth`,
  `tika-python`

### Data & APIs

- HTTP clients → `httpx` (Python), `ky` / `undici` (Node)
- Schema validation → `zod` / `valibot` (TS), `pydantic` (Python),
  `validator` (Go)
- Database access → check for an MCP first (Postgres, ClickHouse,
  etc. all have ones)

### Content & publishing

- Markdown → `remark` / `unified`, `markdown-it`
- Image processing → `sharp`, `imagemin`
- Video → see `videodb`, `remotion-video-creation`, `manim-video`
  skills before reaching for ffmpeg directly

## Integration points

- **With `planner` agent**: planner runs research before Phase 1
  architecture review; researcher's output becomes the
  "available tools" section of the plan. Avoids reinventing the
  wheel inside the plan itself.
- **With `architect` agent**: architect consults research output
  for tech-stack decisions and reference-architecture lookup.
- **With `iterative-retrieval` skill**: cycle 1 = broad search,
  cycle 2 = top-3 deep dive, cycle 3 = compatibility check against
  the project's actual constraints.

## Examples

### "Add dead-link checking for markdown"

```
Need:    Verify HTTP links inside .md files
Stack:   Node monorepo
Search:  npm registry "markdown link checker"
Found:   markdown-link-check (active, MIT)
         lychee (Rust binary, faster but adds toolchain)
Verify:  npm view markdown-link-check version  →  recent
Action:  ADOPT — npm install -D markdown-link-check
Result:  Zero custom code; 1 npm script.
```

### "Add HTTP client with retry"

```
Need:    Resilient HTTP client (timeout, exponential backoff)
Stack:   Python service
Search:  PyPI "httpx retry"
Found:   httpx (built-in transport-level retry via Transport)
         tenacity (general-purpose retry decorator)
Verify:  pip show httpx  →  recent; well-maintained
Action:  ADOPT — httpx Transport + retries=3
Result:  No wrapper layer; standard library-style usage.
```

### "Add config-file schema validation"

```
Need:    Validate YAML config against a schema, in CI
Stack:   any
Search:  npm "json schema cli", PyPI "yaml schema cli"
Found:   ajv-cli (Node, JSON Schema Draft-07/2019/2020)
         check-jsonschema (Python, supports YAML/TOML/JSON)
Verify:  both have releases in the last 6 months
Action:  ADOPT (one) + write project schema
Result:  1 dependency + 1 schema file; no custom validator.
```

## Anti-patterns

- **Jumping to code.** Writing a utility without checking if one
  already exists in registry / skills / repo.
- **Ignoring MCPs.** Not checking whether a connected MCP server
  already exposes the capability before reaching for an SDK.
- **Over-wrapping.** Building so much glue around a library that you
  inherit its bugs and lose its updates.
- **Dependency bloat.** Pulling a 5MB package for one helper that
  could be 10 lines.
- **Silent skipping.** Reporting "I searched and found nothing"
  when one of the search channels was actually unavailable.
  Always say which channels you used and which you couldn't.
