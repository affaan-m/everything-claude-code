#!/usr/bin/env bash
# install.sh — Install claude rules while preserving directory structure.
#
# Usage:
#   ./install.sh <language> [<language> ...]
#
# Examples:
#   ./install.sh typescript
#   ./install.sh typescript python golang
#
# This script copies rules into ~/.claude/rules/ keeping the common/ and
# language-specific subdirectories intact so that:
#   1. Files with the same name in common/ and <language>/ don't overwrite
#      each other.
#   2. Relative references (e.g. ../common/coding-style.md) remain valid.

set -euo pipefail

RULES_DIR="$(cd "$(dirname "$0")/rules" && pwd)"
DEST_DIR="${CLAUDE_RULES_DIR:-$HOME/.claude/rules}"

if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <language> [<language> ...]"
    echo ""
    echo "Available languages:"
    for dir in "$RULES_DIR"/*/; do
        name="$(basename "$dir")"
        [[ "$name" == "common" ]] && continue
        echo "  - $name"
    done
    exit 1
fi

# Always install common rules
echo "Installing common rules -> $DEST_DIR/common/"
mkdir -p "$DEST_DIR/common"
cp -r "$RULES_DIR/common/." "$DEST_DIR/common/"

# Install each requested language
for lang in "$@"; do
    lang_dir="$RULES_DIR/$lang"
    if [[ ! -d "$lang_dir" ]]; then
        echo "Warning: rules/$lang/ does not exist, skipping." >&2
        continue
    fi
    echo "Installing $lang rules -> $DEST_DIR/$lang/"
    mkdir -p "$DEST_DIR/$lang"
    cp -r "$lang_dir/." "$DEST_DIR/$lang/"
done

echo "Done. Rules installed to $DEST_DIR/"
