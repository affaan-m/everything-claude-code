#!/usr/bin/env bash
set -euo pipefail

# Release script for bumping plugin version
# Usage: ./scripts/release.sh VERSION

VERSION="${1:-}"
ROOT_PACKAGE_JSON="package.json"
PACKAGE_LOCK_JSON="package-lock.json"
PLUGIN_JSON=".claude-plugin/plugin.json"
MARKETPLACE_JSON=".claude-plugin/marketplace.json"
CODEX_PLUGIN_JSON=".codex-plugin/plugin.json"
OPENCODE_PACKAGE_JSON=".opencode/package.json"
README_FILE="README.md"

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

# Verify versioned manifests exist
for FILE in "$ROOT_PACKAGE_JSON" "$PACKAGE_LOCK_JSON" "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$CODEX_PLUGIN_JSON" "$OPENCODE_PACKAGE_JSON" "$README_FILE"; do
  if [[ ! -f "$FILE" ]]; then
    echo "Error: $FILE not found"
    exit 1
  fi
done

# Read current version from plugin.json
OLD_VERSION=$(grep -oE '"version": *"[^"]*"' "$PLUGIN_JSON" | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
if [[ -z "$OLD_VERSION" ]]; then
  echo "Error: Could not extract current version from $PLUGIN_JSON"
  exit 1
fi
echo "Bumping version: $OLD_VERSION -> $VERSION"

# Build and verify the packaged OpenCode payload before mutating any manifest
# versions or creating a tag. This keeps a broken npm artifact from being
# released via the manual script path.
echo "Verifying OpenCode build and npm pack payload..."
node scripts/build-opencode.js
node tests/scripts/build-opencode.test.js

update_version() {
  local file="$1"
  local pattern="$2"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$pattern" "$file"
  else
    sed -i "$pattern" "$file"
  fi
}

update_package_lock_version() {
  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const version = process.argv[2];
    const lock = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!lock || typeof lock !== "object") {
      console.error(`Error: ${file} does not contain a JSON object`);
      process.exit(1);
    }
    lock.version = version;
    if (lock.packages && lock.packages[""] && typeof lock.packages[""] === "object") {
      lock.packages[""].version = version;
    }
    fs.writeFileSync(file, `${JSON.stringify(lock, null, 2)}\n`);
  ' "$PACKAGE_LOCK_JSON" "$VERSION"
}

update_readme_version_row() {
  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const version = process.argv[2];
    const current = fs.readFileSync(file, "utf8");
    const updated = current.replace(
      /^\| \*\*Version\*\* \| Plugin \| Plugin \| Reference config \| [0-9][0-9.]* \|$/m,
      `| **Version** | Plugin | Plugin | Reference config | ${version} |`
    );
    if (updated === current) {
      console.error(`Error: could not update README version row in ${file}`);
      process.exit(1);
    }
    fs.writeFileSync(file, updated);
  ' "$README_FILE" "$VERSION"
}

# Update all shipped package/plugin manifests
update_version "$ROOT_PACKAGE_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_package_lock_version
update_version "$PLUGIN_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_version "$MARKETPLACE_JSON" "0,/\"version\": *\"[^\"]*\"/s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_version "$CODEX_PLUGIN_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_version "$OPENCODE_PACKAGE_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_readme_version_row

# Stage, commit, tag, and push
git add "$ROOT_PACKAGE_JSON" "$PACKAGE_LOCK_JSON" "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$CODEX_PLUGIN_JSON" "$OPENCODE_PACKAGE_JSON" "$README_FILE"
git commit -m "chore: bump plugin version to $VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"

echo "Released v$VERSION"
