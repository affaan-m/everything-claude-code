# Exercise 2: Skill with Supporting Files

## Goal

Create a `/write-ssp` skill that generates System Security Plan sections using
a predefined template.

## Step 1: Create the Skill Directory

```bash
mkdir -p .claude/skills/write-ssp
```

## Step 2: Create the Template

Save as `.claude/skills/write-ssp/ssp-template.md`:

```markdown
# System Security Plan (SSP) Section

## [Control ID]: [Control Title]

### Control Description
[Standard description from NIST 800-53]

### Implementation Status
- [ ] Implemented
- [ ] Partially Implemented
- [ ] Planned
- [ ] Not Applicable

### Implementation Description
[How this control is implemented in your system]

### Responsible Role
[Who is responsible for maintaining this control]

### Implementation Evidence
[What artifacts demonstrate compliance]
- Document references:
- Configuration screenshots:
- Log samples:

### Testing Procedures
[How to verify this control is working]

### Related Controls
[Other controls that support or depend on this one]
```

## Step 3: Create the SKILL.md

Save as `.claude/skills/write-ssp/SKILL.md`:

```yaml
---
name: write-ssp
description: >
  Generate SSP (System Security Plan) sections for NIST 800-53 controls.
  Use when documenting how controls are implemented, writing security plans,
  or preparing RMF documentation.
argument-hint: "[control ID, e.g., AC-2, SC-8, AU-3]"
---

# SSP Section Generator

Generate a System Security Plan section using the template in
@ssp-template.md.

## Instructions

1. Look up the specified NIST 800-53 Rev 5 control
2. Fill in the template with:
   - The official control description
   - A realistic implementation description based on common practices
   - Appropriate responsible roles
   - Concrete evidence examples
   - Practical testing procedures
   - Related/dependent controls

3. Write the implementation description in **first person plural** ("We implement...")
4. Be specific — avoid vague statements like "we follow best practices"
5. Reference specific technologies, tools, and configurations

## Tone

Write for an assessor who needs to understand exactly what you do and how.
Be precise, technical, and evidence-focused.
```

## Step 4: Test It

```
/write-ssp AC-2
/write-ssp SC-8
/write-ssp AU-3
```

## Verification

- [ ] Claude uses the template format from ssp-template.md
- [ ] The output is specific enough for a real SSP
- [ ] Implementation descriptions are realistic and detailed
- [ ] Related controls are correctly identified
