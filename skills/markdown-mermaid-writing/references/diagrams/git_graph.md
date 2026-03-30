<!-- Source: https://github.com/SuperiorByteWorks-LLC/agent-project | License: Apache-2.0 | Author: Clayton Young / Superior Byte Works, LLC (Boreal Bytes) -->

# Git Graph

> **Back to [Style Guide](../mermaid_style_guide.md)** — Read the style guide first for emoji, color, and accessibility rules.

**Syntax keyword:** `gitGraph`
**Best for:** Branching strategies, merge workflows, release processes, git-flow visualization
**When NOT to use:** General processes (use [Flowchart](flowchart.md)), project timelines (use [Gantt](gantt.md))

---

## Exemplar Diagram

```mermaid
gitGraph
    accTitle: Trunk-Based Development Workflow
    accDescr: Git history showing short-lived feature branches merging into main with release tags demonstrating trunk-based development

    commit id: "init"
    commit id: "setup CI"

    branch feature/auth
    checkout feature/auth
    commit id: "add login"
    commit id: "add tests"

    checkout main
    merge feature/auth id: "merge auth" tag: "v1.0"

    commit id: "update deps"

    branch feature/dashboard
    checkout feature/dashboard
    commit id: "add charts"
    commit id: "add filters"

    checkout main
    merge feature/dashboard id: "merge dash"

    commit id: "perf fixes" tag: "v1.1"
```

---

## Tips

- Use descriptive `id:` labels on commits
- Add `tag:` for release versions
- Branch names should match your actual convention (`feature/`, `fix/`, `release/`)
- Show the **ideal** workflow — this is prescriptive, not descriptive
- Use `type: HIGHLIGHT` on important merge commits
- Keep to **10–15 commits** maximum for readability

---

## Template

```mermaid
gitGraph
    accTitle: Your Title Here
    accDescr: Describe the branching strategy and merge pattern

    commit id: "initial"
    commit id: "second commit"

    branch feature/your-feature
    checkout feature/your-feature
    commit id: "feature work"
    commit id: "add tests"

    checkout main
    merge feature/your-feature id: "merge feature" tag: "v1.0"
```
