# RMF Command Template: STIG Check

Save this as `.claude/commands/stig-check.md`:

```markdown
Analyze $ARGUMENTS against known STIG (Security Technical Implementation Guide)
requirements.

For the file or configuration provided:

1. **Identify applicable STIGs**: Which STIG applies to this technology?
2. **Check CAT I findings**: Highest severity - must fix immediately
3. **Check CAT II findings**: Medium severity - fix within 90 days
4. **Check CAT III findings**: Lower severity - fix within 180 days

For each finding:
- **STIG ID**: V-XXXXX format
- **Rule Title**: What the rule checks
- **Status**: Open (non-compliant) or Not A Finding (compliant)
- **Details**: Why it passed or failed
- **Fix**: Specific remediation command or config change

Output a summary table at the end with pass/fail counts per category.
```

## Usage Examples

```
/stig-check configs/httpd.conf
/stig-check docker-compose.yml
/stig-check ansible/roles/webserver/tasks/main.yml
```
