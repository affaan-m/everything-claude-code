---
name: security-review
description: Use this skill when implementing authentication, access control, handling sensitive data, creating models with user data, or implementing security-sensitive features in Odoo. Provides ACL validation, record rule checklists, and sudo guidelines.
---

# Odoo Security Review Skill

This skill ensures all Odoo module code follows security best practices and identifies potential vulnerabilities.

## When to Activate

- Creating new models with sensitive data
- Implementing access control (ACLs, record rules)
- Using sudo() for privilege escalation
- Writing raw SQL queries
- Creating HTTP controllers/endpoints
- Handling user input or file uploads
- Working with authentication or authorization

## Security Checklist

### 1. Access Control Lists (ACLs)

#### ir.model.access.csv Validation

```csv
# Required format
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
```

**Checklist:**
- [ ] Every model has ACL entry
- [ ] Model ID format: `model_<model_name_with_underscores>`
- [ ] Group references are valid
- [ ] Permissions follow principle of least privilege
- [ ] Unlink permission justified and limited

```csv
# GOOD - Proper ACL structure
access_custom_model_user,custom.model.user,model_custom_model,base.group_user,1,1,1,0
access_custom_model_manager,custom.model.manager,model_custom_model,module.group_manager,1,1,1,1

# BAD - Missing group (gives access to everyone!)
access_custom_model_all,custom.model.all,model_custom_model,,1,1,1,1
```

#### ACL Audit Commands

```bash
# Find models without ACLs
# 1. List all models in Python files
grep -r "_name = " --include="*.py" models/ | grep -v "_inherit"

# 2. Check ACL file for coverage
cat security/ir.model.access.csv

# Compare the two lists
```

### 2. Record Rules

#### Domain Validation

```xml
<!-- User sees own records only -->
<record id="rule_model_user_own" model="ir.rule">
    <field name="name">Model: User sees own records</field>
    <field name="model_id" ref="model_custom_model"/>
    <field name="domain_force">[('create_uid', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>

<!-- Company-based isolation (multi-company) -->
<record id="rule_model_company" model="ir.rule">
    <field name="name">Model: Company isolation</field>
    <field name="model_id" ref="model_custom_model"/>
    <field name="domain_force">[('company_id', 'in', company_ids)]</field>
</record>

<!-- Department-based access -->
<record id="rule_model_department" model="ir.rule">
    <field name="name">Model: Department access</field>
    <field name="model_id" ref="model_custom_model"/>
    <field name="domain_force">[('department_id', '=', user.employee_id.department_id.id)]</field>
</record>
```

**Record Rule Checklist:**
- [ ] Sensitive models have record rules
- [ ] Multi-company models have company_id rules
- [ ] Personal data has user-based restrictions
- [ ] Manager roles have appropriate escalated access
- [ ] Rules don't conflict or create access gaps

### 3. Sudo Usage Documentation

#### EVERY sudo() call MUST have documentation

```python
# Pattern 1: Comment block explaining why
# Sudo required: Creating system log entry that users shouldn't be able to
# modify directly. No user data is exposed, only audit trail created.
self.env['audit.log'].sudo().create({
    'action': 'user_login',
    'user_id': self.env.user.id,
})

# Pattern 2: Docstring in method
def _create_system_record(self):
    """Create system record with elevated privileges.

    Sudo Justification:
        - Purpose: System needs to create config regardless of user permissions
        - Data accessed: Only system configuration, no user data
        - Risk mitigation: Values are hardcoded, no user input processed
    """
    self.env['ir.config_parameter'].sudo().set_param('key', 'value')
```

**Sudo Audit Checklist:**
- [ ] Every sudo() has documentation
- [ ] Justification explains WHY sudo is needed
- [ ] Data scope is clearly defined
- [ ] User input is NOT passed through sudo operations
- [ ] Consider if sudo can be avoided with proper ACLs

#### Find Sudo Usage

```bash
# Find all sudo() calls
grep -rn "\.sudo()" --include="*.py" .

# Find sudo without comment on previous line
grep -B1 "\.sudo()" --include="*.py" . | grep -v "#"
```

### 4. SQL Injection Prevention

#### Critical: Raw SQL Detection

```python
# CRITICAL VULNERABILITY - Direct string formatting
# BAD - SQL injection possible
self.env.cr.execute(f"SELECT * FROM table WHERE id = {user_input}")
self.env.cr.execute("SELECT * FROM table WHERE name = '%s'" % user_input)
self.env.cr.execute("SELECT * FROM table WHERE name = '" + user_input + "'")

# SECURE - Parameterized queries
self.env.cr.execute("SELECT * FROM table WHERE id = %s", (user_input,))
self.env.cr.execute(
    "SELECT * FROM table WHERE name = %s AND active = %s",
    (user_input, True)
)
```

#### When Raw SQL is Acceptable

```python
# Document why ORM cannot be used
"""
Raw SQL Justification:
- Purpose: Complex reporting query with window functions
- ORM limitation: Cannot express PARTITION BY in ORM
- Security: All parameters are validated integers from system
"""
self.env.cr.execute("""
    SELECT
        id,
        SUM(amount) OVER (PARTITION BY partner_id ORDER BY date) as running_total
    FROM account_move_line
    WHERE partner_id = %s
""", (partner_id,))  # partner_id is validated integer
```

#### SQL Audit Commands

```bash
# Find raw SQL usage
grep -rn "cr.execute\|env.cr.execute" --include="*.py" .

# Find string formatting near execute
grep -rn "execute.*['\"].*%\|execute.*f['\"]" --include="*.py" .

# Find potential SQL in string concatenation
grep -rn "SELECT.*+\|INSERT.*+\|UPDATE.*+\|DELETE.*+" --include="*.py" .
```

