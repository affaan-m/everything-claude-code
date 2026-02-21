#!/usr/bin/env bash
# bootstrap.sh — Master orchestration script for everything-claude-code
# Usage: ./bootstrap.sh [--skip-deps] [--skip-env] [--skip-build] [--non-interactive]
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="${REPO_ROOT}/logs"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="${LOGS_DIR}/bootstrap-${TIMESTAMP}.log"
SCRIPTS_DIR="${REPO_ROOT}/scripts"

# ─── ANSI Colors ──────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Options ──────────────────────────────────────────────────────────────────
SKIP_DEPS=false
SKIP_ENV=false
SKIP_BUILD=false
NON_INTERACTIVE=false

for arg in "$@"; do
  case "$arg" in
    --skip-deps)        SKIP_DEPS=true ;;
    --skip-env)         SKIP_ENV=true ;;
    --skip-build)       SKIP_BUILD=true ;;
    --non-interactive)  NON_INTERACTIVE=true ;;
  esac
done

export NON_INTERACTIVE

# ─── Logging ──────────────────────────────────────────────────────────────────
mkdir -p "${LOGS_DIR}"

log() {
  local level="$1"; shift
  local stage="${1:-bootstrap}"; shift || true
  local msg="$*"
  local ts; ts="$(date +%Y-%m-%dT%H:%M:%S)"
  local line="${ts} [${level}] [${stage}] ${msg}"
  echo "${line}" >> "${LOG_FILE}"

  case "${level}" in
    RUNNING) echo -e "${CYAN}⟳${NC}  ${BOLD}[${stage}]${NC} ${msg}" ;;
    OK)      echo -e "${GREEN}✅${NC} ${BOLD}[${stage}]${NC} ${msg}" ;;
    WARN)    echo -e "${YELLOW}⚠${NC}  ${BOLD}[${stage}]${NC} ${msg}" ;;
    FAIL)    echo -e "${RED}❌${NC} ${BOLD}[${stage}]${NC} ${msg}" ;;
    INFO)    echo -e "   ${BOLD}[${stage}]${NC} ${msg}" ;;
  esac
}

run_stage() {
  local stage="$1"
  local script="$2"
  shift 2

  log RUNNING "${stage}" "Starting…"
  if bash "${script}" "$@" >> "${LOG_FILE}" 2>&1; then
    log OK "${stage}" "Completed successfully"
  else
    log FAIL "${stage}" "Stage failed — see ${LOG_FILE} for details"
    exit 1
  fi
}

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║   Everything Claude Code — Bootstrap Pipeline    ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   Log file: ${CYAN}${LOG_FILE}${NC}"
echo ""

log INFO "bootstrap" "Repo root: ${REPO_ROOT}"
log INFO "bootstrap" "Timestamp: ${TIMESTAMP}"

# ─── Stage 1: Dependency Resolution ───────────────────────────────────────────
if [[ "${SKIP_DEPS}" == "false" ]]; then
  run_stage "check-deps" "${SCRIPTS_DIR}/check-deps.sh"
else
  log WARN "check-deps" "Skipped (--skip-deps)"
fi

# ─── Stage 2: Environment Configuration ───────────────────────────────────────
if [[ "${SKIP_ENV}" == "false" ]]; then
  run_stage "configure-env" "${SCRIPTS_DIR}/configure-env.sh"
else
  log WARN "configure-env" "Skipped (--skip-env)"
fi

# ─── Stage 3: Package Installation ────────────────────────────────────────────
run_stage "npm-install" "${SCRIPTS_DIR}/build.sh" --install-only

# ─── Stage 4: Validation ──────────────────────────────────────────────────────
run_stage "validate" "${SCRIPTS_DIR}/validate.sh"

# ─── Stage 5: Build & Package ─────────────────────────────────────────────────
if [[ "${SKIP_BUILD}" == "false" ]]; then
  run_stage "build" "${SCRIPTS_DIR}/build.sh"
else
  log WARN "build" "Skipped (--skip-build)"
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║         Bootstrap completed successfully!         ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   Full log: ${CYAN}${LOG_FILE}${NC}"
echo ""
