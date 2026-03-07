# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
Task tool (code-reviewer agent):
  Use template at requesting-code-review/code-reviewer.md

  WHAT_WAS_IMPLEMENTED: [from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

**Requires the requesting-code-review skill to be available.** If not loaded, perform a basic quality review: check for hard-stop violations (TODOs, console.log, placeholders, dead code, untyped `any`), verify type safety, and review error handling.

**Code reviewer returns:** Strengths, Issues (Critical/Important/Minor), Assessment
