#!/usr/bin/env bash
# fetch-copilot-branch.sh — List, pick, and checkout a Copilot-created remote branch.
#
# Usage:
#   ./scripts/fetch-copilot-branch.sh              # interactive picker
#   ./scripts/fetch-copilot-branch.sh copilot/issue-42  # direct checkout
#
set -euo pipefail

REMOTE="${GIT_REMOTE:-origin}"

echo "==> Fetching from ${REMOTE}..."
git fetch "${REMOTE}" --prune --quiet

# Collect copilot/* branches from the remote
mapfile -t BRANCHES < <(
  git branch -r \
    | grep -E "^\s+${REMOTE}/copilot/" \
    | sed "s|^\s*${REMOTE}/||" \
    | sort
)

if [[ ${#BRANCHES[@]} -eq 0 ]]; then
  echo "No copilot/* branches found on remote '${REMOTE}'."
  echo "Make sure you have at least one open Copilot PR."
  exit 0
fi

# Accept branch name as first argument, otherwise prompt interactively
if [[ $# -ge 1 ]]; then
  SELECTED="$1"
else
  echo ""
  echo "Available Copilot branches:"
  for i in "${!BRANCHES[@]}"; do
    printf "  [%d] %s\n" "$((i + 1))" "${BRANCHES[$i]}"
  done
  echo ""
  read -rp "Enter branch number (or full branch name): " CHOICE

  # Accept a number or a raw branch name
  if [[ "$CHOICE" =~ ^[0-9]+$ ]]; then
    INDEX=$((CHOICE - 1))
    if [[ $INDEX -lt 0 || $INDEX -ge ${#BRANCHES[@]} ]]; then
      echo "Invalid selection: ${CHOICE}" >&2
      exit 1
    fi
    SELECTED="${BRANCHES[$INDEX]}"
  else
    SELECTED="$CHOICE"
  fi
fi

echo "==> Checking out '${SELECTED}'..."
git checkout -B "${SELECTED}" "${REMOTE}/${SELECTED}"

echo ""
echo "✓ Now on branch: $(git rev-parse --abbrev-ref HEAD)"
echo ""
echo "To open this branch in GitHub Desktop:"
echo "  1. Switch to GitHub Desktop."
echo "  2. Click 'Current Branch' — '${SELECTED}' should appear at the top."
echo "  3. If not, click 'Fetch origin' first."
