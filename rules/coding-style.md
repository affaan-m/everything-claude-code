# Coding Style

## Odoo ORM Patterns (CRITICAL)

ALWAYS use ORM methods, NEVER raw SQL without justification:

```python
# WRONG: Raw SQL (vulnerable, bypasses security)
self.env.cr.execute("SELECT * FROM res_partner WHERE name = '%s'" % name)

# CORRECT: ORM with proper patterns
partners = self.env['res.partner'].search([('name', '=', name)])
```

## Recordset Operations

```python
# WRONG: Loop with individual operations
for partner in partners:
    partner.write({'active': True})

# CORRECT: Batch operations
partners.write({'active': True})

# WRONG: Manual filtering
active_partners = []
for p in partners:
    if p.is_company:
        active_partners.append(p)

# CORRECT: Use filtered()
active_partners = partners.filtered(lambda p: p.is_company)

# CORRECT: Use mapped() for field extraction
partner_names = partners.mapped('name')

# CORRECT: Use sorted()
sorted_partners = partners.sorted(key=lambda p: p.name)
```

## Module Organization

Follow Odoo module structure:
- High cohesion within models, low coupling between modules
- 200-400 lines per model file typical, 800 max
- One model class per file when possible
- Organize by domain, not by type

```
module_name/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── model_name.py          # One model per file
├── views/
│   └── model_name_views.xml   # Views for specific model
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
├── data/
│   └── initial_data.xml
├── wizards/
│   ├── __init__.py
│   └── wizard_name.py
└── tests/
    ├── __init__.py
    └── test_model_name.py
```

## Error Handling

ALWAYS handle errors with proper Odoo exceptions:

```python
from odoo.exceptions import UserError, ValidationError, AccessError

def action_confirm(self):
    if not self.line_ids:
        raise UserError(_("Cannot confirm order without lines."))

    try:
        result = self._process_order()
        return result
    except Exception as e:
        _logger.error('Order processing failed: %s', e)
        raise UserError(_('Processing failed. Please contact support.'))
```

## Input Validation

ALWAYS validate using constraints:

```python
from odoo import api, models
from odoo.exceptions import ValidationError

class SaleOrder(models.Model):
    _name = 'sale.order'

    @api.constrains('date_order', 'date_delivery')
    def _check_dates(self):
        for order in self:
            if order.date_delivery and order.date_delivery < order.date_order:
                raise ValidationError(_("Delivery date cannot be before order date."))

    @api.constrains('amount_total')
    def _check_amount(self):
        for order in self:
            if order.amount_total < 0:
                raise ValidationError(_("Total amount cannot be negative."))
```

## Naming Conventions

Follow Python/Odoo standards:

```python
# Model names: dot.separated.lowercase
_name = 'hr.employee.certification'

# Field names: snake_case
employee_id = fields.Many2one('hr.employee')
date_expiry = fields.Date()

# Method names: snake_case with prefixes
def _compute_state(self):         # Computed field methods
def _check_dates(self):           # Constraint methods
def _onchange_employee(self):     # Onchange methods
def action_confirm(self):         # Button actions
def _prepare_values(self):        # Private helper methods
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code uses ORM, not raw SQL
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling with UserError/ValidationError
- [ ] No print() statements (use _logger.debug)
- [ ] No hardcoded values (use system parameters)
- [ ] Model has _description attribute
- [ ] Many2one fields have ondelete defined
- [ ] Constraints use @api.constrains decorator
- [ ] Translatable strings use _() function
