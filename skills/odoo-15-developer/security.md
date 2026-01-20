# Security - Odoo 15 Development

## Security Rules

### MUST Rules
- Define `ir.model.access.csv` for every model
- Use record rules for row-level security
- Grant minimum rights (principle of least privilege)

### SHOULD Rules
- Use `groups` on views/fields
- Document sudo usage with comments

## Access Rights (ir.model.access.csv)

### File Format

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
```

### Examples

```csv
# Good - Minimal rights with escalation
access_sale_commission_user,sale.commission user,model_sale_commission,base.group_user,1,0,0,0
access_sale_commission_manager,sale.commission manager,model_sale_commission,sales_team.group_sale_manager,1,1,1,1

# Bad - Everyone gets all access
access_sale_commission_all,sale.commission all,model_sale_commission,base.group_user,1,1,1,1
```

### Permission Levels

| Permission | Description | Code |
|------------|-------------|------|
| Read | Can view records | `perm_read=1` |
| Write | Can modify records | `perm_write=1` |
| Create | Can create records | `perm_create=1` |
| Unlink | Can delete records | `perm_unlink=1` |

### Common Group References

| Group | XML ID |
|-------|--------|
| All Users | `base.group_user` |
| Portal Users | `base.group_portal` |
| Public Users | `base.group_public` |
| Sales User | `sales_team.group_sale_salesman` |
| Sales Manager | `sales_team.group_sale_manager` |
| HR User | `hr.group_hr_user` |
| HR Manager | `hr.group_hr_manager` |

## Record Rules (ir.rule)

Row-level security using domain filters:

```xml
<!-- Record rule - Users see only their own records -->
<record id="rule_sale_own" model="ir.rule">
    <field name="name">Sales: Own Orders Only</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="domain_force">[('user_id', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('sales_team.group_sale_salesman'))]"/>
</record>

<!-- Record rule - Managers see all records -->
<record id="rule_sale_manager" model="ir.rule">
    <field name="name">Sales: Manager All Orders</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="domain_force">[(1, '=', 1)]</field>
    <field name="groups" eval="[(4, ref('sales_team.group_sale_manager'))]"/>
</record>
```

### Domain Force Patterns

| Pattern | Description |
|---------|-------------|
| `[(1, '=', 1)]` | All records (no filter) |
| `[('user_id', '=', user.id)]` | Current user's records |
| `[('company_id', '=', company_id)]` | Current company records |
| `[('department_id', '=', user.department_id.id)]` | Same department |
| `['|', ('user_id', '=', user.id), ('public', '=', True)]` | Own OR public |

## Field-Level Security

```xml
<!-- Good - Field visible only to managers -->
<field name="commission_rate" groups="sales_team.group_sale_manager"/>

<!-- Bad - No group restriction on sensitive field -->
<field name="commission_rate"/>
```

### Sensitive Fields to Protect

- Financial data (commission rates, margins, costs)
- Personal data (salary, SSN, addresses)
- System configuration fields
- Debug/technical fields

## Security Groups Definition

```xml
<record id="group_custom_manager" model="res.groups">
    <field name="name">Custom Manager</field>
    <field name="category_id" ref="base.module_category_custom"/>
    <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
    <field name="users" eval="[(4, ref('base.user_admin'))]"/>
</record>
```

## Sudo Usage

### When to Use

- Cron jobs needing access across all records
- Inter-model operations where current user lacks access
- System operations (email sending, logging)

### MUST Document

```python
# Good - Documented sudo usage
# Using sudo here because we need to access all orders for reporting
# regardless of current user's access rights
orders = self.env['sale.order'].sudo().search([])

# Bad - Undocumented sudo
orders = self.env['sale.order'].sudo().search([])
```

### Sudo Patterns

```python
# Switch to sudo for specific operation
def generate_report(self):
    """Generate report across all orders."""
    # Using sudo: Reports need access to all data regardless of user
    all_orders = self.env['sale.order'].sudo().search([
        ('date', '>=', self.date_from),
        ('date', '<=', self.date_to),
    ])
    return self._create_report(all_orders)

# Avoid sudo in create/write when possible
def create_related_record(self, partner):
    """Create record using current user context."""
    # Don't use sudo here - respect user permissions
    return self.env['custom.record'].create({
        'partner_id': partner.id,
    })
```

## Business Logic Security Checks

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def confirm_order_with_validation(self) -> bool:
        """Confirm order with proper validation and access checks."""
        self.ensure_one()

        # Check access rights in business logic
        if not self.env.user.has_group('sales_team.group_sale_manager'):
            if self.amount_total > 10000:
                raise UserError("Large orders require manager approval")

        # Validate business rules
        if not self._validate_order_requirements():
            return False

        return self.action_confirm()
```

## Security File Structure

```
module_name/
└── security/
    ├── ir.model.access.csv    # Model access rights
    └── security.xml           # Groups, record rules
```

### security.xml Template

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Security Groups -->
        <record id="group_custom_user" model="res.groups">
            <field name="name">Custom User</field>
            <field name="category_id" ref="base.module_category_custom"/>
        </record>

        <record id="group_custom_manager" model="res.groups">
            <field name="name">Custom Manager</field>
            <field name="category_id" ref="base.module_category_custom"/>
            <field name="implied_ids" eval="[(4, ref('group_custom_user'))]"/>
        </record>

        <!-- Record Rules -->
        <record id="rule_custom_own" model="ir.rule">
            <field name="name">Custom: Own Records</field>
            <field name="model_id" ref="model_custom_model"/>
            <field name="domain_force">[('user_id', '=', user.id)]</field>
            <field name="groups" eval="[(4, ref('group_custom_user'))]"/>
        </record>

        <record id="rule_custom_manager" model="ir.rule">
            <field name="name">Custom: Manager All</field>
            <field name="model_id" ref="model_custom_model"/>
            <field name="domain_force">[(1, '=', 1)]</field>
            <field name="groups" eval="[(4, ref('group_custom_manager'))]"/>
        </record>
    </data>
</odoo>
```

## Security Checklist

- [ ] `ir.model.access.csv` defined for all new models
- [ ] Record rules created for row-level security
- [ ] Sensitive fields protected with `groups` attribute
- [ ] Sudo usage documented with comments
- [ ] Business logic includes permission checks
- [ ] Minimum rights principle applied
- [ ] Groups hierarchy properly defined
