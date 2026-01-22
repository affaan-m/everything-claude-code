# Workflow

=== THIS DEFINES HOW TO ORCHESTRATE AGENTS AND TOOLS ===

## Request Classification (First Step)

Classify every request before acting.

| Type | Signal | Action |
|------|--------|--------|
| **Trivial** | Single file, obvious fix, typo | Execute directly → Verify |
| **Explicit** | Specific file/line given | Execute directly → Verify |
| **Exploratory** | "How does X work?" | Analyze → Answer |
| **Research** | "What is best practice for X?" | Research → Answer |
| **Design** | New feature, refactoring | Architect → Plan → Implement |
| **Ambiguous** | Unclear scope or intent | Ask clarifying question |

## Agent Selection

| Situation | Agent | Trigger |
|-----------|-------|---------|
| Need to understand codebase | **Analyze** | Before any unfamiliar code change |
| Need external documentation | **Research** | Unfamiliar API, library, pattern |
| Need structural decisions | **Architect** | New feature, multi-component change |
| Need implementation steps | **Plan** | Multi-step implementation |
| Need to validate changes | **Verify** | After implementation, before complete |
| Need post-implementation cleanup | **Refine** | After feature complete, code feels messy |

## Workflow Sequence

```
[Request]
    │
    ▼
[Classify Request] ─── Trivial/Explicit? ──→ Execute → Verify → Done
    │
    │ Open-ended/Design
    ▼
[Codebase Assessment] ─── Understand current state
    │
    ▼
[Analyze] ─── Internal code understanding
    │
    ▼
[Research] ─── External docs if needed (optional)
    │
    ▼
[Architect] ─── Design if structural (optional)
    │
    ▼
[Plan] ─── Break into steps
    │
    ▼
┌─────────────────────────┐
│   Implementation Loop   │
│                         │
│   Small change          │
│       ↓                 │
│   Verify incrementally  │
│       ↓                 │
│   Repeat...             │
└─────────────────────────┘
    │
    ▼
[Refine] ─── Cleanup if needed
    │
    ▼
[Verify] ─── Final verification
    │
    ▼
[Complete] ─── With evidence
```

## Codebase Assessment

Evaluate before making changes.

| State | Signals | Behavior |
|-------|---------|----------|
| **Disciplined** | Consistent patterns, configs present | Follow existing style strictly |
| **Transitional** | Mixed patterns | Ask: "Which pattern to follow?" |
| **Chaotic** | No consistency | Propose: "I suggest convention X. OK?" |
| **Greenfield** | Empty/new project | Apply modern best practices |

## Verification Checkpoints

| After | Verification |
|-------|--------------|
| Each small change | Build + affected tests |
| Feature complete | Full test suite + lint |
| Before PR | Verify agent (full report) |
| Auth/payment/security changes | + Security review |

## Tool Selection

| Task | Tool | NOT |
|------|------|-----|
| Find files by pattern | Glob | `find` in Bash |
| Search file contents | Grep | `grep` in Bash |
| Read specific file | Read | `cat` in Bash |
| Edit existing file | Edit | `sed` in Bash |
| Create new file | Write | `echo >` in Bash |
| Run commands | Bash | Only for actual commands |
| Complex codebase search | Analyze agent | Multiple Grep calls |
| Structural code search | Analyze (LSP/AST-Grep) | Text-only Grep |
| Find references/definitions | Analyze (LSP) | Manual Grep |

## Failure Protocol

```
Failure 1 → Analyze → Fix → Retry
Failure 2 → Analyze → Fix → Retry
Failure 3 →
    STOP
    ↓
    REVERT to last working state
    ↓
    DOCUMENT what was attempted
    ↓
    ASK user for guidance
```

REMEMBER: Classify first. Use the right agent for each phase. Verify after every change.
