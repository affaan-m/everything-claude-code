# Qwen CLI Configuration

This directory contains Qwen CLI-specific configuration and agent definitions for the ECC repository.

## Important Distinction

- **Repository `.qwen/`**: This directory contains configuration templates and documentation for the ECC project
- **Runtime `~/.qwen/`**: Your home directory's `.qwen/` folder where ECC installs rules, skills, agents, and hooks after running `./install.sh --target qwen`

## Setup

Qwen CLI automatically detects this `.qwen/` directory when running in a repository with ECC installed.

## Quick Start

```bash
# Install ECC rules for Qwen CLI
./install.sh --target qwen --profile full

# Or install for specific languages only
./install.sh --target qwen typescript
./install.sh --target qwen python golang
```

## Structure

- `QWEN.md` - Main configuration file (this file)
- `agents/` - Agent role definitions
- `skills/` - Skill definitions
- `rules/` - Coding standards and guidelines
- `hooks/` - Event-based automations
- `ecc-install-state.json` - Installation state tracking

## Features

Qwen CLI support includes:
- Rules installation to `~/.qwen/rules/`
- Agent definitions
- Skills and workflows
- Hook automations
- MCP server configurations

## Compatibility

ECC provides full Qwen CLI support with:
- Rules adapted for Qwen's format
- Skills compatible with Qwen's workflow system
- Hooks for automation
- Agent definitions for delegation
