# Qwen CLI Setup Guide for Everything Claude Code (ECC)

This guide explains how to set up ECC for Qwen CLI.

## Prerequisites

- Qwen CLI installed and configured
- Node.js 18+ and npm/pnpm/yarn/bun
- Git

## Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
```

### Step 2: Install Dependencies

```bash
# Pick your package manager
npm install
# or: pnpm install | yarn install | bun install
```

### Step 3: Install ECC for Qwen CLI

```bash
# Recommended: install everything (full profile)
./install.sh --target qwen --profile full

# Or install for specific languages only
./install.sh --target qwen typescript
./install.sh --target qwen python golang
./install.sh --target qwen typescript python golang swift php
```

### Step 4: Verify Installation

```bash
# Check what was installed
ls -la ~/.qwen/
ls -la ~/.qwen/rules/
```

## What Gets Installed

When you run `./install.sh --target qwen`, ECC installs:

| Component | Location | Description |
|-----------|----------|-------------|
| Rules | `~/.qwen/rules/` | Coding standards and guidelines |
| Agents | `~/.qwen/agents/` | Specialized subagent definitions |
| Skills | `~/.qwen/skills/` | Workflow definitions |
| Hooks | `~/.qwen/hooks/` | Event-based automations |
| MCP Configs | `~/.qwen/mcp.json` | MCP server configurations |

## Available Languages

ECC supports rules for these languages:
- **Common** (language-agnostic, always installed)
- **TypeScript/JavaScript**
- **Python**
- **Go/Golang**
- **Swift**
- **PHP**
- **Java**
- **Kotlin**
- **Rust**
- **C++**
- **Perl**

## Profiles

ECC provides different install profiles:

- **full** - Install all components (recommended for new users)
- **minimal** - Install only core components
- **custom** - Select specific modules

## Manual Installation

If you prefer manual control:

```bash
# Clone the repo
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code

# Copy rules
mkdir -p ~/.qwen/rules
cp -r rules/common ~/.qwen/rules/
cp -r rules/typescript ~/.qwen/rules/  # pick your stack
cp -r rules/python ~/.qwen/rules/
cp -r rules/golang ~/.qwen/rules/

# Copy agents
mkdir -p ~/.qwen/agents
cp agents/*.md ~/.qwen/agents/

# Copy skills
mkdir -p ~/.qwen/skills
cp -r skills/* ~/.qwen/skills/
```

## Configuration

Add to your Qwen CLI config (`~/.qwen/settings.json`):

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

## Using ECC with Qwen CLI

### Available Commands

Once installed, you can use ECC commands in Qwen CLI:

```bash
# Plan a new feature
/ecc:plan "Add user authentication"

# TDD workflow
/tdd

# Code review
/code-review

# Security scan
/security-scan

# Fix build errors
/build-fix
```

### Token Optimization

```bash
# Use Sonnet for most tasks (60% cost reduction)
/model sonnet

# Switch to Opus for complex architecture
/model opus

# Monitor spending
/cost

# Clear context between unrelated tasks
/clear

# Compact at logical breakpoints
/compact
```

## Troubleshooting

### Hooks Not Working

If hooks aren't firing:
1. Check that Qwen CLI supports the hook events
2. Verify `~/.qwen/hooks/` directory exists
3. Check hook configurations in settings

### Rules Not Applied

If rules aren't being followed:
1. Verify rules are in `~/.qwen/rules/`
2. Check Qwen CLI config references the rules directory
3. Restart Qwen CLI

### Missing Components

If some components are missing:
1. Run `./install.sh --target qwen --profile full`
2. Check for errors during installation
3. Verify the `.qwen/` directory in the repo exists

## Contributing

Found issues or want to improve Qwen CLI support? See [CONTRIBUTING.md](CONTRIBUTING.md).

## Additional Resources

- [Shorthand Guide](https://x.com/affaanmustafa/status/2012378465664745795)
- [Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352)
- [Security Guide](./the-security-guide.md)
- [Token Optimization](docs/token-optimization.md)
