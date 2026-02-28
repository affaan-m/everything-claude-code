#!/bin/bash
# Continuous Learning v2 - Observation Hook
#
# Captures tool use events for pattern analysis.
# Claude Code passes hook data via stdin as JSON.
#
# v2.1: Project-scoped observations — detects current project context
#       and writes observations to project-specific directory.
#
# Registered via plugin hooks/hooks.json (auto-loaded when plugin is enabled).
# Can also be registered manually in ~/.claude/settings.json.

set -e

# Hook phase from CLI argument: "pre" (PreToolUse) or "post" (PostToolUse)
HOOK_PHASE="${1:-post}"

# ─────────────────────────────────────────────
# Read stdin first (before project detection)
# ─────────────────────────────────────────────

# Read JSON from stdin (Claude Code hook format)
INPUT_JSON=$(cat)

# Exit if no input
if [ -z "$INPUT_JSON" ]; then
  exit 0
fi

# ─────────────────────────────────────────────
# Extract cwd from stdin for project detection
# ─────────────────────────────────────────────

# Extract cwd from the hook JSON to use for project detection.
# This avoids spawning a separate git subprocess when cwd is available.
STDIN_CWD=$(echo "$INPUT_JSON" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    cwd = data.get("cwd", "")
    print(cwd)
except(KeyError, TypeError, ValueError):
    print("")
' 2>/dev/null || echo "")

# If cwd was provided in stdin, use it for project detection
if [ -n "$STDIN_CWD" ] && [ -d "$STDIN_CWD" ]; then
  export CLAUDE_PROJECT_DIR="$STDIN_CWD"
fi

# ─────────────────────────────────────────────
# Project detection
# ─────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source shared project detection helper
# This sets: PROJECT_ID, PROJECT_NAME, PROJECT_ROOT, PROJECT_DIR
source "${SKILL_ROOT}/scripts/detect-project.sh"

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────

CONFIG_DIR="${HOME}/.claude/homunculus"
OBSERVATIONS_FILE="${PROJECT_DIR}/observations.jsonl"
MAX_FILE_SIZE_MB=10

# Skip if disabled
if [ -f "$CONFIG_DIR/disabled" ]; then
  exit 0
fi

# Parse using python via stdin pipe (safe for all JSON payloads)
# Pass HOOK_PHASE via env var since Claude Code does not include hook type in stdin JSON
PARSED=$(echo "$INPUT_JSON" | HOOK_PHASE="$HOOK_PHASE" python3 -c '
import json
import sys
import os

try:
    data = json.load(sys.stdin)

    # Determine event type from CLI argument passed via env var.
    # Claude Code does NOT include a "hook_type" field in the stdin JSON,
    # so we rely on the shell argument ("pre" or "post") instead.
    hook_phase = os.environ.get("HOOK_PHASE", "post")
    event = "tool_start" if hook_phase == "pre" else "tool_complete"

    # Extract fields - Claude Code hook format
    tool_name = data.get("tool_name", data.get("tool", "unknown"))
    tool_input = data.get("tool_input", data.get("input", {}))
    tool_output = data.get("tool_output", data.get("output", ""))
    session_id = data.get("session_id", "unknown")
    tool_use_id = data.get("tool_use_id", "")
    cwd = data.get("cwd", "")

    # Truncate large inputs/outputs
    if isinstance(tool_input, dict):
        tool_input_str = json.dumps(tool_input)[:5000]
    else:
        tool_input_str = str(tool_input)[:5000]

    if isinstance(tool_output, dict):
        tool_response_str = json.dumps(tool_output)[:5000]
    else:
        tool_response_str = str(tool_output)[:5000]

    print(json.dumps({
        "parsed": True,
        "event": event,
        "tool": tool_name,
        "input": tool_input_str if event == "tool_start" else None,
        "output": tool_response_str if event == "tool_complete" else None,
        "session": session_id,
        "tool_use_id": tool_use_id,
        "cwd": cwd
    }))
except Exception as e:
    print(json.dumps({"parsed": False, "error": str(e)}))
')

# Check if parsing succeeded
PARSED_OK=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin).get('parsed', False))" 2>/dev/null || echo "False")

if [ "$PARSED_OK" != "True" ]; then
  # Fallback: log raw input for debugging
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  export TIMESTAMP="$timestamp"
  echo "$INPUT_JSON" | python3 -c "
import json, sys, os
raw = sys.stdin.read()[:2000]
print(json.dumps({'timestamp': os.environ['TIMESTAMP'], 'event': 'parse_error', 'raw': raw}))
" >> "$OBSERVATIONS_FILE"
  exit 0
fi

# Archive if file too large (atomic: rename with unique suffix to avoid race)
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${PROJECT_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/observations-$(date +%Y%m%d-%H%M%S)-$$.jsonl" 2>/dev/null || true
  fi
fi

# Build and write observation (now includes project context)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

export PROJECT_ID_ENV="$PROJECT_ID"
export PROJECT_NAME_ENV="$PROJECT_NAME"
export TIMESTAMP="$timestamp"

echo "$PARSED" | python3 -c "
import json, sys, os

parsed = json.load(sys.stdin)
observation = {
    'timestamp': os.environ['TIMESTAMP'],
    'event': parsed['event'],
    'tool': parsed['tool'],
    'session': parsed['session'],
    'project_id': os.environ.get('PROJECT_ID_ENV', 'global'),
    'project_name': os.environ.get('PROJECT_NAME_ENV', 'global')
}

if parsed['input']:
    observation['input'] = parsed['input']
if parsed['output'] is not None:
    observation['output'] = parsed['output']

print(json.dumps(observation))
" >> "$OBSERVATIONS_FILE"

# Signal observer if running (check both project-scoped and global observer)
for pid_file in "${PROJECT_DIR}/.observer.pid" "${CONFIG_DIR}/.observer.pid"; do
  if [ -f "$pid_file" ]; then
    observer_pid=$(cat "$pid_file")
    if kill -0 "$observer_pid" 2>/dev/null; then
      kill -USR1 "$observer_pid" 2>/dev/null || true
    fi
  fi
done

exit 0
