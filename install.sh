#!/usr/bin/env bash
# install.sh — Install ECC rules/adapters while preserving directory structure.
#
# Usage:
#   ./install.sh [--target <claude|cursor|codex>] <language> [<language> ...]
#
# Examples:
#   ./install.sh typescript
#   ./install.sh typescript python golang
#   ./install.sh --target cursor typescript
#   ./install.sh --target cursor typescript python golang
#   ./install.sh --target codex typescript
#   ./install.sh --target codex typescript python golang
#
# Targets:
#   claude  (default) — Install rules to ~/.claude/rules/
#   cursor  — Install rules, agents, skills, commands, and MCP to ./.cursor/
#   codex   — Install rules + Codex bootstrap files to ./.codex/ and AGENTS.md
#
# This script copies rules into the target directory keeping the common/ and
# language-specific subdirectories intact so that:
#   1. Files with the same name in common/ and <language>/ don't overwrite
#      each other.
#   2. Relative references (e.g. ../common/coding-style.md) remain valid.

set -euo pipefail

# Resolve symlinks — needed when invoked as `ecc-install` via npm/bun bin symlink
SCRIPT_PATH="$0"
while [ -L "$SCRIPT_PATH" ]; do
    link_dir="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
    SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
    # Resolve relative symlinks
    [[ "$SCRIPT_PATH" != /* ]] && SCRIPT_PATH="$link_dir/$SCRIPT_PATH"
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
RULES_DIR="$SCRIPT_DIR/rules"

# --- Parse --target flag ---
TARGET="claude"
if [[ "${1:-}" == "--target" ]]; then
    if [[ -z "${2:-}" ]]; then
        echo "Error: --target requires a value (claude, cursor, or codex)" >&2
        exit 1
    fi
    TARGET="$2"
    shift 2
fi

if [[ "$TARGET" != "claude" && "$TARGET" != "cursor" && "$TARGET" != "codex" ]]; then
    echo "Error: unknown target '$TARGET'. Must be 'claude', 'cursor', or 'codex'." >&2
    exit 1
fi

# --- Usage ---
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 [--target <claude|cursor|codex>] <language> [<language> ...]"
    echo ""
    echo "Targets:"
    echo "  claude  (default) — Install rules to ~/.claude/rules/"
    echo "  cursor  — Install rules, agents, skills, commands, and MCP to ./.cursor/"
    echo "  codex   — Install rules + Codex bootstrap files to ./.codex/ and AGENTS.md"
    echo ""
    echo "Available languages:"
    for dir in "$RULES_DIR"/*/; do
        name="$(basename "$dir")"
        [[ "$name" == "common" ]] && continue
        echo "  - $name"
    done
    exit 1
fi

# --- Claude target (existing behavior) ---
if [[ "$TARGET" == "claude" ]]; then
    DEST_DIR="${CLAUDE_RULES_DIR:-$HOME/.claude/rules}"

    # Warn if destination already exists (user may have local customizations)
    if [[ -d "$DEST_DIR" ]] && [[ "$(ls -A "$DEST_DIR" 2>/dev/null)" ]]; then
        echo "Note: $DEST_DIR/ already exists. Existing files will be overwritten."
        echo "      Back up any local customizations before proceeding."
    fi

    # Always install common rules
    echo "Installing common rules -> $DEST_DIR/common/"
    mkdir -p "$DEST_DIR/common"
    cp -r "$RULES_DIR/common/." "$DEST_DIR/common/"

    # Install each requested language
    for lang in "$@"; do
        # Validate language name to prevent path traversal
        if [[ ! "$lang" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            echo "Error: invalid language name '$lang'. Only alphanumeric, dash, and underscore allowed." >&2
            continue
        fi
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
fi

# --- Cursor target ---
if [[ "$TARGET" == "cursor" ]]; then
    DEST_DIR=".cursor"
    CURSOR_SRC="$SCRIPT_DIR/.cursor"

    echo "Installing Cursor configs to $DEST_DIR/"

    # --- Rules ---
    echo "Installing common rules -> $DEST_DIR/rules/"
    mkdir -p "$DEST_DIR/rules"
    # Copy common rules (flattened names like common-coding-style.md)
    if [[ -d "$CURSOR_SRC/rules" ]]; then
        for f in "$CURSOR_SRC/rules"/common-*.md; do
            [[ -f "$f" ]] && cp "$f" "$DEST_DIR/rules/"
        done
    fi

    # Install language-specific rules
    for lang in "$@"; do
        # Validate language name to prevent path traversal
        if [[ ! "$lang" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            echo "Error: invalid language name '$lang'. Only alphanumeric, dash, and underscore allowed." >&2
            continue
        fi
        if [[ -d "$CURSOR_SRC/rules" ]]; then
            found=false
            for f in "$CURSOR_SRC/rules"/${lang}-*.md; do
                if [[ -f "$f" ]]; then
                    cp "$f" "$DEST_DIR/rules/"
                    found=true
                fi
            done
            if $found; then
                echo "Installing $lang rules -> $DEST_DIR/rules/"
            else
                echo "Warning: no Cursor rules for '$lang' found, skipping." >&2
            fi
        fi
    done

    # --- Agents ---
    if [[ -d "$CURSOR_SRC/agents" ]]; then
        echo "Installing agents -> $DEST_DIR/agents/"
        mkdir -p "$DEST_DIR/agents"
        cp -r "$CURSOR_SRC/agents/." "$DEST_DIR/agents/"
    fi

    # --- Skills ---
    if [[ -d "$CURSOR_SRC/skills" ]]; then
        echo "Installing skills -> $DEST_DIR/skills/"
        mkdir -p "$DEST_DIR/skills"
        cp -r "$CURSOR_SRC/skills/." "$DEST_DIR/skills/"
    fi

    # --- Commands ---
    if [[ -d "$CURSOR_SRC/commands" ]]; then
        echo "Installing commands -> $DEST_DIR/commands/"
        mkdir -p "$DEST_DIR/commands"
        cp -r "$CURSOR_SRC/commands/." "$DEST_DIR/commands/"
    fi

    # --- MCP Config ---
    if [[ -f "$CURSOR_SRC/mcp.json" ]]; then
        echo "Installing MCP config -> $DEST_DIR/mcp.json"
        cp "$CURSOR_SRC/mcp.json" "$DEST_DIR/mcp.json"
    fi

    echo "Done. Cursor configs installed to $DEST_DIR/"
fi

# --- Codex target ---
if [[ "$TARGET" == "codex" ]]; then
    DEST_DIR=".codex"
    CODEX_RULES_DIR="$DEST_DIR/rules"
    CODEX_MCP_SRC="$SCRIPT_DIR/mcp-configs/mcp-servers.json"
    CODEX_MCP_DEST="$DEST_DIR/mcp-servers.json"
    CODEX_AGENTS_TEMPLATE="$SCRIPT_DIR/AGENTS.md"
    CODEX_AGENTS_FILE="AGENTS.md"
    CODEX_AGENTS_FALLBACK="$DEST_DIR/AGENTS.ecc.md"
    CODEX_TEMPLATE_MARKER="ECC_CODEX_AGENTS_TEMPLATE"

    echo "Installing Codex configs to $DEST_DIR/"

    # --- Rules ---
    echo "Installing common rules -> $CODEX_RULES_DIR/common/"
    mkdir -p "$CODEX_RULES_DIR/common"
    cp -r "$RULES_DIR/common/." "$CODEX_RULES_DIR/common/"

    # Install each requested language
    for lang in "$@"; do
        # Validate language name to prevent path traversal
        if [[ ! "$lang" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            echo "Error: invalid language name '$lang'. Only alphanumeric, dash, and underscore allowed." >&2
            continue
        fi
        lang_dir="$RULES_DIR/$lang"
        if [[ ! -d "$lang_dir" ]]; then
            echo "Warning: rules/$lang/ does not exist, skipping." >&2
            continue
        fi
        echo "Installing $lang rules -> $CODEX_RULES_DIR/$lang/"
        mkdir -p "$CODEX_RULES_DIR/$lang"
        cp -r "$lang_dir/." "$CODEX_RULES_DIR/$lang/"
    done

    # --- MCP Reference ---
    mkdir -p "$DEST_DIR"
    if [[ -f "$CODEX_MCP_SRC" ]]; then
        echo "Installing MCP reference -> $CODEX_MCP_DEST"
        cp "$CODEX_MCP_SRC" "$CODEX_MCP_DEST"
    else
        echo "Warning: MCP config source not found at $CODEX_MCP_SRC, skipping." >&2
    fi

    # --- AGENTS bootstrap ---
    if [[ -f "$CODEX_AGENTS_TEMPLATE" ]]; then
        if [[ -f "$CODEX_AGENTS_FILE" ]]; then
            if grep -q "$CODEX_TEMPLATE_MARKER" "$CODEX_AGENTS_FILE"; then
                echo "Refreshing existing ECC-managed AGENTS.md"
                cp "$CODEX_AGENTS_TEMPLATE" "$CODEX_AGENTS_FILE"
            else
                echo "Detected existing AGENTS.md, preserving it."
                echo "Writing ECC Codex adapter to $CODEX_AGENTS_FALLBACK"
                cp "$CODEX_AGENTS_TEMPLATE" "$CODEX_AGENTS_FALLBACK"
            fi
        else
            echo "Installing Codex adapter -> $CODEX_AGENTS_FILE"
            cp "$CODEX_AGENTS_TEMPLATE" "$CODEX_AGENTS_FILE"
        fi
    else
        echo "Warning: AGENTS template not found at $CODEX_AGENTS_TEMPLATE, skipping." >&2
    fi

    echo "Done. Codex configs installed to $DEST_DIR/"
fi
