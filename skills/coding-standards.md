---
name: coding-standards
description: Python and Odoo coding standards, best practices, and patterns following PEP8, Black, and Odoo OCA guidelines.
---

# Coding Standards & Best Practices

Python and Odoo 15 coding standards applicable across all modules.

## Code Quality Principles

### 1. Readability First
- Code is read more than written
- Clear variable and function names
- Self-documenting code preferred over comments
- Consistent formatting (Black, isort)

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization
- Easy to understand > clever code

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into methods
- Create reusable mixins
- Share utilities across modules
- Avoid copy-paste programming

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Avoid speculative generality
- Add complexity only when required
- Start simple, refactor when needed

## Python Standards (PEP8)

### Variable Naming

```python
# Good: Descriptive names (snake_case)
partner_search_query = 'acme'
is_user_authenticated = True
total_revenue = 1000.00

# Bad: Unclear names
q = 'acme'
flag = True
x = 1000.00
```

### Function Naming

```python
# Good: Verb-noun pattern with snake_case
def fetch_partner_data(partner_id):
    pass

def calculate_order_total(order):
    pass

def is_valid_email(email):
    return bool(re.match(r'[^@]+@[^@]+\.[^@]+', email))

# Bad: Unclear or non-descriptive
def partner(id):
    pass

def calc(o):
    pass
```

### Class Naming (Odoo Models)

```python
# Good: PascalCase class, descriptive model name
class SaleOrderLine(models.Model):
    _name = 'sale.order.line'
    _description = 'Sale Order Line'

class HrEmployeeSkill(models.Model):
    _name = 'hr.employee.skill'
    _description = 'Employee Skill'

# Bad: Unclear naming
class Sol(models.Model):
    _name = 'sol'  # Too short, unclear
```

### Method Naming Conventions (Odoo)

```python
class CustomModel(models.Model):
    _name = 'custom.model'
    _description = 'Custom Model'

    # Compute methods: _compute_<field_name>
    @api.depends('line_ids.amount')
    def _compute_total(self):
        for record in self:
            record.total = sum(record.line_ids.mapped('amount'))

    # Onchange methods: _onchange_<field_name>
    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        if self.partner_id:
            self.phone = self.partner_id.phone

    # Constraint methods: _check_<constraint_name>
    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for record in self:
            if record.date_start > record.date_end:
                raise ValidationError(_("End date must be after start date"))

    # Action methods: action_<action_name>
    def action_confirm(self):
        self.write({'state': 'confirmed'})

    # Private methods: _<method_name>
    def _prepare_invoice_values(self):
        return {'partner_id': self.partner_id.id}
```

### Error Handling

```python
from odoo.exceptions import UserError, ValidationError, AccessError

# Good: Comprehensive error handling
def action_confirm(self):
    self.ensure_one()
    if not self.line_ids:
        raise UserError(_("Cannot confirm order without lines"))

    if self.state != 'draft':
        raise UserError(_("Only draft orders can be confirmed"))

    try:
        self._create_related_records()
        self.write({'state': 'confirmed'})
    except Exception as e:
        _logger.error("Failed to confirm order %s: %s", self.id, str(e))
        raise UserError(_("Failed to confirm order. Please contact support."))

# Bad: No error handling
def action_confirm(self):
    self._create_related_records()
    self.write({'state': 'confirmed'})
```

### Logging Standards

```python
import logging
_logger = logging.getLogger(__name__)

# Good: Use appropriate log levels
_logger.debug("Processing record %s", record.id)  # For debugging
_logger.info("Batch process completed: %d records", count)  # Significant events
_logger.warning("Configuration missing, using default")  # Recoverable issues
_logger.error("Failed to process record %s: %s", record.id, str(e))  # Errors

# Bad: Using info for debug, or print statements
_logger.info("Variable x = %s", x)  # Should be debug
print("Debug:", variable)  # Never use print

# Bad: Logging sensitive data
_logger.info("User password: %s", password)  # NEVER log passwords
```

## Odoo ORM Best Practices

### Field Definitions

```python
# Good: Proper field definitions
class CustomModel(models.Model):
    _name = 'custom.model'
    _description = 'Custom Model'  # REQUIRED

    name = fields.Char(
        string="Name",
        required=True,
        index=True,  # Frequently searched
        tracking=True,  # Audit trail
    )

    partner_id = fields.Many2one(
        'res.partner',
        string="Partner",
        ondelete='restrict',  # ALWAYS specify ondelete
        index=True,
    )

    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
    ], default='draft', tracking=True)

    total = fields.Float(
        compute='_compute_total',
        store=True,  # Store if frequently filtered
    )

# Bad: Missing attributes
class BadModel(models.Model):
    _name = 'bad.model'
    # Missing _description

    partner_id = fields.Many2one('res.partner')  # Missing ondelete
    old_field = fields.Char  # Missing parentheses
```

### Recordset Operations

```python
# Good: Use mapped, filtered, sorted
partners = self.order_ids.mapped('partner_id')
active_orders = self.order_ids.filtered(lambda o: o.state == 'active')
sorted_orders = self.order_ids.sorted(key=lambda o: o.date, reverse=True)

# Good: Efficient iteration
for record in self:
    record.total = sum(record.line_ids.mapped('amount'))

# Bad: Access outside loop (N+1 queries)
for record in records:
    partner_name = record.partner_id.name  # Query per iteration

# Good: Prefetch first
records = self.env['model'].search([])
_ = records.mapped('partner_id.name')  # Prefetch
for record in records:
    partner_name = record.partner_id.name  # Uses cache
```

