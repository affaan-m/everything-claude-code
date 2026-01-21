---
description: List, debug, and manage OpenCode hooks
usage: opencode --opencode-hooks [action] [options]
---

# OpenCode Hooks Manager

Debug and inspect hook lifecycle and execution.

## Actions

### `list` - Show all registered hooks
```bash
opencode --opencode-hooks list
```

Displays:
- Hook name
- Event type (before/after/on)
- Registered by (which plugin/component)
- Handler function signature

### `fire` - Manually trigger a hook (debug)
```bash
opencode --opencode-hooks fire <event> [--payload='{}']
```

Fires a hook event with optional payload:
```bash
opencode --opencode-hooks fire beforeCommand --payload='{"name":"help","args":{}}'
```

### `trace` - Enable hook tracing for next command
```bash
opencode --opencode-hooks trace
opencode <any-command>
```

Shows:
- Every hook that fires
- Execution order
- Duration (milliseconds)
- Return values
- Errors

### `timeline` - Show hook execution timeline
```bash
opencode --opencode-hooks timeline
```

After running a command with trace enabled, shows:
```
Command: help
┌─ startup [0ms]
├─ beforeCommand [2ms]
│  ├─ plugin-a: [1ms]
│  └─ plugin-b: [1ms]
├─ [COMMAND EXECUTES: 50ms]
├─ afterCommand [5ms]
│  ├─ plugin-a: [2ms]
│  └─ plugin-b: [3ms]
└─ shutdown [0ms]
Total: 57ms
```

### `debug` - Enable verbose hook debugging
```bash
opencode --opencode-hooks debug on|off
```

Shows:
- Hook payload (input/output)
- Stack traces
- Variable values in handlers
- Performance metrics

### `errors` - Show recent hook errors
```bash
opencode --opencode-hooks errors
```

Lists:
- When error occurred
- Which hook caused it
- Error message and stack
- Resulting action (hook skipped, command blocked, etc)

### `block` - Block a specific hook
```bash
opencode --opencode-hooks block <plugin>:<event>
```

Example:
```bash
opencode --opencode-hooks block agent-bus:beforeCommand
```

Temporarily disables hook for testing.

### `unblock` - Re-enable blocked hook
```bash
opencode --opencode-hooks unblock <plugin>:<event>
```

## Lifecycle Diagram

```
User invokes command
  ↓
startup (hooks)
  ↓
beforeCommand (hooks) ← Can BLOCK command
  ↓
COMMAND EXECUTES
  ↓
afterCommand (hooks) ← Information only
  ↓
beforeAgent (hooks) ← Can BLOCK agent
  ↓
AGENT RUNS
  ↓
afterAgent (hooks) ← Information only
  ↓
shutdown (hooks)
  ↓
User sees result
```

## Hook Types Reference

| Hook | Type | Purpose | Can Block? |
|------|------|---------|-----------|
| `startup` | on | Initialize plugins | No |
| `beforeCommand` | before | Modify command before execution | Yes |
| `afterCommand` | after | Log/audit command result | No |
| `beforeAgent` | before | Modify agent config before run | Yes |
| `afterAgent` | after | Log agent result | No |
| `beforeWrite` | before | Validate/modify file writes | Yes |
| `afterWrite` | after | Log file writes | No |
| `beforeMCP` | before | Inspect MCP calls | Yes |
| `afterMCP` | after | Log MCP results | No |
| `shutdown` | on | Cleanup | No |

## Examples

### Debug hook timing
```bash
# Enable tracing
opencode --opencode-hooks trace

# Run a command
opencode plan "build feature X"

# View timeline
opencode --opencode-hooks timeline
```

### Find slow hooks
```bash
opencode --opencode-hooks debug on

# Run command
opencode help

# Look for hooks taking > 10ms
```

### Block a misbehaving plugin
```bash
# See error
opencode help  # Error from plugin-x

# Block it
opencode --opencode-hooks block plugin-x:beforeCommand

# Test
opencode help  # Works without plugin-x

# Re-enable when fixed
opencode --opencode-hooks unblock plugin-x:beforeCommand
```

### Audit all file writes
```bash
opencode --opencode-hooks trace

opencode research "how to use rust"  # Creates files

opencode --opencode-hooks timeline  # Shows all write hooks
```

## When to Use

- **Debugging mysterious behavior**: Use `trace` + `timeline`
- **Performance analysis**: Use `debug` to see durations
- **Hook conflicts**: Use `block` to isolate problematic plugins
- **Understanding execution flow**: Use `list` + `timeline`
- **Auditing modifications**: Use `afterWrite` hook logs

## Common Issues & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Command blocked | `beforeCommand` hook threw error | `opencode --opencode-hooks errors` to see which |
| Slow execution | Hook taking too long | `opencode --opencode-hooks debug on` then check durations |
| Hook not firing | Not registered | `opencode --opencode-hooks list` to verify |
| Hook firing twice | Registered twice | Check plugin `init` function |
