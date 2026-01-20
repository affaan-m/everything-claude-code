# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

## Feature Implementation Workflow

1. **Plan First**
   - Use **planner** agent to create implementation plan
   - Identify dependencies and risks
   - Plan module structure and security files
   - Break down into phases

2. **TDD Approach** (Two-Phase Testing)
   - Use **tdd-guide** agent
   - Phase 1: Write database verification tests
   - Phase 2: Write ORM unit tests (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify 80%+ coverage

3. **Security First**
   - Create ACLs in ir.model.access.csv
   - Define record rules in security.xml
   - Document any sudo() usage
   - Use **security-reviewer** agent

4. **Code Review**
   - Use **code-reviewer** agent immediately after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible
   - Check for ORM anti-patterns

5. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format

## Odoo Module Commit Strategy

### Initial Module Setup
```bash
git add module_name/__init__.py
git add module_name/__manifest__.py
git commit -m "chore: initialize module_name module structure"

git add module_name/security/
git commit -m "feat: add ACLs and record rules for module_name"
```

### Model Implementation
```bash
git add module_name/models/
git commit -m "feat(module_name): add model_name model with core fields"
```

### Views
```bash
git add module_name/views/
git commit -m "feat(module_name): add form, tree, and search views for model_name"
```

### Tests
```bash
git add module_name/tests/
git commit -m "test(module_name): add unit tests for model_name"
```

## Branch Naming

```
feature/module-name-feature-description
bugfix/ticket-id-brief-description
refactor/module-name-what-changed
docs/what-documented
```

## Pre-Commit Checklist

Before committing Odoo code:
- [ ] Module installs without errors
- [ ] Tests pass: `docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader module_name.tests`
- [ ] No print() statements (use _logger.debug)
- [ ] ACLs defined for new models
- [ ] sudo() usage documented
- [ ] No hardcoded values
- [ ] flake8 passes with no errors

## PR Description Template

```markdown
## Summary

Brief description of changes.

## Changes

- Added model `hr.certification` for tracking employee certifications
- Added form and tree views
- Added ACLs for HR User and HR Manager groups
- Added record rules for company isolation

## Security

- [x] ACLs added to ir.model.access.csv
- [x] Record rules defined in security.xml
- [x] No undocumented sudo() usage

## Testing

- [x] Unit tests added (80%+ coverage)
- [x] Module installs cleanly
- [x] Manual testing completed

## Test Plan

- [ ] Install module on test database
- [ ] Create certification record as HR User
- [ ] Verify HR Manager can edit all certifications
- [ ] Verify company isolation works
```
