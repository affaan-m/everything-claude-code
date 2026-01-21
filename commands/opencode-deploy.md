---
description: Deploy OpenCode skills, agents, and plugins from project to global config
usage: opencode --opencode-deploy [component-type] [path] [--backup] [--symlink]
---

# OpenCode Deploy Tool

Safely deploy local OpenCode extensions to global configuration with validation and backup.

## Purpose

Move OpenCode components from project-level (`.opencode/`) to global configuration (`~/.config/opencode/`) with:
- Pre-deployment validation
- Automatic backups
- Symlink support for development
- Rollback capability

## Actions

### `skill` - Deploy skill to global
```bash
opencode --opencode-deploy skill /path/to/skill

# Or with symlink for development
opencode --opencode-deploy skill /path/to/skill --symlink
```

### `agent` - Deploy agent to global
```bash
opencode --opencode-deploy agent /path/to/agent.md

# Backup existing before overwrite
opencode --opencode-deploy agent /path/to/agent.md --backup
```

### `plugin` - Deploy plugin to global
```bash
opencode --opencode-deploy plugin /path/to/plugin
```

### `command` - Deploy command to global
```bash
opencode --opencode-deploy command /path/to/command.md
```

### `validate` - Check deployment readiness
```bash
opencode --opencode-deploy validate /path/to/component
```

Shows whether component can be deployed without errors.

## Options

- `--backup` - Create backup before deployment
- `--symlink` - Use symlink instead of copy (for development)
- `--force` - Overwrite existing without asking
- `--dry-run` - Show what would happen without deploying

## Workflow

### Standard Deployment
```bash
# 1. Create in project
.opencode/skill/my-skill/
└── SKILL.md

# 2. Validate
opencode --opencode-deploy validate .opencode/skill/my-skill

# 3. Deploy
opencode --opencode-deploy skill .opencode/skill/my-skill

# 4. Verify
opencode --skill-search my-skill
```

### Development with Symlink
```bash
# 1. Deploy with symlink (for active development)
opencode --opencode-deploy skill /path/to/skill --symlink

# 2. Edit skill locally
vim /path/to/skill/SKILL.md

# 3. Changes immediately available (no re-deployment needed)

# 4. When done, convert to permanent deployment
opencode --opencode-deploy skill /path/to/skill
```

### Safe Deployment with Backup
```bash
# 1. Backup existing
opencode --opencode-deploy agent my-agent.md --backup

# 2. Deploy new version
opencode --opencode-deploy agent my-agent.md --force

# 3. If problems arise, restore
opencode --opencode-deploy restore agent my-agent
```

## Examples

### Deploy skill globally
```bash
opencode --opencode-deploy skill .opencode/skill/api-testing

# Success: Skill deployed to ~/.config/opencode/skill/api-testing/
# Verify with: opencode --skill-search api-testing
```

### Deploy agent with backup
```bash
opencode --opencode-deploy agent .opencode/agent/architect.md --backup

# Backup created: ~/.config/opencode/agent/architect.md.backup.20260121
# Agent deployed
```

### Deploy plugin
```bash
opencode --opencode-deploy plugin .opencode/plugin/my-plugin

# Copied to: ~/.config/opencode/plugin/my-plugin
# Plugin now globally available
```

### Development symlink
```bash
# While developing, use symlink
opencode --opencode-deploy skill ~/my-skill-dev --symlink

# Later, convert to copy
opencode --opencode-deploy skill ~/my-skill-dev --force
```

## Validation Checks

Before deployment, verifies:

- ✅ Source path exists
- ✅ Component has required files (SKILL.md, frontmatter, etc)
- ✅ JSON/YAML syntax valid
- ✅ No naming conflicts in global config
- ✅ All referenced files exist
- ✅ Permissions allow access

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Component not found" | Verify path is correct with `ls -la <path>` |
| "Validation failed" | Run `opencode-doctor` for detailed errors |
| "Naming conflict" | Rename component or remove existing with `opencode-plugins remove` |
| "Permission denied" | Check file permissions: `chmod 644 SKILL.md` |

## When to Use

- **Initial deployment**: Move from project to global
- **Production release**: Deploy tested skill/agent/plugin
- **Development**: Use `--symlink` for rapid iteration
- **Safe updates**: Use `--backup` before overwriting
- **Verification**: Use `validate` before committing

## Complementary Commands

- `opencode --opencode-doctor` - Validate overall system health
- `opencode --opencode-config` - Show current configuration
- `opencode --opencode-plugins list` - List deployed plugins
