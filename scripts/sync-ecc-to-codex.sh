#!/usr/bin/env bash
set -euo pipefail

# Sync Everything Claude Code (ECC) assets into a local Codex CLI setup.
# - Backs up ~/.codex config and AGENTS.md
# - Replaces AGENTS.md with ECC AGENTS.md
# - Syncs Codex-ready skills from .agents/skills
# - Generates prompt files from commands/*.md
# - Normalizes MCP server entries to pnpm dlx and removes duplicate Context7 block

MODE="apply"
if [[ "${1:-}" == "--dry-run" ]]; then
  MODE="dry-run"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"

CONFIG_FILE="$CODEX_HOME/config.toml"
AGENTS_FILE="$CODEX_HOME/AGENTS.md"
SKILLS_SRC="$REPO_ROOT/.agents/skills"
SKILLS_DEST="$CODEX_HOME/skills"
PROMPTS_SRC="$REPO_ROOT/commands"
PROMPTS_DEST="$CODEX_HOME/prompts"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$CODEX_HOME/backups/ecc-$STAMP"

log() { printf '[ecc-sync] %s\n' "$*"; }

run_or_echo() {
  if [[ "$MODE" == "dry-run" ]]; then
    printf '[dry-run] %s\n' "$*"
  else
    eval "$@"
  fi
}

require_path() {
  local p="$1"
  local label="$2"
  if [[ ! -e "$p" ]]; then
    log "Missing $label: $p"
    exit 1
  fi
}

toml_escape() {
  local v="$1"
  v="${v//\\/\\\\}"
  v="${v//\"/\\\"}"
  printf '%s' "$v"
}

