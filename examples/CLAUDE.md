# Example Project CLAUDE.md for Odoo 15

This is an example project-level CLAUDE.md file for an Odoo 15 module. Place this in your module root or project root.

## Project Overview

[Brief description of your Odoo module - what it does, which Odoo apps it extends]

## Environment Configuration

```bash
# Required environment variables
export ODOO_CONTAINER=odoo15_web
export ODOO_DB=odoo15_db
export ODOO_PORT=8069
export POSTGRES_CONTAINER=odoo15_postgres
```

## Critical Rules

### 1. Module Organization

Follow standard Odoo module structure:
```
module_name/
├── __init__.py
├── __manifest__.py
├── models/
├── views/
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
├── data/
├── wizards/
└── tests/
```

### 2. Code Style

- Use ORM methods, not raw SQL
- Use `_logger.debug` for debugging (not `_logger.info` or `print()`)
- All models must have `_description` attribute
- All Many2one fields must have `ondelete` defined
- Use batch operations (`.write()`, `.create()`) over loops
- Translatable strings use `_()` function

### 3. Two-Phase Testing

- **Phase 1**: Direct database verification with real data
- **Phase 2**: ORM unit tests with `TransactionCase`
- 80% minimum coverage
- Use `@tagged('post_install', '-at_install')` decorator

### 4. Security

- Every new model needs ACLs in `ir.model.access.csv`
- Sensitive data needs record rules in `security.xml`
- Document every `sudo()` call with justification
- Use parameterized queries (never string formatting with SQL)

## Key Patterns

### Model Definition

```python
from odoo import api, fields, models
from odoo.exceptions import UserError, ValidationError

class MyModel(models.Model):
    _name = 'my.model'
    _description = 'My Model Description'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Name', required=True)
    partner_id = fields.Many2one('res.partner', ondelete='restrict')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
    ], default='draft', compute='_compute_state', store=True)

    @api.depends('partner_id')
    def _compute_state(self):
        for record in self:
            record.state = 'confirmed' if record.partner_id else 'draft'
```

### Controller Response

```python
from odoo import http
from odoo.http import request

class MyController(http.Controller):

    @http.route('/api/v1/data', type='json', auth='user')
    def get_data(self, **kwargs):
        try:
            data = request.env['my.model'].search([])
            return {'success': True, 'data': data.read(['name'])}
        except Exception as e:
            return {'success': False, 'error': str(e)}
```

## Docker Commands

```bash
# Update module
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u module_name --stop-after-init

# Run tests
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader module_name.tests

# Check logs
docker logs $ODOO_CONTAINER --tail 100 -f

# Access shell
docker exec -it $ODOO_CONTAINER odoo shell -d $ODOO_DB
```

## Available Commands

- `/tdd` - Two-phase test-driven development workflow
- `/plan` - Create module implementation plan
- `/code-review` - Review for ACLs, ORM patterns, security
- `/refactor-clean` - Remove dead code with vulture/pylint
- `/test-coverage` - Analyze coverage with coverage.py

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Never commit to main directly
- PRs require review
- All tests must pass before merge
- Check ACLs for new models before commit
