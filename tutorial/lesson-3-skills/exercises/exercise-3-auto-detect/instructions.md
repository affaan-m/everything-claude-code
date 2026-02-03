# Exercise 3: Auto-Detecting Skill

## Goal

Create a skill that Claude activates **automatically** when it detects you're
working on security-related code — without you typing any command.

## Step 1: Create the Skill

```bash
mkdir -p .claude/skills/security-awareness
```

Save as `.claude/skills/security-awareness/SKILL.md`:

```yaml
---
name: security-awareness
description: >
  Automatically check for security issues when editing authentication code,
  authorization logic, encryption routines, input validation, or any file
  containing passwords, tokens, keys, or credentials. Also activate when
  files in security-critical directories are modified.
user-invocable: false
---

# Security Awareness Check

When I detect security-relevant code changes, automatically:

1. **Flag potential issues**:
   - Hardcoded secrets or credentials
   - Missing input validation
   - SQL injection vulnerabilities
   - Insecure cryptographic practices
   - Overly permissive access controls

2. **Suggest improvements**:
   - Use environment variables for secrets
   - Add input validation/sanitization
   - Use parameterized queries
   - Use approved cryptographic libraries
   - Apply least privilege principle

3. **Reference applicable controls**:
   - Map each finding to a NIST 800-53 control

Keep suggestions brief and actionable. Don't be overwhelming — focus on
the most important issues.
```

Notice `user-invocable: false` — this skill **cannot** be called with
a slash command. It only activates when Claude decides it's relevant.

## Step 2: Test Auto-Detection

Start Claude Code and try these scenarios:

**Scenario A**: Ask Claude to write a login function
```
"Write a Python function that authenticates a user with username and password"
```
Claude should automatically apply security awareness checks.

**Scenario B**: Ask Claude to edit a config file with credentials
```
"Add the database connection string to config.py"
```
Claude should warn about hardcoding credentials.

**Scenario C**: Ask something non-security related
```
"Write a function that calculates the average of a list of numbers"
```
Claude should NOT activate the security skill.

## Verification

- [ ] The skill activates when working on auth/security code
- [ ] The skill does NOT activate for unrelated code
- [ ] Suggestions are brief and actionable
- [ ] NIST controls are referenced
- [ ] You cannot invoke it with `/security-awareness` (it's auto-only)
