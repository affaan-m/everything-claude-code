#!/usr/bin/env bash
# Continuous Learning v2 - Observer background loop

set +e
unset CLAUDECODE

SLEEP_PID=""
USR1_FIRED=0

cleanup() {
  [ -n "$SLEEP_PID" ] && kill "$SLEEP_PID" 2>/dev/null
  if [ -f "$PID_FILE" ] && [ "$(cat "$PID_FILE" 2>/dev/null)" = "$$" ]; then
    rm -f "$PID_FILE"
  fi
  exit 0
}
trap cleanup TERM INT

analyze_observations() {
  if [ ! -f "$OBSERVATIONS_FILE" ]; then
    return
  fi

  obs_count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0)
  if [ "$obs_count" -lt "$MIN_OBSERVATIONS" ]; then
    return
  fi

  echo "[$(date)] Analyzing $obs_count observations for project ${PROJECT_NAME}..." >> "$LOG_FILE"

  if [ "${CLV2_IS_WINDOWS:-false}" = "true" ] && [ "${ECC_OBSERVER_ALLOW_WINDOWS:-false}" != "true" ]; then
    echo "[$(date)] Skipping claude analysis on Windows due to known non-interactive hang issue (#295). Set ECC_OBSERVER_ALLOW_WINDOWS=true to override." >> "$LOG_FILE"
    return
  fi

  if ! command -v claude >/dev/null 2>&1; then
    echo "[$(date)] claude CLI not found, skipping analysis" >> "$LOG_FILE"
    return
  fi

  prompt_file="$(mktemp "${TMPDIR:-/tmp}/ecc-observer-prompt.XXXXXX")"
  cat > "$prompt_file" <<PROMPT
Read ${OBSERVATIONS_FILE} and identify patterns for the project ${PROJECT_NAME} (user corrections, error resolutions, repeated workflows, tool preferences).
If you find 3+ occurrences of the same pattern, create an instinct file in ${INSTINCTS_DIR}/<id>.md.

CRITICAL: Every instinct file MUST use this exact format:

---
id: kebab-case-name
trigger: when <specific condition>
confidence: <0.3-0.85 based on frequency: 3-5 times=0.5, 6-10=0.7, 11+=0.85>
domain: <one of: code-style, testing, git, debugging, workflow, file-patterns>
source: session-observation
scope: project
project_id: ${PROJECT_ID}
project_name: ${PROJECT_NAME}
---

# Title

## Action
<what to do, one clear sentence>

## Evidence
- Observed N times in session <id>
- Pattern: <description>
- Last observed: <date>

Rules:
- Be conservative, only clear patterns with 3+ observations
- Use narrow, specific triggers
- Never include actual code snippets, only describe patterns
- If a similar instinct already exists in ${INSTINCTS_DIR}/, update it instead of creating a duplicate
- The YAML frontmatter (between --- markers) with id field is MANDATORY
- If a pattern seems universal (not project-specific), set scope to global instead of project
- Examples of global patterns: always validate user input, prefer explicit error handling
- Examples of project patterns: use React functional components, follow Django REST framework conventions
PROMPT

  timeout_seconds="${ECC_OBSERVER_TIMEOUT_SECONDS:-120}"
  max_turns="${ECC_OBSERVER_MAX_TURNS:-10}"
  exit_code=0

  case "$max_turns" in
    ''|*[!0-9]*)
      max_turns=10
      ;;
  esac

  if [ "$max_turns" -lt 4 ]; then
    max_turns=10
  fi

  claude --model haiku --max-turns "$max_turns" --print < "$prompt_file" >> "$LOG_FILE" 2>&1 &
  claude_pid=$!

  (
    sleep "$timeout_seconds"
    if kill -0 "$claude_pid" 2>/dev/null; then
      echo "[$(date)] Claude analysis timed out after ${timeout_seconds}s; terminating process" >> "$LOG_FILE"
      kill "$claude_pid" 2>/dev/null || true
    fi
  ) &
  watchdog_pid=$!

  wait "$claude_pid"
  exit_code=$?
  kill "$watchdog_pid" 2>/dev/null || true
  rm -f "$prompt_file"

  if [ "$exit_code" -ne 0 ]; then
    echo "[$(date)] Claude analysis failed (exit $exit_code)" >> "$LOG_FILE"
  fi

  if [ -f "$OBSERVATIONS_FILE" ]; then
    archive_dir="${PROJECT_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/processed-$(date +%Y%m%d-%H%M%S)-$$.jsonl" 2>/dev/null || true
  fi
}

on_usr1() {
  [ -n "$SLEEP_PID" ] && kill "$SLEEP_PID" 2>/dev/null
  SLEEP_PID=""
  USR1_FIRED=1
  analyze_observations
}
trap on_usr1 USR1

echo "$$" > "$PID_FILE"
echo "[$(date)] Observer started for ${PROJECT_NAME} (PID: $$)" >> "$LOG_FILE"

while true; do
  sleep "$OBSERVER_INTERVAL_SECONDS" &
  SLEEP_PID=$!
  wait "$SLEEP_PID" 2>/dev/null
  SLEEP_PID=""

  if [ "$USR1_FIRED" -eq 1 ]; then
    USR1_FIRED=0
  else
    analyze_observations
  fi
done
