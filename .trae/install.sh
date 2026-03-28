#!/bin/bash
#
# ECC Trae Installer
# Installs Everything Claude Code workflows into a Trae project.
#
# Usage:
#   ./install.sh              # Install to current directory
#   ./install.sh ~            # Install globally to ~/.trae/ or ~/.trae-cn/
#
# Environment:
#   TRAE_ENV=cn              # Force use .trae-cn directory
#

set -euo pipefail

# When globs match nothing, expand to empty list instead of the literal pattern
shopt -s nullglob

# Resolve the directory where this script lives (the repo root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Get the trae directory name (.trae or .trae-cn)
get_trae_dir() {
    if [ "${TRAE_ENV:-}" = "cn" ]; then
        echo ".trae-cn"
    else
        echo ".trae"
    fi
}

# Install function
do_install() {
    local target_dir="$PWD"
    local trae_dir="$(get_trae_dir)"

    # Check if ~ was specified (or expanded to $HOME)
    if [ "$#" -ge 1 ]; then
        if [ "$1" = "~" ] || [ "$1" = "$HOME" ]; then
            target_dir="$HOME"
        fi
    fi

    # Check if we're already inside a .trae or .trae-cn directory
    local current_dir_name="$(basename "$target_dir")"
    local trae_full_path

    if [ "$current_dir_name" = ".trae" ] || [ "$current_dir_name" = ".trae-cn" ]; then
        # Already inside the trae directory, use it directly
        trae_full_path="$target_dir"
    else
        # Normal case: append trae_dir to target_dir
        trae_full_path="$target_dir/$trae_dir"
    fi

    echo "ECC Trae Installer"
    echo "=================="
    echo ""
    echo "Source:  $REPO_ROOT"
    echo "Target:  $trae_full_path/"
    echo ""

    # Subdirectories to create
    SUBDIRS="commands agents skills rules"

    # Create all required trae subdirectories
    for dir in $SUBDIRS; do
        mkdir -p "$trae_full_path/$dir"
    done

    # Manifest file to track installed files
    MANIFEST="$trae_full_path/.ecc-manifest"
    rm -f "$MANIFEST"

    # Counters for summary
    commands=0
    agents=0
    skills=0
    rules=0
    other=0

    # Copy commands from repo root
    if [ -d "$REPO_ROOT/commands" ]; then
        for f in "$REPO_ROOT/commands"/*.md; do
            [ -f "$f" ] || continue
            local_name=$(basename "$f")
            target_path="$trae_full_path/commands/$local_name"
            if [ ! -f "$target_path" ]; then
                cp "$f" "$target_path" 2>/dev/null || true
                echo "commands/$local_name" >> "$MANIFEST"
                commands=$((commands + 1))
            fi
        done
    fi

    # Copy agents from repo root
    if [ -d "$REPO_ROOT/agents" ]; then
        for f in "$REPO_ROOT/agents"/*.md; do
            [ -f "$f" ] || continue
            local_name=$(basename "$f")
            target_path="$trae_full_path/agents/$local_name"
            if [ ! -f "$target_path" ]; then
                cp "$f" "$target_path" 2>/dev/null || true
                echo "agents/$local_name" >> "$MANIFEST"
                agents=$((agents + 1))
            fi
        done
    fi

    # Copy skills from repo root (if available)
    if [ -d "$REPO_ROOT/skills" ]; then
        for d in "$REPO_ROOT/skills"/*/; do
            [ -d "$d" ] || continue
            skill_name="$(basename "$d")"
            target_skill_dir="$trae_full_path/skills/$skill_name"
            if [ ! -d "$target_skill_dir" ]; then
                mkdir -p "$target_skill_dir"
                cp -r "$d"* "$target_skill_dir/" 2>/dev/null || true
                for skill_file in "$target_skill_dir"/*; do
                    [ -f "$skill_file" ] || continue
                    relative_path="skills/$skill_name/$(basename "$skill_file")"
                    echo "$relative_path" >> "$MANIFEST"
                done
                echo "skills/$skill_name" >> "$MANIFEST"
                skills=$((skills + 1))
            fi
        done
    fi

    # Copy rules from repo root
    if [ -d "$REPO_ROOT/rules" ]; then
        if [ -d "$REPO_ROOT/rules/common" ]; then
            for f in "$REPO_ROOT/rules/common"/*.md; do
                [ -f "$f" ] || continue
                local_name=$(basename "$f")
                target_path="$trae_full_path/rules/$local_name"
                if [ ! -f "$target_path" ]; then
                    cp "$f" "$target_path" 2>/dev/null || true
                    echo "rules/$local_name" >> "$MANIFEST"
                    rules=$((rules + 1))
                fi
            done
        fi
    fi

    # Copy README files from this directory
    for readme_file in "$SCRIPT_DIR/README.md" "$SCRIPT_DIR/README.zh-CN.md"; do
        if [ -f "$readme_file" ]; then
            local_name=$(basename "$readme_file")
            target_path="$trae_full_path/$local_name"
            if [ ! -f "$target_path" ]; then
                cp "$readme_file" "$target_path" 2>/dev/null || true
                echo "$local_name" >> "$MANIFEST"
                other=$((other + 1))
            fi
        fi
    done

    # Copy install and uninstall scripts
    for script_file in "$SCRIPT_DIR/install.sh" "$SCRIPT_DIR/uninstall.sh"; do
        if [ -f "$script_file" ]; then
            local_name=$(basename "$script_file")
            target_path="$trae_full_path/$local_name"
            if [ ! -f "$target_path" ]; then
                cp "$script_file" "$target_path" 2>/dev/null || true
                chmod +x "$target_path" 2>/dev/null || true
                echo "$local_name" >> "$MANIFEST"
                other=$((other + 1))
            fi
        fi
    done

    # Add manifest file itself to manifest
    echo ".ecc-manifest" >> "$MANIFEST"

    # Installation summary
    echo "Installation complete!"
    echo ""
    echo "Components installed:"
    echo "  Commands:  $commands"
    echo "  Agents:    $agents"
    echo "  Skills:    $skills"
    echo "  Rules:     $rules"
    echo ""
    echo "Directory:   $(basename "$trae_full_path")"
    echo ""
    echo "Next steps:"
    echo "  1. Open your project in Trae"
    echo "  2. Type / to see available commands"
    echo "  3. Enjoy the ECC workflows!"
    echo ""
    echo "To uninstall later:"
    echo "  cd $trae_full_path"
    echo "  ./uninstall.sh"
}

# Main logic
do_install "$@"
