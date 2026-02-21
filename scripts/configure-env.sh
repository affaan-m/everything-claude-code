#!/usr/bin/env bash
# scripts/configure-env.sh — .env generation and validation
# On first run, prompts for required secrets. On subsequent runs, loads .env.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"
ENV_EXAMPLE="${REPO_ROOT}/.env.example"

# ─── ANSI Colors ──────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

OK()   { echo -e "${GREEN}✅${NC} $*"; }
WARN() { echo -e "${YELLOW}⚠${NC}  $*"; }
FAIL() { echo -e "${RED}❌${NC} $*"; }
INFO() { echo -e "   $*"; }

NON_INTERACTIVE="${NON_INTERACTIVE:-false}"

# ─── Parse required variables from .env.example ───────────────────────────────
parse_required_vars() {
  if [[ ! -f "${ENV_EXAMPLE}" ]]; then
    echo ""
    return
  fi
  # Return variable names that are not commented out and not already set
  grep -E '^[A-Z_]+=' "${ENV_EXAMPLE}" | cut -d= -f1 || true
}

# ─── Load existing .env ───────────────────────────────────────────────────────
load_env() {
  if [[ -f "${ENV_FILE}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
    set +a
    OK ".env loaded from ${ENV_FILE}"
  fi
}

# ─── Prompt for a single variable ─────────────────────────────────────────────
prompt_var() {
  local var_name="$1"
  local description="${2:-}"
  local current_val="${!var_name:-}"

  if [[ -n "${current_val}" ]]; then
    OK "${var_name} is already set"
    return 0
  fi

  if [[ "${NON_INTERACTIVE}" == "true" ]]; then
    WARN "${var_name} is not set and running non-interactively — skipping prompt"
    return 0
  fi

  echo ""
  echo -e "${BOLD}${var_name}${NC}${description:+ — ${description}}"
  read -r -s -p "  Enter value (input hidden): " value
  echo ""

  if [[ -n "${value}" ]]; then
    echo "${var_name}=${value}" >> "${ENV_FILE}"
    export "${var_name}=${value}"
    OK "${var_name} saved to .env"
  else
    WARN "${var_name} left empty"
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Environment Configuration${NC}"

# Create .env if it doesn't exist
if [[ ! -f "${ENV_FILE}" ]]; then
  INFO "No .env found — creating ${ENV_FILE}"
  touch "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  OK ".env created (permissions: 600)"
else
  OK ".env already exists at ${ENV_FILE}"
fi

# Load existing values
load_env

# ─── Read descriptions from .env.example ──────────────────────────────────────
if [[ -f "${ENV_EXAMPLE}" ]]; then
  INFO "Using ${ENV_EXAMPLE} as the canonical variable list"

  while IFS= read -r line; do
    # Skip blank lines and pure comments
    [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]] && continue

    if [[ "${line}" =~ ^([A-Z_]+)= ]]; then
      var_name="${BASH_REMATCH[1]}"
      # Look for an inline comment as description
      description=""
      if [[ "${line}" == *#* ]]; then
        description="${line##*#}"
        description="${description# }"
      fi
      prompt_var "${var_name}" "${description}"
    fi
  done < "${ENV_EXAMPLE}"
else
  WARN "No .env.example found — skipping interactive prompts"
fi

# ─── Validation ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Validating environment variables…${NC}"

REQUIRED_VARS="$(parse_required_vars)"
ALL_VALID=true

for var in ${REQUIRED_VARS}; do
  val="${!var:-}"
  if [[ -n "${val}" ]]; then
    OK "${var} is set"
  else
    WARN "${var} is not set — some features may not work"
    ALL_VALID=false
  fi
done

if [[ -z "${REQUIRED_VARS}" ]]; then
  INFO "No required variables defined in .env.example"
fi

echo ""
if [[ "${ALL_VALID}" == "true" ]]; then
  OK "All environment variables validated"
else
  WARN "Some variables are unset — review .env.example for details"
fi