### Search and Browse

```python
# Good: Search returns recordset
orders = self.env['sale.order'].search([
    ('state', '=', 'sale'),
    ('partner_id', '=', partner_id),
], limit=10, order='date desc')

# Good: Browse with known IDs
order = self.env['sale.order'].browse(order_id)
if order.exists():
    # Process order
    pass

# Bad: Browse without existence check
order = self.env['sale.order'].browse(unknown_id)
order.name  # May fail if ID doesn't exist

# Good: Search with IN operator instead of loop
partner_ids = partners.ids
orders = self.env['sale.order'].search([('partner_id', 'in', partner_ids)])
```

### Context and Environment

```python
# Good: Context usage
record.with_context(force_company=company_id).action()
record.with_user(user).action()
record.with_company(company).action()

# Bad: Direct context modification (context is immutable)
self.env.context['key'] = value  # Will fail

# Good: Create new context
self.with_context(key=value).action()
```

## File Organization

### Module Structure

```
module_name/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── model_one.py          # One model per file
│   └── model_two.py
├── views/
│   ├── model_one_views.xml   # Views per model
│   ├── model_two_views.xml
│   └── menu_views.xml        # Menus separate
├── security/
│   ├── ir.model.access.csv   # ACLs
│   └── security_rules.xml    # Record rules
├── data/
│   └── data.xml
├── wizards/
│   ├── __init__.py
│   └── wizard_name.py
├── reports/
│   └── report_template.xml
└── tests/
    ├── __init__.py
    └── test_model.py
```

### File Naming

```
models/sale_order.py          # snake_case for Python files
views/sale_order_views.xml    # snake_case for XML files
security/ir.model.access.csv  # Standard security filename
```

### Import Order (PEP8 + Odoo)

```python
# 1. Standard library imports
import logging
from datetime import datetime, timedelta

# 2. Third-party imports
import requests

# 3. Odoo imports
from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError

# 4. Local imports (within module)
from .utils import helper_function

_logger = logging.getLogger(__name__)
```

## Comments & Documentation

### When to Comment

```python
# Good: Explain WHY, not WHAT
# Use exponential backoff to avoid overwhelming external API during outages
delay = min(1000 * (2 ** retry_count), 30000)

# Sudo required: System needs to create audit log regardless of user permissions
self.env['audit.log'].sudo().create({'action': 'user_login'})

# Bad: Stating the obvious
# Increment counter by 1
count += 1

# Set name to partner's name
name = partner.name
```

### Docstrings

```python
def calculate_discount(self, amount, discount_percent):
    """Calculate discount amount for order.

    Args:
        amount (float): Original order amount
        discount_percent (float): Discount percentage (0-100)

    Returns:
        float: Discount amount

    Raises:
        ValidationError: If discount_percent is not between 0 and 100

    Example:
        >>> order.calculate_discount(100.0, 10.0)
        10.0
    """
    if not 0 <= discount_percent <= 100:
        raise ValidationError(_("Discount must be between 0 and 100"))
    return amount * discount_percent / 100
```

## Code Smell Detection

### 1. Long Methods
```python
# Bad: Method > 50 lines
def process_order(self):
    # 100 lines of code
    pass

# Good: Split into smaller methods
def process_order(self):
    self._validate_order()
    self._calculate_totals()
    self._create_invoice()
    self._send_notification()
```

### 2. Deep Nesting
```python
# Bad: 5+ levels of nesting
if user:
    if user.is_admin:
        if order:
            if order.is_active:
                if has_permission:
                    # Do something
                    pass

# Good: Early returns
if not user:
    return
if not user.is_admin:
    return
if not order:
    return
if not order.is_active:
    return
if not has_permission:
    return

# Do something
```

### 3. Magic Numbers
```python
# Bad: Unexplained numbers
if retry_count > 3:
    pass

# Good: Named constants
MAX_RETRIES = 3
if retry_count > MAX_RETRIES:
    pass
```

### 4. Duplicate Code
```python
# Bad: Repeated logic
def action_confirm(self):
    self.ensure_one()
    if self.state != 'draft':
        raise UserError(_("Invalid state"))
    self.state = 'confirmed'

def action_approve(self):
    self.ensure_one()
    if self.state != 'draft':
        raise UserError(_("Invalid state"))
    self.state = 'approved'

# Good: Extract common logic
def _check_can_proceed(self):
    self.ensure_one()
    if self.state != 'draft':
        raise UserError(_("Invalid state"))

def action_confirm(self):
    self._check_can_proceed()
    self.state = 'confirmed'

def action_approve(self):
    self._check_can_proceed()
    self.state = 'approved'
```

## Linting Tools

```bash
# Run flake8 for PEP8 compliance
flake8 --max-line-length=120 --ignore=E501,W503 models/

# Run pylint with Odoo plugin
pylint --load-plugins=pylint_odoo models/

# Run Black for formatting
black models/

# Run isort for import ordering
isort models/
```

**Remember**: Code quality is not negotiable. Clear, maintainable code enables rapid development and confident refactoring in Odoo modules.
