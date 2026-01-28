---
name: multi-agent-swarm
description: Coordinate multiple AI agents working in parallel. Includes consensus protocols, drift prevention, and hierarchical task routing.
metadata: {"clawdbot":{"emoji":"🐝","os":["darwin","linux","win32"],"requires":{"bins":["git"]}}}
---

# Multi-Agent Swarm Coordination

Deploy multiple AI agents working together on complex tasks.

## When to Use

- Large codebases requiring parallel work
- Multiple independent features to implement
- PR review across many files
- Batch operations (fix 10 issues at once)
- Tasks that can be parallelized

## Core Concepts

### Swarm Topologies

**Hierarchical (Queen/Workers)**
```
       Queen (Coordinator)
      /    |    \
  Worker Worker Worker
```
- Queen assigns tasks and validates results
- Workers execute in isolation
- Best for: Complex tasks needing coordination

**Mesh (Peer-to-Peer)**
```
  Agent ←→ Agent
    ↕       ↕
  Agent ←→ Agent
```
- Agents communicate directly
- Shared memory pool
- Best for: Research, exploration tasks

**Star (Hub/Spoke)**
```
      Agent
       ↑
Agent → Hub ← Agent
       ↓
      Agent
```
- Central hub manages all communication
- Agents don't talk directly
- Best for: Simple parallel execution

## Setting Up a Swarm

### 1. Create Worktrees for Each Agent

```bash
# Create isolated working directories
PROJECT="my-project"
git worktree add -b agent-1 /tmp/swarm/agent-1 main
git worktree add -b agent-2 /tmp/swarm/agent-2 main
git worktree add -b agent-3 /tmp/swarm/agent-3 main
```

### 2. Assign Tasks

```bash
# Agent 1: Backend API
cd /tmp/swarm/agent-1
echo "Task: Implement REST API for users" > AGENT_TASK.md

# Agent 2: Frontend UI
cd /tmp/swarm/agent-2
echo "Task: Build user management UI" > AGENT_TASK.md

# Agent 3: Tests
cd /tmp/swarm/agent-3
echo "Task: Write comprehensive tests" > AGENT_TASK.md
```

### 3. Launch Agents in Parallel

Using tmux:
```bash
SOCKET="${TMPDIR:-/tmp}/swarm.sock"
tmux -S "$SOCKET" new-session -d -s queen -n coord

# Launch worker agents
for i in 1 2 3; do
  tmux -S "$SOCKET" new-window -t queen -n "agent-$i"
  tmux -S "$SOCKET" send-keys -t "queen:agent-$i" \
    "cd /tmp/swarm/agent-$i && codex --yolo exec 'Read AGENT_TASK.md and execute'" Enter
done

# Monitor all agents
tmux -S "$SOCKET" attach -t queen
```

### 4. Coordinate and Merge

```bash
# Wait for completion (poll for shell prompt)
for sess in agent-1 agent-2 agent-3; do
  while ! tmux -S "$SOCKET" capture-pane -p -t "queen:$sess" | grep -q "❯"; do
    sleep 10
  done
  echo "$sess: DONE"
done

# Merge results
git checkout main
git merge agent-1 agent-2 agent-3 --no-edit
```

## Anti-Drift Configuration

Prevent agents from going off-task:

```yaml
# swarm_config.yaml
topology: hierarchical
maxAgents: 8
strategy: specialized

checkpoints:
  - after: 10  # tool calls
    action: validate_alignment

guardrails:
  - no_unrelated_files
  - stay_in_assigned_directory
  - follow_task_scope
```

### Drift Detection

```bash
# Check if agent is still on task
# Compare current work to original task

diff <(cat AGENT_TASK.md) <(git diff --stat) | head -20

# If agent is working on unrelated files, kill and restart
```

## Consensus Protocols

### Majority Voting
```
# 3 agents vote on code review
Agent 1: APPROVE
Agent 2: REQUEST_CHANGES  
Agent 3: APPROVE

Result: APPROVED (2/3 majority)
```

### Byzantine Fault Tolerance
For critical decisions, require 2/3 majority:
```
# 5 agents, 2 can be faulty
# Need 4 agreements for consensus
if votes >= (2 * n / 3) + 1:
    accept()
```

