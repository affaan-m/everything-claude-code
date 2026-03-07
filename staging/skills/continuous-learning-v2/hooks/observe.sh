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

# Extract cwd from the hook JSON using bash pattern matching (no python3 spawn).
# Handles the common case where "cwd" is a simple path string in the JSON.
STDIN_CWD=$(echo "$INPUT_JSON" | grep -o '"cwd" *: *"[^"]*"' | head -1 | sed 's/.*: *"//;s/"$//' 2>/dev/null || echo "")

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

# Archive if file too large (atomic: rename with unique suffix to avoid race)
if [ -f "$OBSERVATIONS_FILE" ]; then
  file_size_mb=$(du -m "$OBSERVATIONS_FILE" 2>/dev/null | cut -f1)
  if [ "${file_size_mb:-0}" -ge "$MAX_FILE_SIZE_MB" ]; then
    archive_dir="${PROJECT_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/observations-$(date +%Y%m%d-%H%M%S)-$$.jsonl" 2>/dev/null || true
  fi
fi

# ─────────────────────────────────────────────
# Single python3 call: parse, scrub, build observation, output
# ─────────────────────────────────────────────
# Consolidates what was previously 4 separate python3 invocations
# (parse, check-parsed, error-fallback, write-observation) into one.
# Also scrubs sensitive data before writing (Issue: raw credentials could leak).

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "$INPUT_JSON" | \
  HOOK_PHASE="$HOOK_PHASE" \
  TIMESTAMP="$timestamp" \
  PROJECT_ID_ENV="$PROJECT_ID" \
  PROJECT_NAME_ENV="$PROJECT_NAME" \
  python3 -c '
import json, sys, os, re

SENSITIVE_PATTERN = re.compile(
    r"""(sk-[A-Za-z0-9_-]{10,})"""          # OpenAI/Anthropic-style keys
    r"""|([A-Za-z0-9_-]*(password|secret|token|credential|api_key|apikey|auth)[A-Za-z0-9_-]*\s*[=:]\s*\S+)"""
    r"""|("(password|secret|token|credential|api_key|apikey|auth)"\s*:\s*"[^"]*")""",
    re.IGNORECASE
)

def scrub(text):
    """Redact strings that look like secrets, tokens, or credentials."""
    if not text:
        return text
    return SENSITIVE_PATTERN.sub("[REDACTED]", text)

timestamp = os.environ["TIMESTAMP"]
project_id = os.environ.get("PROJECT_ID_ENV", "global")
project_name = os.environ.get("PROJECT_NAME_ENV", "global")

raw_input = sys.stdin.read()

try:
    data = json.loads(raw_input)

    hook_phase = os.environ.get("HOOK_PHASE", "post")
    event = "tool_start" if hook_phase == "pre" else "tool_complete"

    tool_name = data.get("tool_name", data.get("tool", "unknown"))
    tool_input = data.get("tool_input", data.get("input", {}))
    tool_output = data.get("tool_output", data.get("output", ""))
    session_id = data.get("session_id", "unknown")

    # Truncate large inputs/outputs
    if isinstance(tool_input, dict):
        tool_input_str = json.dumps(tool_input)[:5000]
    else:
        tool_input_str = str(tool_input)[:5000]

    if isinstance(tool_output, dict):
        tool_response_str = json.dumps(tool_output)[:5000]
    else:
        tool_response_str = str(tool_output)[:5000]

    # Build observation
    observation = {
        "timestamp": timestamp,
        "event": event,
        "tool": tool_name,
        "session": session_id,
        "project_id": project_id,
        "project_name": project_name
    }

    if event == "tool_start" and tool_input_str:
        observation["input"] = scrub(tool_input_str)
    if event == "tool_complete" and tool_response_str:
        observation["output"] = scrub(tool_response_str)

    print(json.dumps(observation))

except Exception:
    # Parse failure fallback — scrub raw input before logging
    safe_raw = scrub(raw_input[:2000])
    print(json.dumps({"timestamp": timestamp, "event": "parse_error", "raw": safe_raw}))
' >> "$OBSERVATIONS_FILE"

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
