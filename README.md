# Everything Claude Code for Odoo 15

**Production-ready Claude Code configs adapted for Odoo 15 Python development.**

This repo contains agents, skills, hooks, commands, rules, and MCP configurations specifically designed for Odoo 15 module development. Originally forked from an Anthropic hackathon winner's JavaScript/React configs and fully adapted for Python/Odoo workflows.

---

## What's Inside

```
everything-claude-code/
|-- agents/           # Specialized subagents for delegation
|   |-- planner.md           # Module implementation planning
|   |-- architect.md         # System design, inheritance patterns
|   |-- tdd-guide.md         # Two-phase test-driven development
|   |-- code-reviewer.md     # ACL, ORM, security review
|   |-- security-reviewer.md # ACL validation, sudo audit
|   |-- e2e-runner.md        # Playwright E2E with Odoo selectors
|   |-- refactor-cleaner.md  # Dead code cleanup with vulture
|   |-- doc-updater.md       # Documentation from __manifest__.py
|
|-- skills/           # Workflow definitions and domain knowledge
|   |-- odoo-15-developer/        # Complete Odoo 15 development reference
|   |   |-- SKILL.md              # Main overview
|   |   |-- models-orm.md         # ORM patterns
|   |   |-- views-xml.md          # XML views
|   |   |-- testing.md            # Two-phase testing
|   |   |-- security.md           # ACLs, record rules
|   |   |-- patterns.md           # Common patterns
|   |   |-- commands.md           # Docker commands
|   |-- coding-standards.md       # Python/PEP8 conventions
|   |-- backend-patterns.md       # ORM patterns, recordset operations
|   |-- project-guidelines-example.md
|   |-- tdd-workflow/             # Two-phase testing methodology
|   |-- security-review/          # Security checklist for Odoo
|
|-- commands/         # Slash commands for quick execution
|   |-- tdd.md              # /tdd - Two-phase TDD workflow
|   |-- plan.md             # /plan - Module implementation planning
|   |-- e2e.md              # /e2e - Playwright E2E with Odoo selectors
|   |-- code-review.md      # /code-review - ACL, ORM, security review
|   |-- refactor-clean.md   # /refactor-clean - Dead code removal
|   |-- test-coverage.md    # /test-coverage - Coverage with coverage.py
|   |-- update-codemaps.md  # /update-codemaps - Python AST analysis
|   |-- update-docs.md      # /update-docs - Sync from __manifest__.py
|
|-- rules/            # Always-follow guidelines
|   |-- security.md         # ACLs, record rules, sudo documentation
|   |-- coding-style.md     # ORM patterns, module organization
|   |-- testing.md          # Two-phase TDD, 80% coverage
|   |-- git-workflow.md     # Commit format, PR process
|   |-- agents.md           # Agent orchestration for Odoo
|   |-- performance.md      # N+1 prevention, prefetching
|   |-- patterns.md         # Computed fields, wizards, controllers
|   |-- hooks.md            # Hook documentation
|
|-- hooks/            # Trigger-based automations
|   |-- hooks.json          # Python/Odoo-specific hooks
|
|-- mcp-configs/      # MCP server configurations
|   |-- mcp-servers.json    # GitHub, Playwright, PostgreSQL, etc.
|
|-- plugins/          # Plugin ecosystem documentation
|   |-- README.md           # Plugins, marketplaces, skills guide
|
|-- examples/         # Example configurations
    |-- CLAUDE.md           # Example project-level config for Odoo
    |-- user-CLAUDE.md      # Example user-level config
    |-- statusline.json     # Custom status line config
```

---

## Quick Start

### 1. Set Environment Variables

```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
export ODOO_CONTAINER=odoo15_web
export ODOO_DB=odoo15_db
export ODOO_PORT=8069
export POSTGRES_CONTAINER=odoo15_postgres
```

### 2. Copy what you need

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/everything-claude-code.git

