#!/bin/bash
set -euo pipefail

# pre-tag-check.sh — Run before tagging a release to verify repo readiness.
# Usage: ./.github/scripts/pre-tag-check.sh [tag_name]

TAG_NAME="${1:-v1.0.0}"
ERRORS=0

echo "=========================================="
echo "Pre-Tag Checklist for: $TAG_NAME"
echo "=========================================="

# Check 1: Are there open PRs?
echo ""
echo "--- Check 1: Open Pull Requests ---"
if command -v gh &>/dev/null; then
  OPEN_PRS=$(gh pr list --state open --json number,title 2>/dev/null || echo "[]")
  if [ "$OPEN_PRS" != "[]" ] && [ -n "$OPEN_PRS" ]; then
    echo "WARNING: Open PRs detected:"
    echo "$OPEN_PRS"
    echo "Verify all intended PRs are merged before tagging."
  else
    echo "PASS: No open PRs."
  fi
else
  echo "SKIP: gh CLI not installed. Manually run: gh pr list --state open"
fi

# Check 2: Are we on main branch?
echo ""
echo "--- Check 2: Current Branch ---"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "FAIL: Not on main branch (currently on: $CURRENT_BRANCH)"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: On main branch."
fi

# Check 3: Is working tree clean?
echo ""
echo "--- Check 3: Working Tree Status ---"
if [ -n "$(git status --porcelain)" ]; then
  echo "FAIL: Uncommitted changes detected:"
  git status --short
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: Working tree is clean."
fi

# Check 4: Are there unpushed commits?
echo ""
echo "--- Check 4: Unpushed Commits ---"
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null || echo "")
if [ -n "$UNPUSHED" ]; then
  echo "FAIL: Unpushed commits:"
  echo "$UNPUSHED"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: All commits pushed to origin/main."
fi

# Check 5: Does the tag already exist?
echo ""
echo "--- Check 5: Tag Existence ---"
if git tag -l "$TAG_NAME" | grep -q "$TAG_NAME"; then
  echo "FAIL: Tag $TAG_NAME already exists."
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: Tag $TAG_NAME does not exist yet."
fi

# Summary
echo ""
echo "=========================================="
if [ "$ERRORS" -gt 0 ]; then
  echo "RESULT: $ERRORS check(s) FAILED. Fix before tagging."
  exit 1
else
  echo "RESULT: All checks PASSED. Safe to tag."
  echo ""
  echo "Run:"
  echo "  git tag -a $TAG_NAME -m \"$TAG_NAME: Post-Migration Baseline with Security and CI Fixes\""
  echo "  git push origin $TAG_NAME"
fi
