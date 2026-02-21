#!/bin/bash
# Claude Stack Installation Script for macOS
# This script provides guidance for installing Claude Desktop, Claude Code, and dependencies
# It does NOT auto-copy configuration files to prevent accidental secret exposure

set -e

BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}Claude Stack Installation Script for macOS${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

# Check macOS version
echo -e "${BOLD}Checking System Requirements...${NC}"
OS_VERSION=$(sw_vers -productVersion)
echo "macOS Version: $OS_VERSION"

MAJOR_VERSION=$(echo "$OS_VERSION" | cut -d '.' -f 1)
if [ "$MAJOR_VERSION" -lt 12 ]; then
    echo -e "${RED}Warning: macOS 12.0 or later is recommended${NC}"
fi
echo ""

# Check/Install Homebrew
echo -e "${BOLD}Checking Homebrew...${NC}"
if command_exists brew; then
    echo -e "${GREEN}✓${NC} Homebrew is installed: $(brew --version | head -1)"
else
    echo -e "${YELLOW}Homebrew not found.${NC}"
    echo "Homebrew is recommended for managing dependencies."
    echo ""
    read -p "Install Homebrew? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_status "Homebrew installation"
    else
        echo "Skipping Homebrew installation."
    fi
fi
echo ""

# Check/Install Node.js
echo -e "${BOLD}Checking Node.js...${NC}"
if command_exists node; then
    echo -e "${GREEN}✓${NC} Node.js is installed: $(node --version)"
    echo -e "${GREEN}✓${NC} npm is installed: $(npm --version)"
else
    echo -e "${YELLOW}Node.js not found.${NC}"
    echo "Node.js is required for npx-based MCP servers."
    echo ""
    if command_exists brew; then
        read -p "Install Node.js via Homebrew? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Installing Node.js..."
            brew install node
            print_status "Node.js installation"
        else
            echo "Skipping Node.js installation."
        fi
    else
        echo "Please install Node.js manually from: https://nodejs.org/"
    fi
fi
echo ""

# Check Python (for validation scripts)
echo -e "${BOLD}Checking Python...${NC}"
if command_exists python3; then
    echo -e "${GREEN}✓${NC} Python 3 is installed: $(python3 --version)"
else
    echo -e "${YELLOW}Python 3 not found.${NC}"
    echo "Python 3 is useful for JSON validation and helper scripts."
    echo "Install via: brew install python3"
fi
echo ""

# Claude Desktop Installation
echo -e "${BOLD}Claude Desktop Installation${NC}"
if [ -d "/Applications/Claude.app" ]; then
    echo -e "${GREEN}✓${NC} Claude Desktop is already installed"
    VERSION=$(defaults read /Applications/Claude.app/Contents/Info.plist CFBundleShortVersionString 2>/dev/null || echo "Unknown")
    echo "   Version: $VERSION"
else
    echo -e "${YELLOW}Claude Desktop not found in /Applications/${NC}"
    echo ""
    echo "To install Claude Desktop:"
    echo "1. Visit https://claude.ai"
    echo "2. Download Claude Desktop for macOS"
    echo "3. Open the .dmg file and drag Claude to Applications"
    echo ""
    echo "Note: Check official Claude documentation for current download links"
    read -rp "Press Enter when installation is complete (or Ctrl+C to exit)..."
fi
echo ""

# Claude Code Installation
echo -e "${BOLD}Claude Code Installation${NC}"
if command_exists claude; then
    echo -e "${GREEN}✓${NC} Claude CLI is installed: $(claude --version 2>/dev/null || echo "Version unknown")"
else
    echo -e "${YELLOW}Claude Code CLI not found${NC}"
    echo ""
    echo "To install Claude Code:"
    echo "1. Follow official Claude Code installation documentation"
    echo "2. Ensure the 'claude' CLI tool is in your PATH"
    echo "3. Verify installation with: claude --version"
    echo ""
    echo "Note: Check official Claude Code documentation for current installation method"
    read -rp "Press Enter when installation is complete (or Ctrl+C to exit)..."
fi
echo ""

# MCP Configuration Setup
echo -e "${BOLD}MCP Configuration Setup${NC}"
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✓${NC} MCP configuration already exists at:"
    echo "   $CONFIG_FILE"
    echo ""
    echo "To update your configuration:"
    echo "1. Review the example config: ./claude_desktop_config.json"
    echo "2. Manually edit your existing config as needed"
    echo "3. NEVER copy-paste configurations containing secrets"
    echo "4. Validate JSON syntax: python3 -m json.tool \"$CONFIG_FILE\""
else
    echo -e "${YELLOW}No MCP configuration found${NC}"
    echo ""
    echo "To create MCP configuration:"
    echo "1. Create directory: mkdir -p \"$CONFIG_DIR\""
    echo "2. Review example config: ./claude_desktop_config.example.json"
    echo "3. Copy and customize for your needs"
    echo "4. IMPORTANT: Remove any '_comment*' fields if you copied an annotated example"
    echo "5. Use environment variables for any secrets"
    echo ""
    read -p "Create minimal config now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create directory with secure permissions
        mkdir -p "$CONFIG_DIR"
        chmod 700 "$CONFIG_DIR"
        
        # Expand path for actual config (no shell expansion in JSON)
        PROJECTS_DIR="$HOME/projects"
        
        # JSON-escape the path safely (requires Python for proper escaping)
        if command -v python3 &> /dev/null; then
            PROJECTS_DIR_JSON=$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$PROJECTS_DIR")
        else
            echo -e "${RED}Error: Python 3 is required for safe JSON generation${NC}"
            echo "Please install Python 3 and try again: brew install python3"
            exit 1
        fi
        
        # Create minimal config with expanded paths (not $HOME literals)
        cat > "$CONFIG_FILE" <<EOF
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        ${PROJECTS_DIR_JSON}
      ],
      "deny": [
        "Read(./.env)",
        "Read(./.env.*)",
        "Write(./.env)",
        "Read(./config/secrets.*)",
        "Write(./config/secrets.*)"
      ]
    }
  }
}
EOF
        
        # Set secure permissions on config file
        chmod 600 "$CONFIG_FILE"
        
        echo -e "${GREEN}✓${NC} Minimal config created at: $CONFIG_FILE"
        echo -e "${GREEN}✓${NC} Permissions set to 600 (user read/write only)"
        echo ""
        echo "NEXT STEPS:"
        echo "1. Edit the config to specify your actual project directory"
        echo "2. Add any additional MCP servers you need"
        echo "3. Review and adjust deny lists for your security needs"
        echo "4. Validate JSON: python3 -m json.tool \"$CONFIG_FILE\""
    else
        echo "Skipping config creation."
        echo "You can create it manually later using the example config as reference."
    fi
