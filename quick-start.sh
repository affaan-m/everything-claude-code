#!/bin/bash
# Everything Claude Code - Quick Start for Mac/Linux
# This script automates the setup process

set -e

echo "========================================"
echo "Everything Claude Code - Quick Start"
echo "========================================"
echo ""

# Check if running from the repo directory
if [ ! -d "agents" ]; then
    echo "[ERROR] Please run this script from the everything-claude-code directory"
    exit 1
fi

# Set Claude config directory
CLAUDE_DIR="$HOME/.claude"

echo "[Step 1/5] Creating Claude config directories..."
mkdir -p "$CLAUDE_DIR"/{agents,rules,commands,skills}
echo "[OK] Directories created"
echo ""

echo "[Step 2/5] Copying agents..."
cp agents/*.md "$CLAUDE_DIR/agents/"
echo "[OK] Copied agents"
echo ""

echo "[Step 3/5] Copying rules..."
cp rules/*.md "$CLAUDE_DIR/rules/"
echo "[OK] Copied rules"
echo ""

echo "[Step 4/5] Copying commands..."
cp commands/*.md "$CLAUDE_DIR/commands/"
echo "[OK] Copied commands"
echo ""

echo "[Step 5/7] Copying skills..."
cp -r skills/* "$CLAUDE_DIR/skills/"
echo "[OK] Copied skills"
echo ""

# Ask about copying hooks to settings.json
echo "[Step 6/7] Configure hooks in settings.json"
echo ""
echo "*** WARNING ***"
echo "This will copy hooks configuration to your settings.json"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
    echo "CAUTION: $SETTINGS_FILE already exists!"
    echo "Your current settings will be OVERWRITTEN (backup will be created)"
    echo ""
    read -p "Do you want to continue? (y/n): " COPY_HOOKS
else
    echo "This will create a new settings.json file."
    echo ""
    read -p "Do you want to continue? (y/n): " COPY_HOOKS
fi

if [[ "$COPY_HOOKS" == "y" || "$COPY_HOOKS" == "Y" ]]; then
    if [ -f "$SETTINGS_FILE" ]; then
        echo "Creating backup: $SETTINGS_FILE.backup"
        cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"
    fi
    cp "hooks/hooks.json" "$SETTINGS_FILE"
    echo "[OK] Hooks copied to settings.json"
else
    echo "[SKIPPED] You can manually copy hooks from: $(pwd)/hooks/hooks.json"
fi
echo ""

# Ask about copying MCP configs
echo "[Step 7/7] Configure MCP servers"
echo ""
echo "*** WARNING ***"
echo "This will copy MCP server configurations to your .claude.json"
MCP_FILE="$HOME/.claude.json"
if [ -f "$MCP_FILE" ]; then
    echo "CAUTION: $MCP_FILE already exists!"
    echo "Your current MCP configurations will be OVERWRITTEN (backup will be created)"
    echo ""
    read -p "Do you want to continue? (y/n): " COPY_MCP
else
    echo "This will create a new .claude.json file."
    echo ""
    read -p "Do you want to continue? (y/n): " COPY_MCP
fi

if [[ "$COPY_MCP" == "y" || "$COPY_MCP" == "Y" ]]; then
    if [ -f "$MCP_FILE" ]; then
        echo "Creating backup: $MCP_FILE.backup"
        cp "$MCP_FILE" "$MCP_FILE.backup"
    fi
    cp "mcp-configs/mcp-servers.json" "$MCP_FILE"
    echo "[OK] MCP configs copied to .claude.json"
    echo ""
    echo "IMPORTANT: Remember to replace YOUR_*_HERE placeholders with your actual API keys!"
else
    echo "[SKIPPED] You can manually copy MCP configs from: $(pwd)/mcp-configs/mcp-servers.json"
fi
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Files copied to: $CLAUDE_DIR"
echo ""
echo "*** NEXT STEPS ***"
echo ""
echo "1. If you copied MCP configs, edit $MCP_FILE"
echo "   and replace YOUR_*_HERE with your actual API keys"
echo ""
echo "2. Read the guides to understand how to use these configs:"
echo "   - Shorthand Guide: https://x.com/affaanmustafa/status/2012378465664745795"
echo "   - Longform Guide: https://x.com/affaanmustafa/status/2014040193557471352"
echo ""

# Open directories (Mac-specific, will fail gracefully on Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Opening directories in Finder..."
    open "$(pwd)/hooks"
    open "$(pwd)/mcp-configs"
    open "$CLAUDE_DIR"
else
    echo "Directories to review manually:"
    echo "  - $(pwd)/hooks"
    echo "  - $(pwd)/mcp-configs"
    echo "  - $CLAUDE_DIR"
fi

echo ""
echo "Press any key to continue..."
read -n 1 -s
