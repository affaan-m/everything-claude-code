---
name: backend-patterns
description: Odoo ORM patterns, model design, database optimization, and server-side best practices for Odoo 15 development.
---

# Odoo Backend Development Patterns

Backend architecture patterns and best practices for Odoo 15 module development.

## ORM Patterns

### CRUD Operations

```python
from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError

class CustomModel(models.Model):
    _name = 'custom.model'
    _description = 'Custom Model'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    # Create
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('reference'):
                vals['reference'] = self.env['ir.sequence'].next_by_code('custom.model')
        return super().create(vals_list)

    # Read - search with domain
    def get_active_records(self):
        return self.search([
            ('state', '=', 'active'),
            ('company_id', '=', self.env.company.id),
        ], limit=100, order='name')

    # Update
    def write(self, vals):
        if 'state' in vals and vals['state'] == 'done':
            self._check_can_complete()
        return super().write(vals)

    # Delete
    def unlink(self):
        for record in self:
            if record.state != 'draft':
                raise UserError(_("Cannot delete non-draft records"))
        return super().unlink()
```

### Recordset Operations

```python
# Filtered - returns recordset matching condition
active_orders = orders.filtered(lambda o: o.state == 'active')
active_orders = orders.filtered('is_active')  # Shortcut for boolean fields

# Mapped - extracts field values or related records
partner_ids = orders.mapped('partner_id')
amounts = orders.mapped('amount_total')
line_products = orders.mapped('order_line.product_id')

# Sorted - returns sorted recordset
sorted_orders = orders.sorted(key=lambda o: o.date_order, reverse=True)
sorted_orders = orders.sorted('date_order', reverse=True)

# Grouped - group by field
from collections import defaultdict
orders_by_partner = defaultdict(lambda: self.env['sale.order'])
for order in orders:
    orders_by_partner[order.partner_id] |= order

# Exists - check if records exist
if order.exists():
    order.action_confirm()

# Ensure one - validate single record
self.ensure_one()
```

### Search Patterns

```python
# Basic search
partners = self.env['res.partner'].search([
    ('is_company', '=', True),
    ('country_id.code', '=', 'US'),
])

# Search with OR
partners = self.env['res.partner'].search([
    '|',
    ('email', 'ilike', 'example.com'),
    ('phone', '!=', False),
])

# Complex domain with AND/OR
domain = [
    '&',
    ('state', '=', 'active'),
    '|',
    ('type', '=', 'customer'),
    ('type', '=', 'prospect'),
]

# Search count (efficient for large datasets)
count = self.env['sale.order'].search_count([('state', '=', 'sale')])

# Search read (returns list of dicts)
data = self.env['res.partner'].search_read(
    domain=[('is_company', '=', True)],
    fields=['name', 'email', 'phone'],
    limit=10,
    order='name'
)

# Read group (aggregation)
results = self.env['sale.order'].read_group(
    domain=[('state', '=', 'sale')],
    fields=['partner_id', 'amount_total:sum'],
    groupby=['partner_id'],
    orderby='amount_total desc',
    limit=10
)
```

### Computed Fields

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    # Stored computed field (for filtering/grouping)
    total_weight = fields.Float(
        compute='_compute_total_weight',
        store=True,
        help="Total weight of all order lines"
    )

    # Non-stored computed field (always current)
    days_since_order = fields.Integer(
        compute='_compute_days_since_order',
        help="Days since order was created"
    )

    @api.depends('order_line.product_id.weight', 'order_line.product_uom_qty')
    def _compute_total_weight(self):
        for order in self:
            order.total_weight = sum(
                line.product_id.weight * line.product_uom_qty
                for line in order.order_line
                if line.product_id.weight
            )

    def _compute_days_since_order(self):
        today = fields.Date.today()
        for order in self:
            if order.date_order:
                delta = today - order.date_order.date()
                order.days_since_order = delta.days
            else:
                order.days_since_order = 0
```

### Context Patterns

```python
# Pass context to method
self.with_context(skip_validation=True).action_confirm()

# Check context in method
def action_confirm(self):
    if not self.env.context.get('skip_validation'):
        self._validate_order()
    self.write({'state': 'confirmed'})

