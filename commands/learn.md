---
description: Extract reusable patterns from current session and save as skills.
---

Analyze the current session and extract patterns worth saving as skills.

What to extract:
- Error resolution patterns (error, root cause, fix)
- Non-obvious debugging techniques
- Library quirks and workarounds
- Project-specific patterns discovered

Steps:
1. Review session for extractable patterns
2. Identify most valuable/reusable insight
3. Draft skill file
4. Ask user to confirm before saving
5. Save to `~/.claude/skills/learned/`

Output format (save as `~/.claude/skills/learned/[pattern-name].md`):
```markdown
# [Descriptive Pattern Name]

**Extracted:** [Date]
**Context:** [When this applies]

## Problem
[What problem this solves]

## Solution
[The pattern/technique/workaround]

## When to Use
[Trigger conditions]
```

Skip: trivial fixes, one-time issues, obvious patterns.
