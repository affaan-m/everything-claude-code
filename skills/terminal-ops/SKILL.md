---
name: terminal-ops
description: 面向 ECC 的证据优先仓库执行工作流。适用场景：用户希望运行命令、检查仓库、调试 CI 失败，或推送一个范围窄的修复，并附上明确的执行与验证证据。
origin: ECC
---

# Terminal Ops

Use this when the user wants real repo execution: run commands, inspect git state, debug CI or builds, make a narrow fix, and report exactly what changed and what was verified.

This skill is intentionally narrower than general coding guidance. It is an operator workflow for evidence-first terminal execution.

## Skill Stack

Pull these ECC-native skills into the workflow when relevant:

- `verification-loop` for exact proving steps after changes
- `tdd-workflow` when the right fix needs regression coverage
- `security-review` when secrets, auth, or external inputs are involved
- `github-ops` when the task depends on CI runs, PR state, or release status
- `knowledge-ops` when the verified outcome needs to be captured into durable project context

## When to Use

- user says "fix", "debug", "run this", "check the repo", or "push it"
- the task depends on command output, git state, test results, or a verified local fix
- the answer must distinguish changed locally, verified locally, committed, and pushed

## Guardrails

- inspect before editing
- stay read-only if the user asked for audit/review only
- prefer repo-local scripts and helpers over improvised ad hoc wrappers
- do not claim fixed until the proving command was rerun
- do not claim pushed unless the branch actually moved upstream

## Workflow

### 1. Resolve the working surface

Settle:

- exact repo path
- branch
- local diff state
- requested mode:
  - inspect
  - fix
  - verify
  - push

### 2. Read the failing surface first

Before changing anything:

- inspect the error
- inspect the file or test
- inspect git state
- use any already-supplied logs or context before re-reading blindly

### 3. Keep the fix narrow

Solve one dominant failure at a time:

- use the smallest useful proving command first
- only escalate to a bigger build/test pass after the local failure is addressed
- if a command keeps failing with the same signature, stop broad retries and narrow scope

### 4. Report exact execution state

Use exact status words:

- inspected
- changed locally
- verified locally
- committed
- pushed
- blocked

## Output Format

```text
SURFACE
- repo
- branch
- requested mode

EVIDENCE
- failing command / diff / test

ACTION
- what changed

STATUS
- inspected / changed locally / verified locally / committed / pushed / blocked
```

## Pitfalls

- do not work from stale memory when the live repo state can be read
- do not widen a narrow fix into repo-wide churn
- do not use destructive git commands
- do not ignore unrelated local work

## Verification

- the response names the proving command or test
- git-related work names the repo path and branch
- any push claim includes the target branch and exact result
