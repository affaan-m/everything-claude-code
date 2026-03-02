#!/bin/bash
# Continuous Learning v2 - Observer Agent Launcher
#
# Starts the background observer agent that analyzes observations
# and creates instincts. Uses Haiku model for cost efficiency.
#
# v2.1: Project-scoped — detects current project and analyzes
#       project-specific observations into project-scoped instincts.
#
# Usage:
#   start-observer.sh        # Start observer for current project (or global)
#   start-observer.sh stop   # Stop running observer
#   start-observer.sh status # Check if observer is running

set -e

# NOTE: set -e is disabled inside the background subshell below
# to prevent claude CLI failures from killing the observer loop.

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
CONFIG_FILE="${SKILL_ROOT}/config.json"
# PID file is project-scoped so each project can have its own observer
PID_FILE="${PROJECT_DIR}/.observer.pid"
LOG_FILE="${PROJECT_DIR}/observer.log"
OBSERVATIONS_FILE="${PROJECT_DIR}/observations.jsonl"
INSTINCTS_DIR="${PROJECT_DIR}/instincts/personal"

# Read config values from config.json
OBSERVER_INTERVAL_MINUTES=5
MIN_OBSERVATIONS=20
OBSERVER_ENABLED=false
if [ -f "$CONFIG_FILE" ]; then
  _config=$(CLV2_CONFIG="$CONFIG_FILE" python3 -c "
import json, os
with open(os.environ['CLV2_CONFIG']) as f:
    cfg = json.load(f)
obs = cfg.get('observer', {})
print(obs.get('run_interval_minutes', 5))
print(obs.get('min_observations_to_analyze', 20))
print(str(obs.get('enabled', False)).lower())
" 2>/dev/null || echo "5
20
false")
  _interval=$(echo "$_config" | sed -n '1p')
  _min_obs=$(echo "$_config" | sed -n '2p')
  _enabled=$(echo "$_config" | sed -n '3p')
  if [ "$_interval" -gt 0 ] 2>/dev/null; then
    OBSERVER_INTERVAL_MINUTES="$_interval"
  fi
  if [ "$_min_obs" -gt 0 ] 2>/dev/null; then
    MIN_OBSERVATIONS="$_min_obs"
  fi
  if [ "$_enabled" = "true" ]; then
    OBSERVER_ENABLED=true
  fi
fi
OBSERVER_INTERVAL_SECONDS=$((OBSERVER_INTERVAL_MINUTES * 60))

echo "Project: ${PROJECT_NAME} (${PROJECT_ID})"
echo "Storage: ${PROJECT_DIR}"

case "${1:-start}" in
  stop)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Stopping observer for ${PROJECT_NAME} (PID: $pid)..."
        kill "$pid"
        rm -f "$PID_FILE"
        echo "Observer stopped."
      else
        echo "Observer not running (stale PID file)."
        rm -f "$PID_FILE"
      fi
    else
      echo "Observer not running."
    fi
    exit 0
    ;;

  status)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer is running (PID: $pid)"
        echo "Log: $LOG_FILE"
        echo "Observations: $(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0) lines"
        # Also show instinct count
        instinct_count=$(find "$INSTINCTS_DIR" -name "*.yaml" 2>/dev/null | wc -l)
        echo "Instincts: $instinct_count"
        exit 0
      else
        echo "Observer not running (stale PID file)"
        rm -f "$PID_FILE"
        exit 1
      fi
    else
      echo "Observer not running"
      exit 1
    fi
    ;;

  start)
    # Check if observer is disabled in config
    if [ "$OBSERVER_ENABLED" != "true" ]; then
      echo "Observer is disabled in config.json (observer.enabled: false)."
      echo "Set observer.enabled to true in config.json to enable."
      exit 1
    fi

    # Check if already running
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer already running for ${PROJECT_NAME} (PID: $pid)"
        exit 0
      fi
      rm -f "$PID_FILE"
    fi

    echo "Starting observer agent for ${PROJECT_NAME}..."

    # The observer loop — fully detached with nohup, IO redirected to log.
    # Variables passed safely via env to avoid shell injection from special chars in paths.
    nohup env \
      CONFIG_DIR="$CONFIG_DIR" \
      PID_FILE="$PID_FILE" \
      LOG_FILE="$LOG_FILE" \
      OBSERVATIONS_FILE="$OBSERVATIONS_FILE" \
      INSTINCTS_DIR="$INSTINCTS_DIR" \
      PROJECT_DIR="$PROJECT_DIR" \
      PROJECT_NAME="$PROJECT_NAME" \
      PROJECT_ID="$PROJECT_ID" \
      MIN_OBSERVATIONS="$MIN_OBSERVATIONS" \
      OBSERVER_INTERVAL_SECONDS="$OBSERVER_INTERVAL_SECONDS" \
      /bin/bash -c '
      set +e
      unset CLAUDECODE

      SLEEP_PID=""
      USR1_FIRED=0

      cleanup() {
        [ -n "$SLEEP_PID" ] && kill "$SLEEP_PID" 2>/dev/null
        # Only remove PID file if it still belongs to this process
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

        # Use Claude Code with Haiku to analyze observations
        # The prompt specifies project-scoped instinct creation
        if command -v claude &> /dev/null; then
          exit_code=0
          claude --model haiku --max-turns 3 --print \
            "Read $OBSERVATIONS_FILE and identify patterns for the project '${PROJECT_NAME}' (user corrections, error resolutions, repeated workflows, tool preferences).
If you find 3+ occurrences of the same pattern, create an instinct file in $INSTINCTS_DIR/<id>.md.

CRITICAL: Every instinct file MUST use this exact format:

---
id: kebab-case-name
trigger: \"when <specific condition>\"
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
- If a similar instinct already exists in $INSTINCTS_DIR/, update it instead of creating a duplicate
- The YAML frontmatter (between --- markers) with id field is MANDATORY
- If a pattern seems universal (not project-specific), set scope to 'global' instead of 'project'
- Examples of global patterns: 'always validate user input', 'prefer explicit error handling'
- Examples of project patterns: 'use React functional components', 'follow Django REST framework conventions'" \
            >> "$LOG_FILE" 2>&1 || exit_code=$?
          if [ "$exit_code" -ne 0 ]; then
            echo "[$(date)] Claude analysis failed (exit $exit_code)" >> "$LOG_FILE"
          fi
        else
          echo "[$(date)] claude CLI not found, skipping analysis" >> "$LOG_FILE"
        fi

        if [ -f "$OBSERVATIONS_FILE" ]; then
          archive_dir="${PROJECT_DIR}/observations.archive"
          mkdir -p "$archive_dir"
          mv "$OBSERVATIONS_FILE" "$archive_dir/processed-$(date +%Y%m%d-%H%M%S)-$$.jsonl" 2>/dev/null || true
        fi
      }

      on_usr1() {
        # Kill pending sleep to avoid leak, then analyze
        [ -n "$SLEEP_PID" ] && kill "$SLEEP_PID" 2>/dev/null
        SLEEP_PID=""
        USR1_FIRED=1
        analyze_observations
      }
      trap on_usr1 USR1

      echo "$$" > "$PID_FILE"
      echo "[$(date)] Observer started for ${PROJECT_NAME} (PID: $$)" >> "$LOG_FILE"

      while true; do
        # Interruptible sleep — allows USR1 trap to fire immediately
        sleep "$OBSERVER_INTERVAL_SECONDS" &
        SLEEP_PID=$!
        wait $SLEEP_PID 2>/dev/null
        SLEEP_PID=""

        # Skip scheduled analysis if USR1 already ran it
        if [ "$USR1_FIRED" -eq 1 ]; then
          USR1_FIRED=0
        else
          analyze_observations
        fi
      done
    ' >> "$LOG_FILE" 2>&1 &

    # Wait for PID file
    sleep 2

    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer started (PID: $pid)"
        echo "Log: $LOG_FILE"
      else
        echo "Failed to start observer (process died immediately, check $LOG_FILE)"
        exit 1
      fi
    else
      echo "Failed to start observer"
      exit 1
    fi
    ;;

  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