### 5. Sensitive Field Protection

```python
class SensitiveModel(models.Model):
    _name = 'sensitive.model'
    _description = 'Sensitive Model'

    # Sensitive fields should have restricted access via groups
    ssn = fields.Char(
        string="SSN",
        groups="hr.group_hr_manager",  # Restrict to specific group
    )

    salary = fields.Monetary(
        string="Salary",
        groups="hr.group_hr_manager",
    )

    # Password fields should use Odoo's built-in mechanisms
    # NEVER store plaintext passwords
```

**Verification Steps:**
- [ ] Sensitive fields have group restrictions
- [ ] No passwords stored in plaintext
- [ ] Personal data properly protected
- [ ] Financial data access controlled

### 6. Controller Security

```python
from odoo import http
from odoo.http import request

class CustomController(http.Controller):

    # Public route - CSRF exemption must be justified
    @http.route('/api/public', type='json', auth='public', csrf=False)
    def public_endpoint(self):
        """
        CSRF disabled: Public API endpoint, read-only data.
        No state modification, returns only public information.
        """
        return {'status': 'ok'}

    # Authenticated route - Keep CSRF protection
    @http.route('/api/private', type='json', auth='user')
    def private_endpoint(self):
        # CSRF token automatically validated
        return {'user': request.env.user.name}

    # Never expose internal data without validation
    @http.route('/api/data/<int:record_id>', type='json', auth='user')
    def get_data(self, record_id):
        # ALWAYS validate access rights
        record = request.env['model.name'].browse(record_id)
        if not record.exists():
            return {'error': 'Not found'}
        # Access rights checked automatically by ORM
        return {'data': record.name}
```

**Controller Checklist:**
- [ ] CSRF protection enabled (unless justified)
- [ ] Authentication required for sensitive endpoints
- [ ] Input validation on all parameters
- [ ] Access rights checked before returning data

### 7. Logging Security Events

```python
import logging
_logger = logging.getLogger(__name__)

# Log security-relevant events
def action_approve(self):
    _logger.info(
        "Security Event: Record %s approved by user %s",
        self.id,
        self.env.user.id
    )
    # ... approval logic

# NEVER log sensitive data
# BAD
_logger.info("User login with password: %s", password)

# GOOD
_logger.info("User login attempt for: %s", username)
```

### 8. Input Validation

```python
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
import re

class SecureModel(models.Model):
    _name = 'secure.model'
    _description = 'Secure Model'

    email = fields.Char()
    phone = fields.Char()

    @api.constrains('email')
    def _check_email(self):
        for record in self:
            if record.email:
                if not re.match(r'^[^@]+@[^@]+\.[^@]+$', record.email):
                    raise ValidationError(_("Invalid email format"))

    @api.constrains('phone')
    def _check_phone(self):
        for record in self:
            if record.phone:
                # Remove non-digit characters and validate
                digits = re.sub(r'\D', '', record.phone)
                if len(digits) < 7 or len(digits) > 15:
                    raise ValidationError(_("Invalid phone number"))
```

## Security Review Output Format

```markdown
## Security Review: [Module Name]

### Critical Vulnerabilities (P0 - Immediate Fix Required)
1. **SQL Injection** at `file.py:123`
   - Risk: Data breach, unauthorized access
   - Code: `cr.execute(f"SELECT...{user_input}")`
   - Fix: Use parameterized query

### High Priority (P1 - Fix Before Deploy)
1. **Missing ACL** for model `custom.model`
   - Risk: Unauthorized data access
   - Fix: Add ir.model.access.csv entry

### Medium Priority (P2 - Fix Soon)
1. **Undocumented Sudo** at `file.py:45`
   - Risk: Unclear privilege escalation
   - Fix: Add sudo justification comment

### Low Priority (P3 - Address in Backlog)
1. **Overly permissive ACL** for model `report.model`
   - Current: All users can delete
   - Recommended: Restrict delete to managers

### Security Audit Summary
- [ ] All models have ACLs
- [ ] Sensitive models have record rules
- [ ] All sudo() calls documented
- [ ] No SQL injection vulnerabilities
- [ ] No hardcoded credentials
- [ ] Sensitive fields have group restrictions
```

## Quick Security Audit Commands

```bash
echo "=== Security Audit ==="

echo "\n1. Models without ACLs:"
# Compare model definitions to ACL file

echo "\n2. Raw SQL usage:"
grep -rn "cr.execute" --include="*.py" .

echo "\n3. Sudo usage:"
grep -rn "\.sudo()" --include="*.py" .

echo "\n4. Potential hardcoded secrets:"
grep -rn "password\|api_key\|secret\|token" --include="*.py" . | grep -v "def\|#\|field"

echo "\n5. CSRF disabled routes:"
grep -rn "csrf=False" --include="*.py" .
```

## Pre-Deployment Security Checklist

Before ANY production deployment:

- [ ] **ACLs**: Every model has access control entries
- [ ] **Record Rules**: Sensitive models have data isolation rules
- [ ] **Sudo Usage**: All sudo() calls documented and justified
- [ ] **SQL Injection**: No raw SQL with user input
- [ ] **Input Validation**: All user inputs validated
- [ ] **Sensitive Fields**: Groups restrictions on personal/financial data
- [ ] **Controllers**: CSRF protection enabled, auth required
- [ ] **Logging**: Security events logged, no sensitive data in logs
- [ ] **Secrets**: No hardcoded passwords, API keys, or tokens
- [ ] **Multi-Company**: Company isolation rules in place

---

**Remember**: Security is not optional. One vulnerability can expose entire datasets. When in doubt, be more restrictive - permissions can always be expanded, but breaches cannot be undone.
