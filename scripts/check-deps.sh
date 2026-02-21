#!/usr/bin/env bash
# scripts/check-deps.sh — Dependency detection and installation
# Checks for required tools and installs them via Homebrew on macOS.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

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

# ─── Helpers ──────────────────────────────────────────────────────────────────
is_macos() { [[ "$(uname -s)" == "Darwin" ]]; }
is_ci()    { [[ "${CI:-false}" == "true" ]]; }

require_cmd() {
  local cmd="$1"
  if command -v "${cmd}" >/dev/null 2>&1; then
    OK "${cmd} is available: $(${cmd} --version 2>/dev/null | head -1 || echo 'ok')"
    return 0
  fi
  return 1
}

brew_install() {
  local pkg="$1"
  if is_macos && command -v brew >/dev/null 2>&1; then
    INFO "Installing ${pkg} via Homebrew…"
    brew install "${pkg}"
  else
    FAIL "Cannot auto-install ${pkg}: Homebrew not available or not on macOS"
    return 1
  fi
}

# ─── Homebrew ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking Homebrew…${NC}"
if is_macos; then
  if command -v brew >/dev/null 2>&1; then
    OK "Homebrew: $(brew --version | head -1)"
  else
    WARN "Homebrew not found. Installing…"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add Homebrew to PATH for Apple Silicon
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    OK "Homebrew installed"
  fi
else
  INFO "Not on macOS — skipping Homebrew check"
fi

# ─── Git ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking Git…${NC}"
if ! require_cmd git; then
  brew_install git
  require_cmd git || { FAIL "git installation failed"; exit 1; }
fi

# ─── Node.js ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking Node.js…${NC}"

# Determine required Node version from .nvmrc, .node-version, or package.json
NODE_VERSION_FILE=""
if [[ -f "${REPO_ROOT}/.nvmrc" ]]; then
  NODE_VERSION_FILE="${REPO_ROOT}/.nvmrc"
  REQUIRED_NODE="$(tr -d '[:space:]' < "${NODE_VERSION_FILE}")"
elif [[ -f "${REPO_ROOT}/.node-version" ]]; then
  NODE_VERSION_FILE="${REPO_ROOT}/.node-version"
  REQUIRED_NODE="$(tr -d '[:space:]' < "${NODE_VERSION_FILE}")"
else
  REQUIRED_NODE="20"
fi

if command -v node >/dev/null 2>&1; then
  CURRENT_NODE="$(node --version)"
  OK "Node.js ${CURRENT_NODE} is available"
else
  WARN "Node.js not found. Installing…"
  # Prefer nvm if available (nvm is a shell function, not a binary)
  if type nvm >/dev/null 2>&1; then
    nvm install "${REQUIRED_NODE}" && nvm use "${REQUIRED_NODE}"
  elif is_macos && command -v brew >/dev/null 2>&1; then
    brew install node
  else
    FAIL "Cannot install Node.js automatically. Please install Node.js ${REQUIRED_NODE}+"
    exit 1
  fi
  require_cmd node || { FAIL "Node.js installation failed"; exit 1; }
fi

if ! require_cmd npm; then
  FAIL "npm is not available after Node.js installation"
  exit 1
fi

# ─── Python 3 ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking Python 3…${NC}"
if command -v python3 >/dev/null 2>&1; then
  OK "Python 3: $(python3 --version)"
else
  WARN "Python 3 not found."
  if is_macos && command -v brew >/dev/null 2>&1; then
    INFO "Installing Python 3 via Homebrew…"
    brew install python3
    require_cmd python3 || { FAIL "Python 3 installation failed"; exit 1; }
  else
    WARN "Python 3 not available — some features may be limited"
  fi
fi

# ─── Docker (optional) ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Checking Docker…${NC}"
if command -v docker >/dev/null 2>&1; then
  OK "Docker: $(docker --version)"
  # Check if Docker daemon is running
  if docker info >/dev/null 2>&1; then
    OK "Docker daemon is running"
  else
    WARN "Docker is installed but daemon is not running"
    if is_macos && ! is_ci; then
      INFO "Attempting to start Docker Desktop…"
      open -a Docker 2>/dev/null || true
      # Wait up to 30s for Docker to start
      for i in $(seq 1 6); do
        sleep 5
        if docker info >/dev/null 2>&1; then
          OK "Docker daemon started"
          break
        fi
        INFO "Waiting for Docker daemon… (${i}/6)"
      done
      docker info >/dev/null 2>&1 || WARN "Docker daemon did not start — Docker-based features will be unavailable"
    else
      WARN "Docker daemon not running — Docker-based features will be unavailable"
    fi
  fi
else
  WARN "Docker not found — Docker-based features will be unavailable"
  if is_macos && ! is_ci; then
    INFO "To install Docker Desktop: brew install --cask docker"
  fi
fi

# ─── Tool versions file (.tool-versions / asdf) ───────────────────────────────
echo ""
echo -e "${BOLD}Checking .tool-versions (asdf)…${NC}"
if [[ -f "${REPO_ROOT}/.tool-versions" ]]; then
  if command -v asdf >/dev/null 2>&1; then
    INFO "Installing tools from .tool-versions…"
    (cd "${REPO_ROOT}" && asdf install) || WARN "asdf install had warnings"
    OK "asdf tools installed"
  else
    INFO ".tool-versions present but asdf not installed — skipping"
  fi
else
  INFO "No .tool-versions file found — skipping asdf"
fi

echo ""
OK "Dependency check complete"
