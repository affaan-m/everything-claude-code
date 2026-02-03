# Exercise 1: Create Your First Skill

## Goal

Create a `/compliance-check` skill that reviews a file for NIST 800-53 compliance.

## Step 1: Create the Directory

```bash
mkdir -p .claude/skills/compliance-check
```

## Step 2: Create the SKILL.md

Save this as `.claude/skills/compliance-check/SKILL.md`:

```yaml
---
name: compliance-check
description: >
  Check code or configuration for NIST SP 800-53 compliance. Use when reviewing
  security configurations, auditing code, or preparing for assessment.
argument-hint: "[file or directory to check]"
---

# NIST 800-53 Compliance Check

Analyze the target for compliance with these control families:

## Access Control (AC)
- Are authentication mechanisms in place?
- Is least privilege enforced?
- Are access controls properly configured?

## Audit and Accountability (AU)
- Are audit events defined?
- Is audit logging enabled?
- Are audit records protected?

## Configuration Management (CM)
- Are baseline configurations defined?
- Are changes controlled?
- Is unnecessary functionality disabled?

## Identification and Authentication (IA)
- Are users uniquely identified?
- Are credentials properly managed?
- Is multi-factor auth used where required?

## System and Communications Protection (SC)
- Is data encrypted in transit?
- Is data encrypted at rest?
- Are boundaries protected?

## For Each Finding

Report using this format:
- **Control**: [Control ID and name]
- **Status**: Compliant / Non-Compliant / Not Applicable
- **Evidence**: [What you found in the code/config]
- **Recommendation**: [What to fix, if non-compliant]
```

## Step 3: Test It

Start Claude Code in your project directory and run:

```
/compliance-check configs/nginx.conf
```

Or just describe a scenario:
```
"I need to check if our SSH configuration meets federal requirements"
```

If the description in your SKILL.md is good, Claude should automatically
activate the compliance-check skill.

## Verification

- [ ] The command `/compliance-check` appears when you type `/comp` + Tab
- [ ] It analyzes the file you specify
- [ ] It maps findings to NIST 800-53 controls
- [ ] It gives actionable recommendations
