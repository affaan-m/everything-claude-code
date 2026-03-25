#!/usr/bin/env bash
# Continuous Learning v2 - Observer background loop
#
# Fix for #521: Added re-entrancy guard, cooldown throttle, and
# tail-based sampling to prevent memory explosion from runaway
# parallel Claude analysis processes.

set +e
unset CLAUDECODE

SLEEP_PID=""
USR1_FIRED=0
ANALYZING=0
LAST_ANALYSIS_EPOCH=0
# Minimum seconds between analyses (prevents rapid re-triggering)
ANALYSIS_COOLDOWN="${ECC_OBSERVER_ANALYSIS_COOLDOWN:-60}"

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

  # session-guardian: gate observer cycle (active hours, cooldown, idle detection)
  if ! bash "$(dirname "$0")/session-guardian.sh"; then
    echo "[$(date)] Observer cycle skipped by session-guardian" >> "$LOG_FILE"
    return
  fi

  # Sample recent observations instead of loading the entire file (#521).
  # This prevents multi-MB payloads from being passed to the LLM.
  MAX_ANALYSIS_LINES="${ECC_OBSERVER_MAX_ANALYSIS_LINES:-500}"
  observer_tmp_dir="${PROJECT_DIR}/.observer-tmp"
  mkdir -p "$observer_tmp_dir"
  analysis_file="$(mktemp "${observer_tmp_dir}/ecc-observer-analysis.XXXXXX.jsonl")"
  tail -n "$MAX_ANALYSIS_LINES" "$OBSERVATIONS_FILE" > "$analysis_file"
  analysis_count=$(wc -l < "$analysis_file" 2>/dev/null || echo 0)
  echo "[$(date)] Using last $analysis_count of $obs_count observations for analysis" >> "$LOG_FILE"

  prompt_file="$(mktemp "${observer_tmp_dir}/ecc-observer-prompt.XXXXXX")"
  cat > "$prompt_file" <<PROMPT
Read ${analysis_file} and identify patterns for the project ${PROJECT_NAME} (user corrections, error resolutions, repeated workflows, tool preferences).
If you find 3+ occurrences of the same pattern, you MUST write an instinct file directly to ${INSTINCTS_DIR}/<id>.md using the Write tool.
Do NOT ask for permission to write files, do NOT describe what you would write, and do NOT stop at analysis when a qualifying pattern exists.

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
- When a qualifying pattern exists, write or update the instinct file in this run instead of asking for confirmation
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

  # Prevent observe.sh from recording this automated Haiku session as observations
  ECC_SKIP_OBSERVE=1 ECC_HOOK_PROFILE=minimal claude --model haiku --max-turns "$max_turns" --print \
    --allowedTools "Read,Write" \
    < "$prompt_file" >> "$LOG_FILE" 2>&1 &
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
  rm -f "$prompt_file" "$analysis_file"

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

  # Re-entrancy guard: skip if analysis is already running (#521)
  if [ "$ANALYZING" -eq 1 ]; then
    echo "[$(date)] Analysis already in progress, skipping signal" >> "$LOG_FILE"
    return
  fi

  # Cooldown: skip if last analysis was too recent (#521)
  now_epoch=$(date +%s)
  elapsed=$(( now_epoch - LAST_ANALYSIS_EPOCH ))
  if [ "$elapsed" -lt "$ANALYSIS_COOLDOWN" ]; then
    echo "[$(date)] Analysis cooldown active (${elapsed}s < ${ANALYSIS_COOLDOWN}s), skipping" >> "$LOG_FILE"
    return
  fi

  ANALYZING=1
  analyze_observations
  LAST_ANALYSIS_EPOCH=$(date +%s)
  ANALYZING=0
}
trap on_usr1 USR1

echo "$$" > "$PID_FILE"
echo "[$(date)] Observer started for ${PROJECT_NAME} (PID: $$)" >> "$LOG_FILE"

# Prune expired pending instincts before analysis
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"${CLV2_PYTHON_CMD:-python3}" "${SCRIPT_DIR}/../scripts/instinct-cli.py" prune --quiet >> "$LOG_FILE" 2>&1 || echo "[$(date)] Warning: instinct prune failed (non-fatal)" >> "$LOG_FILE"

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
