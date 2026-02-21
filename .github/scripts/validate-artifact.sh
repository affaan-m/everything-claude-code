#!/bin/bash
set -euo pipefail

# validate-artifact.sh — Asserts banned files/directories are absent from release zip.
# Usage: ./validate-artifact.sh <path-to-artifact.zip>

ARTIFACT_NAME="${1:?Usage: validate-artifact.sh <artifact.zip>}"

if [ ! -f "$ARTIFACT_NAME" ]; then
  echo "::error::Artifact not found: $ARTIFACT_NAME"
  exit 1
fi

# Banned patterns: exact name at any depth or directory start.
# Uses awk to extract filename column from unzip -l, then anchored grep.
BANNED_PATTERNS=(
    '(^|/)\.env$'
    '(^|/)\.git/'
    '(^|/)node_modules/'
    '(^|/)__pycache__/'
    '(^|/)\.pytest_cache/'
    '(^|/)\.DS_Store$'
    '(^|/)venv/'
    '(^|/)build/'
)

FAILED=0
for pattern in "${BANNED_PATTERNS[@]}"; do
  if unzip -l "$ARTIFACT_NAME" | awk '{print $4}' | grep -qE "$pattern"; then
    echo "::error::Banned file/directory found in artifact matching pattern: $pattern"
    FAILED=1
  else
    echo "PASS: No match for pattern: $pattern"
  fi
done

if [ "$FAILED" -ne 0 ]; then
  echo "::error::Artifact validation FAILED. Banned files detected."
  exit 1
fi

echo "Artifact validation PASSED. No banned files detected."
