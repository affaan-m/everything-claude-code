# Windows Compatibility Plan

Windows incompatibility issues in everything-claude-code, organized by fix priority.

## Already Handled Correctly

The following areas already have good Windows awareness and require no changes:

- `scripts/lib/utils.js` — uses `os.homedir()`, `os.tmpdir()`, `process.env.USERPROFILE` fallback, `process.platform === 'win32'` checks, `where.exe` on Windows
- `scripts/hooks/auto-tmux-dev.js` — explicit Windows branch using `start "..." cmd /k`
- `scripts/hooks/pre-bash-dev-server-block.js` — skips itself on Windows
- `scripts/hooks/pre-bash-tmux-reminder.js` — skips itself on Windows
- `scripts/hooks/post-edit-typecheck.js` — handles `.cmd` shims
- `scripts/hooks/post-edit-format.js` — handles `.cmd` shims with `WIN_CMD_SHIMS` mapping
- `scripts/lib/resolve-formatter.js` — `WIN_CMD_SHIMS` mapping for npx/pnpm/yarn/bunx
- `scripts/hooks/desktop-notify.js` — supports macOS and WSL
- `install.sh` — has `cygpath -w` conversion for MSYS2/Git Bash
- `skills/continuous-learning-v2/hooks/observe.sh` — has `resolve_python_cmd()` trying `python3` then `python`
- `scripts/hooks/insaits-security-wrapper.js` — tries `python3` first, then `python`
- `skills/continuous-learning-v2/scripts/instinct-cli.py` — has `try/except ImportError` for `fcntl`
- Test files — already skip `chmod`-based tests on Windows

## Phase 1: Critical (blocks functionality on Windows)

### 1. `python3` in MCP server configuration

**Files:**
- `mcp-configs/mcp-servers.json` (lines 108, 167)

**Issue:** `insaits` and `evalview` MCP servers use `"command": "python3"`. Windows Python is typically installed as `python`, not `python3`.

**Fix:** Change to `"command": "python"` or add a platform detection wrapper.

### 2. `python3` in uninstall scripts

**Files:**
- `.codebuddy/uninstall.sh` (lines 20, 122)
- `.trae/uninstall.sh` (line 30)

**Issue:** Uses `python3 -c` for path resolution. Windows Python is `python`.

**Fix:** Add a python3/python resolver function (similar to `resolve_python_cmd()` in `observe.sh`).

### 3. `grep -P` (Perl regex)

**File:** `scripts/gan-harness.sh` (lines 65-67)

**Issue:** `grep -P` uses Perl-compatible regex which is not available in Git Bash on all Windows versions.

**Fix:** Rewrite regex to use basic/extended `grep -E` patterns.

### 4. `SIGUSR1` signal handling

**Files:**
- `skills/continuous-learning-v2/agents/observer-loop.sh` (line 249: `trap on_usr1 USR1`)
- `skills/continuous-learning-v2/hooks/observe.sh` (line 421: `kill -USR1 "$observer_pid"`)

**Issue:** `SIGUSR1` does not exist on Windows. Git Bash/MSYS2 partially emulates signals but behavior is unreliable.

**Fix:** Replace with a polling-based mechanism or file-watching approach.

### 5. `nohup` for background processes

**Files:**
- `skills/continuous-learning-v2/hooks/observe.sh` (lines 351, 364, 376)
- `skills/continuous-learning-v2/agents/start-observer.sh` (line 199)

**Issue:** `nohup` is not available on native Windows. Git Bash support for `nohup` with background processes (`&`) is unreliable.

**Fix:** Use `start /b` on Windows or detect platform and use appropriate daemonization.

### 6. Process substitution `<(...)`

**Files:**
- `.codebuddy/install.sh` (lines 175, 193)
- `.codebuddy/uninstall.sh` (line 160)
- `.trae/install.sh` (lines 166, 184)
- `.trae/uninstall.sh` (line 170)
- `scripts/sync-ecc-to-codex.sh` (line 299)
- `skills/skill-stocktake/scripts/scan.sh` (lines 121, 155)
- `skills/skill-stocktake/scripts/quick-diff.sh` (line 77)
- `skills/rules-distill/scripts/scan-skills.sh` (lines 80, 114)
- `skills/rules-distill/scripts/scan-rules.sh` (line 22)
- `skills/skill-stocktake/scripts/save-results.sh` (line 54)

**Issue:** `<(command)` is a bash-only process substitution feature. Git Bash on Windows has limited support — requires `/dev/fd` which may not be available.

**Fix:** Rewrite to use temporary files or pipes.

### 7. `flock` for file locking

**File:** `skills/continuous-learning-v2/hooks/observe.sh` (lines 344-353)

**Issue:** Uses `flock -n 9` for file locking. `flock` is Linux-specific. The code has macOS fallbacks (lockfile/mkdir) but no Windows fallback.

**Fix:** Add a Windows-specific fallback using directory-based locking (which is cross-platform).

---

## Phase 2: Important (affects secondary features)

### 8. Tmux worktree orchestration — Unix-only (no fix needed)

**Files:**
- `scripts/lib/tmux-worktree-orchestrator.js`
- `scripts/orchestrate-worktrees.js`
- `scripts/orchestrate-codex-worker.sh`
- `scripts/orchestration-status.js`
- `scripts/lib/orchestration-session.js`
- `scripts/lib/session-adapters/dmux-tmux.js`
- `skills/dmux-workflows/`
- `commands/orchestrate.md`

**Issue:** tmux and the dmux pane manager are Unix-only. All tmux commands (new-session, split-window, send-keys, list-panes, etc.) will fail on native Windows.

**Resolution:** Marked as Unix-only. These features require a Unix terminal multiplexer and are not planned for Windows. Users who need them can use WSL.

### 9. Desktop notifications

**File:** `scripts/hooks/desktop-notify.js` (lines 124-143)

**Issue:** Supports macOS (osascript) and WSL (PowerShell + BurntToast). Native Windows (non-WSL) has no notification path — the hook silently does nothing.

**Fix:** Add native Windows notification via PowerShell directly (not just WSL path).

### 10. `fcntl` file locking in Python

**File:** `skills/continuous-learning-v2/scripts/instinct-cli.py` (lines 32, 226, 249)

**Issue:** `fcntl` is Unix-only. The code already handles the ImportError gracefully (`_HAS_FCNTL = False`), but file locking is silently disabled, causing potential race conditions in read-modify-write operations on `projects.json`.

**Fix:** Add a Windows-compatible locking mechanism (e.g., `msvcrt.locking` or the `portalocker` package).
