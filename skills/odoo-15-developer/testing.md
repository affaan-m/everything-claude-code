# Testing - Odoo 15 Development

## NON-NEGOTIABLE Two-Phase Testing

**CRITICAL REQUIREMENT**: All code changes MUST follow this two-phase testing approach.

## Phase 1: Development & Debugging (Direct Database Testing)

| Aspect | Description |
|--------|-------------|
| **Purpose** | During implementation, analysis, debugging, or task execution |
| **Approach** | Use Direct Database Testing with **real data from production/development database** |
| **Location** | `.0temp/test_*.py` scripts |
| **Database** | Production/development database with actual records |

### Benefits
- Immediate validation with actual data scenarios
- Quick iteration and debugging
- Real-world edge case discovery
- No test infrastructure setup delays

### Example Phase 1 Script

```bash
# Create test script in .0temp/ directory
cat > .0temp/test_implementation.py << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.append('/odoo')
import odoo

# Test with REAL database data
# ... implementation tests ...
EOF

# Copy to container and run with real data
docker cp .0temp/test_implementation.py $ODOO_CONTAINER:/tmp/
docker exec $ODOO_CONTAINER python3 /tmp/test_implementation.py
```

## Phase 2: Post-Implementation (Odoo Standard Test Framework)

| Aspect | Description |
|--------|-------------|
| **Purpose** | After code implementation/update is complete and validated |
| **Requirement** | **MANDATORY** - Create unit tests in `tests/` folder |
| **Data Source** | **Clone/copy real data** used in Phase 1 |
| **Location** | `module_name/tests/test_*.py` |
| **Framework** | Odoo Standard Test Framework (TransactionCase) |

### Benefits
- Regression prevention
- CI/CD integration
- Documentation of expected behavior
- Long-term maintainability

## Testing Data Flow

```
Real Database Data (Phase 1)
    ↓
Direct Database Testing (implementation/debug)
    ↓
Code Changes Complete
    ↓
Clone/Copy Real Data → Test Fixtures (Phase 2)
    ↓
Odoo Standard Test Framework (tests/ folder)
    ↓
Commit Code + Tests Together
```

**ENFORCEMENT**: No code change is considered complete without corresponding unit tests in the `tests/` folder using data patterns validated in Phase 1.

## Behavior-Driven Testing

- **No "unit tests"** - Test business behavior through the Odoo API
- Test through public model methods exclusively
- Internals should be invisible to tests
- Use TransactionCase for database-dependent tests
- Use TestCase for pure Python logic
- **Coverage targets**: 100% of business behavior, not implementation details
- Tests must document expected business behavior using Odoo records
- **Test data must reflect real scenarios**

## Odoo Testing Framework

```python
from odoo.tests import TransactionCase, tagged
from odoo.exceptions import ValidationError, UserError

@tagged('post_install', '-at_install')
class TestSaleOrder(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner = cls.env['res.partner'].create({
            'name': 'Test Customer',
            'email': 'test@example.com',
            'is_company': False,
        })
        cls.product = cls.env['product.product'].create({
            'name': 'Test Product',
            'type': 'consu',
            'list_price': 100.0,
        })

    def test_order_total_calculation_with_single_line(self):
        """Order should calculate total correctly with one line"""
        order = self.env['sale.order'].create({
            'partner_id': self.partner.id,
            'order_line': [(0, 0, {
                'product_id': self.product.id,
                'product_uom_qty': 2,
                'price_unit': 100.0,
            })]
        })

        self.assertEqual(order.amount_total, 200.0)
        self.assertEqual(order.amount_untaxed, 200.0)
```

## Test Data Factories

Use factory methods with optional overrides:

```python
class TestSaleOrder(TransactionCase):

    def _create_partner(self, **kwargs):
        """Factory for creating test partners"""
        values = {
            'name': 'Test Partner',
            'email': 'test@example.com',
            'is_company': False,
            'country_id': self.env.ref('base.us').id,
        }
        values.update(kwargs)
        return self.env['res.partner'].create(values)

    def _create_product(self, **kwargs):
        """Factory for creating test products"""
        values = {
            'name': 'Test Product',
            'type': 'consu',
            'list_price': 100.0,
            'uom_id': self.env.ref('uom.product_uom_unit').id,
            'uom_po_id': self.env.ref('uom.product_uom_unit').id,
        }
        values.update(kwargs)
        return self.env['product.product'].create(values)

    def _create_sale_order(self, **kwargs):
        """Factory for creating test sale orders"""
        if 'partner_id' not in kwargs:
            kwargs['partner_id'] = self._create_partner().id

        values = {
            'partner_id': kwargs['partner_id'],
            'state': 'draft',
        }
        values.update(kwargs)
        return self.env['sale.order'].create(values)
```

## Test Data Migration Pattern

