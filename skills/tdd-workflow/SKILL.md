---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring Odoo modules. Enforces Two-Phase Testing methodology with direct database verification (Phase 1) and ORM unit tests (Phase 2).
---

# Odoo Two-Phase Testing Workflow

This skill ensures all Odoo module development follows the Two-Phase Testing methodology for comprehensive test coverage.

## When to Activate

- Writing new models or features
- Fixing bugs or issues
- Refactoring existing code
- Adding fields or methods
- Creating wizards or reports

## Core Principles

### 1. Two-Phase Testing is Mandatory

Every feature must have both:
- **Phase 1**: Direct database tests (verify schema)
- **Phase 2**: ORM unit tests (verify business logic)

### 2. Tests BEFORE Code

ALWAYS write tests first, then implement code to make tests pass.

### 3. Test Structure

All tests inherit from `TransactionCase` for automatic rollback.

## Two-Phase Testing Methodology

### Phase 1: Direct Database Tests

**Purpose**: Verify database schema is correct before testing business logic.

```python
from odoo.tests.common import TransactionCase

class TestPhase1DirectDB(TransactionCase):
    """Phase 1: Direct database verification.

    These tests verify the database schema is correctly created
    before testing business logic through the ORM.
    """

    def test_01_table_exists(self):
        """Verify main table was created."""
        self.env.cr.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'custom_model'
            )
        """)
        exists = self.env.cr.fetchone()[0]
        self.assertTrue(exists, "Table custom_model should exist")

    def test_02_required_columns_exist(self):
        """Verify all required columns exist with correct types."""
        self.env.cr.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'custom_model'
            ORDER BY ordinal_position
        """)
        columns = {r[0]: {'type': r[1], 'nullable': r[2]} for r in self.env.cr.fetchall()}

        # Check required columns
        self.assertIn('id', columns)
        self.assertIn('name', columns)
        self.assertIn('state', columns)
        self.assertIn('create_uid', columns)
        self.assertIn('write_uid', columns)

    def test_03_foreign_keys_exist(self):
        """Verify foreign key constraints."""
        self.env.cr.execute("""
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'custom_model'
            AND tc.constraint_type = 'FOREIGN KEY'
        """)
        fks = {r[1]: r[2] for r in self.env.cr.fetchall()}

        self.assertIn('partner_id', fks)
        self.assertEqual(fks['partner_id'], 'res_partner')

    def test_04_indexes_exist(self):
        """Verify expected indexes exist for performance."""
        self.env.cr.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'custom_model'
        """)
        indexes = [r[0] for r in self.env.cr.fetchall()]

        # Check for index on frequently searched fields
        # Odoo creates indexes named: <table>_<column>_index
        self.assertTrue(
            any('name' in idx for idx in indexes),
            "Index on name column should exist"
        )

    def test_05_sql_constraints_work(self):
        """Verify SQL constraints are enforced."""
        from psycopg2 import IntegrityError

        with self.assertRaises(IntegrityError):
            self.env.cr.execute("""
                INSERT INTO custom_model (name, state, create_uid, write_uid, create_date, write_date)
                VALUES (NULL, 'draft', 1, 1, NOW(), NOW())
            """)
```

### Phase 2: ORM Unit Tests

**Purpose**: Test business logic through Odoo's ORM layer.