# Change user context
admin_user = self.env.ref('base.user_admin')
self.with_user(admin_user).action_admin_only()

# Change company context
self.with_company(company_id).action()

# Combine context changes
self.with_context(active_test=False).with_company(company).search([])
```

## Database Patterns

### Query Optimization

```python
# Bad: N+1 query problem
for order in orders:
    partner_name = order.partner_id.name  # Query per iteration

# Good: Prefetch related records
orders = self.env['sale.order'].search([])
_ = orders.mapped('partner_id.name')  # Prefetch all partners
for order in orders:
    partner_name = order.partner_id.name  # Uses cache

# Good: Use read_group for aggregation
totals = self.env['sale.order.line'].read_group(
    domain=[('order_id', 'in', order_ids)],
    fields=['order_id', 'price_subtotal:sum'],
    groupby=['order_id']
)

# Bad: Search inside loop
for partner in partners:
    orders = self.env['sale.order'].search([('partner_id', '=', partner.id)])

# Good: Single search with IN operator
partner_ids = partners.ids
orders = self.env['sale.order'].search([('partner_id', 'in', partner_ids)])
orders_by_partner = defaultdict(lambda: self.env['sale.order'])
for order in orders:
    orders_by_partner[order.partner_id.id] |= order
```

### Raw SQL (When Necessary)

```python
# Only use raw SQL when ORM cannot achieve the result
# ALWAYS use parameterized queries

def _get_partner_statistics(self):
    """Get partner statistics with window functions.

    Raw SQL Justification:
    - Purpose: Complex reporting query with window functions
    - ORM limitation: Cannot express PARTITION BY in ORM
    - Security: All parameters are validated integers from system
    """
    self.env.cr.execute("""
        SELECT
            partner_id,
            SUM(amount_total) as total_sales,
            SUM(amount_total) OVER (PARTITION BY partner_id ORDER BY date_order) as running_total
        FROM sale_order
        WHERE partner_id IN %s
        AND state = 'sale'
        GROUP BY partner_id, date_order, amount_total
    """, (tuple(self.partner_ids.ids),))

    return self.env.cr.dictfetchall()

# NEVER do this - SQL injection vulnerability
def bad_search(self, name):
    self.env.cr.execute(f"SELECT * FROM res_partner WHERE name = '{name}'")
```

### Transaction Patterns

```python
# Odoo manages transactions automatically
# Use savepoints for partial rollback

def process_batch(self):
    for record in self:
        try:
            with self.env.cr.savepoint():
                record._process_single()
        except Exception as e:
            _logger.error("Failed to process %s: %s", record.id, e)
            record.state = 'error'
            continue

# Flush changes to database
def action_with_flush(self):
    self.write({'state': 'processing'})
    self.env.flush_all()  # Ensure write is committed
    self._external_api_call()  # External call sees committed data
```

## Service Layer Patterns

### Business Logic Separation

```python
class SaleOrderService(models.AbstractModel):
    """Business logic service for sale orders.

    Separates complex business logic from model layer.
    """
    _name = 'sale.order.service'
    _description = 'Sale Order Business Logic Service'

    def calculate_shipping(self, order):
        """Calculate shipping cost based on business rules."""
        if order.amount_total > 100:
            return 0  # Free shipping
        return self._get_shipping_rate(order.partner_id.country_id)

    def validate_order(self, order):
        """Validate order before confirmation."""
        errors = []
        if not order.order_line:
            errors.append(_("Order must have at least one line"))
        if order.amount_total <= 0:
            errors.append(_("Order total must be positive"))
        return errors

    def _get_shipping_rate(self, country):
        """Get shipping rate for country."""
        rates = self.env['shipping.rate'].search([
            ('country_id', '=', country.id)
        ], limit=1)
        return rates.rate if rates else 10.0

# Usage in model
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_confirm(self):
        service = self.env['sale.order.service']
        errors = service.validate_order(self)
        if errors:
            raise UserError('\n'.join(errors))
        return super().action_confirm()
