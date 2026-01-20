# Common Patterns

## Odoo Controller Response Format

```python
from odoo import http
from odoo.http import request
import json

class ApiController(http.Controller):

    @http.route('/api/v1/partners', type='json', auth='user', methods=['GET'])
    def get_partners(self, **kwargs):
        """API endpoint for partner list."""
        try:
            partners = request.env['res.partner'].search([])
            return {
                'success': True,
                'data': [{
                    'id': p.id,
                    'name': p.name,
                    'email': p.email,
                } for p in partners],
                'meta': {
                    'total': len(partners),
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/v1/partners/<int:partner_id>', type='json', auth='user')
    def get_partner(self, partner_id, **kwargs):
        """API endpoint for single partner."""
        partner = request.env['res.partner'].browse(partner_id)
        if not partner.exists():
            return {'success': False, 'error': 'Partner not found'}
        return {
            'success': True,
            'data': {
                'id': partner.id,
                'name': partner.name,
                'email': partner.email,
            }
        }
```

## Computed Field Pattern

```python
from odoo import api, fields, models

class SaleOrder(models.Model):
    _name = 'sale.order'
    _description = 'Sale Order'

    line_ids = fields.One2many('sale.order.line', 'order_id')
    amount_untaxed = fields.Monetary(
        string='Untaxed Amount',
        compute='_compute_amounts',
        store=True,
    )
    amount_tax = fields.Monetary(
        string='Tax Amount',
        compute='_compute_amounts',
        store=True,
    )
    amount_total = fields.Monetary(
        string='Total',
        compute='_compute_amounts',
        store=True,
    )

    @api.depends('line_ids.price_subtotal', 'line_ids.price_tax')
    def _compute_amounts(self):
        for order in self:
            order.amount_untaxed = sum(order.line_ids.mapped('price_subtotal'))
            order.amount_tax = sum(order.line_ids.mapped('price_tax'))
            order.amount_total = order.amount_untaxed + order.amount_tax
```

## Inheritance Patterns

```python
# Classic inheritance - extend existing model
class ResPartner(models.Model):
    _inherit = 'res.partner'

    custom_field = fields.Char(string='Custom Field')

# New model inheriting structure
class HrEmployee(models.Model):
    _name = 'hr.employee'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = 'Employee'

# Delegation inheritance
class ProductProduct(models.Model):
    _name = 'product.product'
    _inherits = {'product.template': 'product_tmpl_id'}
    _description = 'Product Variant'

    product_tmpl_id = fields.Many2one(
        'product.template',
        required=True,
        ondelete='cascade',
    )
```

## Wizard Pattern

```python
from odoo import api, fields, models

class MassUpdateWizard(models.TransientModel):
    _name = 'mass.update.wizard'
    _description = 'Mass Update Wizard'

    partner_ids = fields.Many2many('res.partner', string='Partners')
    new_category_id = fields.Many2one('res.partner.category', string='New Category')

    @api.model
    def default_get(self, fields_list):
        res = super().default_get(fields_list)
        active_ids = self.env.context.get('active_ids', [])
        res['partner_ids'] = [(6, 0, active_ids)]
        return res

    def action_apply(self):
        """Apply mass update to selected partners."""
        if not self.new_category_id:
            raise UserError(_("Please select a category."))

        self.partner_ids.write({
            'category_id': [(4, self.new_category_id.id)],
        })

        return {'type': 'ir.actions.act_window_close'}
```

## Cron Job Pattern

```python
class AutomatedTask(models.Model):
    _name = 'automated.task'
    _description = 'Automated Task'

    @api.model
    def _cron_process_pending_tasks(self):
        """Cron method to process pending tasks.

        Called by ir.cron 'Process Pending Tasks' scheduled action.
        Runs daily at 6:00 AM.
        """
        pending = self.search([('state', '=', 'pending')])
        _logger.info('Processing %d pending tasks', len(pending))

        for task in pending:
            try:
                task._process_task()
            except Exception as e:
                _logger.error('Failed to process task %d: %s', task.id, e)

        return True
```

## Test Data Factory Pattern

```python
class TestDataFactory:
    """Factory for creating consistent test data."""

    @classmethod
    def create_partner(cls, env, **kwargs):
        defaults = {
            'name': 'Test Partner',
            'email': 'test@example.com',
            'is_company': False,
        }
        defaults.update(kwargs)
        return env['res.partner'].create(defaults)

    @classmethod
    def create_product(cls, env, **kwargs):
        defaults = {
            'name': 'Test Product',
            'list_price': 100.0,
            'type': 'consu',
        }
        defaults.update(kwargs)
        return env['product.product'].create(defaults)
```

## Skeleton Module Template

When implementing new Odoo modules:
1. Use existing well-structured modules as templates
2. Follow standard module structure
3. Use parallel agents to evaluate:
   - Security assessment (ACLs, record rules)
   - ORM pattern compliance
   - Test coverage plan
   - Documentation completeness
4. Start with __manifest__.py and security files
5. Build models, then views, then business logic
