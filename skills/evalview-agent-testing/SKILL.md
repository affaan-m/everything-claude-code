---
name: evalview-agent-testing
description: Regression testing for AI agents using EvalView. Snapshot agent behavior, detect regressions in tool calls and output quality, and block broken agents before production.
origin: ECC
tools: Bash, Read, Write
---

# EvalView Agent Testing

Automated regression testing for AI agents. EvalView snapshots your agent's behavior (tool calls, parameters, sequence, output), then diffs against the baseline after every change. When something breaks, you know immediately — before it ships.

## When to Activate

- After modifying agent code, prompts, or tool definitions
- After a model update or provider change
- Before deploying an agent to production
- When setting up CI/CD for an agent project
- When an autonomous loop (OpenClaw, coding agents) needs a fitness function
- When agent output changes unexpectedly and you need to identify what shifted

## Core Workflow

```bash
# 1. Set up
pip install "evalview>=0.5,<1"
evalview init              # Detect agent, create starter test suite

# 2. Baseline
evalview snapshot           # Save current behavior as golden baseline

# 3. Gate every change
evalview check              # Diff against baseline — catches regressions

# 4. Monitor in production
evalview monitor --slack-webhook https://hooks.slack.com/services/...
```

## Understanding Check Results

| Status | Meaning | Action |
|--------|---------|--------|
| `PASSED` | Behavior matches baseline | Ship with confidence |
| `TOOLS_CHANGED` | Different tools called | Review the diff |
| `OUTPUT_CHANGED` | Same tools, output shifted | Review the diff |
| `REGRESSION` | Score dropped significantly | Fix before shipping |

## Python API for Autonomous Loops

Use `gate()` as a programmatic regression gate inside agent frameworks, autonomous coding loops, or CI scripts:

```python
from evalview import gate, DiffStatus

# Full evaluation
result = gate(test_dir="tests/")
if not result.passed:
    for d in result.diffs:
        if not d.passed:
            print(f"  {d.test_name}: {d.status.value} ({d.score_delta:+.1f})")

# Quick mode — no LLM judge, $0, sub-second
result = gate(test_dir="tests/", quick=True)
```

### Auto-Revert on Regression

```python
from evalview.openclaw import gate_or_revert

# In an autonomous coding loop:
make_code_change()
if not gate_or_revert("tests/", quick=True):
    # Change was automatically reverted
    try_alternative_approach()
```

> **Warning:** `gate_or_revert` runs `git checkout -- .` when a regression is detected, discarding uncommitted changes. Commit or stash work-in-progress before entering the loop. You can also pass a custom revert command: `gate_or_revert("tests/", revert_cmd="git stash")`.

## MCP Integration

EvalView exposes 8 tools via MCP — works with Claude Code, Cursor, and any MCP client:

```bash
claude mcp add --transport stdio evalview -- evalview mcp serve
```

Tools: `create_test`, `run_snapshot`, `run_check`, `list_tests`, `validate_skill`, `generate_skill_tests`, `run_skill_test`, `generate_visual_report`

After connecting, Claude Code can proactively check for regressions after code changes:
- "Did my refactor break anything?" triggers `run_check`
- "Save this as the new baseline" triggers `run_snapshot`
- "Add a test for the weather tool" triggers `create_test`

## CI/CD Integration

```yaml
# .github/workflows/evalview.yml
name: Agent Regression Check
on: [pull_request, push]
jobs:
  check:
    runs-on: ubuntu-latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - run: pip install "evalview>=0.5,<1"
      - run: evalview check --fail-on REGRESSION
```

`--fail-on REGRESSION` gates on score drops only. For stricter gating that also catches tool sequence changes, use `--fail-on REGRESSION,TOOLS_CHANGED` or `--strict` (fails on any change).

## Test Case Format

```yaml
name: refund-flow
input:
  query: "I need a refund for order #4812"
expected:
  tools: ["lookup_order", "check_refund_policy", "issue_refund"]
  forbidden_tools: ["delete_order"]
  output:
    contains: ["refund", "processed"]
    not_contains: ["error"]
thresholds:
  min_score: 70
```

Multi-turn tests are also supported:

```yaml
name: clarification-flow
turns:
  - query: "I want a refund"
    expected:
      output:
        contains: ["order number"]
  - query: "Order 4812"
    expected:
      tools: ["lookup_order", "issue_refund"]
```

## Best Practices

- **Snapshot after every intentional change.** Baselines should reflect intended behavior.
- **Use `--preview` before snapshotting.** `evalview snapshot --preview` shows what would change without saving.
- **Quick mode for tight loops.** `gate(quick=True)` skips the LLM judge — free and fast for iterative development.
- **Full evaluation for final validation.** Run without `quick=True` before deploying to get LLM-as-judge scoring.
- **Commit `.evalview/golden/` to git.** Baselines should be versioned. Don't commit `state.json`.
- **Use variants for non-deterministic agents.** `evalview snapshot --variant v2` stores alternate valid behaviors (up to 5).
- **Monitor in production.** `evalview monitor` catches gradual drift that individual checks miss.

## Installation

```bash
pip install "evalview>=0.5,<1"
```

Package: [evalview on PyPI](https://pypi.org/project/evalview/)
