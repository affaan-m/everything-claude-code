#!/bin/bash
#
# ECC Trae Uninstaller
# Uninstalls Everything Claude Code workflows from a Trae project.
#
# Usage:
#   ./uninstall.sh              # Uninstall from current directory
#   ./uninstall.sh ~            # Uninstall globally from ~/.trae/
#
# Environment:
#   TRAE_ENV=cn              # Force use .trae-cn directory
#

set -euo pipefail

# Resolve the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Get the trae directory name (.trae or .trae-cn)
get_trae_dir() {
    # Check environment variable first
    if [ "${TRAE_ENV:-}" = "cn" ]; then
        echo ".trae-cn"
    else
        echo ".trae"
    fi
}

# Main uninstall function
do_uninstall() {
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
    
    echo "ECC Trae Uninstaller"
    echo "===================="
    echo ""
    echo "Target:  $trae_full_path/"
    echo ""
    
    if [ ! -d "$trae_full_path" ]; then
        echo "Error: $trae_dir directory not found at $target_dir"
        exit 1
    fi
    
    # Manifest file path
    MANIFEST="$trae_full_path/.ecc-manifest"
    
    if [ ! -f "$MANIFEST" ]; then
        echo "Warning: No manifest file found (.ecc-manifest)"
        echo ""
        echo "This could mean:"
        echo "  1. ECC was installed with an older version without manifest support"
        echo "  2. The manifest file was manually deleted"
        echo ""
        read -p "Do you want to remove the entire $trae_dir directory? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Uninstall cancelled."
            exit 0
        fi
        rm -rf "$trae_full_path"
        echo "Uninstall complete!"
        echo ""
        echo "Removed: $trae_full_path/"
        exit 0
    fi
    
    echo "Found manifest file - will only remove files installed by ECC"
    echo ""
    read -p "Are you sure you want to uninstall ECC from $trae_dir? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Uninstall cancelled."
        exit 0
    fi
    
    # Counters
    removed=0
    skipped=0
    
    # Read manifest and remove files
    while IFS= read -r file_path; do
        [ -z "$file_path" ] && continue
        
        full_path="$trae_full_path/$file_path"
        
        if [ -f "$full_path" ]; then
            rm -f "$full_path"
            echo "Removed: $file_path"
            removed=$((removed + 1))
        elif [ -d "$full_path" ]; then
            # Only remove directory if it's empty
            if [ -z "$(ls -A "$full_path" 2>/dev/null)" ]; then
                rmdir "$full_path" 2>/dev/null || true
                if [ ! -d "$full_path" ]; then
                    echo "Removed: $file_path/"
                    removed=$((removed + 1))
                fi
            else
                echo "Skipped: $file_path/ (not empty - contains user files)"
                skipped=$((skipped + 1))
            fi
        else
            skipped=$((skipped + 1))
        fi
    done < "$MANIFEST"
    
    # Try to remove subdirectories if they're empty
    for subdir in commands agents skills rules; do
        subdir_path="$trae_full_path/$subdir"
        if [ -d "$subdir_path" ] && [ -z "$(ls -A "$subdir_path" 2>/dev/null)" ]; then
            rmdir "$subdir_path" 2>/dev/null || true
            if [ ! -d "$subdir_path" ]; then
                echo "Removed: $subdir/"
                removed=$((removed + 1))
            fi
        fi
    done
    
    # Try to remove the main trae directory if it's empty
    if [ -d "$trae_full_path" ] && [ -z "$(ls -A "$trae_full_path" 2>/dev/null)" ]; then
        rmdir "$trae_full_path" 2>/dev/null || true
        if [ ! -d "$trae_full_path" ]; then
            echo "Removed: $trae_dir/"
            removed=$((removed + 1))
        fi
    fi
    
    echo ""
    echo "Uninstall complete!"
    echo ""
    echo "Summary:"
    echo "  Removed: $removed items"
    echo "  Skipped: $skipped items (not found or user-modified)"
    echo ""
    if [ -d "$trae_full_path" ]; then
        echo "Note: $trae_dir directory still exists (contains user-added files)"
    fi
}

# Execute uninstall
do_uninstall "$@"