```python
from odoo.tests.common import TransactionCase
from odoo.exceptions import UserError, ValidationError

class TestPhase2ORM(TransactionCase):
    """Phase 2: ORM-level unit tests.

    These tests verify business logic works correctly
    through the Odoo ORM layer.
    """

    def setUp(self):
        super().setUp()
        # Create test fixtures
        self.partner = self.env['res.partner'].create({
            'name': 'Test Partner'
        })
        self.user = self.env['res.users'].create({
            'name': 'Test User',
            'login': 'test_user@example.com',
        })

    # === CRUD Tests ===

    def test_create_with_defaults(self):
        """Test record creation with default values."""
        record = self.env['custom.model'].create({
            'name': 'Test Record'
        })

        self.assertTrue(record.id)
        self.assertEqual(record.name, 'Test Record')
        self.assertEqual(record.state, 'draft')

    def test_create_with_all_fields(self):
        """Test record creation with all fields."""
        record = self.env['custom.model'].create({
            'name': 'Full Record',
            'partner_id': self.partner.id,
            'state': 'draft',
        })

        self.assertEqual(record.partner_id, self.partner)

    def test_read_record(self):
        """Test reading record fields."""
        record = self.env['custom.model'].create({'name': 'Read Test'})
        data = record.read(['name', 'state'])[0]

        self.assertEqual(data['name'], 'Read Test')
        self.assertEqual(data['state'], 'draft')

    def test_write_record(self):
        """Test updating record."""
        record = self.env['custom.model'].create({'name': 'Original'})
        record.write({'name': 'Updated'})

        self.assertEqual(record.name, 'Updated')

    def test_unlink_draft_record(self):
        """Test deleting draft record."""
        record = self.env['custom.model'].create({'name': 'To Delete'})
        record_id = record.id
        record.unlink()

        self.assertFalse(self.env['custom.model'].browse(record_id).exists())

    def test_unlink_non_draft_raises_error(self):
        """Test that non-draft records cannot be deleted."""
        record = self.env['custom.model'].create({'name': 'Protected'})
        record.action_confirm()

        with self.assertRaises(UserError):
            record.unlink()

    # === Workflow Tests ===

    def test_workflow_draft_to_confirmed(self):
        """Test confirmation workflow."""
        record = self.env['custom.model'].create({'name': 'Workflow Test'})
        self.assertEqual(record.state, 'draft')

        record.action_confirm()

        self.assertEqual(record.state, 'confirmed')

    def test_workflow_confirmed_to_done(self):
        """Test completion workflow."""
        record = self.env['custom.model'].create({'name': 'Complete Test'})
        record.action_confirm()
        record.action_done()

        self.assertEqual(record.state, 'done')

    def test_workflow_invalid_transition_raises_error(self):
        """Test invalid workflow transition raises error."""
        record = self.env['custom.model'].create({'name': 'Invalid Test'})

        with self.assertRaises(UserError):
            record.action_done()  # Cannot go from draft to done directly

    # === Computed Field Tests ===

    def test_computed_total_empty_lines(self):
        """Test computed total with no lines."""
        record = self.env['custom.model'].create({'name': 'Empty'})

        self.assertEqual(record.total, 0)

    def test_computed_total_with_lines(self):
        """Test computed total calculation."""
        record = self.env['custom.model'].create({'name': 'With Lines'})
        self.env['custom.model.line'].create([
            {'parent_id': record.id, 'amount': 100.0},
            {'parent_id': record.id, 'amount': 250.0},
            {'parent_id': record.id, 'amount': 50.0},
        ])

        self.assertEqual(record.total, 400.0)

    # === Constraint Tests ===

    def test_constraint_name_required(self):
        """Test that name is required."""
        with self.assertRaises(Exception):
            self.env['custom.model'].create({})

    def test_constraint_dates_validation(self):
        """Test date validation constraint."""
        with self.assertRaises(ValidationError):
            self.env['custom.model'].create({
                'name': 'Date Test',
                'date_start': '2024-12-31',
                'date_end': '2024-01-01',  # End before start
            })

    # === Access Rights Tests ===

    def test_user_can_create(self):
        """Test user can create records."""
        record = self.env['custom.model'].with_user(self.user).create({
            'name': 'User Created'
        })
        self.assertTrue(record.id)

    def test_user_cannot_delete_others_record(self):
        """Test user cannot delete another user's record."""
        admin = self.env.ref('base.user_admin')
        record = self.env['custom.model'].with_user(admin).create({
            'name': 'Admin Record'
        })

        # User should not be able to delete admin's record
        # (depends on record rules configuration)
```

## Test File Organization

```
module_name/
└── tests/
    ├── __init__.py
    ├── test_phase1_db.py          # Phase 1: Direct DB tests
    ├── test_phase2_orm.py         # Phase 2: ORM tests
    ├── test_phase2_workflow.py    # Phase 2: Workflow tests
    └── common.py                  # Shared fixtures and utilities
```

### Common Test Fixtures

```python
# tests/common.py
from odoo.tests.common import TransactionCase

class CustomModelTestCase(TransactionCase):
    """Base test case with common fixtures."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Create shared test data
        cls.partner = cls.env['res.partner'].create({
            'name': 'Test Partner',
            'email': 'test@example.com',
        })
        cls.product = cls.env['product.product'].create({
            'name': 'Test Product',
        })

    def create_test_record(self, **kwargs):
        """Helper to create test records with defaults."""
        defaults = {
            'name': 'Test Record',
            'partner_id': self.partner.id,
        }
        defaults.update(kwargs)
        return self.env['custom.model'].create(defaults)
```

