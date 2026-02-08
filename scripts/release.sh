#!/usr/bin/env bash
set -euo pipefail

# Release script for bumping plugin version
# Usage: ./scripts/release.sh VERSION

VERSION="${1:-}"
PLUGIN_JSON=".claude-plugin/plugin.json"

# Function to show usage
usage() {
  echo "Usage: $0 VERSION"
  echo "Example: $0 1.5.0"
  exit 1
}

# Validate VERSION is provided
if [[ -z "$VERSION" ]]; then
  echo "Error: VERSION argument is required"
  usage
fi

# Validate VERSION is semver format (X.Y.Z)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: VERSION must be in semver format (e.g., 1.5.0)"
  exit 1
fi

# Check current branch is main
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Error: Must be on main branch (currently on $CURRENT_BRANCH)"
  exit 1
fi

# Check working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: Working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Verify plugin.json exists
if [[ ! -f "$PLUGIN_JSON" ]]; then
  echo "Error: $PLUGIN_JSON not found"
  exit 1
fi

# Read current version
OLD_VERSION=$(grep -oE '"version": *"[^"]*"' "$PLUGIN_JSON" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
echo "Bumping version: $OLD_VERSION -> $VERSION"

# Update version in plugin.json (cross-platform sed)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$VERSION\"/" "$PLUGIN_JSON"
else
  # Linux
  sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"$VERSION\"/" "$PLUGIN_JSON"
fi

# Stage, commit, tag, and push
git add "$PLUGIN_JSON"
git commit -m "chore: bump plugin version to $VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"

echo "Released v$VERSION"
