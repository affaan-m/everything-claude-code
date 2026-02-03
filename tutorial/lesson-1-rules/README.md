# Lesson 1: Rules (CLAUDE.md) - The Foundation

## What Are Rules?

Rules are **memory files** that Claude Code reads automatically at the start of every
session. Think of them like a **briefing document** you hand to a new team member on
their first day — "here's how we do things around here."

Without rules, Claude starts every conversation from scratch. With rules, Claude
already knows your project structure, coding standards, team conventions, and
important context.

## Real-World Analogy

You're a system engineer on an RMF project. Imagine you have a checklist taped to
your monitor:

- "All systems must follow NIST SP 800-53 controls"
- "Security plans go in `/docs/ssp/`"
- "Run `oscap` scans before any deployment"
- "Tag all resources with `environment` and `owner`"

That checklist is your CLAUDE.md. Claude reads it every time and follows those rules
automatically.

## The Memory Hierarchy

Rules load in a specific order (later ones take priority):

```
1. Organization policy    →  /etc/claude-code/CLAUDE.md  (IT admin sets this)
2. User memory            →  ~/.claude/CLAUDE.md         (your personal prefs)
3. Project memory         →  ./CLAUDE.md                 (team-shared, in git)
4. Project rules          →  ./.claude/rules/*.md        (modular topic rules)
5. Project local          →  ./CLAUDE.local.md           (personal, gitignored)
```

## How to Create Rules

### Method 1: Use `/init` (easiest)

```bash
# Inside Claude Code, just type:
/init
```

Claude will ask you questions about your project and generate a CLAUDE.md for you.

### Method 2: Create manually

Create a file called `CLAUDE.md` in your project root.

### Method 3: Modular rules

Create individual rule files under `.claude/rules/`:

```
.claude/rules/
├── security.md       # Security requirements
├── coding-style.md   # How we write code
├── testing.md        # Testing standards
└── git-workflow.md   # Git conventions
```

## Key Concepts

### 1. Be Specific, Not Vague

```markdown
# Bad (vague)
Write good code. Follow best practices.

# Good (specific)
- Use 4-space indentation in Python files
- All functions must have type hints
- Maximum line length: 88 characters (Black formatter)
```

### 2. Use `@` Imports for Large Context

Instead of copying your entire README into CLAUDE.md:

```markdown
# Project Overview
See @README.md for full project details.
See @docs/architecture.md for system design.
```

### 3. Path-Specific Rules

Rules that only apply to certain files:

```yaml
---
paths:
  - "src/api/**/*.py"
  - "src/services/**/*.py"
---

# API Development Rules
- All endpoints require authentication middleware
- Use Pydantic models for request/response validation
- Include OpenAPI docstrings
```

---

## Exercise 1: Create Your First CLAUDE.md

**Goal**: Create a project-level CLAUDE.md for a system engineering project.

1. Look at the example file in `exercises/exercise-1-basic-claude-md.md`
2. Create your own CLAUDE.md by filling in the template
3. Drop it into any project directory and start Claude Code there

## Exercise 2: Create Modular Rules

**Goal**: Split concerns into separate rule files.

1. Look at the examples in `exercises/exercise-2-modular-rules/`
2. Create your own `.claude/rules/` directory in a project
3. Add at least 2 rule files

## Exercise 3: Path-Specific Rules

**Goal**: Create rules that only activate for certain file types.

1. Look at `exercises/exercise-3-path-rules.md`
2. Try creating a rule that only applies to Python files
3. Create another that only applies to YAML/JSON config files

---

## Quick Reference

| What | Where | Scope |
|------|-------|-------|
| Personal preferences | `~/.claude/CLAUDE.md` | All your projects |
| Team project rules | `./CLAUDE.md` | This project (in git) |
| Topic-specific rules | `./.claude/rules/*.md` | This project (in git) |
| Your local overrides | `./CLAUDE.local.md` | This project (gitignored) |

## What's Next?

In **Lesson 2**, you'll learn about **Commands** — slash commands that let you trigger
specific actions inside Claude Code. Rules tell Claude *how* to behave; commands tell
Claude *what* to do.
