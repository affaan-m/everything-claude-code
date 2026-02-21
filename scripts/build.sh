#!/usr/bin/env bash
# scripts/build.sh — Build and packaging logic
# Installs dependencies, builds artifacts, and creates a distributable package.
# Usage: ./scripts/build.sh [--install-only]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${REPO_ROOT}/dist"

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

INSTALL_ONLY=false
for arg in "$@"; do
  [[ "${arg}" == "--install-only" ]] && INSTALL_ONLY=true
done

# ─── Git SHA for artifact naming ──────────────────────────────────────────────
GIT_SHA="$(git -C "${REPO_ROOT}" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
export TIMESTAMP  # Used in artifact naming context

# ─── npm install ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Installing npm dependencies…${NC}"

cd "${REPO_ROOT}"

# Determine package manager from environment or default to npm
PM="${CLAUDE_CODE_PACKAGE_MANAGER:-npm}"

case "${PM}" in
  npm)
    if [[ -f "package-lock.json" ]]; then
      npm ci
    else
      npm install
    fi
    ;;
  pnpm)
    pnpm install ;;
  yarn)
    yarn install --ignore-engines ;;
  bun)
    bun install ;;
  *)
    WARN "Unknown package manager '${PM}', falling back to npm"
    npm install ;;
esac

OK "npm dependencies installed"

# ─── Handle monorepo subdirectories ───────────────────────────────────────────
while IFS= read -r -d '' pkg_json; do
  subdir="$(dirname "${pkg_json}")"
  # Skip the root and node_modules
  [[ "${subdir}" == "${REPO_ROOT}" ]] && continue
  [[ "${subdir}" == *node_modules* ]] && continue

  INFO "Installing dependencies in ${subdir}…"
  (cd "${subdir}" && npm install) || WARN "npm install failed in ${subdir}"
done < <(find "${REPO_ROOT}" -name "package.json" -not -path "*/node_modules/*" -print0)

# ─── Python dependencies ──────────────────────────────────────────────────────
if [[ -f "${REPO_ROOT}/requirements.txt" ]]; then
  INFO "Installing Python dependencies from requirements.txt…"
  if command -v uv >/dev/null 2>&1; then
    uv pip install -r "${REPO_ROOT}/requirements.txt"
  elif command -v pip3 >/dev/null 2>&1; then
    pip3 install -r "${REPO_ROOT}/requirements.txt"
  else
    WARN "pip/uv not available — skipping Python dependency installation"
  fi
  OK "Python dependencies installed"
fi

if [[ -f "${REPO_ROOT}/pyproject.toml" ]]; then
  INFO "Running uv sync for pyproject.toml…"
  if command -v uv >/dev/null 2>&1; then
    uv sync
    OK "uv sync complete"
  else
    WARN "uv not available — skipping uv sync"
  fi
fi

# ─── Docker builds ────────────────────────────────────────────────────────────
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    # Detect build platform from host architecture
    HOST_ARCH="$(uname -m)"
    case "${HOST_ARCH}" in
      x86_64)  BUILD_PLATFORM="linux/amd64" ;;
      aarch64|arm64) BUILD_PLATFORM="linux/arm64" ;;
      *)       BUILD_PLATFORM="linux/${HOST_ARCH}" ;;
    esac
    DOCKER_PLATFORM="${DOCKER_PLATFORM:-${BUILD_PLATFORM}}"

    # Build images from Dockerfile(s) in the repo
  while IFS= read -r -d '' dockerfile; do
    context_dir="$(dirname "${dockerfile}")"
    image_name="everything-claude-code-$(basename "${context_dir}" | tr '[:upper:]' '[:lower:]')"
    INFO "Building Docker image '${image_name}' from ${dockerfile}…"
    docker build \
      --platform "${DOCKER_PLATFORM}" \
      -t "${image_name}:${GIT_SHA}" \
      -t "${image_name}:latest" \
      "${context_dir}" || WARN "Docker build failed for ${dockerfile}"
    OK "Built ${image_name}:${GIT_SHA}"
  done < <(find "${REPO_ROOT}" -name "Dockerfile" -not -path "*/node_modules/*" -print0)

  # docker compose if present
  for compose_file in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
    if [[ -f "${REPO_ROOT}/${compose_file}" ]]; then
      INFO "Running docker compose up --build -d…"
      docker compose -f "${REPO_ROOT}/${compose_file}" up --build -d || WARN "docker compose had warnings"
      OK "docker compose started"
      break
    fi
  done
else
  INFO "Docker not available — skipping Docker builds"
fi

# ─── Stop here if install-only ────────────────────────────────────────────────
if [[ "${INSTALL_ONLY}" == "true" ]]; then
  OK "Install-only mode complete"
  exit 0
fi

# ─── Build artifacts ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Building artifacts…${NC}"

# Run npm build script if it exists
if node -e "require('./package.json').scripts.build" >/dev/null 2>&1; then
  INFO "Running npm run build…"
  npm run build
  OK "npm build complete"
fi

# ─── Package ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Packaging release bundle…${NC}"

mkdir -p "${DIST_DIR}"
ARTIFACT_NAME="everything-claude-code-${GIT_SHA}.zip"
ARTIFACT_PATH="${DIST_DIR}/${ARTIFACT_NAME}"

# Exclude common non-distributable paths
zip -r "${ARTIFACT_PATH}" . \
  -x "*.git*" \
  -x "*/node_modules/*" \
  -x "*/.env*" \
  -x "*/dist/*" \
  -x "*/logs/*" \
  -x "*/.DS_Store" \
  >/dev/null

OK "Artifact created: ${ARTIFACT_PATH}"
INFO "Artifact: ${ARTIFACT_NAME} ($(du -sh "${ARTIFACT_PATH}" | cut -f1))"

echo ""
OK "Build and packaging complete"
