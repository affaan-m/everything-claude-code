# RMF Command Template: Control Mapper

Save this as `.claude/commands/control-mapper.md`:

```markdown
Map the code or configuration in $ARGUMENTS to NIST SP 800-53 Rev 5 controls.

For each relevant section of the code:

1. **Identify the control family**: AC, AU, CM, IA, SC, SI, etc.
2. **Map to specific controls**: e.g., AC-2, AU-3, SC-8
3. **Assessment**: Does this code satisfy, partially satisfy, or fail the control?
4. **Evidence**: Quote the specific code/config that supports the assessment
5. **Gaps**: What's missing to fully satisfy the control?

Output format:
| Control | Title | Status | Evidence | Gap |
|---------|-------|--------|----------|-----|

Group results by control family.

This mapping can be used as evidence in a System Security Plan (SSP).
```

## Usage Examples

```
/control-mapper src/auth/login.py
/control-mapper infrastructure/terraform/main.tf
/control-mapper configs/audit-rules.conf
```
