---
name: architecture-decision-records
description: Capture architectural decisions made during Claude Code sessions as structured ADRs. Auto-detects decision moments, records context, alternatives considered, and rationale.
origin: ECC
---

# Architecture Decision Records

Capture architectural decisions as they happen during coding sessions, producing structured ADR documents that live alongside the code.

## When to Activate

- User says "let's record this decision" or "ADR this"
- User chooses between significant alternatives (framework, library, pattern, database)
- User says "we decided to..." or "the reason we're doing X instead of Y is..."
- During planning phases when architectural trade-offs are discussed

## Workflow

1. **Detect** the decision moment from conversation signals
2. **Gather** context, constraints, and alternatives considered
3. **Write** a structured ADR to `docs/adr/NNNN-decision-title.md`
4. **Update** the ADR index at `docs/adr/README.md`

## ADR Format

Each ADR includes: Context (the problem), Decision (what we chose), Alternatives Considered (with pros/cons/why-not for each), and Consequences (positive, negative, risks).

## Key Principles

- Record the **why**, not just the what
- Always include rejected alternatives
- Keep each ADR readable in 2 minutes
- Superseded decisions link to their replacement
