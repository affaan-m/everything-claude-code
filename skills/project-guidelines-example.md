# Project Guidelines Skill (Odoo Module Example)

This is an example of a project-specific skill for Odoo 15 module development. Use this as a template for your own projects.

---

## When to Use

Reference this skill when working on Odoo module projects. Project skills contain:
- Architecture overview
- Module structure
- Code patterns
- Testing requirements
- Deployment workflow

---

## Architecture Overview

**Tech Stack:**
- **Backend**: Odoo 15 (Python 3.8+)
- **Database**: PostgreSQL 13+
- **ORM**: Odoo ORM
- **Testing**: TransactionCase (Two-Phase Testing)
- **Environment**: Docker containers
- **Version Control**: Git

**Environment Variables (placeholders):**
```bash
ODOO_CONTAINER=odoo_web          # Docker container name
ODOO_DB=odoo_db                  # Database name
ODOO_PORT=8069                   # Odoo port
POSTGRES_CONTAINER=odoo_postgres  # PostgreSQL container
```

**Services:**
```
┌─────────────────────────────────────────────────────────────┐
│                      Odoo Container                          │
│  Python 3.8 + Odoo 15 + Custom Modules                      │
│  Deployed: Docker / Cloud VM                                │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Redis   │   │ External │
        │ Database │   │  Cache   │   │   APIs   │
        └──────────┘   └──────────┘   └──────────┘
```

---

## Module Structure

```
custom_module/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── custom_model.py         # Main model
│   └── custom_line.py          # Line model
├── views/
│   ├── custom_model_views.xml  # Form, tree, search views
│   └── menu_views.xml          # Menu items
├── security/
│   ├── ir.model.access.csv     # ACLs
│   └── security_rules.xml      # Record rules
├── data/
│   └── data.xml                # Initial data
├── wizards/
│   ├── __init__.py
│   └── import_wizard.py        # Transient models
├── reports/
│   └── report_template.xml
├── static/
│   └── description/
│       └── icon.png
└── tests/
    ├── __init__.py
    ├── test_phase1_db.py       # Phase 1: Direct DB tests
    └── test_phase2_orm.py      # Phase 2: ORM tests
```

---

## Code Patterns

### Model Definition

```python
from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError

import logging
_logger = logging.getLogger(__name__)

class CustomModel(models.Model):
    _name = 'custom.model'
    _description = 'Custom Model'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string="Name",
        required=True,
        index=True,
        tracking=True,
    )

    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
    ], default='draft', tracking=True)

    partner_id = fields.Many2one(
        'res.partner',
        string="Partner",
        ondelete='restrict',
        index=True,
    )

    line_ids = fields.One2many(
        'custom.model.line',
        'parent_id',
        string="Lines",
    )

    total = fields.Float(
        compute='_compute_total',
        store=True,
    )

    @api.depends('line_ids.amount')
    def _compute_total(self):
        for record in self:
            record.total = sum(record.line_ids.mapped('amount'))

    def action_confirm(self):
        self.ensure_one()
        if self.state != 'draft':
            raise UserError(_("Only draft records can be confirmed"))
        self.write({'state': 'confirmed'})

    def action_done(self):
        self.ensure_one()
        if self.state != 'confirmed':
            raise UserError(_("Only confirmed records can be marked done"))
        self.write({'state': 'done'})
```

### Security Files

**ir.model.access.csv:**
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_custom_model_user,custom.model.user,model_custom_model,base.group_user,1,1,1,0
access_custom_model_manager,custom.model.manager,model_custom_model,custom_module.group_manager,1,1,1,1
```

**security_rules.xml:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="rule_custom_model_user_own" model="ir.rule">
        <field name="name">Custom Model: User sees own records</field>
        <field name="model_id" ref="model_custom_model"/>
        <field name="domain_force">[('create_uid', '=', user.id)]</field>
        <field name="groups" eval="[(4, ref('base.group_user'))]"/>
    </record>
</odoo>
```

### Manifest File

```python
{
    'name': 'Custom Module',
    'version': '15.0.1.0.0',
    'category': 'Custom',
    'summary': 'Custom module for business needs',
    'description': """
Custom Module
=============

Features:
* Feature 1
* Feature 2

Configuration:
1. Go to Settings
2. Configure options
    """,
    'author': 'Company Name',
    'website': 'https://example.com',
    'depends': [
        'base',
        'mail',
    ],
    'data': [
        # Security first
        'security/ir.model.access.csv',
        'security/security_rules.xml',
        # Then views
        'views/custom_model_views.xml',
        'views/menu_views.xml',
        # Then data
        'data/data.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
```

