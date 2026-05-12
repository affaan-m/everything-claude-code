# ECC 2.0 Reference Architecture

Research summary from competitor/reference analysis (2026-03-22).

For the current GA execution roadmap and Linear milestone mirror, see
[`ECC-2.0-GA-ROADMAP.md`](ECC-2.0-GA-ROADMAP.md).

## Competitive Landscape

| Project | Stars | Language | Type | Multi-Agent | Worktrees | Terminal-native |
|---------|-------|----------|------|-------------|-----------|-----------------|
| **ECC 2.0** | - | Rust | TUI | Yes | Yes | **Yes (SSH)** |
| superset-sh/superset | 7.7K | TypeScript | Electron | Yes | Yes | No (desktop) |
| standardagents/dmux | 1.2K | TypeScript | TUI (Ink) | Yes | Yes | Yes |
| opencode-ai/opencode | 11.5K | Go | TUI | No | No | Yes |
| smtg-ai/claude-squad | 6.5K | Go | TUI | Yes | Yes | Yes |

## Three-Layer Architecture

```
┌─────────────────────────────────┐
│        TUI Layer (ratatui)      │  User-facing dashboard
│  Panes, diff viewer, hotkeys    │  Communicates via Unix socket
├─────────────────────────────────┤
│     Runtime Layer (library)     │  Workspace runtime, agent registry,
│  State persistence, detection   │  status detection, SQLite
├─────────────────────────────────┤
│     Daemon Layer (process)      │  Persistent across TUI restarts
│  Terminal sessions, git ops,    │  PTY management, heartbeats
│  agent process supervision      │
└─────────────────────────────────┘
```

## Patterns to Adopt

### From Superset (Electron, 7.7K stars)
- **Workspace Runtime Registry** — trait-based abstraction with capability flags
- **Persistent daemon terminal** — sessions survive restarts via IPC
- **Per-project mutex** for git operations (prevents race conditions)
- **Port allocation** per workspace for dev servers
- **Cold restore** from serialized terminal scrollback

### From dmux (Ink TUI, 1.2K stars)
- **Worker-per-pane status detection** — fingerprint terminal output + LLM classification
- **Agent Registry** — centralized agent definitions (install check, launch cmd, permissions)
- **Retry strategies** — different policies for destructive vs read-only operations
- **PaneLifecycleManager** — exclusive locks preventing concurrent pane races
- **Lifecycle hooks** — worktree_created, pre_merge, post_merge
- **Background cleanup queue** — async worktree deletion

## ECC 2.0 Advantages
- Terminal-native (works over SSH, unlike Superset)
- Integrates with 116-skill ecosystem
- AgentShield security scanning
- Self-improving skill evolution (continuous-learning-v2)
- Rust single binary (3.4MB, no runtime deps)
- First Rust-based agentic IDE TUI in open source
