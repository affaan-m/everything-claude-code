---
description: Analyze test coverage for Odoo modules and generate missing tests using coverage.py.
---

# Test Coverage

Analyze test coverage and generate missing tests for Odoo modules:

1. Run tests with coverage:

```bash
# Install coverage
pip install coverage

# Run Odoo tests with coverage
docker exec $ODOO_CONTAINER coverage run \
    --source=/mnt/extra-addons/module_name \
    -m odoo.tests.loader module_name.tests

# Generate report
docker exec $ODOO_CONTAINER coverage report
docker exec $ODOO_CONTAINER coverage html -d /mnt/extra-addons/module_name/htmlcov
```

2. Analyze coverage report

3. Identify files below 80% coverage threshold

4. For each under-covered file:
   - Analyze untested code paths
   - Generate Phase 1 direct database tests
   - Generate Phase 2 ORM unit tests
   - Generate security access tests

5. Verify new tests pass

6. Show before/after coverage metrics

7. Ensure module reaches 80%+ overall coverage

## Coverage Commands

```bash
# Run with coverage in Docker
docker exec $ODOO_CONTAINER coverage run \
    --source=/mnt/extra-addons/module_name \
    -m odoo.tests.loader module_name.tests

# Generate terminal report
docker exec $ODOO_CONTAINER coverage report

# Generate HTML report
docker exec $ODOO_CONTAINER coverage html

# Generate XML report for CI
docker exec $ODOO_CONTAINER coverage xml
```

## Odoo-Specific Coverage

### Focus Areas

**Critical (100% coverage required):**
- Computed fields (`_compute_*` methods)
- Constraint methods (`_check_*` methods)
- Business logic methods
- Security-related methods

**High Priority (90%+ coverage):**
- Create/write overrides
- Workflow action methods
- Cron job methods

**Standard (80%+ coverage):**
- Helper methods
- Utility functions
- Report methods

### Common Untested Patterns

```python
# 1. Error handling branches
def action_confirm(self):
    if not self.line_ids:
        raise UserError("No lines")  # Often untested
    # ...

# 2. Conditional logic
def _compute_state(self):
    for record in self:
        if record.date < today:
            record.state = 'expired'  # Edge case
        elif record.date == today:
            record.state = 'today'    # Edge case
        else:
            record.state = 'future'   # Happy path

# 3. Access rights checks
def action_approve(self):
    if not self.env.user.has_group('module.group_manager'):
        raise AccessError("...")  # Needs security test
```

## Test Generation Patterns

### Phase 2 ORM Tests

```python
from odoo.tests import TransactionCase, tagged
from odoo.exceptions import UserError, ValidationError

@tagged('post_install', '-at_install')
class TestModelCoverage(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_record = cls.env['model.name'].create({
            'name': 'Test Record',
        })

    # Happy path tests
    def test_confirm_with_lines(self):
        """Confirm action should work with lines."""
        self.test_record.line_ids = [(0, 0, {'name': 'Line'})]
        self.test_record.action_confirm()
        self.assertEqual(self.test_record.state, 'confirmed')

    # Error handling tests
    def test_confirm_without_lines_raises_error(self):
        """Confirm without lines should raise UserError."""
        with self.assertRaises(UserError):
            self.test_record.action_confirm()

    # Edge case tests
    def test_compute_state_expired(self):
        """State should be expired for past dates."""
        self.test_record.write({'date': '2020-01-01'})
        self.assertEqual(self.test_record.state, 'expired')

    # Boundary tests
    def test_compute_state_today(self):
        """State should be 'today' for current date."""
        from odoo import fields
        self.test_record.write({'date': fields.Date.today()})
        self.assertEqual(self.test_record.state, 'today')
```

### Security Tests

```python
@tagged('post_install', '-at_install')
class TestModelSecurity(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = cls.env['res.users'].create({
            'name': 'Test User',
            'login': 'test_user@example.com',
        })
        cls.manager = cls.env['res.users'].create({
            'name': 'Test Manager',
            'login': 'test_manager@example.com',
            'groups_id': [(4, cls.env.ref('module.group_manager').id)],
        })

    def test_user_cannot_approve(self):
        """Regular user should not be able to approve."""
        record = self.env['model.name'].create({'name': 'Test'})
        with self.assertRaises(AccessError):
            record.with_user(self.user).action_approve()

    def test_manager_can_approve(self):
        """Manager should be able to approve."""
        record = self.env['model.name'].create({'name': 'Test'})
        record.with_user(self.manager).action_approve()
        self.assertEqual(record.state, 'approved')
```

## Coverage Report Format

```
╔══════════════════════════════════════════════════════════════╗
║              Test Coverage Report: module_name               ║
╠══════════════════════════════════════════════════════════════╣
║ Overall Coverage: 85% (Target: 80%)                          ║
╠══════════════════════════════════════════════════════════════╣
║ File                          │ Stmts │ Miss │ Cover │       ║
║───────────────────────────────│───────│──────│───────│───────║
║ models/sale_order.py          │   120 │   12 │   90% │ ✅    ║
║ models/partner.py             │    45 │    3 │   93% │ ✅    ║
║ models/report.py              │    67 │   20 │   70% │ ⚠️    ║
║ wizards/import_wizard.py      │    34 │   15 │   56% │ ❌    ║
╚══════════════════════════════════════════════════════════════╝

Files Below Threshold:
- models/report.py (70%): Missing tests for export methods
- wizards/import_wizard.py (56%): Missing error handling tests

Recommended Actions:
1. Add tests for report.py export_xlsx() method
2. Add error handling tests for import_wizard.py
3. Add edge case tests for date boundary conditions
```

## Integration with Other Commands

- Use `/tdd` to implement new tests
- Use `/code-review` to review test quality
- Use `/refactor-clean` after improving coverage

## CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: |
    docker exec $ODOO_CONTAINER coverage run \
      --source=/mnt/extra-addons/module_name \
      -m odoo.tests.loader module_name.tests

- name: Check coverage threshold
  run: |
    docker exec $ODOO_CONTAINER coverage report --fail-under=80

- name: Upload coverage
  uses: codecov/codecov-action@v3
```
