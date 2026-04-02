#!/usr/bin/env bash
# uninstall.sh — Reverse an ECC install by reading install-state.json
#
# Usage: ./uninstall.sh [--dry-run] [--keep-settings]
#
# Options:
#   --dry-run         Show what would be removed without deleting anything
#   --keep-settings   Don't touch ~/.claude/settings.json (skip hook removal)

set -euo pipefail

DRY_RUN=false
KEEP_SETTINGS=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --keep-settings) KEEP_SETTINGS=true ;;
    --help|-h)
      echo "Usage: $0 [--dry-run] [--keep-settings]"
      echo ""
      echo "Removes all files installed by ECC based on install-state.json."
      echo ""
      echo "Options:"
      echo "  --dry-run         Show what would be removed without deleting"
      echo "  --keep-settings   Don't touch ~/.claude/settings.json"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

CLAUDE_DIR="${HOME}/.claude"
STATE_FILE="${CLAUDE_DIR}/ecc/install-state.json"

if [ ! -f "$STATE_FILE" ]; then
  echo "[ECC] No install-state found at $STATE_FILE"
  echo "[ECC] Nothing to uninstall."
  exit 0
fi

echo "[ECC] Reading install-state from $STATE_FILE"

# --- Step 1: Collect all destination paths from install-state ---

