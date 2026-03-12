#!/usr/bin/env bash
# session-guardian.sh — Observer session guard
# Exit 0 = proceed. Exit 1 = skip this observer cycle.
# Called by observer-loop.sh before spawning any Claude session.
#
# Config (env vars, all optional):
#   OBSERVER_INTERVAL_SECONDS   default: 300  (per-project cooldown)
#   OBSERVER_LAST_RUN_LOG       default: ~/.claude/observer-last-run.log
#
set -euo pipefail

INTERVAL="${OBSERVER_INTERVAL_SECONDS:-300}"
LOG_PATH="${OBSERVER_LAST_RUN_LOG:-$HOME/.claude/observer-last-run.log}"

# ── Gate 2: Project Cooldown Log ─────────────────────────────────────────────
# Prevent the same project being observed faster than OBSERVER_INTERVAL_SECONDS.
# Key: git root path. Falls back to $PWD outside a git repo.
# stderr uses basename only — never prints the full absolute path.

project_root="$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"
project_name="$(basename "$project_root")"
now="$(date +%s)"

mkdir -p "$(dirname "$LOG_PATH")"

# Acquire lock via mkdir (atomic on POSIX filesystems, portable cross-platform)
_lock_dir="${LOG_PATH}.lock"
if ! mkdir "$_lock_dir" 2>/dev/null; then
  # Another observer holds the lock — fail open, let this cycle proceed
  echo "session-guardian: log locked by concurrent process, proceeding" >&2
else
  trap 'rm -rf "$_lock_dir"' EXIT INT TERM

  last_spawn=0
  last_spawn=$(grep -F "$project_root" "$LOG_PATH" 2>/dev/null | tail -n1 | awk '{print $NF}') || true
  last_spawn="${last_spawn:-0}"

  elapsed=$(( now - last_spawn ))
  if [ "$elapsed" -lt "$INTERVAL" ]; then
    rm -rf "$_lock_dir"
    trap - EXIT INT TERM
    echo "session-guardian: cooldown active for '${project_name}' (last spawn ${elapsed}s ago, interval ${INTERVAL}s)" >&2
    exit 1
  fi

  # Update log atomically: remove old entry, append new timestamp
  tmp_log="$(mktemp "${TMPDIR:-/tmp}/observer-last-run.XXXXXX")"
  grep -vF "$project_root" "$LOG_PATH" > "$tmp_log" 2>/dev/null || true
  echo "${project_root}	${now}" >> "$tmp_log"
  mv "$tmp_log" "$LOG_PATH"

  rm -rf "$_lock_dir"
  trap - EXIT INT TERM
fi

exit 0