fi
echo ""

# Security Reminders
echo -e "${BOLD}${YELLOW}SECURITY REMINDERS${NC}"
echo ""
echo "⚠️  NEVER put API keys or secrets in claude_desktop_config.json"
echo "⚠️  Use environment variables for sensitive data"
echo "⚠️  Use deny lists to protect sensitive files (.env, .ssh, .aws, etc.)"
echo "⚠️  Only grant MCPs minimal necessary access"
echo "⚠️  Review the SECURITY.md file for detailed guidance"
echo ""

# Import to Claude Code
if command_exists claude; then
    echo -e "${BOLD}Import Configuration to Claude Code${NC}"
    echo ""
    echo "After configuring MCPs in Claude Desktop, import to Claude Code:"
    echo ""
    echo "    claude mcp add-from-claude-desktop"
    echo ""
    read -p "Import configuration now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "$CONFIG_FILE" ]; then
            echo "Running: claude mcp add-from-claude-desktop"
            claude mcp add-from-claude-desktop || echo "Import command failed or not available"
            print_status "Configuration import"
        else
            echo -e "${RED}No Desktop config found to import${NC}"
        fi
    fi
    echo ""
fi

# Verification
echo -e "${BOLD}Verification Steps${NC}"
echo ""
echo "Run these commands to verify your setup:"
echo ""
echo "1. Check Claude Desktop is installed:"
echo "   ls -la /Applications/Claude.app"
echo ""
echo "2. Check Claude Code CLI:"
echo "   claude --version"
echo ""
echo "3. Validate MCP configuration:"
echo "   python3 -m json.tool \"$CONFIG_FILE\""
echo ""
echo "4. List imported MCP servers:"
echo "   claude mcp list"
echo ""
echo "5. Test MCPs interactively in Claude Desktop and Code"
echo ""

# Acceptance Testing
echo -e "${BOLD}Acceptance Testing${NC}"
echo ""
echo "For comprehensive acceptance testing, see:"
echo "- Migration docs: ../AI/09-Migration-Meta/MIG_2026-02-17/ACCEPTANCE_TEST.md"
echo "- Or refer to Claude documentation for testing procedures"
echo ""

# Additional Resources
echo -e "${BOLD}Additional Resources${NC}"
echo ""
echo "Documentation:"
echo "- README.md in this directory"
echo "- SECURITY.md for security best practices"
echo "- stack-comparison.md for tooling comparison"
echo ""
echo "Official Links:"
echo "- Claude Code Settings: https://code.claude.com/docs/de/settings"
echo "- GitHub MCP Server: https://github.com/github/github-mcp-server"
echo "- MCP Specification: https://modelcontextprotocol.io"
echo ""

echo -e "${BOLD}${GREEN}Installation guidance complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Complete any pending installations"
echo "2. Configure MCP servers in Claude Desktop"
echo "3. Import configuration to Claude Code"
echo "4. Review SECURITY.md for security best practices"
echo "5. Run acceptance tests to verify everything works"
echo ""
