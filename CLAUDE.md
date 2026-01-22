# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Configuration system enabling Claude to develop **great software** across any technology stack.

## Core Principles

These principles guide all development work:

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **Understand before modifying** | Read code first, grasp context before changes |
| 2 | **No completion without evidence** | Tests pass, build succeeds, lint clean |
| 3 | **Acknowledge and recover from failure** | 3 failures → STOP → REVERT → ASK |
| 4 | **Small changes, frequent verification** | Small change → verify → repeat |
| 5 | **See the whole after completion** | Clean up fragmented work |
| 6 | **Research when uncertain** | No guessing, look it up |
| 7 | **Respect existing patterns** | Harmonize with codebase |

## Agents

| Agent | Model | Purpose | Supports Principles |
|-------|-------|---------|---------------------|
| **Explore** (built-in) | Haiku | Internal codebase search | 1, 7 |
| **Plan** (built-in) | - | Implementation planning | 4 |
| **Research** | Opus | External research, documentation, best practices | 1, 6 |
| **Architect** | Opus | System design, ADR, interface definition | 1, 7 |
| **Verify** | Opus | Validation, evidence collection | 2 |
| **Refine** | Opus | Post-implementation cleanup | 5, 7 |

## Processes

| Process | Purpose | Supports Principles |
|---------|---------|---------------------|
| **Intent Gate** | Classify request, confirm understanding | 1 |
| **Codebase Assessment** | Evaluate codebase state | 7 |
| **Self-Correction** | 3 failures → STOP → REVERT → ASK | 3 |
| **Evidence-based Completion** | No evidence = not complete | 2 |

## Workflow

```
[Request]
    ↓
[Intent Gate] ─── Understand? (Principle 1)
    ↓
[Codebase Assessment] ─── Patterns? (Principle 7)
    ↓
[Explore + Research] ─── Internal + External (Principles 1, 6)
    ↓
[Architect] ─── Design if needed (Principles 1, 7)
    ↓
[Plan] ─── Break into small units (Principle 4)
    ↓
┌──────────────────────────┐
│ Implementation Loop      │
│ Small change → Verify    │←── Self-Correction on failure (Principle 3)
│        ↓                 │
│ Repeat...                │
└──────────────────────────┘
    ↓
[Refine] ─── Cleanup (Principles 5, 7)
    ↓
[Verify] ─── Collect evidence (Principle 2)
    ↓
[Complete] ─── With evidence
```

## Request Classification (Intent Gate)

| Type | Signal | Action |
|------|--------|--------|
| **Trivial** | Single file, obvious fix | Execute → Verify |
| **Explicit** | Specific file/line given | Execute → Verify |
| **Exploratory** | "How does X work?" | Explore → Answer |
| **Open-ended** | "Add feature", "Improve" | Full workflow |
| **Ambiguous** | Unclear scope | Ask clarifying question |

## Codebase Assessment

| State | Signals | Behavior |
|-------|---------|----------|
| **Disciplined** | Consistent patterns, configs present | Follow existing style strictly |
| **Transitional** | Mixed patterns | Ask: "Which pattern to follow?" |
| **Chaotic** | No consistency | Propose: "I suggest convention X. OK?" |
| **Greenfield** | New/empty project | Apply modern best practices |

## Self-Correction Process

```
Failure 1 → Analyze → Fix → Retry
Failure 2 → Analyze → Fix → Retry
Failure 3 →
    1. STOP   - Stop immediately
    2. REVERT - Restore last working state
    3. DOCUMENT - Record what was attempted
    4. ANALYZE - Root cause analysis
    5. ASK    - Ask user for guidance
```

## Evidence Requirements

| Action | Required Evidence |
|--------|-------------------|
| Code change | Lint/typecheck clean |
| Build | Exit code 0 |
| Test | All pass |
| Feature | All above + works as intended |

**No evidence = Not complete**

## Delegation Protocol

When delegating to agents:

```
TASK: [Atomic, specific goal]
CONTEXT: [Relevant files, patterns, constraints]
EXPECTED: [Success criteria, deliverables]
CONSTRAINTS:
  - MUST DO: [Required actions]
  - MUST NOT DO: [Forbidden actions]
```

## Component Types

| Directory | Purpose | Format |
|-----------|---------|--------|
| `agents/` | Subagents for delegated tasks | Markdown with YAML frontmatter |
| `skills/` | Workflow definitions, domain knowledge | Markdown |
| `commands/` | Slash commands | Markdown with description frontmatter |
| `rules/` | Always-follow guidelines | Markdown |
| `hooks/` | Tool event automations | JSON + shell scripts |

## File Formats

**Agents** require frontmatter:
```markdown
---
name: agent-name
description: What it does
tools: Read, Grep, Glob, Bash
model: opus|sonnet|haiku
---
```

**Commands** require description:
```markdown
---
description: Brief description
---
```

## Conventions

- Filenames: lowercase with hyphens
- No emojis in any files
- Agent name should match filename
- API keys use `YOUR_*_HERE` placeholders

## When Contributing

1. Place files in the correct directory
2. Follow the format for that component type
3. Test with Claude Code before submitting
4. Use conventional commits: `feat:`, `fix:`, `docs:`
