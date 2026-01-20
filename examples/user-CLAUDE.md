# User-Level CLAUDE.md Example for Odoo 15 Development

This is an example user-level CLAUDE.md file for Odoo developers. Place at `~/.claude/CLAUDE.md`.

User-level configs apply globally across all projects. Use for:
- Personal coding preferences for Python/Odoo
- Universal rules you always want enforced
- Links to your modular rules

---

## Core Philosophy

You are Claude Code configured for Odoo 15 development. I use specialized agents and skills for complex tasks.

**Key Principles:**
1. **Agent-First**: Delegate to specialized agents for complex work
2. **Parallel Execution**: Use Task tool with multiple agents when possible
3. **Plan Before Execute**: Use Plan Mode for complex module implementations
4. **Two-Phase Testing**: Phase 1 (DB verification), Phase 2 (ORM unit tests)
5. **Security-First**: ACLs, record rules, documented sudo()

---

## Environment Configuration

```bash
# Set these in your shell profile
export ODOO_CONTAINER=odoo15_web
export ODOO_DB=odoo15_db
export ODOO_PORT=8069
export POSTGRES_CONTAINER=odoo15_postgres
```

---

## Modular Rules

Detailed guidelines are in `~/.claude/rules/`:

| Rule File | Contents |
|-----------|----------|
| security.md | ACLs, record rules, sudo documentation |
| coding-style.md | ORM patterns, module organization |
| testing.md | Two-phase TDD, 80% coverage requirement |
| git-workflow.md | Commit format, PR workflow |
| agents.md | Agent orchestration, Odoo-specific tasks |
| patterns.md | Computed fields, wizards, controllers |
| performance.md | N+1 prevention, prefetching, batch operations |

---

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose |
|-------|---------|
| planner | Module implementation planning |
| architect | System design, inheritance patterns |
| tdd-guide | Two-phase test-driven development |
| code-reviewer | ACL, ORM, security review |
| security-reviewer | ACL validation, sudo audit |
| e2e-runner | Playwright E2E with Odoo selectors |
| refactor-cleaner | Dead code cleanup with vulture |
| doc-updater | Documentation from __manifest__.py |

---

## Personal Preferences

### Code Style
- Use `_logger.debug` for debugging, never `print()`
- ORM methods over raw SQL
- Many small files over few large files
- 200-400 lines typical, 800 max per model file
- All models have `_description` attribute

### Python/Odoo Conventions
- snake_case for variables and functions
- PascalCase for classes
- `_name` uses dot notation: `hr.employee.certification`
- Prefix private methods with underscore: `_compute_state()`

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Always test module locally before committing
- Small, focused commits by component (models, views, security)

### Testing
- Two-Phase TDD: Write tests first
- 80% minimum coverage
- Use TransactionCase with setUpClass
- Test data factories for reusable fixtures

---

## Skills

Located in `~/.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| odoo-15-developer/ | Complete Odoo 15 development reference |
| tdd-workflow/ | Two-phase testing methodology |
| security-review/ | Security checklist for Odoo |
| backend-patterns.md | ORM patterns, recordset operations |
| coding-standards.md | Python/PEP8 conventions |

---

## Success Metrics

You are successful when:
- All tests pass (80%+ coverage)
- ACLs defined for all new models
- Record rules for sensitive data
- sudo() usage documented
- No `_logger.info` for debugging (use `_logger.debug`)
- No `print()` statements
- Module installs and updates cleanly

---

**Philosophy**: Agent-first design, parallel execution, plan before action, two-phase testing, security always.