```python
# Step 1: During Phase 1, document real data used
# .0temp/test_implementation.py
"""
Test Data Used:
- Employee ID: 123, Name: "John Doe"
- Attendance Sheet ID: 456, Date: 2024-01-15
- Expected Result: total_hours = 8.0
"""

# Step 2: In Phase 2, clone this data pattern into unit test
# module_name/tests/test_attendance_calculation.py
@tagged('post_install', '-at_install')
class TestAttendanceCalculation(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Clone real data pattern from Phase 1
        cls.employee = cls.env['hr.employee'].create({
            'name': 'John Doe',  # From real data
            'user_id': cls.env.ref('base.user_admin').id,
        })
        cls.attendance_sheet = cls.env['attendance.sheet'].create({
            'employee_id': cls.employee.id,
            'date_start': '2024-01-15',  # From real data
            # ... other fields matching real scenario
        })

    def test_total_hours_calculation(self):
        """Should calculate 8.0 hours for standard work day"""
        # Test behavior validated in Phase 1 with real data
        self.assertEqual(self.attendance_sheet.total_hours, 8.0)
```

## Integration Testing

```python
@tagged('post_install', '-at_install')
class TestOrderWorkflow(TransactionCase):

    def test_complete_order_to_invoice_workflow(self):
        """Test complete workflow from order to invoice."""
        # Create order
        order = self._create_sale_order()
        order_line = self.env['sale.order.line'].create({
            'order_id': order.id,
            'product_id': self._create_product().id,
            'product_uom_qty': 5,
            'price_unit': 100.0,
        })

        # Confirm order
        order.action_confirm()
        self.assertEqual(order.state, 'sale')

        # Deliver products
        delivery = order.picking_ids[0]
        delivery.move_lines.write({'quantity_done': 5})
        delivery.button_validate()

        # Create invoice
        invoice = order._create_invoices()
        self.assertTrue(invoice)
        self.assertEqual(invoice.amount_total, 500.0)

        # Confirm invoice
        invoice.action_post()
        self.assertEqual(invoice.state, 'posted')
```

## Performance Testing

```python
class TestPerformance(TransactionCase):

    def test_bulk_partner_creation_performance(self):
        """Test performance of bulk partner creation."""
        import time

        start_time = time.time()

        # Create 1000 partners
        partners_data = [
            {
                'name': f'Partner {i}',
                'email': f'partner{i}@example.com',
            }
            for i in range(1000)
        ]

        partners = self.env['res.partner'].create(partners_data)

        end_time = time.time()
        creation_time = end_time - start_time

        self.assertEqual(len(partners), 1000)
        self.assertLess(creation_time, 5.0, "Bulk creation should take less than 5 seconds")
```

## Testing Commands

### Phase 1: Direct Database Testing
```bash
# Copy custom test script to container and run
docker cp .0temp/test_script.py $ODOO_CONTAINER:/tmp/
docker exec $ODOO_CONTAINER python3 /tmp/test_script.py

# Query real data for testing
docker exec $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB \
    -c "SELECT * FROM table WHERE conditions"
```

### Phase 2: Odoo Standard Tests (MANDATORY)
```bash
# Run Odoo standard tests (must exist in module/tests/ folder)
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader MODULE_NAME.tests.test_file

# Run specific test module
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    custom_module.tests.test_calculation

# Run all module tests
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader MODULE_NAME.tests

# Run with specific database
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    MODULE_NAME.tests.test_file -d $ODOO_DB
```

## Test Tags Reference

| Tag | Description |
|-----|-------------|
| `post_install` | Run after module installation |
| `-at_install` | Don't run during installation |
| `standard` | Standard test (default) |
| `external` | External service tests |

## Common Assertions

| Method | Description |
|--------|-------------|
| `assertEqual(a, b)` | Assert a == b |
| `assertNotEqual(a, b)` | Assert a != b |
| `assertTrue(x)` | Assert x is True |
| `assertFalse(x)` | Assert x is False |
| `assertIn(a, b)` | Assert a in b |
| `assertRaises(exc)` | Assert exception raised |
| `assertRecordValues(records, expected)` | Assert record field values |

## Test File Structure

```
module_name/
└── tests/
    ├── __init__.py
    ├── test_models.py      # Model tests
    ├── test_workflows.py   # Workflow tests
    ├── test_security.py    # Security tests
    └── common.py           # Shared test utilities
```

### tests/__init__.py
```python
from . import test_models
from . import test_workflows
from . import test_security
```

## Summary Checklist

- [ ] Phase 1: Direct Database Testing with real data
- [ ] Phase 2: Unit tests in `module/tests/` folder (MANDATORY)
- [ ] Test data cloned from Phase 1 patterns
- [ ] All tests pass before commit
- [ ] Tests and code committed together
