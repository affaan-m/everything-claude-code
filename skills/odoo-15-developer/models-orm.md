# Models & ORM - Odoo 15 Development

## Model Definition Rules

### MUST Rules
- Use `_name` only for new models
- Use `_inherit` for extensions
- Define `_description` for every model
- All fields must have meaningful `string=` labels

### SHOULD Rules
- Set `string`, `help`, and `required` where applicable
- Use `related` and `compute` fields to avoid duplicating logic
- Check existing Odoo fields before adding new ones

## Model Definition Examples

```python
# Good - Complete model definition
class SaleCommission(models.Model):
    _name = "sale.commission"
    _description = "Sales Commission"

    name = fields.Char(string="Description", required=True)
    rate = fields.Float(string="Commission Rate", help="Rate in %")
    active = fields.Boolean(default=True)

# Bad - Missing description and field labels
class SaleCommission(models.Model):
    _name = "sale.commission"

    name = fields.Char()
    rate = fields.Float()
```

## Computed Fields

Prefer computed/stored fields instead of duplicating data:

```python
# Good - Computed with proper dependencies
commission_total = fields.Monetary(
    compute="_compute_commission_total",
    store=True,
    string="Commission Total"
)

@api.depends("order_line.price_total")
def _compute_commission_total(self):
    for order in self:
        order.commission_total = sum(
            line.price_total * 0.1 for line in order.order_line
        )

# Bad - Duplicate data stored without compute logic
commission_total = fields.Monetary()
```

## Computed Field Patterns

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    total_weight = fields.Float(
        string='Total Weight',
        compute='_compute_total_weight',
        store=True,
    )

    @api.depends('order_line.product_id.weight', 'order_line.product_uom_qty')
    def _compute_total_weight(self) -> None:
        """Compute total weight of all order lines."""
        for order in self:
            order.total_weight = sum(
                line.product_id.weight * line.product_uom_qty
                for line in order.order_line
                if line.product_id.weight
            )
```

## Business Logic & Method Overrides

### MUST Rules
- Call `super()` when overriding `create`, `write`, `unlink`
- Use `@api.constrains` and `@api.onchange` for validations
- Keep business logic in models, not in controllers or views

### SHOULD Rules
- Prefer small, composable methods over large ones
- Avoid overriding `create`/`write` unless strictly necessary
- Prefer constraints/onchange over write overrides

## Constraints

```python
# Good - Using constrains decorator
@api.constrains("rate")
def _check_rate(self):
    for record in self:
        if record.rate < 0 or record.rate > 100:
            raise ValidationError("Rate must be between 0 and 100.")

# Good - Multiple field constraint
@api.constrains("credit_limit", "balance")
def _check_credit_limit(self):
    for partner in self:
        if partner.balance > partner.credit_limit:
            raise ValidationError(_("Credit limit exceeded"))
```

## Write/Create Overrides

```python
# Good - Proper super() usage with post-processing
def write(self, vals):
    res = super().write(vals)
    if "state" in vals and vals["state"] == "done":
        self._do_post_processing()
    return res

# Bad - No super(), validation in write
def write(self, vals):
    if "rate" in vals and (vals["rate"] < 0 or vals["rate"] > 100):
        return False  # Wrong! Use constrains
    return True
```

## Validation Methods

```python
class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.constrains('email')
    def _check_email_format(self) -> None:
        """Validate email format for partners."""
        for partner in self:
            if partner.email and not self._is_valid_email(partner.email):
                raise ValidationError(f"Invalid email format: {partner.email}")

    def _is_valid_email(self, email: str) -> bool:
        """Check if email format is valid.

        Args:
            email: Email string to validate

        Returns:
            True if email format is valid, False otherwise
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
```

## Search Methods

```python
@api.model
def search_by_email_domain(self, domain: str) -> 'ResPartner':
    """Search partners by email domain.

    Args:
        domain: Email domain to search for (e.g., 'example.com')

    Returns:
        Recordset of partners matching the domain
    """
    return self.search([('email', 'ilike', f'%@{domain}')])
```

## Scheduled Actions (Cron)

```python
class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def cron_update_partner_credit_scores(self) -> None:
        """Scheduled action to update partner credit scores."""
        partners = self.search([
            ('is_company', '=', True),
            ('active', '=', True),
        ])

        for partner in partners:
            try:
                self._update_single_partner_credit_score(partner)
                self.env.cr.commit()  # Commit each to avoid full rollback
            except Exception as e:
                self._log_credit_score_error(partner, str(e))
                continue

    def _update_single_partner_credit_score(self, partner) -> None:
        """Update credit score for a single partner."""
        # Business logic here
        pass
```

## External API Integration

```python
import requests
from typing import Dict, Any
from odoo.exceptions import ValidationError

class ResPartner(models.Model):
    _inherit = 'res.partner'

    def validate_address_with_external_api(self) -> Dict[str, Any]:
        """Validate address using external service."""
        if not self.street or not self.zip or not self.country_id:
            raise ValidationError("Complete address required for validation")

        address_data = self._prepare_address_data()

        try:
            response = self._call_address_validation_api(address_data)
            return self._process_validation_response(response)
        except requests.RequestException as e:
            self._log_api_error(str(e))
            raise ValidationError("Address validation service unavailable")

    def _prepare_address_data(self) -> Dict[str, str]:
        """Prepare address data for API call."""
        return {
            'street': self.street,
            'city': self.city,
            'zip': self.zip,
            'country': self.country_id.code,
        }
```

## Access Rights in Business Logic

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def confirm_order_with_validation(self) -> bool:
        """Confirm order with proper validation and access checks."""
        self.ensure_one()

        # Check access rights
        if not self.env.user.has_group('sales_team.group_sale_manager'):
            if self.amount_total > 10000:
                raise UserError("Large orders require manager approval")

        # Validate business rules
        if not self._validate_order_requirements():
            return False

        return self.action_confirm()
```

## Database Migrations

```python
# migrations/15.0.1.1.0/post-migration.py

def migrate(cr, version):
    """Update existing records after module upgrade."""
    from odoo import api, SUPERUSER_ID

    env = api.Environment(cr, SUPERUSER_ID, {})

    # Update existing partners with new field
    partners = env['res.partner'].search([])
    for partner in partners:
        partner.write({
            'credit_score': partner._calculate_initial_credit_score()
        })
```

## Manifest File Standards

```python
# __manifest__.py
{
    'name': 'My Custom Module',
    'version': '15.0.1.0.0',
    'category': 'Sales/Sales',
    'summary': 'Short description of module functionality',
    'description': """
        Detailed description of what this module does.
        Include business use cases and key features.
    """,
    'author': 'Your Company',
    'website': 'https://yourcompany.com',
    'depends': [
        'base',
        'sale',
        'account',
    ],
    'data': [
        'security/ir.model.access.csv',
        'security/security.xml',
        'data/ir_cron_data.xml',
        'views/res_partner_views.xml',
        'views/sale_order_views.xml',
        'wizard/partner_wizard_views.xml',
    ],
    'demo': [
        'demo/demo_data.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
    'license': 'LGPL-3',
}
```

## Quick Reference Table

| Task | Decorator/Method | Notes |
|------|-----------------|-------|
| New model | `_name = "..."` | Define `_description` |
| Extend model | `_inherit = "..."` | No `_name` needed |
| Computed field | `@api.depends` | List all dependencies |
| Validation | `@api.constrains` | Prefer over write override |
| UI changes | `@api.onchange` | Client-side only |
| Create override | `super().create()` | Always call super |
| Write override | `super().write()` | Always call super |
| Class method | `@api.model` | No recordset context |
