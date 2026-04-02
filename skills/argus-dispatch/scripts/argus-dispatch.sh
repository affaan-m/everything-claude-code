#!/bin/bash
# argus-dispatch.sh — Dispatch tasks to external AI CLIs as autonomous agents
# Part of the Argus multi-model review system by Chris Yau (@chris-yyau)
#
# Usage:
#   argus-dispatch.sh --cli codex|gemini|both [--mode readonly|auto] [--timeout SECS] [--model MODEL] --prompt "..."
#   echo "task" | argus-dispatch.sh --cli codex

set -euo pipefail

LOG_DIR="$HOME/.claude/argus"
LOG_FILE="$LOG_DIR/dispatch-log.jsonl"

# ── Defaults ───────────────────────────────────
CLI="auto"
MODE="readonly"
TIMEOUT=300
MODEL=""
PROMPT=""

# ── Parse args ─────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --cli)     CLI="$2";     shift 2 ;;
        --mode)    MODE="$2";    shift 2 ;;
        --timeout) TIMEOUT="$2"; shift 2 ;;
        --model)   MODEL="$2";   shift 2 ;;
        --prompt)  PROMPT="$2";  shift 2 ;;
        -h|--help)
            cat <<'USAGE'
argus-dispatch.sh — Dispatch tasks to external AI CLIs
Part of the Argus multi-model review system.

FLAGS:
  --cli     codex|gemini|droid|amp|opencode|both|all|auto  (default: auto)
  --mode    readonly|auto           (default: readonly)
  --timeout seconds                 (default: 300)
  --model   model override          (optional)
  --prompt  "task description"      (or pipe via stdin)
USAGE
            exit 0 ;;
        *) echo "Unknown: $1" >&2; exit 1 ;;
    esac
done

# Read prompt from stdin if not provided via flag
if [[ -z "$PROMPT" ]]; then
    if [[ ! -t 0 ]]; then
        if command -v timeout &>/dev/null; then
            PROMPT=$(timeout 5 cat 2>/dev/null || true)
        else
            PROMPT=$(perl -e 'alarm 5; while(<STDIN>){print}' 2>/dev/null || cat 2>/dev/null || true)
        fi
    else
        echo "Error: No prompt. Use --prompt or pipe via stdin." >&2
        exit 1
    fi
fi
[[ -z "$PROMPT" ]] && { echo "Error: Empty prompt." >&2; exit 1; }

# Write prompt to temp file (avoids shell escaping with long prompts)
PROMPT_FILE=$(mktemp "${TMPDIR:-/tmp}/argus-dispatch-prompt-XXXXXX")
printf '%s' "$PROMPT" > "$PROMPT_FILE"
trap 'rm -f "$PROMPT_FILE"' EXIT

# ── Portable timeout ──────────────────────────
_portable_timeout() {
    if command -v timeout &>/dev/null; then
        timeout "$@"
    elif command -v gtimeout &>/dev/null; then
        gtimeout "$@"
    else
        # macOS fallback: use perl alarm
        local secs="$1"; shift
        perl -e "alarm $secs; exec @ARGV" -- "$@"
    fi
}

# ── CLI detection ──────────────────────────────
_has_cli() { command -v "$1" &>/dev/null; }

if [[ "$CLI" == "auto" ]]; then
    if _has_cli codex; then CLI="codex"
    elif _has_cli gemini; then CLI="gemini"
    elif _has_cli droid; then CLI="droid"
    elif _has_cli amp; then CLI="amp"
    elif _has_cli opencode; then CLI="opencode"
    else echo "Error: No supported CLI found (tried codex, gemini, droid, amp, opencode)." >&2; exit 1; fi
elif [[ "$CLI" != "codex" && "$CLI" != "gemini" && "$CLI" != "droid" && "$CLI" != "amp" && "$CLI" != "opencode" && "$CLI" != "both" && "$CLI" != "all" ]]; then
    echo "Error: Invalid --cli value '$CLI'. Must be codex|gemini|droid|amp|opencode|both|all|auto." >&2; exit 1
fi

# Validate mode
[[ "$MODE" != "readonly" && "$MODE" != "auto" ]] && { echo "Error: Invalid --mode '$MODE'. Must be readonly|auto." >&2; exit 1; }

# Validate timeout is a positive integer
if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]] || [[ "$TIMEOUT" -eq 0 ]]; then
    echo "Error: --timeout must be a positive integer (got '$TIMEOUT')." >&2; exit 1
fi

