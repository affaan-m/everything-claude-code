#!/usr/bin/env bash
# scan-rules.sh — enumerate rule files and extract H2 heading index
# Usage: scan-rules.sh [RULES_DIR]
# Output: JSON to stdout
#
# Environment:
#   RULES_DISTILL_DIR  Override ~/.claude/rules (for testing only)

set -euo pipefail

RULES_DIR="${RULES_DISTILL_DIR:-${1:-$HOME/.claude/rules}}"

if [[ ! -d "$RULES_DIR" ]]; then
  echo '{"error":"rules directory not found","path":"'"$RULES_DIR"'"}' >&2
  exit 1
fi

# Collect all .md files (excluding _archived/)
mapfile_compat() {
  local -n arr="$1"
  arr=()
  while IFS= read -r line; do
    arr+=("$line")
  done
}

files=()
while IFS= read -r -d '' f; do
  files+=("$f")
done < <(find "$RULES_DIR" -name '*.md' -not -path '*/_archived/*' -print0 | sort -z)

total=${#files[@]}

# Build JSON output
echo '{'
echo '  "rules_dir": "'"$RULES_DIR"'",'
echo '  "total": '"$total"','
echo '  "rules": ['

for i in "${!files[@]}"; do
  file="${files[$i]}"
  rel_path="${file#"$HOME"/}"
  rel_path="~/$rel_path"

  # Extract H2 headings (## Title)
  headings=""
  while IFS= read -r heading; do
    heading="${heading#\#\# }"
    if [[ -n "$headings" ]]; then
      headings="$headings, "
    fi
    headings="$headings\"$heading\""
  done < <(grep -E '^## ' "$file" 2>/dev/null || true)

  # Get line count
  line_count=$(wc -l < "$file" | tr -d ' ')

  comma=""
  if [[ $i -lt $((total - 1)) ]]; then
    comma=","
  fi

  echo '    {'
  echo '      "path": "'"$rel_path"'",'
  echo '      "file": "'"$(basename "$file")"'",'
  echo '      "lines": '"$line_count"','
  echo '      "headings": ['"$headings"']'
  echo "    }$comma"
done

echo '  ]'
echo '}'
