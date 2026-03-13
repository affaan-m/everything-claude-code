#!/usr/bin/env bash
set -euo pipefail

# Sync Everything Claude Code (ECC) assets into a local Codex CLI setup.
# - Backs up ~/.codex config and AGENTS.md
# - Replaces AGENTS.md with ECC AGENTS.md
# - Syncs Codex-ready skills from .agents/skills
# - Generates prompt files from commands/*.md
# - Generates Codex QA wrappers and optional language rule-pack prompts
# - Installs global git safety hooks (pre-commit and pre-push)
# - Runs a post-sync global regression sanity check
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
AGENTS_ROOT_SRC="$REPO_ROOT/AGENTS.md"
AGENTS_CODEX_SUPP_SRC="$REPO_ROOT/.codex/AGENTS.md"
SKILLS_SRC="$REPO_ROOT/.agents/skills"
SKILLS_DEST="$CODEX_HOME/skills"
PROMPTS_SRC="$REPO_ROOT/commands"
PROMPTS_DEST="$CODEX_HOME/prompts"
HOOKS_INSTALLER="$REPO_ROOT/scripts/codex/install-global-git-hooks.sh"
SANITY_CHECKER="$REPO_ROOT/scripts/codex/check-codex-global-state.sh"
CURSOR_RULES_DIR="$REPO_ROOT/.cursor/rules"

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
require_path "$AGENTS_CODEX_SUPP_SRC" "ECC Codex AGENTS supplement"
require_path "$SKILLS_SRC" "ECC skills directory"
require_path "$PROMPTS_SRC" "ECC commands directory"
require_path "$HOOKS_INSTALLER" "ECC global git hooks installer"
require_path "$SANITY_CHECKER" "ECC global sanity checker"
require_path "$CURSOR_RULES_DIR" "ECC Cursor rules directory"
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

log "Replacing global AGENTS.md with ECC AGENTS + Codex supplement"
if [[ "$MODE" == "dry-run" ]]; then
  printf '[dry-run] compose %s from %s + %s\n' "$AGENTS_FILE" "$AGENTS_ROOT_SRC" "$AGENTS_CODEX_SUPP_SRC"
else
  {
    cat "$AGENTS_ROOT_SRC"
    printf '\n\n---\n\n'
    printf '# Codex Supplement (From ECC .codex/AGENTS.md)\n\n'
    cat "$AGENTS_CODEX_SUPP_SRC"
  } > "$AGENTS_FILE"
fi

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

log "Generating Codex tool prompts + optional rule-pack prompts"
extension_manifest="$PROMPTS_DEST/ecc-extension-prompts-manifest.txt"
if [[ "$MODE" == "dry-run" ]]; then
  printf '[dry-run] > %s\n' "$extension_manifest"
else
  : > "$extension_manifest"
fi

extension_count=0

write_extension_prompt() {
  local name="$1"
  local file="$PROMPTS_DEST/$name"
  if [[ "$MODE" == "dry-run" ]]; then
    printf '[dry-run] generate %s\n' "$file"
  else
    cat > "$file"
    printf '%s\n' "$name" >> "$extension_manifest"
  fi
  extension_count=$((extension_count + 1))
}

write_extension_prompt "ecc-tool-run-tests.md" <<EOF
# ECC Tool Prompt: run-tests

Run the repository test suite with package-manager autodetection and concise reporting.

