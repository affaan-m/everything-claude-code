# Core Philosophy - Odoo 15 Development

## TDD is NON-NEGOTIABLE

**Every single line of production code must be written in response to a failing test. No exceptions.**

This is not a suggestion or preference - it is the fundamental practice that enables all other principles.

### Key Principles

| Principle | Description |
|-----------|-------------|
| Write tests first | TDD - Red-Green-Refactor |
| Test behavior, not implementation | Focus on business outcomes |
| No duck typing | Always use proper type hints |
| Immutable patterns | Prefer immutable data where possible |
| Small, pure functions | Easy to test, easy to reason about |
| Evidence-based | Show file:line for code, table:column for data |

### Preferred Tools

- **Language**: Python 3.8+ (Odoo 15 compatible)
- **Testing**: Odoo test framework + unittest
- **Type Checking**: mypy
- **Code Quality**: black, flake8, isort

## Odoo Framework Integration

### Never Bypass the ORM

```python
# Bad - Direct SQL
self.env.cr.execute("SELECT * FROM res_partner WHERE active = true")
partners = self.env.cr.fetchall()

# Good - ORM methods
partners = self.env['res.partner'].search([('active', '=', True)])
```

### Respect the Framework Lifecycle

Use proper decorators and hooks:
- `@api.model` - Class methods
- `@api.depends` - Computed field dependencies
- `@api.constrains` - Validation constraints
- `@api.onchange` - UI change handlers

### Follow Odoo Patterns

- Use proper inheritance (`_inherit` for extensions, `_name` for new models)
- Use delegation and composition appropriately
- Follow naming conventions (`my.model.name`)

### Security First

Always consider:
- Access rights (`ir.model.access.csv`)
- Record rules (`ir.rule`)
- Field-level permissions (`groups` attribute)

## Red-Green-Refactor Cycle

```python
# Step 1: RED - Write failing test
class TestPartnerCredit(TransactionCase):
    def test_credit_limit_calculation(self):
        partner = self._create_partner(credit_limit=1000.0)
        available_credit = partner.calculate_available_credit()
        self.assertEqual(available_credit, 1000.0)

# Step 2: GREEN - Minimal implementation
class ResPartner(models.Model):
    _inherit = 'res.partner'

    def calculate_available_credit(self) -> float:
        return self.credit_limit  # Minimal implementation

# Step 3: RED - Add complexity
def test_credit_with_debt(self):
    partner = self._create_partner(credit_limit=1000.0, total_due=300.0)
    available_credit = partner.calculate_available_credit()
    self.assertEqual(available_credit, 700.0)

# Step 4: GREEN - Update implementation
def calculate_available_credit(self) -> float:
    return self.credit_limit - self.total_due

# Step 5: REFACTOR - Extract and improve
MINIMUM_CREDIT_BUFFER = 50.0

def _get_total_outstanding_amount(self) -> float:
    return self.total_due or 0.0

def calculate_available_credit(self) -> float:
    outstanding = self._get_total_outstanding_amount()
    return max(0.0, self.credit_limit - outstanding - MINIMUM_CREDIT_BUFFER)
```

## Type Hints and Documentation

Always provide type hints and docstrings:

```python
from typing import Dict, List, Optional, Any
from odoo import api, fields, models
from odoo.exceptions import ValidationError

class ResPartner(models.Model):
    _inherit = 'res.partner'

    def calculate_credit_limit(self, additional_amount: float = 0.0) -> float:
        """Calculate total credit limit including additional amount.

        Args:
            additional_amount: Additional amount to add to calculation

        Returns:
            Total credit limit as float

        Raises:
            ValidationError: If additional_amount is negative
        """
        if additional_amount < 0:
            raise ValidationError("Additional amount cannot be negative")

        return self.credit_limit + additional_amount
```

## Functional Programming Patterns

```python
# Good - Immutable operations with recordsets
def apply_discount_to_lines(order_lines, discount_percent: float):
    """Apply discount to order lines immutably."""
    return order_lines.with_context(
        discount_percent=discount_percent
    ).mapped(lambda line: line.with_context(
        price_unit=line.price_unit * (1 - discount_percent / 100)
    ))

# Good - Pure functions for calculations
def calculate_shipping_cost(weight: float, distance: float, base_rate: float = 5.0) -> float:
    """Calculate shipping cost based on weight and distance."""
    weight_factor = max(1.0, weight / 10.0)
    distance_factor = max(1.0, distance / 100.0)
    return base_rate * weight_factor * distance_factor

# Good - Composition for complex operations
def process_order_workflow(order):
    """Process order through complete workflow."""
    validated_order = validate_order_data(order)
    priced_order = calculate_order_pricing(validated_order)
    confirmed_order = confirm_order_availability(priced_order)
    return finalize_order_processing(confirmed_order)
```

## Evidence-Based Development

### Code References
Always show source references when mentioning code:

```
# Format: module/file.py:line_number
custom_module/models/custom_model.py:145
```

### Database References
Always show table/column when discussing data:

```
# Format: table.column
hr_employee.department_id
custom_model.total_amount
```

## Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
        language_version: python3.8

  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8
        args: ['--max-line-length=88', '--extend-ignore=E203,W503']

  - repo: https://github.com/pycqa/isort
    rev: 5.10.1
    hooks:
      - id: isort
        args: ["--profile", "black"]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v0.950
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

## Summary

1. **TDD Always** - No production code without failing test
2. **Evidence-Based** - Always cite sources (file:line, table:column)
3. **ORM-First** - Use framework methods, not raw SQL
4. **Type-Safe** - Type hints on all methods
5. **Security-First** - Consider access rights always
6. **Clean Code** - Small functions, clear naming, proper docs