remove_section_inplace() {
  local file="$1"
  local section="$2"
  local tmp
  tmp="$(mktemp)"
  awk -v section="$section" '
    BEGIN { skip = 0 }
    {
      if ($0 == "[" section "]") {
        skip = 1
        next
      }
      if (skip && $0 ~ /^\[/) {
        skip = 0
      }
      if (!skip) {
        print
      }
    }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

extract_toml_value() {
  local file="$1"
  local section="$2"
  local key="$3"
  awk -v section="$section" -v key="$key" '
    $0 == "[" section "]" { in_section = 1; next }
    in_section && /^\[/ { in_section = 0 }
    in_section && $1 == key {
      line = $0
      sub(/^[^=]*=[[:space:]]*"/, "", line)
      sub(/".*$/, "", line)
      print line
      exit
    }
  ' "$file"
}

extract_context7_key() {
  local file="$1"
  grep -oP -- '--key",[[:space:]]*"\K[^"]+' "$file" | head -n 1 || true
}

generate_prompt_file() {
  local src="$1"
  local out="$2"
  local cmd_name="$3"
  {
    printf '# ECC Command Prompt: /%s\n\n' "$cmd_name"
    printf 'Source: %s\n\n' "$src"
    printf 'Use this prompt to run the ECC `%s` workflow.\n\n' "$cmd_name"
    awk '
      NR == 1 && $0 == "---" { fm = 1; next }
      fm == 1 && $0 == "---" { fm = 0; next }
      fm == 1 { next }
      { print }
    ' "$src"
  } > "$out"
}

require_path "$REPO_ROOT/AGENTS.md" "ECC AGENTS.md"
require_path "$SKILLS_SRC" "ECC skills directory"
require_path "$PROMPTS_SRC" "ECC commands directory"
require_path "$CONFIG_FILE" "Codex config.toml"

log "Mode: $MODE"
log "Repo root: $REPO_ROOT"
log "Codex home: $CODEX_HOME"

log "Creating backup folder: $BACKUP_DIR"
run_or_echo "mkdir -p \"$BACKUP_DIR\""
run_or_echo "cp \"$CONFIG_FILE\" \"$BACKUP_DIR/config.toml\""
if [[ -f "$AGENTS_FILE" ]]; then
  run_or_echo "cp \"$AGENTS_FILE\" \"$BACKUP_DIR/AGENTS.md\""
fi

log "Replacing global AGENTS.md with ECC AGENTS.md"
run_or_echo "cp \"$REPO_ROOT/AGENTS.md\" \"$AGENTS_FILE\""

log "Syncing ECC Codex skills"
run_or_echo "mkdir -p \"$SKILLS_DEST\""
skills_count=0
for skill_dir in "$SKILLS_SRC"/*; do
  [[ -d "$skill_dir" ]] || continue
  skill_name="$(basename "$skill_dir")"
  dest="$SKILLS_DEST/$skill_name"
  run_or_echo "rm -rf \"$dest\""
  run_or_echo "cp -R \"$skill_dir\" \"$dest\""
  skills_count=$((skills_count + 1))
done

log "Generating prompt files from ECC commands"
run_or_echo "mkdir -p \"$PROMPTS_DEST\""
manifest="$PROMPTS_DEST/ecc-prompts-manifest.txt"
if [[ "$MODE" == "dry-run" ]]; then
  printf '[dry-run] > %s\n' "$manifest"
else
  : > "$manifest"
fi

prompt_count=0
while IFS= read -r -d '' command_file; do
  name="$(basename "$command_file" .md)"
  out="$PROMPTS_DEST/ecc-$name.md"
  if [[ "$MODE" == "dry-run" ]]; then
    printf '[dry-run] generate %s from %s\n' "$out" "$command_file"
  else
    generate_prompt_file "$command_file" "$out" "$name"
    printf 'ecc-%s.md\n' "$name" >> "$manifest"
  fi
  prompt_count=$((prompt_count + 1))
done < <(find "$PROMPTS_SRC" -maxdepth 1 -type f -name '*.md' -print0 | sort -z)

if [[ "$MODE" == "apply" ]]; then
  sort -u "$manifest" -o "$manifest"
fi

if [[ "$MODE" == "apply" ]]; then
  log "Normalizing MCP server config to pnpm"

  supabase_token="$(extract_toml_value "$CONFIG_FILE" "mcp_servers.supabase.env" "SUPABASE_ACCESS_TOKEN")"
  context7_key="$(extract_context7_key "$CONFIG_FILE")"
  github_bootstrap='token=$(gh auth token 2>/dev/null || true); if [ -n "$token" ]; then export GITHUB_PERSONAL_ACCESS_TOKEN="$token"; fi; exec pnpm dlx @modelcontextprotocol/server-github'

  remove_section_inplace "$CONFIG_FILE" "mcp_servers.github.env"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.github"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.memory"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.sequential-thinking"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.context7"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.context7-mcp"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.playwright"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.supabase.env"
  remove_section_inplace "$CONFIG_FILE" "mcp_servers.supabase"

  {
    printf '\n[mcp_servers.supabase]\n'
    printf 'command = "pnpm"\n'
    printf 'args = ["dlx", "@supabase/mcp-server-supabase@latest", "--features=account,docs,database,debugging,development,functions,storage,branching"]\n'
    printf 'startup_timeout_sec = 20.0\n'
    printf 'tool_timeout_sec = 120.0\n'

    if [[ -n "$supabase_token" ]]; then
      printf '\n[mcp_servers.supabase.env]\n'
      printf 'SUPABASE_ACCESS_TOKEN = "%s"\n' "$(toml_escape "$supabase_token")"
    fi

    printf '\n[mcp_servers.playwright]\n'
    printf 'command = "pnpm"\n'
    printf 'args = ["dlx", "@playwright/mcp@latest"]\n'

    if [[ -n "$context7_key" ]]; then
      printf '\n[mcp_servers.context7-mcp]\n'
      printf 'command = "pnpm"\n'
      printf 'args = ["dlx", "@smithery/cli@latest", "run", "@upstash/context7-mcp", "--key", "%s"]\n' "$(toml_escape "$context7_key")"
    else
      printf '\n[mcp_servers.context7-mcp]\n'
      printf 'command = "pnpm"\n'
      printf 'args = ["dlx", "@upstash/context7-mcp"]\n'
    fi

    printf '\n[mcp_servers.github]\n'
    printf 'command = "bash"\n'
    printf 'args = ["-lc", "%s"]\n' "$(toml_escape "$github_bootstrap")"

    printf '\n[mcp_servers.memory]\n'
    printf 'command = "pnpm"\n'
    printf 'args = ["dlx", "@modelcontextprotocol/server-memory"]\n'

    printf '\n[mcp_servers.sequential-thinking]\n'
    printf 'command = "pnpm"\n'
    printf 'args = ["dlx", "@modelcontextprotocol/server-sequential-thinking"]\n'
  } >> "$CONFIG_FILE"
else
  log "Skipping MCP config normalization in dry-run mode"
fi

log "Sync complete"
log "Backup saved at: $BACKUP_DIR"
log "Skills synced: $skills_count"
log "Prompts generated: $prompt_count"

if [[ "$MODE" == "apply" ]]; then
  log "Done. Restart Codex CLI to reload AGENTS, prompts, and MCP servers."
fi
