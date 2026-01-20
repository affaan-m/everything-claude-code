# Contributing to Everything Claude Code for Odoo 15

Thanks for wanting to contribute. This repo is meant to be a community resource for Odoo developers using Claude Code.

## What We're Looking For

### Agents

New agents that handle Odoo-specific tasks:
- Odoo version specialists (14.0, 16.0, 17.0 patterns)
- Module experts (Accounting, HR, Manufacturing, Inventory)
- Integration specialists (REST API, XMLRPC, external systems)
- Localization experts (specific country adaptations)

### Skills

Workflow definitions and domain knowledge:
- ORM advanced patterns
- Performance optimization techniques
- Module migration guides
- Testing strategies
- Security hardening

### Commands

Slash commands that invoke useful Odoo workflows:
- Module scaffolding
- Data migration
- Database analysis
- Deployment commands

### Hooks

Useful automations for Python/Odoo:
- Linting hooks (flake8, pylint)
- Security checks (sudo audit, ACL validation)
- XML validation
- Manifest validation

### Rules

Always-follow guidelines:
- Odoo coding standards
- Security rules for specific domains
- Performance requirements
- Testing requirements

### MCP Configurations

New or improved MCP server configs:
- Database tools for PostgreSQL
- Odoo-specific integrations
- Documentation tools

---

## How to Contribute

### 1. Fork the repo

```bash
git clone https://github.com/YOUR_USERNAME/everything-claude-code.git
cd everything-claude-code
```

### 2. Create a branch

```bash
git checkout -b add-manufacturing-skill
```

### 3. Add your contribution

Place files in the appropriate directory:
- `agents/` for new agents
- `skills/` for skills (can be single .md or directory with SKILL.md)
- `commands/` for slash commands
- `rules/` for rule files
- `hooks/` for hook configurations
- `mcp-configs/` for MCP server configs

### 4. Follow the format

**Agents** should have frontmatter:

```markdown
---
name: agent-name
description: What it does
tools: Read, Grep, Glob, Bash
model: sonnet
---

Instructions here...
```

**Skills** should be clear and actionable with Odoo examples:

```markdown
# Skill Name

## When to Use

...

## Odoo Patterns

```python
# Example code
class MyModel(models.Model):
    _name = 'my.model'
    _description = 'My Model'
```

## Examples

...
```

**Commands** should explain what they do:

```markdown
---
description: Brief description of command
---

# Command Name

Detailed instructions for Odoo workflow...
```

**Hooks** should include descriptions:

```json
{
  "matcher": "...",
  "hooks": [...],
  "description": "What this hook does for Odoo development"
}
```

### 5. Use environment variable placeholders

For Docker commands, use:
- `$ODOO_CONTAINER` instead of hardcoded container names
- `$ODOO_DB` instead of hardcoded database names
- `$ODOO_PORT` for port references

```bash
# Good
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u module_name --stop-after-init

# Bad
docker exec odoo15_web odoo -d production_db -u module_name --stop-after-init
```

### 6. Test your contribution

Make sure your config works with Claude Code on an actual Odoo 15 project before submitting.

### 7. Submit a PR

```bash
git add .
git commit -m "Add Manufacturing module skill"
git push origin add-manufacturing-skill
```

Then open a PR with:
- What you added
- Why it's useful for Odoo development
- How you tested it

---

## Guidelines

### Do

- Keep configs focused and modular
- Include clear descriptions
- Test on real Odoo 15 projects before submitting
- Follow existing patterns
- Document any dependencies
- Use Python/PEP8 conventions in code examples
- Include ACL and security considerations

### Don't

- Include sensitive data (API keys, tokens, paths)
- Add overly complex or niche configs
- Submit untested configs
- Create duplicate functionality
- Add configs that require specific paid services without alternatives
- Use `print()` in examples (use `_logger.debug`)
- Use raw SQL without justification

---

## Python/Odoo Code Style

When adding code examples:

```python
# Good - follows Odoo conventions
from odoo import api, fields, models
from odoo.exceptions import UserError, ValidationError

import logging
_logger = logging.getLogger(__name__)

class MyModel(models.Model):
    _name = 'my.model'
    _description = 'My Model Description'

    name = fields.Char(string='Name', required=True)
    partner_id = fields.Many2one('res.partner', ondelete='restrict')

    @api.depends('partner_id')
    def _compute_display_name(self):
        for record in self:
            record.display_name = record.name

    def action_confirm(self):
        """Confirm the record."""
        _logger.debug('Confirming record %s', self.id)
        self.write({'state': 'confirmed'})
```

---

## File Naming

- Use lowercase with hyphens: `manufacturing-patterns.md`
- Be descriptive: `two-phase-testing.md` not `testing.md`
- Match the agent/skill name to the filename
- For Odoo-specific content, prefix appropriately: `odoo-15-developer/`

---

## Questions?

Open an issue if you have questions about contributing.

---

Thanks for contributing. Let's build a great resource for Odoo developers using Claude Code.
