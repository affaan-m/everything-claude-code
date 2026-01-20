# Performance Optimization

## Model Selection Strategy

**Haiku 4.5** (90% of Sonnet capability, 3x cost savings):
- Lightweight agents with frequent invocation
- Pair programming and code generation
- Worker agents in multi-agent systems

**Sonnet 4.5** (Best coding model):
- Main development work
- Orchestrating multi-agent workflows
- Complex coding tasks

**Opus 4.5** (Deepest reasoning):
- Complex architectural decisions
- Maximum reasoning requirements
- Research and analysis tasks

## ORM Performance Patterns

### Avoid N+1 Queries

```python
# BAD: N+1 query pattern (1 query per partner)
for partner in partners:
    print(partner.country_id.name)  # Triggers query each iteration

# GOOD: Prefetch related fields
partners = self.env['res.partner'].search([]).with_prefetch()
for partner in partners:
    print(partner.country_id.name)  # Uses prefetched data

# GOOD: Explicit prefetch
partners = self.env['res.partner'].search([])
partners.mapped('country_id')  # Prefetches all countries
for partner in partners:
    print(partner.country_id.name)  # No additional queries
```

### Use Batch Operations

```python
# BAD: Individual writes
for partner in partners:
    partner.write({'active': True})

# GOOD: Batch write
partners.write({'active': True})

# BAD: Individual creates
for data in data_list:
    self.env['res.partner'].create(data)

# GOOD: Batch create
self.env['res.partner'].create(data_list)
```

### Optimize Search Queries

```python
# BAD: Load all fields when only ID needed
partners = self.env['res.partner'].search([('is_company', '=', True)])
partner_ids = partners.ids

# GOOD: Use search_read with specific fields
partners = self.env['res.partner'].search_read(
    [('is_company', '=', True)],
    ['id', 'name']  # Only load needed fields
)

# GOOD: Use read_group for aggregations
result = self.env['sale.order'].read_group(
    [('state', '=', 'sale')],
    ['amount_total:sum'],
    ['partner_id']
)
```

### Stored Computed Fields

```python
# BAD: Non-stored computed field (computed on every access)
state = fields.Selection(compute='_compute_state')

# GOOD: Stored computed field (computed only when dependencies change)
state = fields.Selection(compute='_compute_state', store=True)

@api.depends('date_expiry')
def _compute_state(self):
    today = fields.Date.today()
    for record in self:
        if record.date_expiry < today:
            record.state = 'expired'
        else:
            record.state = 'valid'
```

## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

## Ultrathink + Plan Mode

For complex tasks requiring deep reasoning:
1. Use `ultrathink` for enhanced thinking
2. Enable **Plan Mode** for structured approach
3. "Rev the engine" with multiple critique rounds
4. Use split role sub-agents for diverse analysis

## Database Query Optimization

```python
# Use SQL for read-only bulk operations
self.env.cr.execute("""
    SELECT partner_id, SUM(amount_total)
    FROM sale_order
    WHERE state = 'sale'
    GROUP BY partner_id
""")
results = self.env.cr.dictfetchall()

# Use indexes for frequently searched fields
class SaleOrder(models.Model):
    _name = 'sale.order'

    partner_id = fields.Many2one('res.partner', index=True)
    date_order = fields.Datetime(index=True)
```

## Caching Strategies

```python
from odoo import tools

class ProductProduct(models.Model):
    _name = 'product.product'

    @tools.ormcache('self.id')
    def _get_cached_price(self):
        """Cache price calculation."""
        return self._calculate_complex_price()

    def _calculate_complex_price(self):
        # Complex calculation
        pass

    def write(self, vals):
        # Invalidate cache on write
        self.env.registry.clear_cache()
        return super().write(vals)
```

## Performance Troubleshooting

If module is slow:
1. Enable Odoo profiling in debug mode
2. Check for N+1 query patterns
3. Analyze slow SQL queries with EXPLAIN
4. Review computed field dependencies
5. Consider storing computed fields
6. Use batch operations instead of loops

```bash
# Enable debug logging
docker exec $ODOO_CONTAINER odoo \
    --log-handler=odoo.sql_db:DEBUG \
    -d $ODOO_DB
```
