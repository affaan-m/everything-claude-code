# Everything Claude Code for JoyCode

Bring Everything Claude Code (ECC) workflows to JoyCode IDE. This repository provides custom commands, agents, skills, and rules that can be installed into any JoyCode project with a single command.

## Quick Start

### Option 1: Local Installation (Current Project Only)

```bash
# Install to current project
cd /path/to/your/project
.joycode/install.sh
```

This creates `.joycode/` in your project directory.

### Option 2: Global Installation (All Projects)

```bash
# Install globally to ~/.joycode/
cd /path/to/your/project
.joycode/install.sh ~

# Or from the .joycode folder directly
cd /path/to/your/project/.joycode
./install.sh ~
```

This creates `~/.joycode/` which applies to all JoyCode projects.

### Option 3: Quick Install to Current Directory

```bash
# If already in project directory with .joycode folder
cd .joycode
./install.sh
```

The installer uses non-destructive copy - it will not overwrite your existing files.

## Installation Modes

### Local Installation

Install to the current project's `.joycode` directory:

```bash
cd /path/to/your/project
.joycode/install.sh
```

This creates `/path/to/your/project/.joycode/` with all ECC components.

### Global Installation

Install to your home directory's `.joycode` directory (applies to all JoyCode projects):

```bash
# From project directory
.joycode/install.sh ~

# Or directly from .joycode folder
cd .joycode
./install.sh ~
```

This creates `~/.joycode/` with all ECC components. All JoyCode projects will use these global installations.

**Note**: Global installation is useful when you want to maintain a single copy of ECC across all your projects.

## Uninstall

The uninstaller uses a manifest file (`.ecc-manifest`) to track installed files, ensuring safe removal:

```bash
# Uninstall from current directory (if already inside .joycode)
cd .joycode
./uninstall.sh

# Or uninstall from project root
cd /path/to/your/project
.joycode/uninstall.sh

# Uninstall globally from home directory
.joycode/uninstall.sh ~

# Will ask for confirmation before uninstalling
```

### Uninstall Behavior

- **Safe removal**: Only removes files tracked in the manifest (installed by ECC)
- **User files preserved**: Any files you added manually are kept
- **Non-empty directories**: Directories containing user-added files are skipped
- **Manifest-based**: Requires `.ecc-manifest` file (created during install)

**Note**: If no manifest file is found (old installation), the uninstaller will ask whether to remove the entire directory.

## What's Included

### Commands

Commands are on-demand workflows invocable via the `/` menu in JoyCode chat. All commands are reused directly from the project root's `commands/` folder.

### Agents

Agents are specialized AI assistants with specific tool configurations. All agents are reused directly from the project root's `agents/` folder.

### Skills

Skills are on-demand workflows invocable via the `/` menu in chat. All skills are reused directly from the project's `skills/` folder.

### Rules

Rules provide always-on rules and context that shape how the agent works with your code. All rules are reused directly from the project root's `rules/` folder.

## Usage

1. Type `/` in chat to open the commands menu
2. Select a command or skill
3. The agent will guide you through the workflow with specific instructions and checklists

## Project Structure

```
.joycode/
├── commands/           # Command files (reused from project root)
├── agents/             # Agent files (reused from project root)
├── skills/             # Skill files (reused from skills/)
├── rules/              # Rule files (reused from project root)
├── install.sh          # Install script
├── uninstall.sh        # Uninstall script
└── README.md           # This file
```

## Customization

All files are yours to modify after installation. The installer never overwrites existing files, so your customizations are safe across re-installs.

**Note**: The `install.sh` and `uninstall.sh` scripts are automatically copied to the target directory during installation, so you can run these commands directly from your project.

## Recommended Workflow

1. **Start with planning**: Use `/plan` command to break down complex features
2. **Write tests first**: Invoke `/tdd` command before implementing
3. **Review your code**: Use `/code-review` after writing code
4. **Check security**: Use `/code-review` again for auth, API endpoints, or sensitive data handling
5. **Fix build errors**: Use `/build-fix` if there are build errors

## Next Steps

- Open your project in JoyCode
- Type `/` to see available commands
- Enjoy the ECC workflows!