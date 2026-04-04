# Windows Compatibility Plan

Windows incompatibility issues in everything-claude-code, organized by fix priority.

## Design Decisions

| Decision | Answer |
|----------|--------|
| Target environment | Native Windows with Git Bash (Claude Code runs in PowerShell; shell scripts invoked through Git Bash via hooks.json) |
| PR strategy | Fork-only — all changes stay on `windows-support` branch, no upstream PRs |
| Features in scope | Instinct system (continuous-learning-v2), skill-stocktake, rules-distill |
| Features out of scope | CodeBuddy, Trae, Kiro, Codex integration, GAN harness, insaits/evalview MCP servers |
| Tmux orchestration | Documented as Unix-only, no code changes needed |
| Desktop notifications | Known limitation — no fix planned |
| Backwards compatibility | Not required — fork-only changes can hardcode Windows behavior |

## Already Handled Correctly

The following areas already have good Windows awareness and require no changes:

- `scripts/lib/utils.js` — uses `os.homedir()`, `os.tmpdir()`, `process.env.USERPROFILE` fallback, `process.platform === 'win32'` checks, `where.exe` on Windows
- `scripts/hooks/auto-tmux-dev.js` — explicit Windows branch using `start "..." cmd /k`
- `scripts/hooks/pre-bash-dev-server-block.js` — skips itself on Windows
- `scripts/hooks/pre-bash-tmux-reminder.js` — skips itself on Windows
- `scripts/hooks/post-edit-typecheck.js` — handles `.cmd` shims
- `scripts/hooks/post-edit-format.js` — handles `.cmd` shims with `WIN_CMD_SHIMS` mapping
- `scripts/lib/resolve-formatter.js` — `WIN_CMD_SHIMS` mapping for npx/pnpm/yarn/bunx
- `scripts/hooks/desktop-notify.js` — supports macOS and WSL (native Windows silently does nothing — accepted limitation)
- `install.sh` — has `cygpath -w` conversion for MSYS2/Git Bash
- `skills/continuous-learning-v2/hooks/observe.sh` — has `resolve_python_cmd()` trying `python3` then `python`
- `scripts/hooks/insaits-security-wrapper.js` — tries `python3` first, then `python`
- `skills/continuous-learning-v2/scripts/instinct-cli.py` — has `try/except ImportError` for `fcntl`
- Test files — already skip `chmod`-based tests on Windows

## Out of Scope (not used on Windows)

The following features are not used and will not be fixed:

| Feature | Files | Reason |
|---------|-------|--------|
| CodeBuddy/Trae/Kiro install/uninstall | `.codebuddy/`, `.trae/`, `.kiro/` | Not used |
| Codex integration | `scripts/sync-ecc-to-codex.sh`, `scripts/orchestrate-codex-worker.sh`, `scripts/codex/` | Not used |
| GAN harness | `scripts/gan-harness.sh` | Not used |
| insaits/evalview MCP servers | `mcp-configs/mcp-servers.json` | Not used |
| Tmux orchestration | `scripts/lib/tmux-worktree-orchestrator.js`, `scripts/orchestrate-worktrees.js`, `scripts/lib/session-adapters/dmux-tmux.js`, `skills/dmux-workflows/`, `commands/orchestrate.md` | Documented as Unix-only |
| Desktop notifications | `scripts/hooks/desktop-notify.js` | Accepted limitation |

---

## Phase 1: Critical (blocks in-scope features on Windows)

### 1. SIGUSR1 signal handling (observer lifecycle)

**Files:**
- `skills/continuous-learning-v2/agents/observer-loop.sh` — `trap on_usr1 USR1`
- `skills/continuous-learning-v2/hooks/observe.sh` — `kill -USR1 "$observer_pid"`

**Issue:** `SIGUSR1` does not exist on Windows. Git Bash/MSYS2 partially emulates signals but behavior is unreliable. The observer uses this for on-demand analysis triggers.

**Fix approach:** Replace signal-based trigger with a file-based polling mechanism. The observer loop already runs on a cooldown timer — add a sentinel file check (e.g., `.observer-trigger`) alongside the timer. When `observe.sh` wants to trigger analysis, it writes the sentinel file instead of sending a signal. The observer checks for the file each iteration and removes it after processing.

### 2. `nohup` for background observer process

**Files:**
- `skills/continuous-learning-v2/hooks/observe.sh` — launches observer with `nohup ... &`
- `skills/continuous-learning-v2/agents/start-observer.sh` — starts observer as background process

**Issue:** `nohup` is not available on native Windows. Git Bash support for background process daemonization is unreliable. The observer needs to run as a persistent background process.

**Fix approach:** Detect Windows and use `start /b` via CMD, or use a PID file approach where the observer forks itself and the parent exits. Since Claude Code invokes scripts through Git Bash, a Bash-native backgrounding approach (`command & disown`) may work as a Git Bash-specific path. Test in Git Bash first — if `& disown` works reliably, use that with a Windows guard comment. If not, shell out to `powershell.exe -Command "Start-Process -WindowStyle Hidden ..."`.

