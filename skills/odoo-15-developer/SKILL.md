---
name: odoo-15-developer
description: Comprehensive Odoo 15 development guidelines covering TDD, ORM patterns, security, testing, and best practices. Auto-enabled for Odoo projects.
---

# Odoo 15 Developer Skill

**Priority**: 1 (Highest - Auto-enabled for all sessions)
**Version**: 15.0
**Framework**: Odoo 15 Enterprise/Community

## Environment Configuration

Configure these environment variables for your project:

```bash
# Docker container names
export ODOO_CONTAINER=odoo_web          # Your Odoo container name
export POSTGRES_CONTAINER=odoo_postgres # Your PostgreSQL container name

# Database settings
export ODOO_DB=odoo_db                  # Your database name
export ODOO_USER=odoo                   # Database user
export ODOO_PASSWORD=odoo               # Database password

# Port mappings
export ODOO_PORT=8069                   # Odoo web port
export POSTGRES_PORT=5432               # PostgreSQL port
```

## Overview

Comprehensive Odoo 15 development guidelines covering TDD, ORM patterns, security, testing, and best practices. This skill is **automatically enabled** for all Claude Code sessions in Odoo workspaces.

## Activation

- **Default**: Always active (1st priority)
- **Triggers**: Any Odoo-related work, Python files in module directories, model/view/controller modifications
- **Context**: Odoo 15 + Python 3.8+ + PostgreSQL

## Quick Reference

### Core Principles
- **TDD is NON-NEGOTIABLE** - Every line of production code responds to a failing test
- **Evidence-based** - Show file:line references for code, table:column for data
- **ORM-first** - Never bypass Odoo's ORM
- **Security-first** - Always consider access rights and record rules

### Two-Phase Testing (MANDATORY)
1. **Phase 1**: Direct Database Testing with real data during development
2. **Phase 2**: Odoo Standard Tests in `module/tests/` after implementation

### Key Commands
```bash
# Update module
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u MODULE_NAME --stop-after-init

# Run tests
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader MODULE_NAME.tests

# Access container
docker exec -it $ODOO_CONTAINER bash
```

## Skill Documents

| Document | Description |
|----------|-------------|
| [core-philosophy.md](core-philosophy.md) | TDD, development principles, code quality |
| [models-orm.md](models-orm.md) | Python ORM, fields, computed fields, constraints |
| [views-xml.md](views-xml.md) | XML views, XPath inheritance, i18n |
| [testing.md](testing.md) | Two-phase testing, test framework, factories |
| [security.md](security.md) | Access rights, record rules, sudo usage |
| [patterns.md](patterns.md) | Common patterns, anti-patterns, gotchas |
| [commands.md](commands.md) | Docker commands, module management |

## Module Structure

```
my_module/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── my_model.py
├── views/
│   └── my_model_views.xml
├── data/
│   └── ir_cron_data.xml
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
├── tests/
│   ├── __init__.py
│   └── test_my_model.py
├── static/src/
│   ├── js/
│   ├── css/
│   └── xml/
└── wizard/
    ├── __init__.py
    └── my_wizard.py
```

## Code Review Checklist

- [ ] **Phase 1**: Direct Database Testing with real data
- [ ] **Phase 2**: Unit tests in `module/tests/` folder
- [ ] Test data cloned from Phase 1 patterns
- [ ] Type hints for all method signatures
- [ ] Security considerations addressed
- [ ] ORM methods used (no raw SQL)
- [ ] Proper Odoo exceptions used
- [ ] Access rights defined
- [ ] Performance implications considered
- [ ] Code follows Odoo conventions
- [ ] Tests and code committed together

## Official Documentation

- [Odoo 15 Developer Documentation](https://www.odoo.com/documentation/15.0/developer.html)
- [ORM API Reference](https://www.odoo.com/documentation/15.0/developer/reference/backend/orm.html)
- [Views Reference](https://www.odoo.com/documentation/15.0/developer/reference/backend/views.html)
- [Testing Framework](https://www.odoo.com/documentation/15.0/developer/reference/backend/testing.html)
