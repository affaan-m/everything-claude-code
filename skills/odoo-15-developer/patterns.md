# Patterns & Anti-Patterns - Odoo 15 Development

## Common Anti-Patterns to Avoid

### Database Operations

```python
# Avoid: Direct SQL queries
self.env.cr.execute("SELECT * FROM res_partner WHERE active = true")
partners = self.env.cr.fetchall()

# Prefer: ORM methods
partners = self.env['res.partner'].search([('active', '=', True)])

# Avoid: Inefficient loops (N+1 problem)
for partner in all_partners:
    partner.write({'last_update': fields.Datetime.now()})

# Prefer: Batch operations
all_partners.write({'last_update': fields.Datetime.now()})
```

### Context and Environment

```python
# Avoid: Modifying global context
self.env.context.update({'lang': 'en_US'})

# Prefer: Using with_context
partner_en = partner.with_context(lang='en_US')

# Avoid: Sudo without justification
orders = self.env['sale.order'].sudo().search([])

# Prefer: Documented sudo or proper access rights
# Using sudo: need all orders for cross-user reporting
orders = self.env['sale.order'].sudo().search([])
```

## Common Gotchas and Solutions

### Recordset Operations

```python
# Wrong: Modifying recordset during iteration
for record in recordset:
    if condition:
        recordset -= record  # This can cause issues!

# Right: Filter first, then operate
filtered_records = recordset.filtered(lambda r: not condition)
remaining_records = recordset - filtered_records
```

### Context Management

```python
# Wrong: Forgetting context in complex operations
def complex_operation(self):
    # Context might be lost in nested calls
    return self.some_operation()

# Right: Explicitly manage context
def complex_operation(self):
    return self.with_context(
        active_test=False,
        mail_create_nolog=True,
    ).some_operation()
```

### Transaction Management

```python
# Wrong: Not handling transactions in background jobs
@api.model
def cron_process_records(self):
    for record in self.search([]):
        record.process()  # If one fails, all rollback!

# Right: Individual transaction commits
@api.model
def cron_process_records(self):
    for record in self.search([]):
        try:
            record.process()
            self.env.cr.commit()
        except Exception as e:
            self.env.cr.rollback()
            _logger.error(f"Failed to process {record}: {e}")
```

## Recommended Patterns

### Recordset Filtering

```python
# Filter by condition
active_partners = partners.filtered(lambda p: p.active)

# Filter by field value
large_orders = orders.filtered(lambda o: o.amount_total > 1000)

# Multiple conditions
valid_records = records.filtered(
    lambda r: r.state == 'confirmed' and r.amount > 0
)
```

### Recordset Mapping

```python
# Get field values
names = partners.mapped('name')

# Get related values
emails = orders.mapped('partner_id.email')

# Complex mapping
totals = orders.mapped(lambda o: o.amount_total * 1.1)
```

### Recordset Sorting

```python
# Sort by field
sorted_partners = partners.sorted('name')

# Reverse sort
sorted_desc = partners.sorted('create_date', reverse=True)

# Sort by computed value
sorted_by_total = orders.sorted(lambda o: o.amount_total)
```

### Grouped Operations

```python
# Group by field
from collections import defaultdict

grouped = defaultdict(self.env['sale.order'].browse)
for order in orders:
    grouped[order.partner_id] |= order

# Or using itertools
from itertools import groupby
sorted_orders = orders.sorted('partner_id')
for partner, orders_group in groupby(sorted_orders, lambda o: o.partner_id):
    partner_orders = self.env['sale.order'].concat(*orders_group)
```

### Batch Processing

```python
# Batch create
partners_data = [{'name': f'Partner {i}'} for i in range(100)]
partners = self.env['res.partner'].create(partners_data)

# Batch write
partners.write({'active': False})

# Chunked processing for large datasets
BATCH_SIZE = 100
for i in range(0, len(records), BATCH_SIZE):
    batch = records[i:i + BATCH_SIZE]
    batch.process()
    self.env.cr.commit()
```

### Context Patterns

