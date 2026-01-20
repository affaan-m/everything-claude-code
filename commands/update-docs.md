---
description: Sync Odoo module documentation from source-of-truth files (__manifest__.py, models, views).
---

# Update Documentation

Sync documentation from source-of-truth for Odoo modules:

1. Read `__manifest__.py`
   - Extract module name, version, summary
   - List dependencies
   - Document data files

2. Analyze model files
   - Extract model descriptions
   - Document public methods with docstrings
   - List computed fields and their dependencies

3. Generate `docs/README.md` with:
   - Module overview
   - Installation instructions
   - Configuration options
   - Usage guide

4. Generate `docs/DEVELOPER.md` with:
   - Model reference
   - API methods
   - Extension points

5. Generate `docs/CHANGELOG.md` with:
   - Version history from `__manifest__.py`
   - Breaking changes
   - New features

6. Identify obsolete documentation:
   - Find docs not modified in 90+ days
   - List for manual review

7. Show diff summary

## Source-of-Truth Files

### __manifest__.py

```python
# Extract this information for docs
{
    'name': 'HR Certifications',           # → Title
    'version': '15.0.1.0.0',               # → Version
    'summary': 'Track certifications',      # → Short description
    'description': """Long description""",  # → Full description
    'depends': ['hr', 'mail'],             # → Dependencies
    'data': [...]                          # → Installed files
}
```

### Model Docstrings

```python
class HrCertification(models.Model):
    """Employee certification tracking.

    This model stores certification information for employees,
    including expiry dates and renewal tracking.

    Attributes:
        name: Certification name
        employee_id: Link to employee
        date_expiry: When certification expires
    """
    _name = 'hr.certification'
    _description = 'Employee Certification'

    def action_renew(self):
        """Renew the certification for another year.

        Creates a new certification record with updated dates
        and archives the current one.

        Returns:
            dict: Action to open the new certification form

        Raises:
            UserError: If certification is not yet expired
        """
        pass
```

## Generated Documentation

### docs/README.md

```markdown
# HR Certifications

Track employee training certifications with expiry notifications.

## Version

15.0.1.0.0

## Dependencies

- `hr` - Human Resources
- `mail` - Discuss

## Installation

1. Copy module to addons path
2. Update module list: Settings > Apps > Update Apps List
3. Install module: Search for "HR Certifications" and install

## Configuration

### Security Groups

- **Certification User**: View and manage own certifications
- **Certification Manager**: Manage all certifications

### Scheduled Actions

- **Check Expiring Certifications**: Daily at 6:00 AM

## Usage

1. Go to Employees > Certifications
2. Create new certification for employee
3. Set expiry date for automatic notifications
```

### docs/DEVELOPER.md

```markdown
# Developer Guide: HR Certifications

## Models

### hr.certification

Employee certification tracking.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| name | Char | Certification name |
| employee_id | Many2one | Link to hr.employee |
| date_expiry | Date | Expiration date |
| state | Selection | Current state (valid/expiring/expired) |

**Computed Fields:**

| Field | Dependencies | Stored |
|-------|--------------|--------|
| state | date_expiry | Yes |

**Public Methods:**

#### action_renew()

Renew the certification for another year.

```python
certification.action_renew()
```

**Returns:** Action dictionary to open new certification form

**Raises:** UserError if certification is not yet expired

## Extension Points

### Adding Fields

```python
class HrCertification(models.Model):
    _inherit = 'hr.certification'

    training_hours = fields.Float(string="Training Hours")
```

### Overriding Methods

```python
class HrCertification(models.Model):
    _inherit = 'hr.certification'

    def action_renew(self):
        # Custom logic before renewal
        self._send_renewal_notification()
        return super().action_renew()
```
```

## Documentation Commands

```bash
# Generate all documentation
python3 scripts/generate_docs.py /mnt/extra-addons/module_name

# Generate specific doc
python3 scripts/generate_docs.py /mnt/extra-addons/module_name --only readme

# Check for stale docs
python3 scripts/generate_docs.py /mnt/extra-addons/module_name --check-stale

# Preview changes without writing
python3 scripts/generate_docs.py /mnt/extra-addons/module_name --dry-run
```

## Stale Documentation Detection

```bash
# Find docs not modified in 90+ days
find docs/ -name "*.md" -mtime +90 -type f

# Output:
# docs/old_feature.md (last modified 120 days ago)
# docs/deprecated_api.md (last modified 95 days ago)
```

## Best Practices

1. **Keep docstrings current** - They are the source of truth
2. **Update __manifest__.py** - Version and description matter
3. **Run after releases** - Generate docs for each version
4. **Review stale docs** - Archive or update old documentation

## Integration with Other Commands

- Use `/update-codemaps` for technical architecture docs
- Use `/code-review` to ensure docstrings exist
- Run before releases for up-to-date documentation

## Related Agents

This command invokes the `doc-updater` agent located at:
`~/.claude/agents/doc-updater.md`