### 3. Process substitution `<(...)` in skill-stocktake and rules-distill

**Files:**
- `skills/skill-stocktake/scripts/scan.sh` — diff with process substitution
- `skills/skill-stocktake/scripts/quick-diff.sh` — diff with process substitution
- `skills/skill-stocktake/scripts/save-results.sh` — sort with process substitution
- `skills/rules-distill/scripts/scan-skills.sh` — diff with process substitution
- `skills/rules-distill/scripts/scan-rules.sh` — diff with process substitution

**Issue:** `<(command)` requires `/dev/fd` support which may not be available in all Git Bash versions on Windows.

**Fix approach:** Rewrite each occurrence to use a temporary file pattern:
```bash
# Before (process substitution):
diff <(command_a) <(command_b)

# After (temp file):
tmp_a=$(mktemp); command_a > "$tmp_a"
tmp_b=$(mktemp); command_b > "$tmp_b"
diff "$tmp_a" "$tmp_b"
rm -f "$tmp_a" "$tmp_b"
```

### 4. `flock` for file locking (observer)

**File:** `skills/continuous-learning-v2/hooks/observe.sh`

**Issue:** Uses `flock -n 9` for file locking. `flock` is Linux-specific. macOS has lockfile/mkdir fallbacks. No Windows fallback exists.

**Fix approach:** The macOS fallback already uses `mkdir` for directory-based locking, which is atomic on NTFS for local drives. Extend the fallback chain to include Windows. The existing logic tries `flock` first, then falls back — just ensure the `mkdir` path is reached on Windows. Test that `mkdir` atomicity is sufficient for the use case (single-user instinct operations, low concurrency risk).

### 5. `python3` references in instinct system entry points

**Files:**
- `skills/continuous-learning-v2/scripts/instinct-cli.py` — shebang `#!/usr/bin/env python3`
- `skills/continuous-learning-v2/scripts/detect-project.sh` — calls `python3` for project detection

**Issue:** Windows Python is installed as `python`, not `python3`. The `observe.sh` hook already has a `resolve_python_cmd()` function that handles this, but other entry points (e.g., the `/instinct-status` command which invokes `instinct-cli.py` directly) may not go through that resolver.

**Fix approach:** Since this is fork-only, change `python3` to `python` in all in-scope files. The `resolve_python_cmd()` function in `observe.sh` can also be simplified to just use `python` on Windows. Update the shebang in `instinct-cli.py` — note that shebangs are ignored on Windows, but updating it keeps consistency.

---

## Phase 2: Important (affects secondary features)

### 6. `fcntl` file locking in Python (instinct-cli.py)

**File:** `skills/continuous-learning-v2/scripts/instinct-cli.py`

**Issue:** `fcntl` is Unix-only. The code already handles the ImportError gracefully (`_HAS_FCNTL = False`), but file locking is silently disabled, causing potential race conditions in read-modify-write operations on `projects.json`.

**Risk assessment:** The race condition requires two Claude Code sessions running instinct commands simultaneously against the same project. This is low-risk for single-user workflows but possible if multiple Claude Code instances are active.

**Fix approach:** Add a Windows fallback using `msvcrt.locking()` in the existing `try/except` block:
```python
try:
    import fcntl
    _HAS_FCNTL = True
except ImportError:
    try:
        import msvcrt
        _HAS_MSVCRT = True
    except ImportError:
        _HAS_MSVCRT = False
    _HAS_FCNTL = False
```

Then in the locking function, use `msvcrt.locking(fd, msvcrt.LK_NBLCK, 1)` as the Windows path. Since `msvcrt.locking` works on file descriptors and the code already opens files for locking, this integrates cleanly.

---

## Testing Strategy

### Environment
- All fixes tested in Git Bash on Windows (the shell Claude Code uses to invoke scripts)
- Node.js v24.13.0, Python via `python` command
- No WSL — all testing is native Windows

### Per-fix verification

| Fix | How to verify |
|-----|---------------|
| SIGUSR1 replacement | Start observer, trigger analysis via sentinel file, verify observer picks it up |
| nohup replacement | Start observer via `start-observer.sh`, verify it persists after shell exits |
| Process substitution | Run `/skill-stocktake` and `/rules-distill` commands, verify output matches expected |
| flock fallback | Run two instinct imports in parallel, verify no data corruption |
| python3 → python | Run `/instinct-status`, `/instinct-import`, `/promote` — verify they execute |
| fcntl fallback | Run `/instinct-import` twice in rapid succession — verify no corruption |

### Regression check
- Run `node tests/run-all.js` after each fix to verify no existing functionality breaks
- Line numbers in this plan are approximate and will drift — reference function/pattern names when implementing

### Rebase awareness
- This plan modifies files that upstream may also change
- The `git sync-upstream` alias will rebase these changes onto upstream/main
- Conflicts are most likely in `observe.sh` and `observer-loop.sh` (most complex files with most changes)
- Keep changes minimal and well-isolated to reduce conflict surface
