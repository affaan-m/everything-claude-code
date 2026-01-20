# Security Guidelines

## Mandatory Security Checks

Before ANY commit:

### Access Control (ACLs)
- [ ] Every new model has ACL entries in `ir.model.access.csv`
- [ ] ACLs follow least-privilege principle
- [ ] Read-only groups can't write/create/unlink

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_hr_certification_user,hr.certification.user,model_hr_certification,hr.group_hr_user,1,0,0,0
access_hr_certification_manager,hr.certification.manager,model_hr_certification,hr.group_hr_manager,1,1,1,1
```

### Record Rules
- [ ] Sensitive models have record rules for data isolation
- [ ] Multi-company models use company_id rule
- [ ] User-specific data uses create_uid/user_id rule

```xml
<!-- Company isolation rule -->
<record id="rule_certification_company" model="ir.rule">
    <field name="name">Certification Company Rule</field>
    <field name="model_id" ref="model_hr_certification"/>
    <field name="domain_force">[('company_id', 'in', company_ids)]</field>
</record>

<!-- User sees own records rule -->
<record id="rule_certification_user" model="ir.rule">
    <field name="name">Certification User Rule</field>
    <field name="model_id" ref="model_hr_certification"/>
    <field name="domain_force">[('create_uid', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>
```

### Sudo Documentation
- [ ] Every `sudo()` call is documented with justification
- [ ] Sudo usage is minimized
- [ ] Security implications are considered

```python
# BAD: Undocumented sudo
orders = self.env['sale.order'].sudo().search([])

# GOOD: Documented sudo with justification
# Sudo required: Cross-company order aggregation for management reporting
# Security note: Only aggregated totals returned, no sensitive data exposed
orders = self.env['sale.order'].sudo().search([])
total = sum(orders.mapped('amount_total'))
```

## SQL Injection Prevention

ALWAYS use parameterized queries:

```python
# CRITICAL VULNERABILITY: SQL injection possible
self.env.cr.execute(
    "SELECT * FROM res_partner WHERE name = '%s'" % user_input
)

# SECURE: Parameterized query
self.env.cr.execute(
    "SELECT * FROM res_partner WHERE name = %s",
    (user_input,)
)
```

## ORM Bypass Prevention

Avoid raw SQL when ORM can be used:

```python
# BAD: Bypasses ORM security
self.env.cr.execute("UPDATE res_partner SET active = false WHERE id = %s", (partner_id,))

# GOOD: Uses ORM (respects ACLs and record rules)
self.env['res.partner'].browse(partner_id).write({'active': False})
```

## Secret Management

```python
# NEVER: Hardcoded secrets
api_key = "sk-proj-xxxxx"

# ALWAYS: System parameters or config
api_key = self.env['ir.config_parameter'].sudo().get_param('integration.api_key')

if not api_key:
    raise UserError(_('API key not configured in System Parameters'))
```

## Input Validation

```python
from odoo import api, models
from odoo.exceptions import ValidationError
import re

class Partner(models.Model):
    _inherit = 'res.partner'

    @api.constrains('email')
    def _check_email(self):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        for partner in self:
            if partner.email and not re.match(email_pattern, partner.email):
                raise ValidationError(_("Invalid email format."))

    @api.constrains('vat')
    def _check_vat(self):
        for partner in self:
            if partner.vat and not partner._validate_vat():
                raise ValidationError(_("Invalid VAT number."))
```

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets (API keys, passwords)
5. Review entire codebase for similar issues
6. Check ACLs and record rules for affected models
7. Audit sudo usage in related code

## Security Checklist Summary

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated with constraints
- [ ] SQL injection prevention (parameterized queries)
- [ ] ACLs defined for all new models
- [ ] Record rules for data isolation
- [ ] Sudo usage documented and justified
- [ ] ORM used instead of raw SQL where possible
- [ ] Error messages don't leak sensitive data
- [ ] File uploads validated and sanitized
