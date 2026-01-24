#!/bin/bash

# Setup symlinks from ~/.claude to everything-claude-code repository
# This allows editing files in the repo while Claude Code uses them

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "🔗 Setting up symlinks for Claude Code"
echo "Repository: $REPO_DIR"
echo "Claude dir: $CLAUDE_DIR"
echo ""

# Directories to symlink
DIRS=(
  "agents"
  "commands"
  "skills"
  "scripts"
  "rules"
  "hooks"
)

# Create backup directory with timestamp
BACKUP_DIR="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"

echo "📦 Backup directory: $BACKUP_DIR"
echo ""

# Function to setup symlink for a directory
setup_symlink() {
  local dir_name="$1"
  local source="$REPO_DIR/$dir_name"
  local target="$CLAUDE_DIR/$dir_name"

  if [ ! -d "$source" ]; then
    echo "⚠️  Skipping $dir_name (not found in repo)"
    return
  fi

  # Check if target exists and is not a symlink
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "📂 Backing up existing $dir_name..."
    mkdir -p "$BACKUP_DIR"
    mv "$target" "$BACKUP_DIR/$dir_name"
  fi

  # Remove existing symlink if any
  if [ -L "$target" ]; then
    echo "🔄 Updating existing symlink for $dir_name..."
    rm "$target"
  fi

  # Create symlink
  ln -s "$source" "$target"
  echo "✓ Linked $dir_name -> $source"
}

# Process each directory
for dir in "${DIRS[@]}"; do
  setup_symlink "$dir"
done

echo ""
echo "✨ Symlink setup complete!"
echo ""

# Show backup info if backup was created
if [ -d "$BACKUP_DIR" ]; then
  echo "📦 Original files backed up to:"
  echo "   $BACKUP_DIR"
  echo ""
  echo "To restore originals:"
  echo "   rm -rf $CLAUDE_DIR/{agents,commands,skills,scripts}"
  echo "   mv $BACKUP_DIR/* $CLAUDE_DIR/"
  echo "   rmdir $BACKUP_DIR"
  echo ""
fi

# Verify symlinks
echo "🔍 Verifying symlinks:"
for dir in "${DIRS[@]}"; do
  target="$CLAUDE_DIR/$dir"
  if [ -L "$target" ]; then
    link_target=$(readlink "$target")
    echo "  ✓ $dir -> $link_target"
  fi
done

echo ""
echo "✅ Done! You can now edit files in:"
echo "   $REPO_DIR"
echo ""
echo "And Claude Code will use them from:"
echo "   $CLAUDE_DIR"
