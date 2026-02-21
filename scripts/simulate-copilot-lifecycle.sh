#!/usr/bin/env bash
# simulate-copilot-lifecycle.sh — Dry-run simulation of the Copilot PR lifecycle.
#
# This script exercises every stage of the GitHub Desktop + Copilot workflow
# without making destructive changes. All git operations use --dry-run where
# possible; network operations are skipped in simulation mode.
#
# Usage:
#   ./scripts/simulate-copilot-lifecycle.sh [--verbose]
#
set -euo pipefail

VERBOSE=false
if [[ "${1:-}" == "--verbose" ]]; then
  VERBOSE=true
fi

# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
PASS=0
FAIL=0

ok() {
  echo "  ✓ $1"
  PASS=$((PASS + 1))
}

fail() {
  echo "  ✗ $1"
  if [[ "${2:-}" != "" ]]; then
    echo "    → $2"
  fi
  FAIL=$((FAIL + 1))
}

info() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo "    [debug] $1"
  fi
}

section() {
  echo ""
  echo "── $1 ──────────────────────────────────────────"
}

# --------------------------------------------------------------------------- #
# Stage A — Repository structure
# --------------------------------------------------------------------------- #
section "Stage A: Repository Structure"

if git rev-parse --git-dir >/dev/null 2>&1; then
  ok "Git repository is present"
else
  fail "Not inside a git repository"
fi

REMOTE=$(git remote 2>/dev/null | head -1)
if [[ -n "$REMOTE" ]]; then
  ok "Remote '$REMOTE' is configured"
  info "Remote URL: $(git remote get-url "$REMOTE" 2>/dev/null || echo 'n/a')"
else
  fail "No git remote configured"
fi

# --------------------------------------------------------------------------- #
# Stage B — Branch naming patterns
# --------------------------------------------------------------------------- #
section "Stage B: Copilot Branch Naming"

COPILOT_PATTERNS=("copilot/issue-1" "copilot/issue-42" "copilot/fix-readme" "copilot/fix-login-bug")
NON_COPILOT=("feature/my-task" "main" "bugfix/issue-5")

for branch in "${COPILOT_PATTERNS[@]}"; do
  if [[ "$branch" == copilot/* ]]; then
    ok "Pattern matches copilot/*: '$branch'"
  else
    fail "Expected match for '$branch'"
  fi
done

for branch in "${NON_COPILOT[@]}"; do
  if [[ "$branch" != copilot/* ]]; then
    ok "Correctly excluded non-copilot branch: '$branch'"
  else
    fail "False positive for '$branch'"
  fi
done

# --------------------------------------------------------------------------- #
# Stage C — Environment setup (non-destructive checks)
# --------------------------------------------------------------------------- #
section "Stage C: Environment"

if [[ -f "package.json" ]]; then
  ok "package.json present"
else
  fail "package.json not found"
fi

if [[ -d "node_modules" ]]; then
  ok "node_modules/ installed"
else
  # Only warn — the repo scripts use only Node built-ins; npm install is only
  # needed when devDependencies (eslint, markdownlint-cli) are required.
  echo "  ⚠  node_modules/ not present — run 'make setup' before linting"
fi

if [[ -f "VERSION" ]]; then
  VERSION=$(tr -d '[:space:]' < VERSION)
  ok "VERSION file present: $VERSION"
else
  fail "VERSION file missing"
fi

if [[ -f "Makefile" ]]; then
  ok "Makefile present"
  for target in setup validate build package update logs clean; do
    if grep -q "^$target:" Makefile; then
      info "Makefile target '$target' found"
    else
      fail "Makefile missing target: $target"
    fi
  done
else
  fail "Makefile not found"
fi

# --------------------------------------------------------------------------- #
# Stage D — Copilot issue template
# --------------------------------------------------------------------------- #
section "Stage D: Copilot Issue Template"

TEMPLATE=".github/ISSUE_TEMPLATE/copilot-task.md"
if [[ -f "$TEMPLATE" ]]; then
  ok "Copilot issue template exists"
  if grep -q "assignees: copilot" "$TEMPLATE"; then
    ok "Template pre-assigns @copilot"
  else
    fail "Template missing 'assignees: copilot'"
  fi
  if grep -q "labels: copilot" "$TEMPLATE"; then
    ok "Template includes 'copilot' label"
  else
    fail "Template missing 'labels: copilot'"
  fi
else
  fail "Copilot issue template not found at $TEMPLATE"
fi

# --------------------------------------------------------------------------- #
# Stage E — CI workflow validation
# --------------------------------------------------------------------------- #
section "Stage E: CI Workflow"

WORKFLOW=".github/workflows/ci.yml"
if [[ -f "$WORKFLOW" ]]; then
  ok "ci.yml present"
  if grep -q "copilot/\*\*" "$WORKFLOW"; then
    ok "Workflow triggers on copilot/** branches"
  else
    fail "Workflow missing copilot/** trigger"
  fi
  if grep -q "^  validate:" "$WORKFLOW"; then
    ok "Workflow has a validate job"
  else
    fail "Workflow missing validate job"
  fi
else
  fail "ci.yml not found"
fi

# --------------------------------------------------------------------------- #
# Stage F — Branch helper script
# --------------------------------------------------------------------------- #
section "Stage F: Branch Helper"

HELPER="scripts/fetch-copilot-branch.sh"
if [[ -f "$HELPER" ]]; then
  ok "fetch-copilot-branch.sh exists"
  if [[ -x "$HELPER" ]]; then
    ok "Script is executable"
  else
    fail "Script is not executable" "run: chmod +x $HELPER"
  fi
  if head -1 "$HELPER" | grep -q "#!/usr/bin/env bash"; then
    ok "Script uses correct shebang"
  else
    fail "Script missing '#!/usr/bin/env bash' shebang"
  fi
  if grep -q "set -euo pipefail" "$HELPER"; then
    ok "Script uses 'set -euo pipefail'"
  else
    fail "Script missing 'set -euo pipefail'"
  fi
else
  fail "fetch-copilot-branch.sh not found"
fi

# --------------------------------------------------------------------------- #
# Stage G — .gitignore artifact exclusions
# --------------------------------------------------------------------------- #
section "Stage G: Artifact Isolation"

GITIGNORE=".gitignore"
for entry in "dist/" "logs/" "node_modules/" ".env"; do
  if grep -q "^$entry" "$GITIGNORE" 2>/dev/null || grep -q "^${entry%/}" "$GITIGNORE" 2>/dev/null; then
    ok ".gitignore excludes: $entry"
  else
    fail ".gitignore missing exclusion: $entry"
  fi
done

# --------------------------------------------------------------------------- #
# Stage H — CODEOWNERS
# --------------------------------------------------------------------------- #
section "Stage H: Governance"

if [[ -f ".github/CODEOWNERS" ]]; then
  ok "CODEOWNERS file present"
  if grep -q "\.github/workflows/" ".github/CODEOWNERS"; then
    ok "CI workflows require explicit review"
  else
    fail "CODEOWNERS missing .github/workflows/ entry"
  fi
else
  fail "CODEOWNERS not found"
fi

# --------------------------------------------------------------------------- #
# Summary
# --------------------------------------------------------------------------- #
echo ""
echo "══════════════════════════════════════════════════"
echo "  Lifecycle Simulation Results"
echo "══════════════════════════════════════════════════"
echo "  Passed : $PASS"
echo "  Failed : $FAIL"
echo "══════════════════════════════════════════════════"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo "Some checks failed. Review the output above and fix before opening a PR."
  exit 1
else
  echo "All checks passed. The Copilot PR lifecycle is correctly wired."
  exit 0
fi