## Instructions
1. Detect package manager from lock files in this order: \`pnpm-lock.yaml\`, \`bun.lockb\`, \`yarn.lock\`, \`package-lock.json\`.
2. Detect available scripts or test commands for this repo.
3. Execute tests with the best project-native command.
4. If tests fail, report failing files/tests first, then the smallest likely fix list.
5. Do not change code unless explicitly asked.

## Output Format
\`\`\`
RUN TESTS: [PASS/FAIL]
Command used: <command>
Summary: <x passed / y failed>
Top failures:
- ...
Suggested next step:
- ...
\`\`\`
EOF

write_extension_prompt "ecc-tool-check-coverage.md" <<EOF
# ECC Tool Prompt: check-coverage

Analyze coverage and compare it to an 80% threshold (or a threshold I specify).

## Instructions
1. Find existing coverage artifacts first (\`coverage/coverage-summary.json\`, \`coverage/coverage-final.json\`, \`.nyc_output/coverage.json\`).
2. If missing, run the project's coverage command using the detected package manager.
3. Report total coverage and top under-covered files.
4. Fail the report if coverage is below threshold.

## Output Format
\`\`\`
COVERAGE: [PASS/FAIL]
Threshold: <n>%
Total lines: <n>%
Total branches: <n>% (if available)
Worst files:
- path: xx%
Recommended focus:
- ...
\`\`\`
EOF

write_extension_prompt "ecc-tool-security-audit.md" <<EOF
# ECC Tool Prompt: security-audit

Run a practical security audit: dependency vulnerabilities + secret scan + high-risk code patterns.

## Instructions
1. Run dependency audit command for this repo/package manager.
2. Scan source and staged changes for high-signal secrets (OpenAI keys, GitHub tokens, AWS keys, private keys).
3. Scan for risky patterns (\`eval(\`, \`dangerouslySetInnerHTML\`, unsanitized \`innerHTML\`, obvious SQL string interpolation).
4. Prioritize findings by severity: CRITICAL, HIGH, MEDIUM, LOW.
5. Do not auto-fix unless I explicitly ask.

## Output Format
\`\`\`
SECURITY AUDIT: [PASS/FAIL]
Dependency vulnerabilities: <summary>
Secrets findings: <count>
Code risk findings: <count>
Critical issues:
- ...
Remediation plan:
1. ...
2. ...
\`\`\`
EOF

write_extension_prompt "ecc-rules-pack-common.md" <<EOF
# ECC Rule Pack: common (optional)

Apply ECC common engineering rules for this session. Use these files as the source of truth:

- \`$CURSOR_RULES_DIR/common-agents.md\`
- \`$CURSOR_RULES_DIR/common-coding-style.md\`
- \`$CURSOR_RULES_DIR/common-development-workflow.md\`
- \`$CURSOR_RULES_DIR/common-git-workflow.md\`
- \`$CURSOR_RULES_DIR/common-hooks.md\`
- \`$CURSOR_RULES_DIR/common-patterns.md\`
- \`$CURSOR_RULES_DIR/common-performance.md\`
- \`$CURSOR_RULES_DIR/common-security.md\`
- \`$CURSOR_RULES_DIR/common-testing.md\`

Treat these as strict defaults for planning, implementation, review, and verification in this repo.
EOF

write_extension_prompt "ecc-rules-pack-typescript.md" <<EOF
# ECC Rule Pack: typescript (optional)

Apply ECC common rules plus TypeScript-specific rules for this session.

## Common
Use \`$PROMPTS_DEST/ecc-rules-pack-common.md\`.

## TypeScript Extensions
- \`$CURSOR_RULES_DIR/typescript-coding-style.md\`
- \`$CURSOR_RULES_DIR/typescript-hooks.md\`
- \`$CURSOR_RULES_DIR/typescript-patterns.md\`
- \`$CURSOR_RULES_DIR/typescript-security.md\`
- \`$CURSOR_RULES_DIR/typescript-testing.md\`

Language-specific guidance overrides common rules when they conflict.
EOF

write_extension_prompt "ecc-rules-pack-python.md" <<EOF
# ECC Rule Pack: python (optional)

Apply ECC common rules plus Python-specific rules for this session.

## Common
Use \`$PROMPTS_DEST/ecc-rules-pack-common.md\`.

## Python Extensions
- \`$CURSOR_RULES_DIR/python-coding-style.md\`
- \`$CURSOR_RULES_DIR/python-hooks.md\`
- \`$CURSOR_RULES_DIR/python-patterns.md\`
- \`$CURSOR_RULES_DIR/python-security.md\`
- \`$CURSOR_RULES_DIR/python-testing.md\`

Language-specific guidance overrides common rules when they conflict.
EOF

write_extension_prompt "ecc-rules-pack-golang.md" <<EOF
# ECC Rule Pack: golang (optional)

Apply ECC common rules plus Go-specific rules for this session.

## Common
Use \`$PROMPTS_DEST/ecc-rules-pack-common.md\`.

## Go Extensions
- \`$CURSOR_RULES_DIR/golang-coding-style.md\`
- \`$CURSOR_RULES_DIR/golang-hooks.md\`
- \`$CURSOR_RULES_DIR/golang-patterns.md\`
- \`$CURSOR_RULES_DIR/golang-security.md\`
- \`$CURSOR_RULES_DIR/golang-testing.md\`

Language-specific guidance overrides common rules when they conflict.
EOF

write_extension_prompt "ecc-rules-pack-swift.md" <<EOF
# ECC Rule Pack: swift (optional)

Apply ECC common rules plus Swift-specific rules for this session.

## Common
Use \`$PROMPTS_DEST/ecc-rules-pack-common.md\`.

## Swift Extensions
- \`$CURSOR_RULES_DIR/swift-coding-style.md\`
- \`$CURSOR_RULES_DIR/swift-hooks.md\`
- \`$CURSOR_RULES_DIR/swift-patterns.md\`
- \`$CURSOR_RULES_DIR/swift-security.md\`
- \`$CURSOR_RULES_DIR/swift-testing.md\`

Language-specific guidance overrides common rules when they conflict.
EOF

if [[ "$MODE" == "apply" ]]; then
  sort -u "$extension_manifest" -o "$extension_manifest"
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

log "Installing global git safety hooks"
if [[ "$MODE" == "dry-run" ]]; then
  "$HOOKS_INSTALLER" --dry-run
else
  "$HOOKS_INSTALLER"
fi

log "Running global regression sanity check"
if [[ "$MODE" == "dry-run" ]]; then
  printf '[dry-run] %s\n' "$SANITY_CHECKER"
else
  "$SANITY_CHECKER"
fi

log "Sync complete"
log "Backup saved at: $BACKUP_DIR"
log "Skills synced: $skills_count"
log "Prompts generated: $((prompt_count + extension_count)) (commands: $prompt_count, extensions: $extension_count)"

if [[ "$MODE" == "apply" ]]; then
  log "Done. Restart Codex CLI to reload AGENTS, prompts, and MCP servers."
fi