# Validate availability — "both" mode degrades gracefully
if [[ "$CLI" == "both" ]]; then
    if ! _has_cli codex && ! _has_cli gemini; then
        echo "Error: Neither codex nor gemini found." >&2; exit 1
    elif ! _has_cli codex; then
        echo "Warning: codex not found, falling back to gemini only." >&2
        CLI="gemini"
    elif ! _has_cli gemini; then
        echo "Warning: gemini not found, falling back to codex only." >&2
        CLI="codex"
    fi
else
    [[ "$CLI" == "codex" ]] && ! _has_cli codex && { echo "Error: codex not found." >&2; exit 1; }
    [[ "$CLI" == "gemini" ]] && ! _has_cli gemini && { echo "Error: gemini not found." >&2; exit 1; }
    [[ "$CLI" == "droid" ]] && ! _has_cli droid && { echo "Error: droid not found." >&2; exit 1; }
    [[ "$CLI" == "amp" ]] && ! _has_cli amp && { echo "Error: amp not found." >&2; exit 1; }
    [[ "$CLI" == "opencode" ]] && ! _has_cli opencode && { echo "Error: opencode not found." >&2; exit 1; }
fi

# Handle --cli all: discover top 3 available CLIs
if [[ "$CLI" == "all" ]]; then
    ALL_CLIS=()
    for c in codex gemini droid amp opencode; do
        _has_cli "$c" && ALL_CLIS+=("$c")
        [[ ${#ALL_CLIS[@]} -ge 3 ]] && break
    done
    if [[ ${#ALL_CLIS[@]} -eq 0 ]]; then
        echo "Error: No CLIs found for --cli all." >&2; exit 1
    fi
fi

# ── Helpers ────────────────────────────────────
strip_ansi() {
    perl -pe 's/\e\[[0-9;]*[a-zA-Z]//g' 2>/dev/null || cat
}

log_event() {
    mkdir -p "$LOG_DIR"
    local ts
    ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    printf '{"ts":"%s","cli":"%s","mode":"%s","status":"%s","duration":%s,"prompt_len":%d,"output_file":"%s"}\n' \
        "$ts" "$1" "$MODE" "$2" "$3" "${#PROMPT}" "$4" >> "$LOG_FILE" 2>/dev/null || true
}

# ── Single-CLI dispatch ───────────────────────
dispatch_one() {
    local name="$1" outfile="$2" meta="${2}.meta"
    local start exit_code=0
    start=$(date +%s)

    case "$name" in
        codex)
            if [[ "$MODE" == "auto" ]]; then
                _portable_timeout "$TIMEOUT" codex exec --full-auto ${MODEL:+-m "$MODEL"} - \
                    < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$?
            else
                _portable_timeout "$TIMEOUT" codex exec -s read-only ${MODEL:+-m "$MODEL"} - \
                    < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$?
            fi ;;
        gemini)
            if [[ "$MODE" == "auto" ]]; then
                _portable_timeout "$TIMEOUT" gemini -y ${MODEL:+-m "$MODEL"} \
                    < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$?
            else
                _portable_timeout "$TIMEOUT" gemini ${MODEL:+-m "$MODEL"} \
                    < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$?
            fi ;;
        droid)
            if [[ "$MODE" == "auto" ]]; then
                _portable_timeout "$TIMEOUT" droid exec --auto low \
                    < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$?
            else
                _portable_timeout "$TIMEOUT" droid exec \
                    < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$?
            fi ;;
        amp)
            local amp_tmp
            amp_tmp=$(mktemp "${TMPDIR:-/tmp}/argus-amp-XXXXXX")
            cp "$PROMPT_FILE" "$amp_tmp"
            _portable_timeout "$TIMEOUT" amp review --instructions "$amp_tmp" \
                > "$outfile" 2>&1 || exit_code=$?
            rm -f "$amp_tmp" ;;
        opencode)
            _portable_timeout "$TIMEOUT" opencode \
                < "$PROMPT_FILE" > "$outfile" 2>&1 || exit_code=$? ;;
    esac

    local duration=$(( $(date +%s) - start ))

    # Clean ANSI escape codes
    if [[ -f "$outfile" ]]; then
        strip_ansi < "$outfile" > "${outfile}.clean" && mv "${outfile}.clean" "$outfile"
    fi

    # Determine status
    local status="success"
    [[ $exit_code -eq 124 ]] && status="timeout"
    [[ $exit_code -ne 0 && $exit_code -ne 124 ]] && status="error"

    echo "${status}|${duration}|${exit_code}" > "$meta"
}

# ── Read meta helper ───────────────────────────
read_meta() {
    cat "$1" 2>/dev/null || echo "error|0|1"
}

# ── Execute ────────────────────────────────────
STAMP="$(date +%s)-$$"
OUT_DIR="${TMPDIR:-/tmp}"

if [[ "$CLI" == "both" ]]; then
    CODEX_OUT="${OUT_DIR}/argus-codex-${STAMP}.txt"
    GEMINI_OUT="${OUT_DIR}/argus-gemini-${STAMP}.txt"

    echo "Dispatching to Codex + Gemini in parallel (${MODE}, ${TIMEOUT}s timeout)..." >&2

    dispatch_one "codex"  "$CODEX_OUT" &
    dispatch_one "gemini" "$GEMINI_OUT" &
    wait

    CMETA=$(read_meta "${CODEX_OUT}.meta");  rm -f "${CODEX_OUT}.meta"
    GMETA=$(read_meta "${GEMINI_OUT}.meta"); rm -f "${GEMINI_OUT}.meta"

    CS=$(echo "$CMETA" | cut -d'|' -f1); CD=$(echo "$CMETA" | cut -d'|' -f2)
    GS=$(echo "$GMETA" | cut -d'|' -f1); GD=$(echo "$GMETA" | cut -d'|' -f2)

    echo "═══════════════════════════════════════════════════════"
    echo "  CODEX  (${CS}, ${CD}s)"
    echo "═══════════════════════════════════════════════════════"
    [[ -f "$CODEX_OUT" ]] && cat "$CODEX_OUT" || echo "(no output)"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  GEMINI  (${GS}, ${GD}s)"
    echo "═══════════════════════════════════════════════════════"
    [[ -f "$GEMINI_OUT" ]] && cat "$GEMINI_OUT" || echo "(no output)"

    log_event "codex"  "$CS" "$CD" "$CODEX_OUT"
    log_event "gemini" "$GS" "$GD" "$GEMINI_OUT"

    echo "" >&2
    echo "Saved: codex → ${CODEX_OUT}  |  gemini → ${GEMINI_OUT}" >&2

    [[ "$CS" == "error" || "$CS" == "timeout" || "$GS" == "error" || "$GS" == "timeout" ]] && exit 1

elif [[ "$CLI" == "all" ]]; then
    echo "Dispatching to ${#ALL_CLIS[@]} CLIs: ${ALL_CLIS[*]} (${MODE}, ${TIMEOUT}s timeout)..." >&2

    ALL_OUTS=()
    for c in "${ALL_CLIS[@]}"; do
        outfile="${OUT_DIR}/argus-${c}-${STAMP}.txt"
        ALL_OUTS+=("$outfile")
        dispatch_one "$c" "$outfile" &
    done
    wait

    any_failed=false
    idx=0
    for c in "${ALL_CLIS[@]}"; do
        outfile="${ALL_OUTS[$idx]}"
        META=$(read_meta "${outfile}.meta"); rm -f "${outfile}.meta"
        STATUS=$(echo "$META" | cut -d'|' -f1); DURATION=$(echo "$META" | cut -d'|' -f2)
        echo "═══════════════════════════════════════════════════════"
        echo "  $(echo "$c" | tr '[:lower:]' '[:upper:]')  (${STATUS}, ${DURATION}s)"
        echo "═══════════════════════════════════════════════════════"
        [[ -f "$outfile" ]] && cat "$outfile" || echo "(no output)"
        echo ""
        log_event "$c" "$STATUS" "$DURATION" "$outfile"
        [[ "$STATUS" == "error" || "$STATUS" == "timeout" ]] && any_failed=true
        idx=$((idx + 1))
    done

    echo "" >&2
    echo "Saved outputs to ${OUT_DIR}/argus-*-${STAMP}.txt" >&2
    [[ "$any_failed" == "true" ]] && exit 1

else
    OUTFILE="${OUT_DIR}/argus-${CLI}-${STAMP}.txt"

    echo "Dispatching to ${CLI} (${MODE}, ${TIMEOUT}s timeout)..." >&2

    dispatch_one "$CLI" "$OUTFILE"
    META=$(read_meta "${OUTFILE}.meta"); rm -f "${OUTFILE}.meta"

    STATUS=$(echo "$META" | cut -d'|' -f1)
    DURATION=$(echo "$META" | cut -d'|' -f2)
    EXIT_CODE=$(echo "$META" | cut -d'|' -f3)

    [[ -f "$OUTFILE" ]] && cat "$OUTFILE"

    log_event "$CLI" "$STATUS" "$DURATION" "$OUTFILE"

    echo "" >&2
    echo "${CLI} → ${STATUS} (${DURATION}s) | saved: ${OUTFILE}" >&2

    exit "${EXIT_CODE}"
fi