---

## Testing Requirements

### Two-Phase Testing

**Phase 1: Direct Database Tests (test_phase1_db.py):**
```python
from odoo.tests.common import TransactionCase

class TestPhase1DirectDB(TransactionCase):
    """Phase 1: Direct database verification."""

    def test_table_exists(self):
        """Verify table was created."""
        self.env.cr.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'custom_model'
            )
        """)
        self.assertTrue(self.env.cr.fetchone()[0])

    def test_columns_exist(self):
        """Verify all columns exist."""
        self.env.cr.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'custom_model'
        """)
        columns = [r[0] for r in self.env.cr.fetchall()]
        self.assertIn('name', columns)
        self.assertIn('state', columns)
        self.assertIn('partner_id', columns)
```

**Phase 2: ORM Unit Tests (test_phase2_orm.py):**
```python
from odoo.tests.common import TransactionCase
from odoo.exceptions import UserError, ValidationError

class TestPhase2ORM(TransactionCase):
    """Phase 2: ORM-level unit tests."""

    def setUp(self):
        super().setUp()
        self.partner = self.env['res.partner'].create({
            'name': 'Test Partner'
        })

    def test_create_record(self):
        """Test record creation."""
        record = self.env['custom.model'].create({
            'name': 'Test Record',
            'partner_id': self.partner.id,
        })
        self.assertEqual(record.state, 'draft')
        self.assertEqual(record.partner_id, self.partner)

    def test_workflow_confirm(self):
        """Test confirmation workflow."""
        record = self.env['custom.model'].create({'name': 'Test'})
        record.action_confirm()
        self.assertEqual(record.state, 'confirmed')

    def test_confirm_non_draft_raises_error(self):
        """Test confirming non-draft record raises error."""
        record = self.env['custom.model'].create({'name': 'Test'})
        record.action_confirm()
        with self.assertRaises(UserError):
            record.action_confirm()

    def test_computed_total(self):
        """Test computed total field."""
        record = self.env['custom.model'].create({'name': 'Test'})
        self.env['custom.model.line'].create([
            {'parent_id': record.id, 'amount': 100},
            {'parent_id': record.id, 'amount': 200},
        ])
        self.assertEqual(record.total, 300)
```

### Running Tests

```bash
# Run all tests for module
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/custom_module/tests/ -v

# Run specific test file
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/custom_module/tests/test_phase2_orm.py -v

# Run with Odoo test runner
docker exec $ODOO_CONTAINER python3 /usr/bin/odoo \
    -c /etc/odoo/odoo.conf \
    -d $ODOO_DB \
    --test-enable \
    --stop-after-init \
    -i custom_module
```

---

## Deployment Workflow

### Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Module installs cleanly
- [ ] Module upgrades cleanly
- [ ] No Odoo log errors
- [ ] Security files complete
- [ ] No hardcoded credentials

### Deployment Commands

```bash
# Update module
docker exec $ODOO_CONTAINER python3 /usr/bin/odoo \
    -c /etc/odoo/odoo.conf \
    -d $ODOO_DB \
    -u custom_module \
    --stop-after-init

# Install module
docker exec $ODOO_CONTAINER python3 /usr/bin/odoo \
    -c /etc/odoo/odoo.conf \
    -d $ODOO_DB \
    -i custom_module \
    --stop-after-init

# Restart Odoo
docker restart $ODOO_CONTAINER
```

### Environment Setup

```bash
# Docker environment
export ODOO_CONTAINER=odoo_web
export ODOO_DB=odoo_db
export ODOO_PORT=8069
export POSTGRES_CONTAINER=odoo_postgres

# Access Odoo shell
docker exec -it $ODOO_CONTAINER python3 /usr/bin/odoo shell \
    -c /etc/odoo/odoo.conf -d $ODOO_DB

# Access PostgreSQL
docker exec -it $POSTGRES_CONTAINER psql -U odoo -d $ODOO_DB
```

---

## Critical Rules

1. **_description required** on all models
2. **ondelete required** on all Many2one fields
3. **Security files first** in manifest data list
4. **Two-phase testing** - Phase 1 DB, Phase 2 ORM
5. **_logger.debug** for debugging, not _logger.info
6. **Parameterized queries** for all raw SQL
7. **Document sudo()** usage with justification
8. **No print()** statements - use logging

---

## Related Skills

- `coding-standards.md` - Python/Odoo coding best practices
- `backend-patterns.md` - ORM and database patterns
- `security-review/` - Security review checklist
- `tdd-workflow/` - Two-phase testing methodology
- `odoo-15-developer/` - Comprehensive Odoo 15 guide
