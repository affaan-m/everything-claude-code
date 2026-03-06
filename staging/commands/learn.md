---
description: Extract reusable patterns from the session with quality verification before saving.
---

# /learn -- Extract Reusable Patterns

Analyze the current session and extract patterns worth saving as skills.

## What to Extract

1. **Error Resolution Patterns** -- root cause + fix + reusability
2. **Debugging Techniques** -- non-obvious steps, tool combinations
3. **Workarounds** -- library quirks, API limitations, version-specific fixes
4. **Project-Specific Patterns** -- conventions, architecture decisions

## Process

1. Review the session for extractable patterns
2. Identify the most valuable/reusable insight

3. **Verify root cause (MANDATORY):**
   - Run diagnostic commands to confirm the actual mechanism
   - Ask: "What else could explain this?" -- try to falsify your explanation
   - Ask: "Am I describing the symptom or the cause?"
   - If you can't verify, mark as "hypothesis" not "fact"

4. **Determine save location:**
   - **Global** (`~/.claude/skills/learned/`): Patterns useful across 2+ projects
   - **Project** (`.claude/skills/learned/`): Project-specific knowledge
   - When in doubt, choose Global

5. Draft the skill file:

```markdown
---
name: pattern-name
description: "Under 130 characters"
user-invocable: false
origin: auto-extracted
---

# [Pattern Name]

**Extracted:** [Date] | **Context:** [when this applies]

## Problem
[specific]

## Solution
[with code examples]

## When to Use
[trigger conditions]
```

6. **Self-evaluate** before saving:

   | Dimension | 1 (Weak) | 5 (Strong) |
   |-----------|----------|------------|
   | Root Cause Verified | Hypothesis only | Confirmed with diagnostics |
   | Specificity | No code examples | Rich examples |
   | Actionability | Unclear what to do | Immediately actionable |
   | Scope Fit | Too broad/narrow | Perfectly aligned |
   | Non-redundancy | Nearly identical to existing | Completely unique |
   | Coverage | Fraction of cases | Main + edge cases |

   - All dimensions must score 3 or higher
   - **Root Cause Verified scoring 1-2 is a hard blocker** -- go back to step 3

7. Show user: proposed path + scores table + draft. Wait for confirmation before saving.

## What NOT to Extract

- Trivial fixes (typos, syntax errors)
- One-time issues (specific API outages)
- Patterns already covered by existing skills
