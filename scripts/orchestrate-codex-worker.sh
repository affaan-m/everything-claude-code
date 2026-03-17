#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "Usage: bash scripts/orchestrate-codex-worker.sh <task-file> <handoff-file> <status-file>" >&2
  exit 1
fi

task_file="$1"
handoff_file="$2"
status_file="$3"

normalize_path() {
  local input="$1"

  if [[ -z "$input" ]]; then
    printf '%s\n' ''
    return 0
  fi

  case "$input" in
    /*)
      printf '%s\n' "$input"
      return 0
      ;;
  esac

  if command -v cygpath >/dev/null 2>&1; then
    cygpath -u "$input" 2>/dev/null && return 0
  fi

  if command -v wslpath >/dev/null 2>&1; then
    wslpath -a "$input" 2>/dev/null && return 0
  fi

  case "$input" in
    [A-Za-z]:\\*|[A-Za-z]:/*)
      local drive="${input%%:*}"
      local rest="${input#?:}"
      drive="$(printf '%s' "$drive" | tr '[:upper:]' '[:lower:]')"
      rest="${rest//\\//}"
      printf '/mnt/%s%s\n' "$drive" "$rest"
      return 0
      ;;
  esac

  printf '%s\n' "$input"
}

task_file="$(normalize_path "$task_file")"
handoff_file="$(normalize_path "$handoff_file")"
status_file="$(normalize_path "$status_file")"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

write_status() {
  local state="$1"
  local details="$2"

  cat > "$status_file" <<EOF
# Status

- State: $state
- Updated: $(timestamp)
- Branch: $(git rev-parse --abbrev-ref HEAD)
- Worktree: \`$(pwd)\`

$details
EOF
}

mkdir -p "$(dirname "$handoff_file")" "$(dirname "$status_file")"

if [[ ! -r "$task_file" ]]; then
  write_status "failed" "- Error: task file is missing or unreadable (\`$task_file\`)"
  {
    echo "# Handoff"
    echo
    echo "- Failed: $(timestamp)"
    echo "- Branch: \`$(git rev-parse --abbrev-ref HEAD)\`"
    echo "- Worktree: \`$(pwd)\`"
    echo
    echo "Task file is missing or unreadable: \`$task_file\`"
  } > "$handoff_file"
  exit 1
fi

write_status "running" "- Task file: \`$task_file\`"

prompt_file="$(mktemp)"
output_file="$(mktemp)"
cleanup() {
  rm -f "$prompt_file" "$output_file"
}
trap cleanup EXIT

cat > "$prompt_file" <<EOF
You are one worker in an ECC tmux/worktree swarm.

Rules:
- Work only in the current git worktree.
- Do not touch sibling worktrees or the parent repo checkout.
- Complete the task from the task file below.
- Do not spawn subagents or external agents for this task.
- Report progress and final results in stdout only.
- Do not write handoff or status files yourself; the launcher manages those artifacts.
- If you change code or docs, keep the scope narrow and defensible.
- In your final response, include exactly these sections:
  1. Summary
  2. Files Changed
  3. Validation
  4. Remaining Risks

Task file: $task_file

$(cat "$task_file")
EOF

if codex exec -p yolo -m gpt-5.4 --color never -C "$(pwd)" -o "$output_file" - < "$prompt_file"; then
  {
    echo "# Handoff"
    echo
    echo "- Completed: $(timestamp)"
    echo "- Branch: \`$(git rev-parse --abbrev-ref HEAD)\`"
    echo "- Worktree: \`$(pwd)\`"
    echo
    cat "$output_file"
    echo
    echo "## Git Status"
    echo
    git status --short
  } > "$handoff_file"
  write_status "completed" "- Handoff file: \`$handoff_file\`"
else
  {
    echo "# Handoff"
    echo
    echo "- Failed: $(timestamp)"
    echo "- Branch: \`$(git rev-parse --abbrev-ref HEAD)\`"
    echo "- Worktree: \`$(pwd)\`"
    echo
    echo "The Codex worker exited with a non-zero status."
  } > "$handoff_file"
  write_status "failed" "- Handoff file: \`$handoff_file\`"
  exit 1
fi
