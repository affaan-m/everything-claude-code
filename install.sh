#!/usr/bin/env bash
# install.sh — Legacy shell entrypoint for the ECC installer.
#
# This wrapper resolves the real repo/package root when invoked through a
# symlinked npm bin, then delegates to the Node-based installer runtime.

set -euo pipefail

SCRIPT_PATH="$0"
while [ -L "$SCRIPT_PATH" ]; do
    link_dir="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
    SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
    [[ "$SCRIPT_PATH" != /* ]] && SCRIPT_PATH="$link_dir/$SCRIPT_PATH"
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"

# Auto-install Node dependencies when running from a git clone
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "[ECC] Installing dependencies..."
    (cd "$SCRIPT_DIR" && npm install --no-audit --no-fund --loglevel=error)
fi

exec node "$SCRIPT_DIR/scripts/install-apply.js" "$@"
