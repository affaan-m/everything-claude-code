# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Phase 1: Direct Database Tests** - Verify database state with real data
2. **Phase 2: ORM Unit Tests** - Business logic with TransactionCase
3. **E2E Tests** - Critical user flows (Playwright)

## Two-Phase Test-Driven Development

MANDATORY workflow:

### Phase 1: Direct Database Verification
```python
# First, verify expected database state
def test_phase1_database_verification(self):
    """Phase 1: Verify real database state."""
    self.env.cr.execute("""
        SELECT COUNT(*) FROM hr_employee
        WHERE department_id IS NOT NULL
    """)
    count = self.env.cr.fetchone()[0]
    self.assertGreater(count, 0, "Employees should have departments")
```

### Phase 2: ORM Unit Tests
```python
from odoo.tests import TransactionCase, tagged
from odoo.exceptions import UserError, ValidationError

@tagged('post_install', '-at_install')
class TestSaleOrder(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner = cls.env['res.partner'].create({
            'name': 'Test Partner',
        })
        cls.product = cls.env['product.product'].create({
            'name': 'Test Product',
            'list_price': 100.0,
        })

    def test_create_order(self):
        """Test order creation with valid data."""
        order = self.env['sale.order'].create({
            'partner_id': self.partner.id,
        })
        self.assertEqual(order.state, 'draft')

    def test_confirm_order_without_lines_raises_error(self):
        """Confirm without lines should raise UserError."""
        order = self.env['sale.order'].create({
            'partner_id': self.partner.id,
        })
        with self.assertRaises(UserError):
            order.action_confirm()
```

## TDD Workflow

1. Write test first (RED)
2. Run test - it should FAIL:
   ```bash
   docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader MODULE_NAME.tests
   ```
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+):
   ```bash
   docker exec $ODOO_CONTAINER coverage run \
       --source=/mnt/extra-addons/MODULE_NAME \
       -m odoo.tests.loader MODULE_NAME.tests
   docker exec $ODOO_CONTAINER coverage report
   ```

## Test Data Factories

Use factory pattern for reusable test data:

```python
class TestDataFactory:
    """Factory for creating test data."""

    @classmethod
    def create_partner(cls, env, **kwargs):
        defaults = {
            'name': 'Test Partner',
            'email': 'test@example.com',
        }
        defaults.update(kwargs)
        return env['res.partner'].create(defaults)

    @classmethod
    def create_sale_order(cls, env, partner=None, **kwargs):
        if not partner:
            partner = cls.create_partner(env)
        defaults = {
            'partner_id': partner.id,
        }
        defaults.update(kwargs)
        return env['sale.order'].create(defaults)
```

## Troubleshooting Test Failures

1. Use **tdd-guide** agent
2. Check test isolation (each test should be independent)
3. Verify test data setup in setUpClass
4. Check for missing dependencies in __manifest__.py
5. Fix implementation, not tests (unless tests are wrong)

## Coverage Focus Areas

**Critical (100% coverage required):**
- `_compute_*` methods
- `_check_*` constraint methods
- Business logic methods

**High Priority (90%+ coverage):**
- `create()`/`write()` overrides
- Workflow action methods
- Cron job methods

**Standard (80%+ coverage):**
- Helper methods
- Utility functions

## Agent Support

- **tdd-guide** - Use PROACTIVELY for new features, enforces write-tests-first
- **e2e-runner** - Playwright E2E testing with Odoo-specific selectors
