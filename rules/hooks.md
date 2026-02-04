# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, blocking, redirection)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When response ends (final verification)
- **SessionStart**: When session starts (context injection)

## Current Hooks

### PreToolUse
- **Dev server blocker**: Blocks `pnpm dev` etc. - must use PM2 (Windows) or tmux (Linux/macOS)
- **tmux reminder**: Suggests tmux for long-running commands
- **git push review**: Reminder before push
- **doc blocker**: Blocks creation of unnecessary .md/.txt files

### PostToolUse
- **PR creation**: Logs PR URL after `gh pr create`
- **Prettier**: Auto-formats JS/TS files after edit
- **TypeScript check**: Runs tsc after editing .ts/.tsx files
- **console.log warning**: Warns about console.log in edited files

### Stop
- **console.log audit**: Checks modified files for console.log

## Dev Server Management

### Windows (PM2)

**Setup**: `/everything-claude-code:pm2 init` - generates `ecosystem.config.cjs` + project commands

**User commands** (opens log window):
| Command | Action |
|---------|--------|
| `/pm2-all` | Start all + open monit |
| `/pm2-{port}` | Start single + open logs |
| `/pm2-{port}-stop` | Stop single |
| `/pm2-{port}-restart` | Restart single |
| `/pm2-logs` | View all logs |
| `/pm2-status` | Check status |

**CC auto-calls** (no window):
```bash
pm2 start ecosystem.config.cjs          # Start all
pm2 start ecosystem.config.cjs --only x # Start single
pm2 restart all                         # Restart
pm2 stop all                            # Stop
pm2 logs --lines 50 --nostream          # View logs
```

**IMPORTANT**:
- NEVER run `pnpm dev` directly - hook will block it
- No `ecosystem.config.cjs` -> run `/everything-claude-code:pm2 init` first
- Config must use `.cjs` extension (ESM compatibility)
- Node.js: specify bin path + interpreter
- Python: use start.cjs wrapper with windowsHide

### Linux/macOS (tmux)

```bash
tmux new-session -d -s dev "pnpm dev"   # Start in background
tmux attach -t dev                       # View logs
tmux kill-session -t dev                 # Stop
```

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps
