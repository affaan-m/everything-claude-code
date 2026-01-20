---
description: Enforce test-driven development workflow for Odoo modules. Write tests FIRST using Two-Phase Testing methodology, then implement minimal code to pass.
---

# TDD Command

This command invokes the **tdd-guide** agent to enforce test-driven development methodology for Odoo modules.

## What This Command Does

1. **Define Model Structure** - Design models/fields first
2. **Write Phase 1 Tests** - Direct database tests with real data
3. **Write Phase 2 Tests** - ORM unit tests (TransactionCase)
4. **Implement Minimal Code** - Write just enough to pass (GREEN)
5. **Refactor** - Improve code while keeping tests green

## When to Use

Use `/tdd` when:
- Implementing new Odoo models or features
- Adding new methods or computed fields
- Fixing bugs (write test that reproduces bug first)
- Refactoring existing module code
- Building critical business logic

## How It Works

The tdd-guide agent will:

1. **Design model structure** with fields and relationships
2. **Write Phase 1 tests** using direct database verification
3. **Write Phase 2 tests** using TransactionCase
4. **Run tests** and verify they fail for the right reason
5. **Write minimal implementation** to make tests pass
6. **Run tests** and verify they pass
7. **Refactor** code while keeping tests green

## TDD Cycle

```
RED → GREEN → REFACTOR → REPEAT

RED:      Write a failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests passing
REPEAT:   Next feature/scenario
```

## Two-Phase Testing

### Phase 1: Direct Database Testing

```python
# .0temp/test_credit_limit.py
"""Phase 1: Verify database schema and business logic with real data."""
import sys
sys.path.append('/odoo')
import odoo

# Test with REAL database data
# Verify table columns exist
# Verify constraints work
# Verify computed fields calculate correctly
```

### Phase 2: ORM Unit Tests

```python
# module_name/tests/test_partner_credit.py
from odoo.tests import TransactionCase, tagged
from odoo.exceptions import ValidationError

@tagged('post_install', '-at_install')
class TestPartnerCredit(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner = cls.env['res.partner'].create({
            'name': 'Test Partner',
            'credit_limit': 1000.0,
        })

    def test_credit_limit_calculation(self):
        """Credit limit should be applied correctly."""
        available_credit = self.partner.calculate_available_credit()
        self.assertEqual(available_credit, 1000.0)

    def test_credit_with_debt(self):
        """Available credit should decrease with outstanding debt."""
        self.partner.write({'total_due': 300.0})
        available_credit = self.partner.calculate_available_credit()
        self.assertEqual(available_credit, 700.0)

    def test_negative_credit_raises_error(self):
        """Negative credit limit should raise ValidationError."""
        with self.assertRaises(ValidationError):
            self.partner.write({'credit_limit': -100.0})
```

## Example Usage

```
User: /tdd I need a method to calculate available credit for partners

Agent (tdd-guide):
# TDD Session: Partner Available Credit Calculator

## Step 1: Design Interface

```python
# models/res_partner.py
from odoo import api, fields, models
from odoo.exceptions import ValidationError

class ResPartner(models.Model):
    _inherit = 'res.partner'

    credit_limit = fields.Float(string="Credit Limit")
    total_due = fields.Float(string="Total Due")
    available_credit = fields.Float(
        compute='_compute_available_credit',
        string="Available Credit"
    )

    @api.depends('credit_limit', 'total_due')
    def _compute_available_credit(self) -> None:
        """Calculate available credit for partner."""
        raise NotImplementedError("TODO: Implement")
```

## Step 2: Write Failing Tests (RED)

```python
# tests/test_partner_credit.py
from odoo.tests import TransactionCase, tagged
from odoo.exceptions import ValidationError

@tagged('post_install', '-at_install')
class TestPartnerCredit(TransactionCase):

    def _create_partner(self, **kwargs):
        """Factory for creating test partners."""
        values = {
            'name': 'Test Partner',
            'credit_limit': 1000.0,
            'total_due': 0.0,
        }
        values.update(kwargs)
        return self.env['res.partner'].create(values)

    def test_available_credit_full_limit(self):
        """Partner with no debt should have full credit available."""
        partner = self._create_partner(credit_limit=1000.0)
        self.assertEqual(partner.available_credit, 1000.0)

    def test_available_credit_with_debt(self):
        """Available credit should decrease with outstanding debt."""
        partner = self._create_partner(credit_limit=1000.0, total_due=300.0)
        self.assertEqual(partner.available_credit, 700.0)

    def test_available_credit_zero_when_exceeded(self):
        """Available credit should be zero when debt exceeds limit."""
        partner = self._create_partner(credit_limit=1000.0, total_due=1500.0)
        self.assertEqual(partner.available_credit, 0.0)
```

## Step 3: Run Tests - Verify FAIL

```bash
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    custom_module.tests.test_partner_credit

FAIL: test_available_credit_full_limit
  NotImplementedError: TODO: Implement

1 test failed
```

✅ Tests fail as expected. Ready to implement.

## Step 4: Implement Minimal Code (GREEN)

```python
# models/res_partner.py
@api.depends('credit_limit', 'total_due')
def _compute_available_credit(self) -> None:
    """Calculate available credit for partner."""
    for partner in self:
        available = partner.credit_limit - (partner.total_due or 0.0)
        partner.available_credit = max(0.0, available)
```

## Step 5: Run Tests - Verify PASS

```bash
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    custom_module.tests.test_partner_credit

PASS: test_available_credit_full_limit
PASS: test_available_credit_with_debt
PASS: test_available_credit_zero_when_exceeded

3 tests passed
```

✅ All tests passing!

## Step 6: Refactor (IMPROVE)

```python
# models/res_partner.py
MINIMUM_CREDIT_BUFFER = 50.0

@api.depends('credit_limit', 'total_due')
def _compute_available_credit(self) -> None:
    """Calculate available credit for partner.

    Returns the available credit limit minus outstanding debt,
    with a minimum buffer for safety.
    """
    for partner in self:
        outstanding = partner.total_due or 0.0
        available = partner.credit_limit - outstanding - MINIMUM_CREDIT_BUFFER
        partner.available_credit = max(0.0, available)
```

✅ TDD session complete!
```

## Running Tests

### Phase 1: Direct Database Testing
```bash
# Copy test script and run
docker cp .0temp/test_implementation.py $ODOO_CONTAINER:/tmp/
docker exec $ODOO_CONTAINER python3 /tmp/test_implementation.py
```

### Phase 2: Odoo Standard Tests
```bash
# Run specific test
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    module_name.tests.test_file

# Run all module tests
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    module_name.tests
```

## TDD Best Practices

**DO:**
- ✅ Write the test FIRST, before any implementation
- ✅ Run tests and verify they FAIL before implementing
- ✅ Write minimal code to make tests pass
- ✅ Refactor only after tests are green
- ✅ Use TransactionCase for automatic rollback
- ✅ Create test data factories for reusability
- ✅ Test business behavior, not implementation

**DON'T:**
- ❌ Write implementation before tests
- ❌ Skip running tests after each change
- ❌ Use raw SQL in tests (use ORM)
- ❌ Test private methods directly
- ❌ Ignore Phase 1 testing
- ❌ Mock everything (prefer integration tests)

## Test Types

**Phase 1 - Direct Database:**
- Schema verification
- Constraint validation
- Real data scenarios
- Edge case discovery

**Phase 2 - ORM Unit Tests:**
- CRUD operations
- Computed fields
- Workflow transitions
- Constraint validations
- Access rights

## Integration with Other Commands

- Use `/plan` first to understand what to build
- Use `/tdd` to implement with tests
- Use `/code-review` to review implementation
- Use `/test-coverage` to verify coverage

## Related Agents

This command invokes the `tdd-guide` agent located at:
`~/.claude/agents/tdd-guide.md`

And references the `tdd-workflow` skill at:
`~/.claude/skills/tdd-workflow/`
