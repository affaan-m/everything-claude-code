# Community Workarounds: Hook Bugs, Compaction, and MCP Auth

> **Source**: Community-validated workarounds from issue #644 (v2.1.79, macOS, 8 hooks, Gmail/Google Drive MCP).

> **See also**: [`docs/TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for general troubleshooting. This file documents advanced hook-specific bugs with detailed root-cause analysis.

---

## Bug 1: False "Hook Error" Labels (#34713, #10936, #10463)

**Problem**: Every hook execution shows "Hook Error" in transcript regardless of success. With 8+ hooks, this floods model context and causes premature turn endings.

**Root cause**: Hooks that output JSON to stdout without the `hookSpecificOutput` wrapper trigger the error label. Unconsumed stdin also causes broken pipe errors that surface as hook errors.

### Workaround

1. **Always consume stdin** at the top of every hook:
   ```bash
   INPUT=$(cat)
   ```
2. **Never output raw JSON to stdout** for simple allow/block hooks — use stderr only.
3. **Block messages go to stderr** with a `[BLOCKED]` prefix:
   ```bash
   # Before (triggers false error):
   echo '{"decision":"block","reason":"blocked"}'
   exit 2

   # After (clean):
   echo "[BLOCKED] Reason here" >&2
   exit 2
   ```
4. **Redirect all subcommand stderr** with `2>/dev/null` to prevent stray output.

Alternatively, use the structured wrapper format:
```json
{"hookSpecificOutput":{"decision":"allow"}}
```

**Result**: Eliminates 100% of false hook error labels.

---

## Bug 2: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` is Counterproductive (#24677, #31806)

**Problem**: Setting `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=75` causes *earlier* compaction, not later. The env var is clamped with `Math.min`, so values below the default (~83.5%) trigger compaction sooner — wasting working space.

### Workaround

**Remove the env var entirely.** On 1M context models (Opus 4.6, Sonnet 4.6), the default threshold is sufficient and the "death spiral" is effectively eliminated by the larger context window.

> **Note for Anthropic**: This env var should clearly document that it can only *lower* the threshold, not raise it. A warning when set above the default would also help.

---

## Bug 3: MCP Connectors Lose Auth After Compaction (#34832)

**Problem**: Gmail and Google Drive MCP connectors silently lose OAuth session tokens after auto-compaction. The UI still shows "connected" but tool calls fail.

**Root cause**: MCP auth tokens are stored in-memory within the Claude Code process. When compaction triggers a context rebuild, these in-memory connections reset. The OAuth tokens in session context are not persisted to disk.

### Workaround

Add a `Stop` hook that sends a notification reminding to toggle connectors OFF/ON before the next session:

```json
{
  "Stop": [{
    "hooks": [{
      "type": "command",
      "command": "osascript -e 'display notification \"MCP connectors may need re-auth\" with title \"Session Ended\" sound name \"Glass\"' 2>/dev/null; cat > /dev/null"
    }]
  }]
}
```

> **Note for Anthropic**: OAuth tokens should be persisted outside conversation context (e.g., in `mcp-needs-auth-cache.json` or process environment) so they survive compaction.

---

## Bug 4: No Hook Hot-Reload (#22679, #5513)

**Problem**: Changes to hooks in `settings.json` require a full session restart. No `/reload` command exists.

### Workaround

Create a custom `/reload` command using SIGHUP:

```markdown
Run: `kill -HUP $PPID`
```

> **Platform note**: SIGHUP (`kill -HUP`) is supported on macOS and Linux only. On Windows, use `taskkill /F /PID <pid>` and restart manually — there is no equivalent signal-based reload.

Combine with a shell wrapper function that catches exit code `129` and restarts Claude with `-c` (continue) to preserve session context while reloading hooks from disk.

> **Note for Anthropic**: A built-in `/reload` or `/refresh-hooks` command would eliminate the need for this wrapper.

---

## Bug 5: 529 Overloaded Errors (#35487)

**Configuration that reduces 529 errors**:

| Setting | Value | Effect |
|---|---|---|
| `ENABLE_TOOL_SEARCH` | `auto:5` | Defers MCP tool definitions, reducing tokens per request |
| `CLAUDE_CODE_SUBAGENT_MODEL` | `haiku` | Routes subagents to separate capacity pool |
| `MAX_THINKING_TOKENS` | `8000` | Caps thinking overhead |

Also: prefer manual `/compact` at natural breakpoints instead of relying on auto-compaction.

---

## General Hook Recommendations

1. **Document hook exit code semantics prominently**: `exit 0` = allow, `exit 1` = error (fail-open!), `exit 2` = block. Many users use `exit 1` thinking it blocks — it does not.
2. **Consider a `--validate-hooks` CLI flag** to test hook scripts before deployment.

---

*Last validated: Claude Code v2.1.79, macOS 26.3.1 Tahoe. See issue [#644](https://github.com/affaan-m/everything-claude-code/issues/644) for the original community report.*
