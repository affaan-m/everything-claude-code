---
name: beads-task-tracker
description: Distributed git-backed task tracking for AI agents. Hash-based IDs prevent merge conflicts in multi-agent/multi-branch workflows.
metadata: {"clawdbot":{"emoji":"📿","os":["darwin","linux","win32"],"requires":{"bins":["git"]}}}
---

# Beads Task Tracker

Distributed, git-backed graph issue tracker for AI agents.

## Why Beads?

Traditional issue trackers (GitHub Issues, Jira) have problems for AI agents:
- Require network access
- Can't be branched with code
- No dependency tracking
- Conflict-prone in parallel work

Beads solves these by storing tasks **in the repo**, versioned like code.

## Quick Start

```bash
# Install beads CLI
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Or via npm
npm install -g @beads/bd

# Initialize in your project
cd your-project
bd init

# Create a task
bd create "Implement user authentication" -p 0

# List ready tasks (no blockers)
bd ready
```

## Essential Commands

| Command | Action |
|---------|--------|
| `bd ready` | List tasks with no open blockers |
| `bd create "Title" -p 0` | Create a P0 (highest priority) task |
| `bd dep add <child> <parent>` | Link tasks (blocks, related, parent-child) |
| `bd show <id>` | View task details and audit trail |
| `bd close <id>` | Mark task as complete |
| `bd list` | List all tasks |

## Task Hierarchy

Beads supports hierarchical IDs for epics:

```
bd-a3f8        (Epic)
├── bd-a3f8.1  (Task)
│   ├── bd-a3f8.1.1  (Sub-task)
│   └── bd-a3f8.1.2  (Sub-task)
└── bd-a3f8.2  (Task)
```

## Agent Workflow

### 1. Check Ready Tasks

```bash
bd ready --json
# Returns tasks with no blockers, ready to work on
```

### 2. Work on a Task

```bash
# Start working
bd assign bd-a3f8.1 --to "agent-1"

# Update progress
bd comment bd-a3f8.1 "Implemented auth middleware"

# Mark complete
bd close bd-a3f8.1
```

### 3. Create Sub-tasks

```bash
# Break down complex task
bd create "Setup JWT library" --parent bd-a3f8.1
bd create "Implement login endpoint" --parent bd-a3f8.1
bd create "Add session management" --parent bd-a3f8.1
```

### 4. Track Dependencies

```bash
# Task A blocks Task B
bd dep add bd-a3f8.2 bd-a3f8.1 --type blocks

# Task A relates to Task B
bd dep add bd-a3f8.2 bd-a3f8.3 --type related
```

## Multi-Agent Parallel Work

Perfect for running multiple agents in parallel:

```bash
# Agent 1 works on feature A
cd /tmp/worktree-agent-1
bd create "Feature A" -p 0
bd assign bd-xxxx --to agent-1

# Agent 2 works on feature B
cd /tmp/worktree-agent-2
bd create "Feature B" -p 0
bd assign bd-yyyy --to agent-2

# Hash-based IDs prevent conflicts on merge!
git merge feature-a feature-b  # No conflicts in .beads/
```

## Stealth Mode

Use Beads locally without committing to the repo:

```bash
bd init --stealth
# Tasks stored locally, not in .beads/
```

## Contributor vs Maintainer

When working on open-source projects:

**Contributors** (forked repos):
```bash
bd init --contributor
# Routes planning to ~/.beads-planning/
# Keeps experimental work out of PRs
```

**Maintainers** (write access):
```bash
# Auto-detected via SSH URLs
# Or set manually:
git config beads.role maintainer
```

## Memory Compaction

For long-running projects, old closed tasks get compacted:

```bash
bd compact
# Summarizes old tasks to save context window
```

## Integration with Git Worktrees

Perfect for parallel issue fixing:

```bash
# Create worktrees for each issue
git worktree add -b fix/bd-a3f8.1 /tmp/issue-1 main
git worktree add -b fix/bd-a3f8.2 /tmp/issue-2 main

# Each worktree has its own beads view
cd /tmp/issue-1
bd show bd-a3f8.1  # Focus on this issue
```

## JSON Output for Scripting

```bash
# All commands support --json
bd list --json
bd ready --json
bd show bd-a3f8 --json

# Parse with jq
bd ready --json | jq '.[] | .id'
```

## Best Practices

### 1. Create Before You Code
Always create a task before starting work. It provides context and history.

### 2. Break Down Large Tasks
Use hierarchical IDs to decompose epics into manageable chunks.

### 3. Link Dependencies
Explicit dependencies prevent agents from working on blocked tasks.

### 4. Close with Context
```bash
bd close bd-a3f8.1 --comment "Implemented in commit abc123"
```

### 5. Regular Compaction
Run `bd compact` periodically to keep context manageable.

## Comparison with Alternatives

| Feature | Beads | GitHub Issues | Jira |
|---------|-------|---------------|------|
| Git-backed | ✅ | ❌ | ❌ |
| Offline | ✅ | ❌ | ❌ |
| Branch-aware | ✅ | ❌ | ❌ |
| Hash IDs (no conflicts) | ✅ | ❌ | ❌ |
| Dependency graph | ✅ | Limited | ✅ |
| Agent-optimized | ✅ | ❌ | ❌ |

## Installation Options

```bash
# npm (recommended)
npm install -g @beads/bd

# Homebrew
brew install beads

# Go
go install github.com/steveyegge/beads/cmd/bd@latest

# Script
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
```

## File Structure

```
.beads/
├── issues/          # JSONL task storage
├── config.json      # Beads configuration
└── cache/           # SQLite local cache
```

---

**Remember**: Tasks belong with code. Version them together.

Based on [steveyegge/beads](https://github.com/steveyegge/beads)
