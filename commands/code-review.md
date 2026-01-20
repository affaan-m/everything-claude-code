---
description: Comprehensive security and quality review of Odoo module changes. Checks ACLs, record rules, ORM patterns, and Python best practices.
---

# Code Review

Comprehensive security and quality review of uncommitted changes for Odoo modules:

1. Get changed files: `git diff --name-only HEAD`

2. For each changed file, check for:

**Security Issues (CRITICAL):**
- Missing ACLs (ir.model.access.csv) for new models
- Missing record rules for sensitive data
- Undocumented sudo() usage
- SQL injection (raw cr.execute with user input)
- Hardcoded credentials, API keys, tokens
- Missing input validation
- Insecure file handling

**Odoo-Specific Issues (HIGH):**
- Missing `_description` on models
- Missing `ondelete` on Many2one fields
- Bypassing ORM with direct SQL
- N+1 query patterns in loops
- Missing `super()` calls in overrides
- `_logger.info` instead of `_logger.debug` for debugging
- print() statements (use logging)

**Code Quality (HIGH):**
- Methods > 50 lines
- Files > 500 lines
- Nesting depth > 4 levels
- Missing error handling
- Missing type hints
- Missing docstrings for public methods
- TODO/FIXME comments

**Best Practices (MEDIUM):**
- Python naming conventions (snake_case)
- Import order (stdlib, third-party, odoo, local)
- Missing tests for new code
- Hardcoded strings (should use _())

3. Run linting checks:

```bash
# Run flake8
flake8 --max-line-length=120 models/ wizards/ controllers/

# Run pylint with Odoo plugin
pylint --load-plugins=pylint_odoo models/
```

4. Generate report with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line numbers
   - Issue description
   - Suggested fix

5. Block commit if CRITICAL or HIGH issues found

## Security Checklist

### ACL Validation
```python
# Every model must have access rules
# Check: security/ir.model.access.csv

# Required columns:
# id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
```

### Record Rules
```python
# Sensitive models need record rules
# Check: security/security.xml

# Common patterns:
# - User sees own records: [('create_uid', '=', user.id)]
# - Company isolation: [('company_id', 'in', company_ids)]
# - Department access: [('department_id', '=', user.department_id.id)]
```

### Sudo Documentation
```python
# Every sudo() call must be documented
# Bad:
orders = self.env['sale.order'].sudo().search([])

# Good:
# Sudo required: Need all orders for cross-user reporting
orders = self.env['sale.order'].sudo().search([])
```

### SQL Injection Prevention
```python
# CRITICAL: Never use string formatting with user input

# Bad - SQL injection possible:
self.env.cr.execute(f"SELECT * FROM table WHERE name = '{user_input}'")
self.env.cr.execute("SELECT * FROM table WHERE name = '%s'" % user_input)

# Good - Parameterized query:
self.env.cr.execute("SELECT * FROM table WHERE name = %s", (user_input,))
```

## ORM Anti-Patterns

### N+1 Queries
```python
# Bad - Query per iteration:
for order in orders:
    partner_name = order.partner_id.name

# Good - Prefetch:
orders = self.env['sale.order'].search([]).with_prefetch()
for order in orders:
    partner_name = order.partner_id.name
```

### Missing super()
```python
# Bad - Breaks inheritance chain:
def create(self, vals):
    return self.env['model'].create(vals)

# Good - Call super():
def create(self, vals):
    return super().create(vals)
```

## Example Report

```markdown
## Code Review: custom_module

### CRITICAL
1. **Missing ACL** for model `custom.model`
   - File: models/custom_model.py:15
   - Risk: All users have unrestricted access
   - Fix: Add entry to security/ir.model.access.csv

2. **SQL Injection** vulnerability
   - File: models/report.py:45
   - Code: `cr.execute(f"SELECT...{name}")`
   - Fix: Use parameterized query

### HIGH
1. **Missing _description** on model
   - File: models/custom_model.py:8
   - Fix: Add `_description = 'Custom Model'`

2. **Undocumented sudo()**
   - File: models/wizard.py:23
   - Fix: Add comment explaining why sudo is needed

### MEDIUM
1. **_logger.info for debugging**
   - File: models/custom_model.py:67
   - Fix: Change to `_logger.debug`

2. **Missing type hints**
   - File: models/custom_model.py:34
   - Fix: Add return type annotation
```

## Audit Commands

```bash
# Find models without ACLs
grep -r "_name = " --include="*.py" models/ | grep -v "_inherit"
# Compare with security/ir.model.access.csv

# Find undocumented sudo usage
grep -rn "\.sudo()" --include="*.py" . | grep -v "#"

# Find raw SQL
grep -rn "cr.execute" --include="*.py" .

# Find potential SQL injection
grep -rn "execute.*['\"].*%" --include="*.py" .
```

Never approve code with security vulnerabilities!
