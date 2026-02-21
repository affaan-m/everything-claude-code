#!/usr/bin/env bash
# scripts/validate.sh — Post-install validation suite
# Checks required binaries, runs component validators, and smoke tests.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ─── ANSI Colors ──────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Result tracking ──────────────────────────────────────────────────────────
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() { echo -e "${GREEN}✅${NC} $*"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { echo -e "${RED}❌${NC} $*"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; WARN_COUNT=$((WARN_COUNT + 1)); }
info() { echo -e "   $*"; }

check_cmd() {
  local cmd="$1"
  local label="${2:-${cmd}}"
  if command -v "${cmd}" >/dev/null 2>&1; then
    pass "${label}: $(${cmd} --version 2>/dev/null | head -1 || echo 'available')"
  else
    fail "${label}: not found on PATH"
  fi
}

check_cmd_optional() {
  local cmd="$1"
  local label="${2:-${cmd}}"
  if command -v "${cmd}" >/dev/null 2>&1; then
    pass "${label}: $(${cmd} --version 2>/dev/null | head -1 || echo 'available')"
  else
    warn "${label}: not found (optional)"
  fi
}

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Post-Install Validation Suite${NC}"
echo ""

# ─── 1. Required Binaries ─────────────────────────────────────────────────────
echo -e "${BOLD}1. Required Binaries${NC}"
check_cmd git
check_cmd node "Node.js"
check_cmd npm

# ─── 2. Optional Binaries ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}2. Optional Binaries${NC}"
check_cmd_optional python3 "Python 3"
check_cmd_optional docker "Docker"
check_cmd_optional brew "Homebrew"

# ─── 3. node_modules ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}3. Node Modules${NC}"
if [[ -d "${REPO_ROOT}/node_modules" ]]; then
  pass "node_modules directory exists"
else
  fail "node_modules missing — run 'npm install'"
fi

# ─── 4. Docker health (if applicable) ────────────────────────────────────────
echo ""
echo -e "${BOLD}4. Docker Health${NC}"
if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    pass "Docker daemon is running"
    # Check for any running containers from this project
    RUNNING=$(docker ps --filter "name=everything-claude-code" --format "{{.Names}}" 2>/dev/null || true)
    if [[ -n "${RUNNING}" ]]; then
      pass "Project containers running: ${RUNNING}"
    else
      info "No project containers running"
    fi
  else
    warn "Docker installed but daemon is not running"
  fi
else
  warn "Docker not installed (optional)"
fi

# ─── 5. Component validation (CI validators) ──────────────────────────────────
echo ""
echo -e "${BOLD}5. Component Validation${NC}"

CI_SCRIPTS=(
  "validate-agents.js"
  "validate-hooks.js"
  "validate-commands.js"
  "validate-skills.js"
  "validate-rules.js"
)

for script in "${CI_SCRIPTS[@]}"; do
  script_path="${REPO_ROOT}/scripts/ci/${script}"
  if [[ -f "${script_path}" ]]; then
    if node "${script_path}" >/dev/null 2>&1; then
      pass "CI validator: ${script}"
    else
      fail "CI validator: ${script} — failed (run manually for details)"
    fi
  else
    warn "CI validator: ${script} not found"
  fi
done

# ─── 6. Smoke test ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}6. Smoke Test${NC}"

# Custom validate.sh in repo root (not this script)
if [[ -x "${REPO_ROOT}/validate.sh" ]] && [[ "${REPO_ROOT}/validate.sh" != "${BASH_SOURCE[0]}" ]]; then
  info "Running custom validate.sh…"
  if bash "${REPO_ROOT}/validate.sh" >/dev/null 2>&1; then
    pass "Custom validate.sh passed"
  else
    fail "Custom validate.sh failed"
  fi
fi

# npm test (with --passWithNoTests equivalent)
if [[ -f "${REPO_ROOT}/tests/run-all.js" ]]; then
  info "Running test suite…"
  if node "${REPO_ROOT}/tests/run-all.js" >/dev/null 2>&1; then
    pass "Test suite passed"
  else
    fail "Test suite failed — run 'node tests/run-all.js' for details"
  fi
fi

# ─── 7. .env file check ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}7. Environment File${NC}"
if [[ -f "${REPO_ROOT}/.env" ]]; then
  pass ".env file exists"
  # Check permissions (should be 600) — portable check via ls
  # shellcheck disable=SC2012
  ENV_PERMS="$(ls -l "${REPO_ROOT}/.env" | cut -c2-10)"
  if [[ "${ENV_PERMS}" == "rw-------" ]]; then
    pass ".env permissions are secure (600)"
  else
    warn ".env permissions are not 600 — run: chmod 600 .env (current: ${ENV_PERMS})"
  fi
else
  warn ".env file not found — run 'make setup' or './scripts/configure-env.sh'"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
TOTAL=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
echo ""
echo -e "${BOLD}Validation Summary${NC}"
echo "────────────────────────────────"
echo -e "  Total:    ${TOTAL}"
echo -e "  ${GREEN}Passed:   ${PASS_COUNT}${NC}"
echo -e "  ${YELLOW}Warnings: ${WARN_COUNT}${NC}"
echo -e "  ${RED}Failed:   ${FAIL_COUNT}${NC}"
echo "────────────────────────────────"

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  echo -e "${RED}❌ Validation failed — ${FAIL_COUNT} check(s) failed${NC}"
  exit 1
elif [[ "${WARN_COUNT}" -gt 0 ]]; then
  echo -e "${YELLOW}⚠  Validation passed with ${WARN_COUNT} warning(s)${NC}"
else
  echo -e "${GREEN}✅ All checks passed${NC}"
fi
