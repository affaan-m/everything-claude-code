#!/usr/bin/env bash
# .cursor/install.sh
# Install ECC .cursor/rules into a target project directory
#
# Usage:
#   bash .cursor/install.sh                    # install to current directory
#   bash .cursor/install.sh --target /path/to/project
#   bash .cursor/install.sh --symlink          # symlink instead of copy
#
# Requirements: bash 4+, realpath (GNU coreutils or macOS greadlink)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ECC_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET="$(pwd)"
SYMLINK=false

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --target|-t)
      TARGET="$2"
      shift 2
      ;;
    --symlink|-s)
      SYMLINK=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--target <dir>] [--symlink]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "ECC Cursor IDE installer"
echo "  Source:  ${ECC_ROOT}/.cursor/rules/"
echo "  Target:  ${TARGET}/.cursor/rules/"
echo "  Mode:    $([ "$SYMLINK" = true ] && echo symlink || echo copy)"
echo ""

# Create target .cursor/rules directory
mkdir -p "${TARGET}/.cursor/rules"

if [ "$SYMLINK" = true ]; then
  # Symlink each .mdc file
  for mdc_file in "${ECC_ROOT}/.cursor/rules"/*.mdc; do
    name=$(basename "$mdc_file")
    target_file="${TARGET}/.cursor/rules/${name}"
    if [ -L "$target_file" ]; then
      echo "  skip (already linked): $name"
    else
      ln -s "$mdc_file" "$target_file"
      echo "  linked: $name"
    fi
  done
else
  # Copy each .mdc file
  for mdc_file in "${ECC_ROOT}/.cursor/rules"/*.mdc; do
    name=$(basename "$mdc_file")
    cp "$mdc_file" "${TARGET}/.cursor/rules/${name}"
    echo "  copied: $name"
  done
fi

echo ""
echo "Done! Open Cursor Settings > Cursor Settings > Rules and Commands to verify."
