---
description: Safely identify and remove dead code in Odoo modules with test verification using vulture and pylint.
---

# Refactor Clean

Safely identify and remove dead code in Odoo modules with test verification:

1. Run dead code analysis tools:
   - vulture: Find unused Python code
   - pylint: Find unused imports and variables
   - Custom Odoo checks: Find unused fields and models

2. Generate comprehensive report in `.reports/dead-code-analysis.md`

3. Categorize findings by severity:
   - SAFE: Test files, unused utilities
   - CAUTION: Models, computed fields, wizard methods
   - DANGER: Controller routes, cron methods, onchange handlers

4. Propose safe deletions only

5. Before each deletion:
   - Run full test suite
   - Verify tests pass
   - Apply change
   - Re-run tests
   - Rollback if tests fail

6. Show summary of cleaned items

Never delete code without running tests first!

## Analysis Commands

```bash
# Find unused Python code with vulture
pip install vulture
vulture models/ wizards/ controllers/ --min-confidence 80

# Run pylint for unused code
pylint --disable=all --enable=W0611,W0612,W0613,W0614 models/

# Find unused Odoo fields (custom check)
# Look for fields not referenced in views or Python code
```

## Odoo-Specific Checks

### Unused Fields Detection

```python
# Find fields defined in Python
grep -rn "fields\." --include="*.py" models/ | grep "="

# Find fields referenced in views
grep -rn "name=\"" --include="*.xml" views/

# Cross-reference to find unused fields
```

### Unused Model Detection

```python
# Find model definitions
grep -rn "_name = " --include="*.py" models/

# Find model references
grep -rn "env\[" --include="*.py" .
grep -rn "ref=\"" --include="*.xml" .
```

### Dead Method Detection

```python
# Vulture will find these, but verify:
# - @api.onchange methods are called from views
# - Cron methods are referenced in ir.cron data
# - Button actions are referenced in views
```

## Verification Steps

### Before Removing Code

```bash
# 1. Run full test suite
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader module_name.tests

# 2. Check if module installs cleanly
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -i module_name --stop-after-init

# 3. Verify no Odoo log errors
docker logs $ODOO_CONTAINER 2>&1 | grep -i error
```

### After Removing Code

```bash
# 1. Run tests again
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader module_name.tests

# 2. Update module
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u module_name --stop-after-init

# 3. Check logs
docker logs $ODOO_CONTAINER 2>&1 | grep -i error
```

## Safe vs Unsafe Deletions

### SAFE to Delete
- Unused import statements
- Unused local variables
- Commented-out code blocks
- Test utilities not called
- Debug/logging code

### CAUTION Required
- Unused computed fields (may be used in reports)
- Unused model methods (may be called via RPC)
- Unused wizard methods (may be action buttons)

### DANGER - Do NOT Delete Without Verification
- Controller routes (external integrations may use)
- Cron job methods (scheduled actions call these)
- @api.onchange methods (views may reference)
- Fields with `groups` attribute (may be conditionally visible)

## Report Format

```markdown
## Dead Code Analysis: module_name

### Statistics
- Files analyzed: 15
- Lines analyzed: 2,340
- Potential dead code: 156 lines
- Safe to remove: 89 lines

### SAFE (89 lines)
1. `models/utils.py:45-67` - Unused helper function `_format_date()`
2. `models/partner.py:12` - Unused import `from datetime import timedelta`

### CAUTION (52 lines)
1. `models/sale.py:123-145` - Unused method `_compute_old_total()`
   - Verify not used in reports
   - Check for RPC calls

### DANGER (15 lines)
1. `controllers/api.py:34-49` - Unused route `/api/v1/old_endpoint`
   - May be used by external systems
   - Deprecate before removing
```

## Integration with Other Commands

- Use `/code-review` to review changes
- Use `/test-coverage` to verify test coverage
- Use `/tdd` to add tests before major refactoring

## Related Agents

This command invokes the `refactor-cleaner` agent located at:
`~/.claude/agents/refactor-cleaner.md`