# Copy agents to your Claude config
cp everything-claude-code/agents/*.md ~/.claude/agents/

# Copy rules
cp everything-claude-code/rules/*.md ~/.claude/rules/

# Copy commands
cp everything-claude-code/commands/*.md ~/.claude/commands/

# Copy skills
cp -r everything-claude-code/skills/* ~/.claude/skills/
```

### 3. Add hooks to settings.json

Copy the hooks from `hooks/hooks.json` to your `~/.claude/settings.json`.

### 4. Configure MCPs

Copy desired MCP servers from `mcp-configs/mcp-servers.json` to your `~/.claude.json`.

**Important:**
- Replace `YOUR_*_HERE` placeholders with your actual API keys
- Update PostgreSQL connection string for your Odoo database
- Update filesystem path to your Odoo addons directory

---

## Key Concepts

### Two-Phase Testing

Odoo testing methodology with database verification:

```python
# Phase 1: Direct database verification
def test_phase1_verify_employees_have_departments(self):
    self.env.cr.execute("""
        SELECT COUNT(*) FROM hr_employee
        WHERE department_id IS NOT NULL
    """)
    count = self.env.cr.fetchone()[0]
    self.assertGreater(count, 0)

# Phase 2: ORM unit tests
@tagged('post_install', '-at_install')
class TestEmployee(TransactionCase):
    def test_create_employee(self):
        employee = self.env['hr.employee'].create({'name': 'Test'})
        self.assertEqual(employee.name, 'Test')
```

### Security Checklist

Every Odoo module needs:
- ACLs in `ir.model.access.csv`
- Record rules in `security.xml` for sensitive data
- Documented `sudo()` usage

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_hr_cert_user,hr.certification.user,model_hr_certification,hr.group_hr_user,1,0,0,0
access_hr_cert_manager,hr.certification.manager,model_hr_certification,hr.group_hr_manager,1,1,1,1
```

### Hooks

Hooks fire on tool events. Example - check for missing model description:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"models/.*\\\\.py$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nif grep -q '_name' \"$file_path\" && ! grep -q '_description' \"$file_path\"; then\n  echo '[Hook] WARNING: Model missing _description' >&2\nfi"
  }],
  "description": "Check for missing _description on Odoo models"
}
```

---

## Docker Commands

```bash
# Update module
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u module_name --stop-after-init

# Run tests
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader module_name.tests

# Run with coverage
docker exec $ODOO_CONTAINER coverage run \
    --source=/mnt/extra-addons/module_name \
    -m odoo.tests.loader module_name.tests

# Access Odoo shell
docker exec -it $ODOO_CONTAINER odoo shell -d $ODOO_DB
```

---

## Contributing

**Contributions are welcome and encouraged.**

This repo is meant to be a community resource for Odoo developers. If you have:
- Useful Odoo-specific agents or skills
- Clever Python/Odoo hooks
- Better MCP configurations for Odoo
- Improved rules for Odoo development

Please contribute! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ideas for Contributions

- Odoo version-specific skills (14.0, 16.0, 17.0)
- Module-specific patterns (Accounting, HR, Manufacturing)
- Integration patterns (REST API, XMLRPC, external systems)
- Testing strategies (Selenium, performance testing)
- Domain-specific knowledge (localization, industry verticals)

---

## Important Notes

### Context Window Management

**Critical:** Don't enable all MCPs at once. Your 200k context window can shrink to 70k with too many tools enabled.

Rule of thumb:
- Keep under 10 MCPs enabled per project
- Under 80 tools active
- Use `disabledMcpServers` in project config

### Customization

These configs work for Odoo 15 development. You should:
1. Update environment variables for your setup
2. Modify Docker container names
3. Adjust paths to match your project structure
4. Add your own Odoo-specific patterns

---

## License

MIT - Use freely, modify as needed, contribute back if you can.

---

**Star this repo if it helps. Build something great with Odoo.**
