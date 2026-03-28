---
name: omega-memory
description: Persistent memory for AI coding agents — semantic search, cross-session recall, graph relationships, checkpoint/resume, and multi-agent coordination via MCP.
origin: ECC
---

# OMEGA Memory

Persistent memory system for AI coding agents. OMEGA runs as an MCP server that gives Claude Code semantic memory across sessions — decisions, lessons, error patterns, and preferences are stored locally and recalled automatically when relevant.

## When to Use

Use when you need agents to:
- Remember decisions, architectural choices, and lessons across sessions
- Coordinate multiple parallel agents without file conflicts
- Checkpoint long-running tasks and resume them in new sessions
- Build up project knowledge over time without re-explaining context
- Store and retrieve user preferences and coding conventions

## How It Works

### Installation

```bash
pip install omega-memory[server]
omega setup
omega doctor
```

`omega setup` downloads the ONNX embedding model, registers `omega-memory` as an MCP server with Claude Code, and installs session hooks into `~/.claude/settings.json`.

### Core Concepts

- **Typed memories**: Store decisions, lessons, error patterns, user preferences, and session summaries. Each type has different retention and surfacing behavior.
- **Semantic search**: Memories are embedded with a local ONNX model and retrieved by meaning, not keywords. Query "auth approach" and find a memory about "JWT tokens vs session cookies."
- **Graph relationships**: Memories link to each other with typed edges (`evolves`, `related`, `supersedes`). Traverse the graph to discover connected context.
- **Session hooks**: Automatically capture context at session start/end. Memories from prior sessions surface as `[MEMORY]` blocks in new conversations.
- **Checkpoint/resume**: Save task state mid-session with `omega_checkpoint`. Resume in a new session with `omega_resume_task` to continue where you left off.

### MCP Tools (25 core)

| Tool | Purpose |
|------|---------|
| `omega_store` | Store a typed memory (decision, lesson, error, preference) |
| `omega_query` | Semantic search with filters and contextual re-ranking |
| `omega_welcome` | Session briefing with recent context and profile |
| `omega_checkpoint` | Save task state for cross-session continuity |
| `omega_resume_task` | Resume a checkpointed task |
| `omega_traverse` | Walk the memory relationship graph |
| `omega_similar` | Find semantically similar memories |
| `omega_timeline` | View memories grouped by day |
| `omega_consolidate` | Prune stale memories and clean edges |
| `omega_compact` | Cluster and summarize related memories |
| `omega_feedback` | Rate a surfaced memory as helpful/unhelpful |
| `omega_lessons` | Cross-session lessons ranked by access count |

### Multi-Agent Coordination (omega-pro)

29 additional tools for parallel agent workflows: session registration, file and branch claiming, task queues with dependencies, intent broadcasting, and agent-to-agent messaging.

## Examples

**Store a decision:**
```
omega_store("Use PostgreSQL for user data, SQLite for local cache", "decision")
```

**Query across sessions:**
```
omega_query("database choices")
# Returns: [decision] "Use PostgreSQL for user data, SQLite for local cache"
#          Stored 3 days ago | accessed 5 times
```

**Checkpoint a long task:**
```
omega_checkpoint  # Saves current plan, progress, files changed, decisions, next steps
# ... close session, open new one ...
omega_resume_task  # Restores full context, continues where you left off
```

**Graph traversal:**
```
omega_traverse(memory_id="abc123", max_hops=2)
# Returns connected memories: decision -> lesson -> error_pattern
```

## Best Practices

- Call `omega_welcome()` at session start to load recent context and reminders
- Use typed memory (`decision`, `lesson_learned`, `error_pattern`, `user_preference`) instead of generic `memory` for better retrieval
- After storing, call `omega_similar()` to find related memories and `omega_memory(action="link")` to build the knowledge graph
- Use `omega_checkpoint` proactively during long sessions — context windows have limits, checkpoints don't
- Store decisions with rationale: "Chose X over Y because Z" retrieves better than "Use X"
- Keep memories atomic — one decision per store call, not paragraphs

## Related

- [PyPI: omega-memory](https://pypi.org/project/omega-memory/)
- [GitHub: omega-memory/omega](https://github.com/omega-memory/omega)
- [Documentation: omegamax.co](https://omegamax.co)
