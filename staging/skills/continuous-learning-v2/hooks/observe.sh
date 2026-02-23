#!/bin/bash
# Continuous Learning v2 - Observation Hook
#
# Captures tool use events for pattern analysis.
# Claude Code passes hook data via stdin as JSON.
#
# SAFETY: This runs on EVERY tool call. Must be fast, safe, and never crash.
# Timeout: 3000ms. Any failure exits 0 (never blocks Claude).

set -e

CONFIG_DIR="${HOME}/.claude/homunculus"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
PARSE_ERRORS_FILE="${CONFIG_DIR}/parse-errors.jsonl"
MAX_FILE_SIZE_MB=10

# Ensure directory exists
mkdir -p "$CONFIG_DIR"

# Skip if disabled
if [ -f "$CONFIG_DIR/disabled" ]; then
  exit 0
fi

# [FIX #3] Read JSON from stdin with size limit (max 100KB)
INPUT_JSON=$(head -c 102400)

# Exit if no input
if [ -z "$INPUT_JSON" ]; then
  exit 0
fi

# Parse using python via stdin pipe (safe for all JSON payloads)
PARSED=$(echo "$INPUT_JSON" | python3 -c '
import json
import sys

try:
    data = json.load(sys.stdin)

    hook_type = data.get("hook_type", "unknown")
    tool_name = data.get("tool_name", data.get("tool", "unknown"))
    tool_input = data.get("tool_input", data.get("input", {}))
    tool_output = data.get("tool_output", data.get("output", ""))
    session_id = data.get("session_id", "unknown")

    if isinstance(tool_input, dict):
        tool_input_str = json.dumps(tool_input)[:5000]
    else:
        tool_input_str = str(tool_input)[:5000]

    if isinstance(tool_output, dict):
        tool_output_str = json.dumps(tool_output)[:5000]
    else:
        tool_output_str = str(tool_output)[:5000]

    event = "tool_start" if "Pre" in hook_type else "tool_complete"

    print(json.dumps({
        "parsed": True,
        "event": event,
        "tool": tool_name,
        "input": tool_input_str if event == "tool_start" else None,
        "output": tool_output_str if event == "tool_complete" else None,
        "session": session_id
    }))
except Exception as e:
    print(json.dumps({"parsed": False, "error": str(e)}))
')

# Check if parsing succeeded
PARSED_OK=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin).get('parsed', False))")

if [ "$PARSED_OK" != "True" ]; then
  # [FIX #6] Log parse errors to separate file (don't pollute observations)
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  export TIMESTAMP="$timestamp"
  echo "$INPUT_JSON" | python3 -c "
import json, sys, os
raw = sys.stdin.read()[:2000]
print(json.dumps({'timestamp': os.environ['TIMESTAMP'], 'event': 'parse_error', 'raw': raw}))
" >> "$PARSE_ERRORS_FILE" 2>/dev/null || true
  exit 0
fi

# Archive if file too large
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${CONFIG_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/observations-$(date +%Y%m%d-%H%M%S).jsonl"
  fi
fi

# Build observation JSON
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
export TIMESTAMP="$timestamp"
OBSERVATION=$(echo "$PARSED" | python3 -c "
import json, sys, os

parsed = json.load(sys.stdin)
observation = {
    'timestamp': os.environ['TIMESTAMP'],
    'event': parsed['event'],
    'tool': parsed['tool'],
    'session': parsed['session']
}

if parsed['input']:
    observation['input'] = parsed['input']
if parsed['output']:
    observation['output'] = parsed['output']

print(json.dumps(observation))
")

# [FIX #2] Write with shlock to prevent concurrent write corruption
LOCK_FILE="${CONFIG_DIR}/.observations.lock"
if shlock -f "$LOCK_FILE" -p $$ 2>/dev/null; then
  echo "$OBSERVATION" >> "$OBSERVATIONS_FILE"
  rm -f "$LOCK_FILE"
else
  # Lock contention — skip this observation rather than block Claude
  exit 0
fi

# Signal observer if running
OBSERVER_PID_FILE="${CONFIG_DIR}/.observer.pid"
if [ -f "$OBSERVER_PID_FILE" ]; then
  observer_pid=$(cat "$OBSERVER_PID_FILE")
  if kill -0 "$observer_pid" 2>/dev/null; then
    kill -USR1 "$observer_pid" 2>/dev/null || true
  fi
fi

exit 0
