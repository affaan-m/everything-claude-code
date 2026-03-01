#!/bin/bash
# Continuous Learning v2 - Observer Agent Launcher
#
# Starts the background observer agent that analyzes observations
# and creates instincts. Uses Haiku model for cost efficiency.
#
# Usage:
#   start-observer.sh        # Start observer in background
#   start-observer.sh stop   # Stop running observer
#   start-observer.sh status # Check if observer is running

set -e

# NOTE: set -e is disabled inside the background subshell below
# to prevent claude CLI failures from killing the observer loop.

CONFIG_DIR="${HOME}/.claude/homunculus"
PID_FILE="${CONFIG_DIR}/.observer.pid"
LOG_FILE="${CONFIG_DIR}/observer.log"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"

mkdir -p "$CONFIG_DIR"

case "${1:-start}" in
  stop)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Stopping observer (PID: $pid)..."
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
    # Check if already running
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer already running (PID: $pid)"
        exit 0
      fi
      rm -f "$PID_FILE"
    fi

    echo "Starting observer agent..."

    # The observer loop — fully detached with nohup, IO redirected to log.
    # Variables passed safely via env to avoid shell injection from special chars in paths.
    nohup env \
      CONFIG_DIR="$CONFIG_DIR" \
      PID_FILE="$PID_FILE" \
      LOG_FILE="$LOG_FILE" \
      OBSERVATIONS_FILE="$OBSERVATIONS_FILE" \
      /bin/bash -c '
      set +e
      unset CLAUDECODE

      SLEEP_PID=""
      USR1_FIRED=0

      cleanup() {
        [ -n "$SLEEP_PID" ] && kill "$SLEEP_PID" 2>/dev/null
        rm -f "$PID_FILE"
        exit 0
      }
      trap cleanup TERM INT

      analyze_observations() {
        if [ ! -f "$OBSERVATIONS_FILE" ]; then
          return
        fi
        obs_count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null || echo 0)
        if [ "$obs_count" -lt 10 ]; then
          return
        fi

        echo "[$(date)] Analyzing $obs_count observations..." >> "$LOG_FILE"

        if command -v claude &> /dev/null; then
          exit_code=0
          claude --model haiku --max-turns 3 --print \
            "Read $OBSERVATIONS_FILE and identify patterns (user corrections, error resolutions, repeated workflows, tool preferences). If you find 3+ occurrences of the same pattern, create an instinct file in $CONFIG_DIR/instincts/personal/<id>.md.

CRITICAL: Every instinct file MUST use this exact format:

---
id: kebab-case-name
trigger: \"when <specific condition>\"
confidence: <0.3-0.85 based on frequency: 3-5 times=0.5, 6-10=0.7, 11+=0.85>
domain: <one of: code-style, testing, git, debugging, workflow, file-patterns>
source: session-observation
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
- If a similar instinct already exists in $CONFIG_DIR/instincts/personal/, update it instead of creating a duplicate
- The YAML frontmatter (between --- markers) with id field is MANDATORY" \
            >> "$LOG_FILE" 2>&1 || exit_code=$?
          if [ "$exit_code" -ne 0 ]; then
            echo "[$(date)] Claude analysis failed (exit $exit_code)" >> "$LOG_FILE"
          fi
        else
          echo "[$(date)] claude CLI not found, skipping analysis" >> "$LOG_FILE"
        fi

        if [ -f "$OBSERVATIONS_FILE" ]; then
          archive_dir="${CONFIG_DIR}/observations.archive"
          mkdir -p "$archive_dir"
          mv "$OBSERVATIONS_FILE" "$archive_dir/processed-$(date +%Y%m%d-%H%M%S).jsonl" 2>/dev/null || true
          touch "$OBSERVATIONS_FILE"
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

      echo $$ > "$PID_FILE"
      echo "[$(date)] Observer started (PID: $$)" >> "$LOG_FILE"

      while true; do
        sleep 300 &
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