```python
# Skip mail notifications
record.with_context(mail_create_nolog=True).write(vals)

# Skip access checks
record.with_context(active_test=False).search([])

# Pass custom values
record.with_context(custom_param='value').method()

# Multiple context values
record.with_context(
    lang='en_US',
    tz='UTC',
    mail_create_nolog=True,
).method()
```

### User/Company Context

```python
# Switch user
record.with_user(user).method()

# Switch company (multi-company)
record.with_company(company).method()

# Both
record.with_user(user).with_company(company).method()
```

### Safe Field Access

```python
# Safe navigation for optional relations
department_name = employee.department_id.name if employee.department_id else ''

# Using mapped (returns empty list if no relation)
department_names = employees.mapped('department_id.name')

# Default values
value = record.field_name or default_value
```

### Error Handling Patterns

```python
from odoo.exceptions import UserError, ValidationError, AccessError

# User-facing errors
if not self.partner_id:
    raise UserError(_("Please select a partner first."))

# Validation errors (typically in constraints)
@api.constrains('amount')
def _check_amount(self):
    for record in self:
        if record.amount < 0:
            raise ValidationError(_("Amount cannot be negative."))

# Access errors
if not self.env.user.has_group('base.group_manager'):
    raise AccessError(_("Only managers can perform this action."))
```

### Logging Patterns

```python
import logging
_logger = logging.getLogger(__name__)

# Debug logging (use _logger.debug for investigation)
_logger.debug("Processing record %s with values %s", record.id, vals)

# Info logging (for important events)
_logger.info("Order %s confirmed by user %s", order.name, self.env.user.name)

# Warning logging
_logger.warning("Deprecated method called: %s", method_name)

# Error logging
_logger.error("Failed to process record %s: %s", record.id, str(e))
```

## Performance Patterns

### Prefetching

```python
# Bad: N+1 queries
for order in orders:
    print(order.partner_id.name)  # Query for each order

# Good: Prefetch related records
orders = self.env['sale.order'].search([]).with_prefetch()
for order in orders:
    print(order.partner_id.name)  # Uses prefetched data
```

### Search Optimization

```python
# Use count when you only need the count
count = self.env['sale.order'].search_count([('state', '=', 'done')])

# Limit results when you only need a few
recent_orders = self.env['sale.order'].search([], limit=10, order='create_date desc')

# Use read() when you need specific fields only
partner_data = partners.read(['name', 'email'])
```

### Stored Computed Fields

```python
# Store computed field for better query performance
total = fields.Float(compute='_compute_total', store=True)

@api.depends('line_ids.amount')
def _compute_total(self):
    for record in self:
        record.total = sum(record.line_ids.mapped('amount'))
```

## Module Dependency Patterns

### Manifest Dependencies

```python
# __manifest__.py
{
    'depends': [
        'base',      # Always needed
        'sale',      # Direct dependency
        # Don't include transitive dependencies
    ],
}
```

### Optional Dependencies

```python
# Check if module is installed
if 'sale_subscription' in self.env.registry._init_modules:
    # Use subscription features
    pass

# Or check model existence
if 'sale.subscription' in self.env:
    # Use subscription model
    pass
```

## Debugging Patterns

### Investigation with Debug Logging

```python
# Always use _logger.debug for investigation (NOT _logger.info)
_logger.debug("=== DEBUG: Starting investigation ===")
_logger.debug("Record: %s", record)
_logger.debug("Context: %s", self.env.context)
_logger.debug("User: %s (ID: %s)", self.env.user.name, self.env.user.id)
_logger.debug("Values: %s", vals)
```

### Interactive Debugging

```python
# Use in Odoo shell for investigation
import odoo
env = odoo.api.Environment(cr, uid, {})

# Query records
records = env['model.name'].search([])
for r in records:
    print(f"{r.id}: {r.name}")
```

## Anti-Pattern Summary

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Direct SQL | Bypasses ORM, security | Use ORM methods |
| Loop writes | N+1 queries | Batch operations |
| Context mutation | Side effects | `with_context()` |
| Undocumented sudo | Security risk | Document with comment |
| Recordset iteration mutation | Undefined behavior | Filter first |
| Lost context | Unexpected behavior | Explicit context |
| Full rollback on error | Data loss | Per-record commits |