## Running Tests

### Docker Commands

```bash
# Run all tests for module
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/ -v

# Run only Phase 1 tests
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/test_phase1_db.py -v

# Run only Phase 2 tests
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/test_phase2_orm.py -v

# Run specific test method
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/test_phase2_orm.py::TestPhase2ORM::test_workflow_confirm -v

# Run with coverage
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/ \
    --cov=/mnt/extra-addons/module_name \
    --cov-report=html
```

### Odoo Test Runner

```bash
# Install module with tests
docker exec $ODOO_CONTAINER python3 /usr/bin/odoo \
    -c /etc/odoo/odoo.conf \
    -d $ODOO_DB \
    --test-enable \
    --stop-after-init \
    -i module_name

# Update module with tests
docker exec $ODOO_CONTAINER python3 /usr/bin/odoo \
    -c /etc/odoo/odoo.conf \
    -d $ODOO_DB \
    --test-enable \
    --stop-after-init \
    -u module_name
```

## TDD Workflow Steps

### Step 1: Write User Story
```
As a [role], I want to [action], so that [benefit]

Example:
As a manager, I want to approve pending orders,
so that they can be processed for fulfillment.
```

### Step 2: Write Phase 1 Tests
```python
# Verify database schema supports the feature
def test_approval_columns_exist(self):
    self.env.cr.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'custom_model'
    """)
    columns = [r[0] for r in self.env.cr.fetchall()]
    self.assertIn('approved_by', columns)
    self.assertIn('approved_date', columns)
```

### Step 3: Write Phase 2 Tests
```python
# Verify business logic works
def test_approval_workflow(self):
    record = self.create_test_record()
    record.action_approve()
    self.assertEqual(record.state, 'approved')
    self.assertEqual(record.approved_by, self.env.user)
```

### Step 4: Run Tests (They Should Fail)
```bash
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/ -v
# Tests should fail - we haven't implemented yet
```

### Step 5: Implement Code
```python
# Add fields and methods to make tests pass
approved_by = fields.Many2one('res.users', readonly=True)
approved_date = fields.Datetime(readonly=True)

def action_approve(self):
    self.write({
        'state': 'approved',
        'approved_by': self.env.user.id,
        'approved_date': fields.Datetime.now(),
    })
```

### Step 6: Run Tests Again
```bash
docker exec $ODOO_CONTAINER python3 -m pytest \
    /mnt/extra-addons/module_name/tests/ -v
# Tests should now pass
```

### Step 7: Refactor
Improve code quality while keeping tests green.

## Common Testing Patterns

### Testing Exceptions

```python
def test_validation_error_raised(self):
    with self.assertRaises(ValidationError):
        self.env['custom.model'].create({
            'name': 'Invalid',
            'amount': -100,  # Negative not allowed
        })

def test_user_error_message(self):
    record = self.create_test_record()
    with self.assertRaisesRegex(UserError, "cannot be confirmed"):
        record.action_confirm()
```

### Testing with Different Users

```python
def test_manager_can_approve(self):
    manager = self.env.ref('module.group_manager').users[0]
    record = self.create_test_record()
    record.with_user(manager).action_approve()
    self.assertEqual(record.state, 'approved')

def test_user_cannot_approve(self):
    regular_user = self.env['res.users'].create({
        'name': 'Regular',
        'login': 'regular@test.com',
    })
    record = self.create_test_record()
    with self.assertRaises(AccessError):
        record.with_user(regular_user).action_approve()
```

## Best Practices

1. **Always Two Phases** - Never skip Phase 1 DB tests
2. **Tests Before Code** - Write tests first, then implement
3. **One Assert Per Test** - Focus on single behavior
4. **Descriptive Names** - Test names explain what's tested
5. **Independent Tests** - Each test sets up its own data
6. **Clean Up** - Use TransactionCase for automatic rollback
7. **Mock External Services** - Don't call real APIs in tests
8. **Test Edge Cases** - Empty, null, boundary conditions

## Success Metrics

- Phase 1 tests verify all schema elements
- Phase 2 tests cover all business logic
- All tests pass before deployment
- Tests catch bugs before production
- Fast test execution (< 30s for unit tests)

---

**Remember**: Two-Phase Testing is not optional. Phase 1 catches schema issues early, Phase 2 verifies business logic. Together they ensure robust, reliable Odoo modules.