```

### Mixin Pattern

```python
class ApprovalMixin(models.AbstractModel):
    """Mixin for models requiring approval workflow."""
    _name = 'approval.mixin'
    _description = 'Approval Workflow Mixin'

    approval_state = fields.Selection([
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending', tracking=True)

    approved_by = fields.Many2one('res.users', readonly=True)
    approved_date = fields.Datetime(readonly=True)

    def action_approve(self):
        self.write({
            'approval_state': 'approved',
            'approved_by': self.env.user.id,
            'approved_date': fields.Datetime.now(),
        })

    def action_reject(self):
        self.write({'approval_state': 'rejected'})

    def action_reset(self):
        self.write({
            'approval_state': 'pending',
            'approved_by': False,
            'approved_date': False,
        })

# Usage
class PurchaseRequest(models.Model):
    _name = 'purchase.request'
    _inherit = ['mail.thread', 'approval.mixin']
    _description = 'Purchase Request'

    name = fields.Char(required=True)
    amount = fields.Float()
```

## Error Handling Patterns

### Custom Exceptions

```python
from odoo.exceptions import UserError, ValidationError, AccessError

class OrderProcessingError(Exception):
    """Custom exception for order processing failures."""
    pass

def process_order(self):
    try:
        self._validate_inventory()
        self._reserve_stock()
        self._create_delivery()
    except OrderProcessingError as e:
        raise UserError(_("Order processing failed: %s") % str(e))
    except AccessError:
        raise UserError(_("You don't have permission to process this order"))
    except Exception as e:
        _logger.exception("Unexpected error processing order %s", self.id)
        raise UserError(_("An unexpected error occurred. Please contact support."))
```

### Validation Pattern

```python
@api.constrains('date_start', 'date_end', 'amount')
def _check_values(self):
    for record in self:
        if record.date_start and record.date_end:
            if record.date_start > record.date_end:
                raise ValidationError(_("End date must be after start date"))

        if record.amount <= 0:
            raise ValidationError(_("Amount must be positive"))

# Pre-validation before expensive operations
def action_confirm(self):
    self.ensure_one()
    errors = self._validate_can_confirm()
    if errors:
        raise UserError('\n'.join(errors))
    self._do_confirm()

def _validate_can_confirm(self):
    errors = []
    if self.state != 'draft':
        errors.append(_("Only draft orders can be confirmed"))
    if not self.line_ids:
        errors.append(_("Order must have at least one line"))
    return errors
```

## Scheduled Actions

```python
class AutomaticProcessing(models.Model):
    _name = 'automatic.processing'
    _description = 'Automatic Processing'

    @api.model
    def _cron_process_pending_orders(self):
        """Process pending orders (called by scheduled action)."""
        orders = self.env['sale.order'].search([
            ('state', '=', 'pending'),
            ('date_order', '<', fields.Datetime.now()),
        ], limit=100)

        for order in orders:
            try:
                with self.env.cr.savepoint():
                    order.action_confirm()
                    _logger.info("Auto-confirmed order %s", order.name)
            except Exception as e:
                _logger.error("Failed to auto-confirm %s: %s", order.name, e)
                continue

        return True
```

## Controller Patterns (HTTP Endpoints)

```python
from odoo import http
from odoo.http import request

class CustomController(http.Controller):

    @http.route('/api/orders', type='json', auth='user', methods=['GET'])
    def get_orders(self, **kwargs):
        """Get orders for current user."""
        orders = request.env['sale.order'].search([
            ('partner_id', '=', request.env.user.partner_id.id)
        ])
        return {
            'success': True,
            'data': [{
                'id': o.id,
                'name': o.name,
                'total': o.amount_total,
            } for o in orders]
        }

    @http.route('/api/orders/<int:order_id>', type='json', auth='user')
    def get_order(self, order_id):
        """Get single order."""
        order = request.env['sale.order'].browse(order_id)
        if not order.exists():
            return {'success': False, 'error': 'Order not found'}
        return {'success': True, 'data': {'id': order.id, 'name': order.name}}

    @http.route('/api/public', type='json', auth='public', csrf=False)
    def public_endpoint(self):
        """Public API endpoint (CSRF disabled - must justify).

        CSRF disabled: Public API endpoint, read-only data.
        No state modification, returns only public information.
        """
        return {'status': 'ok'}
```

**Remember**: Odoo ORM patterns enable scalable, maintainable backend applications. Prefer ORM methods over raw SQL, use proper error handling, and always consider multi-company and access rights.
