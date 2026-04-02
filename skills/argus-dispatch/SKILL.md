---
name: argus-dispatch
description: >
  Dispatch any task to an external AI CLI (Codex, Gemini, Droid, Amp, OpenCode) as an autonomous agent.
  Use when needing an external AI to perform analysis, audit, review, code changes,
  or any self-contained task. Triggers: "send to codex/gemini", "dispatch to",
  "have codex/gemini do", "external agent", "second opinion", general audits,
  or when a task would benefit from independent external execution.
  Part of the Argus multi-model review system.
origin: "Chris Yau (@chris-yyau)"
---

# Argus Dispatch

Send any task to an external AI CLI as an autonomous agent. This is the foundation layer of the Argus system — other Argus skills (argus-council, argus-loop, argus-review, argus-design-review) use this to achieve model diversity.

Model diversity matters: different AI models have different training data, different biases, and different blind spots. Running the same review through two independent models catches issues that a single model — no matter how capable — will systematically miss.

## When to Use

- **Second opinions** — independent analysis from a different AI model
- **Parallel sub-tasks** — dispatch work while continuing your own
- **General audits** — audit code, configs, scripts
- **Specialized analysis** — deep dive into a specific area
- **Code changes via external agent** — refactoring, fixes, generation
- **Multi-model consensus** — dispatch to two+ CLIs, synthesize agreement

## When NOT to Use

- Tasks requiring Claude Code's specific tools (MCP servers, web search, etc.)
- Simple questions that don't benefit from a second model's perspective
- Tasks that need conversation context (external CLIs start fresh)

## Supported CLIs

| CLI | Binary | Strengths |
|-----|--------|-----------|
| Codex | `codex` | Deep code reasoning, tool use, sandbox execution |
| Gemini | `gemini` | Broad strategic thinking, large context |
| Droid | `droid` | Lightweight, fast execution |
| Amp | `amp` | Review-oriented analysis |
| OpenCode | `opencode` | Go ecosystem integration |

## CLI Selection

| Task Type | CLI | Rationale |
|-----------|-----|-----------|
| Code audit, bug hunting | `codex` | Deep code reasoning, tool use |
| Architecture analysis | `gemini` | Broad strategic thinking |
| Fast autonomous agent | `droid` | Lightweight, fast execution |
| Code review focus | `amp` | Review-oriented analysis |
| Go-native projects | `opencode` | Go ecosystem integration |
| High-stakes decisions | `both` | Codex + Gemini consensus |
| Maximum coverage | `all` | Top 3 available CLIs in parallel |
| Quick analysis (either) | `auto` | Uses whichever is available |

## Execution Modes

| Mode | What happens | When to use |
|------|-------------|-------------|
| `readonly` (default) | Sandbox — cannot modify files | Analysis, audit, review |
| `auto` | Full auto-approve — can make changes | Refactoring, code generation |

**Safety**: ALWAYS default to `readonly`. Only use `auto` when the user explicitly requests file changes.

## How to Dispatch

### Step 1: Construct the Prompt

A well-constructed prompt is the difference between useful output and noise.

**Structure every prompt like this:**

```
## Task
[One clear sentence: what to do]

## Scope
[Specific files, directories, or areas to focus on]

## Focus Areas
[What specifically to look for or produce]

## Output Format
[How to structure the response — report, JSON, list, etc.]

## Constraints
[What NOT to do, boundaries]
```

**Example — Audit prompt:**
```
## Task
Audit the shell scripts under hooks/ for correctness, edge cases, and bugs.

## Scope
All .sh files in hooks/ and scripts/

## Focus Areas
- Race conditions in concurrent operations
- Unhandled edge cases (empty inputs, missing files)
- Shell quoting issues
- Error handling gaps

## Output Format
Severity-ranked report: CRITICAL > HIGH > MEDIUM > LOW
Each finding: file, line, severity, description, suggested fix.

## Constraints
Read-only analysis. Do not modify any files.
```

### Step 2: Invoke the Script

```bash
# Single CLI, read-only (default and safest)
argus-dispatch.sh --cli codex --prompt "Your task description here"

# Both CLIs for consensus (parallel execution)
argus-dispatch.sh --cli both --prompt "Your task description here"

# Write mode (user explicitly requested changes)
argus-dispatch.sh --cli codex --mode auto --prompt "Your task description here"

# With model override and custom timeout
argus-dispatch.sh --cli gemini --model gemini-2.5-pro --timeout 600 --prompt "Your task description here"
```

The script auto-detects its own location, so it works from any directory.

**Script flags:**

| Flag | Values | Default |
|------|--------|---------|
| `--cli` | `codex`, `gemini`, `droid`, `amp`, `opencode`, `both`, `all`, `auto` | `auto` |
| `--mode` | `readonly`, `auto` | `readonly` |
| `--timeout` | seconds | `300` |
| `--model` | model name | CLI default |
| `--prompt` | task description | (or pipe stdin) |

### Step 3: Process the Output

- **Single CLI**: Output prints to stdout. Read it and summarize key findings.
- **Both CLIs**: Output shows labeled sections for each. Synthesize a consensus view — where they agree is high confidence, where they disagree warrants investigation.
- **Raw output saved** to `${TMPDIR:-/tmp}/dispatch-{cli}-{timestamp}.txt` for reference.

After dispatch:
1. Read the output carefully
2. Summarize key findings for the user
3. If actionable items exist, propose next steps
4. If "both" mode, highlight agreements and disagreements

## Dispatch Patterns

### Pattern: Quick Analysis
One CLI, readonly, focused question.
```bash
argus-dispatch.sh --cli codex --prompt "What does the session hook do? Explain its data flow."
```

### Pattern: Consensus Audit
Both CLIs, readonly, comprehensive review.
```bash
argus-dispatch.sh --cli both --prompt "Audit the authentication module for security issues and bypass vectors."
```

### Pattern: Delegated Code Change
One CLI, auto mode, well-scoped change.
```bash
argus-dispatch.sh --cli codex --mode auto --prompt "Add input validation to the config parser."
```

### Pattern: Research
One CLI, readonly, open-ended exploration.
```bash
argus-dispatch.sh --cli gemini --prompt "Analyze the caching layer and suggest improvements to the eviction strategy."
```

## Fallback Behavior

When no external CLIs are installed, other Argus skills (argus-council, argus-loop) fall back to using the Agent tool with separate Claude instances. This preserves **context isolation** (each reviewer starts fresh) but loses **model diversity** (all reviewers share the same model family). The fallback is logged so users know true independence was not achieved.

For full Argus effectiveness, install at least one external CLI:
```bash
# Pick one or more:
npm install -g @openai/codex    # Codex CLI
npm install -g @anthropic/gemini # Gemini CLI (check current install method)
```

## Integration with Other Argus Skills

| Skill | How it uses argus-dispatch |
|-------|---------------------------|
| argus-council | Dispatches Pragmatist + Critic voices to external models |
| argus-loop | Dispatches Reviewer B to external model for dual verification |
| argus-review | Dispatches external model for independent code review pass |
| argus-design-review | Dispatches external reviewers for 3-tier design doc review |

## Error Handling

| Situation | What happens |
|-----------|-------------|
| CLI not found | Script falls back to next available CLI (auto mode) or errors clearly |
| Timeout (default 5min) | Script returns timeout status, partial output if any |
| CLI error | Script captures stderr, returns error status |
| Empty output | Script notes "(no output)" — may need a better prompt |

If a dispatch fails, check:
1. Is the CLI installed? (`which codex`, `which gemini`)
2. Is the prompt clear enough?
3. Does the timeout need extending for complex tasks?
4. Try the other CLI as fallback