### Weighted Voting
Queen's vote counts more:
```
Queen: 3x weight
Workers: 1x weight
```

## Communication Patterns

### Shared File System
```
/tmp/swarm/
├── shared/
│   ├── findings.md      # All agents can read/write
│   ├── decisions.log    # Append-only decisions
│   └── artifacts/       # Shared outputs
├── agent-1/
├── agent-2/
└── agent-3/
```

### Message Queue
```bash
# Agent writes to queue
echo "COMPLETED: API endpoint /users" >> /tmp/swarm/shared/queue.log

# Queen polls queue
tail -f /tmp/swarm/shared/queue.log
```

## Task Routing

### By Complexity

| Complexity | Handler | Time |
|------------|---------|------|
| Simple (single file) | 1 agent | < 5 min |
| Medium (feature) | 2-3 agents | 10-30 min |
| Complex (system) | 4-8 agents | 30+ min |

### By Specialization

```yaml
agents:
  - name: coder
    skills: [python, typescript, go]
    tasks: implementation
    
  - name: tester
    skills: [pytest, jest, playwright]
    tasks: testing
    
  - name: reviewer
    skills: [security, performance, style]
    tasks: code_review
    
  - name: documenter
    skills: [markdown, api_docs]
    tasks: documentation
```

## Example: Parallel PR Review

```bash
#!/bin/bash
# Review multiple PRs in parallel

PRS="86 87 88 89 90"
SOCKET="${TMPDIR:-/tmp}/review-army.sock"

# Fetch PR refs
git fetch origin '+refs/pull/*/head:refs/remotes/origin/pr/*'

# Launch reviewers
for pr in $PRS; do
  tmux -S "$SOCKET" new-window -t review -n "pr-$pr"
  tmux -S "$SOCKET" send-keys -t "review:pr-$pr" \
    "codex exec 'Review PR #$pr. Run: git diff origin/main...origin/pr/$pr'" Enter
done

# Collect results
for pr in $PRS; do
  output=$(tmux -S "$SOCKET" capture-pane -p -t "review:pr-$pr" -S -200)
  gh pr comment $pr --body "$output"
done
```

## Example: Parallel Issue Fixing

```bash
#!/bin/bash
# Fix multiple issues in parallel

ISSUES="78 79 80 81"

# Create worktrees
for issue in $ISSUES; do
  git worktree add -b "fix/issue-$issue" "/tmp/fix-$issue" main
done

# Launch fixers
for issue in $ISSUES; do
  cd "/tmp/fix-$issue"
  # Get issue description
  DESC=$(gh issue view $issue --json body -q .body)
  
  # Run agent
  codex --yolo exec "Fix issue #$issue: $DESC. Commit and push." &
done

# Wait for all
wait

# Create PRs
for issue in $ISSUES; do
  cd "/tmp/fix-$issue"
  gh pr create --title "fix: issue #$issue" --body "Fixes #$issue"
done

# Cleanup
for issue in $ISSUES; do
  git worktree remove "/tmp/fix-$issue"
done
```

## Best Practices

### 1. Isolate Agents
Each agent should have its own workspace. Never share working directories.

### 2. Clear Task Boundaries
Define exactly what each agent should do. Ambiguity causes drift.

### 3. Regular Checkpoints
Poll agents every N tool calls to ensure alignment.

### 4. Structured Output
Require agents to output in parseable format (JSON, markdown).

### 5. Graceful Failure
If one agent fails, others should continue. Handle partial results.

### 6. Resource Limits
Set timeouts and token limits per agent.

```bash
# Timeout after 10 minutes
timeout 600 codex exec "..."
```

## Monitoring

```bash
# Watch all agents
watch -n 5 'for sess in agent-{1,2,3}; do
  echo "=== $sess ==="
  tmux -S "$SOCKET" capture-pane -p -t "queen:$sess" -S -5
done'
```

---

**Remember**: Parallel agents multiply productivity, but require coordination. Start small (2-3 agents) and scale up.

Inspired by [claude-flow](https://github.com/ruvnet/claude-flow)
