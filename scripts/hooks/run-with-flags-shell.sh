#!/usr/bin/env bash
set -euo pipefail

HOOK_ID="${1:-}"
REL_SCRIPT_PATH="${2:-}"
PROFILES_CSV="${3:-standard,strict}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"

# Preserve stdin for passthrough or script execution
INPUT="$(cat)"

if [[ -z "$HOOK_ID" || -z "$REL_SCRIPT_PATH" ]]; then
  printf '%s' "$INPUT"
  exit 0
fi

# Ask Node helper if this hook is enabled
ENABLED="$(node "${PLUGIN_ROOT}/scripts/hooks/check-hook-enabled.js" "$HOOK_ID" "$PROFILES_CSV" 2>/dev/null || echo yes)"
if [[ "$ENABLED" != "yes" ]]; then
  printf '%s' "$INPUT"
  exit 0
fi

SCRIPT_PATH="${PLUGIN_ROOT}/${REL_SCRIPT_PATH}"
if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "[Hook] Script not found for ${HOOK_ID}: ${SCRIPT_PATH}" >&2
  printf '%s' "$INPUT"
  exit 0
fi

# Extract phase prefix from hook ID (e.g., "pre:observe" -> "pre", "post:observe" -> "post")
# This is needed by scripts like observe.sh that behave differently for PreToolUse vs PostToolUse
HOOK_PHASE="${HOOK_ID%%:*}"

printf '%s' "$INPUT" | "$SCRIPT_PATH" "$HOOK_PHASE"