DEST_PATHS=$(node -e "
  const state = require('$STATE_FILE');
  for (const op of state.operations) {
    console.log(op.destinationPath);
  }
")

FILE_COUNT=$(echo "$DEST_PATHS" | wc -l | tr -d ' ')
echo "[ECC] Found $FILE_COUNT installed files"

if $DRY_RUN; then
  echo ""
  echo "[DRY RUN] Would remove the following files:"
fi

# --- Step 2: Remove installed files ---

REMOVED=0
MISSING=0

while IFS= read -r filepath; do
  [ -z "$filepath" ] && continue

  if [ -f "$filepath" ]; then
    if $DRY_RUN; then
      echo "  rm $filepath"
    else
      rm "$filepath"
    fi
    REMOVED=$((REMOVED + 1))
  else
    MISSING=$((MISSING + 1))
  fi
done <<< "$DEST_PATHS"

# --- Step 3: Clean up empty directories ---

# Collect unique parent directories, deepest first
DIRS_TO_CHECK=$(echo "$DEST_PATHS" | while IFS= read -r f; do
  [ -z "$f" ] && continue
  dirname "$f"
done | sort -ru)

DIRS_REMOVED=0

while IFS= read -r dir; do
  [ -z "$dir" ] && continue
  # Don't remove ~/.claude itself
  [ "$dir" = "$CLAUDE_DIR" ] && continue
  # Don't remove directories outside ~/.claude
  [[ "$dir" != "$CLAUDE_DIR"/* ]] && continue

  if [ -d "$dir" ] && [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
    if $DRY_RUN; then
      echo "  rmdir $dir"
    else
      rmdir "$dir" 2>/dev/null || true
    fi
    DIRS_REMOVED=$((DIRS_REMOVED + 1))
  fi
done <<< "$DIRS_TO_CHECK"

# Repeat for parent dirs that may now be empty (up to 5 levels)
for _ in 1 2 3 4 5; do
  FOUND_EMPTY=false
  while IFS= read -r dir; do
    [ -z "$dir" ] && continue
    [ "$dir" = "$CLAUDE_DIR" ] && continue
    [[ "$dir" != "$CLAUDE_DIR"/* ]] && continue

    if [ -d "$dir" ] && [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
      if $DRY_RUN; then
        echo "  rmdir $dir (parent cleanup)"
      else
        rmdir "$dir" 2>/dev/null || true
      fi
      DIRS_REMOVED=$((DIRS_REMOVED + 1))
      FOUND_EMPTY=true
    fi
  done <<< "$(echo "$DIRS_TO_CHECK" | while IFS= read -r f; do dirname "$f" 2>/dev/null; done | sort -ru)"
  $FOUND_EMPTY || break
done

# --- Step 4: Remove ECC hooks from settings.json ---

HOOKS_SOURCE="${CLAUDE_DIR}/hooks/hooks.json"

if ! $KEEP_SETTINGS; then
  SETTINGS_FILE="${CLAUDE_DIR}/settings.json"

  if [ -f "$SETTINGS_FILE" ] && [ -f "$HOOKS_SOURCE" ] 2>/dev/null || [ -n "${DEST_PATHS:-}" ]; then
    if $DRY_RUN; then
      echo ""
      echo "[DRY RUN] Would remove ECC hooks from $SETTINGS_FILE"
    else
      # Use node to surgically remove ECC hook entries from settings.json
      node -e "
        const fs = require('fs');
        const path = require('path');

        const settingsPath = '$SETTINGS_FILE';
        if (!fs.existsSync(settingsPath)) process.exit(0);

        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (!settings.hooks || typeof settings.hooks !== 'object') process.exit(0);

        // Load the ECC hooks that were merged in
        let eccHooks = {};
        const hooksJsonPath = '$HOOKS_SOURCE';
        if (fs.existsSync(hooksJsonPath)) {
          try {
            const hooksConfig = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
            eccHooks = hooksConfig.hooks || {};
          } catch (e) {
            // If hooks.json is already deleted, build set from known ECC descriptions
          }
        }

        // Known ECC hook descriptions (fallback if hooks.json already removed)
        const eccDescriptions = new Set([
          'Block git hook-bypass flag to protect pre-commit, commit-msg, and pre-push hooks from being skipped',
          'Auto-start dev servers in tmux with directory-based session names',
          'Reminder to use tmux for long-running commands',
          'Reminder before git push to review changes',
          'Pre-commit quality check: lint staged files, validate commit message format, detect console.log/debugger/secrets before committing',
          'Doc file warning: warn about non-standard documentation files (exit code 0; warns only)',
          'Suggest manual compaction at logical intervals',
          'Capture tool use observations for continuous learning',
          'Optional InsAIts AI security monitor for Bash/Edit/Write flows. Enable with ECC_ENABLE_INSAITS=1. Requires: pip install insa-its',
          'Capture governance events (secrets, policy violations, approval requests). Enable with ECC_GOVERNANCE_CAPTURE=1',
          'Block modifications to linter/formatter config files. Steers agent to fix code instead of weakening configs.',
          'Check MCP server health before MCP tool execution and block unhealthy MCP calls',
          'Save state before context compaction',
          'Load previous context and detect package manager on new session',
          'Log PR URL and provide review command after PR creation',
          'Example: async hook for build analysis (runs in background without blocking)',
          'Run quality gate checks after file edits',
          'Auto-format JS/TS files after edits (auto-detects Biome or Prettier)',
          'TypeScript check after editing .ts/.tsx files',
          'Warn about console.log statements after edits',
          'Capture governance events from tool outputs. Enable with ECC_GOVERNANCE_CAPTURE=1',
          'Capture tool use results for continuous learning',
          'Track failed MCP tool calls, mark unhealthy servers, and attempt reconnect',
          'Check for console.log in modified files after each response',
          'Persist session state after each response (Stop carries transcript_path)',
          'Evaluate session for extractable patterns',
          'Track token and cost metrics per session',
          'Send desktop notification (macOS/WSL) with task summary when Claude responds',
          'Session end lifecycle marker (non-blocking)',
        ]);

        // Also match by CLAUDE_PLUGIN_ROOT or block-no-verify in command
        function isEccHookEntry(entry) {
          if (eccDescriptions.has(entry.description)) return true;
          if (entry.hooks) {
            for (const h of entry.hooks) {
              if (h.command && (
                h.command.includes('CLAUDE_PLUGIN_ROOT') ||
                h.command.includes('block-no-verify') ||
                h.command.includes('run-with-flags')
              )) return true;
            }
          }
          return false;
        }

        let changed = false;
        for (const [eventName, entries] of Object.entries(settings.hooks)) {
          if (!Array.isArray(entries)) continue;
          const filtered = entries.filter(entry => !isEccHookEntry(entry));
          if (filtered.length !== entries.length) {
            changed = true;
            if (filtered.length === 0) {
              delete settings.hooks[eventName];
            } else {
              settings.hooks[eventName] = filtered;
            }
          }
        }

        // Remove hooks key entirely if empty
        if (Object.keys(settings.hooks).length === 0) {
          delete settings.hooks;
        }

        if (changed) {
          fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
          console.log('[ECC] Removed ECC hooks from settings.json');
        } else {
          console.log('[ECC] No ECC hooks found in settings.json');
        }
      "
    fi
  fi
fi

# --- Step 5: Remove install-state ---

if $DRY_RUN; then
  echo "  rm $STATE_FILE"
  ECC_DIR=$(dirname "$STATE_FILE")
  if [ -d "$ECC_DIR" ]; then
    echo "  rmdir $ECC_DIR (if empty)"
  fi
else
  rm -f "$STATE_FILE"
  ECC_DIR=$(dirname "$STATE_FILE")
  rmdir "$ECC_DIR" 2>/dev/null || true
fi

# --- Summary ---

echo ""
if $DRY_RUN; then
  echo "[DRY RUN] Would remove $REMOVED files ($MISSING already missing), $DIRS_REMOVED empty dirs"
  echo "[DRY RUN] No changes made."
else
  echo "[ECC] Uninstall complete:"
  echo "  Files removed: $REMOVED"
  echo "  Already missing: $MISSING"
  echo "  Empty dirs cleaned: $DIRS_REMOVED"
  echo ""
  echo "The source repo at $(cd "$(dirname "$0")" && pwd) was not modified."
  echo "To reinstall: ./install.sh --profile full"
fi
