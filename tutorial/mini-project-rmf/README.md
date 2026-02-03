# Mini Project: RMF Compliance Dashboard

## Overview

In this hands-on project, you'll configure Claude Code with **all six features**
to build a small compliance tracking tool. This is a practical exercise that
simulates real system engineering work on an RMF project.

By the end, you'll have:
- **Rules** that tell Claude about your project and standards
- **Commands** for common RMF tasks
- **Skills** for generating compliance artifacts
- **Hooks** that enforce security guardrails
- **Agents** that review your work
- An understanding of how **MCPs** connect to external services

## Project Description

You're building a CLI-based RMF compliance tracker that:
- Tracks NIST 800-53 control implementation status
- Generates POA&M entries
- Produces compliance reports
- Validates security configurations

## Architecture

```
rmf-tracker/
├── CLAUDE.md                          # ← Rules (Lesson 1)
├── .claude/
│   ├── settings.json                  # ← Hooks (Lesson 4)
│   ├── commands/
│   │   ├── check-control.md           # ← Commands (Lesson 2)
│   │   └── gen-poam.md                # ← Commands (Lesson 2)
│   ├── skills/
│   │   └── compliance-report/
│   │       ├── SKILL.md               # ← Skills (Lesson 3)
│   │       └── report-template.md
│   ├── agents/
│   │   └── security-reviewer.md       # ← Agents (Lesson 5)
│   └── rules/
│       ├── security.md                # ← Rules (Lesson 1)
│       └── python-style.md            # ← Rules (Lesson 1)
├── src/
│   ├── __init__.py
│   ├── models.py                      # Control & Finding data models
│   ├── tracker.py                     # Main tracking logic
│   └── reports.py                     # Report generation
├── data/
│   ├── controls.json                  # NIST 800-53 control catalog
│   └── findings.json                  # Current findings
├── tests/
│   └── test_tracker.py                # Test suite
└── requirements.txt
```

---

## Step-by-Step Instructions

### Phase 1: Set Up the Project (Rules)

Create the project directory and configure Claude's memory.

#### 1.1 Create the Project Structure

```bash
mkdir -p rmf-tracker/{src,data,tests,.claude/{commands,skills/compliance-report,agents,rules,hooks}}
touch rmf-tracker/src/__init__.py
```

#### 1.2 Create CLAUDE.md (See Lesson 1)

Save as `rmf-tracker/CLAUDE.md`:

```markdown
# RMF Compliance Tracker

## Overview
A CLI tool for tracking NIST SP 800-53 Rev 5 control implementation status,
managing findings, and generating compliance reports.

## Tech Stack
- Python 3.11+
- No external framework (stdlib + json)
- pytest for testing

## Project Structure
- `src/models.py` — Data models for Controls, Findings, POA&M entries
- `src/tracker.py` — Core tracking and querying logic
- `src/reports.py` — Report generation (markdown, JSON)
- `data/controls.json` — Control catalog with implementation status
- `data/findings.json` — Active security findings
- `tests/` — pytest test suite

## Commands
- `python -m pytest tests/ -v` — Run tests
- `python src/tracker.py status` — Show compliance status
- `python src/tracker.py report` — Generate report

## Code Conventions
- Python 3.11+, type hints required
- PEP 8 style (Black formatter, 88 char lines)
- All functions need docstrings
- snake_case for functions, PascalCase for classes

## RMF Context
- Framework: NIST SP 800-53 Rev 5
- Baseline: Moderate (FedRAMP)
- All controls must reference their control ID in comments
- Security-sensitive code must log actions (AU-3 compliance)
```

#### 1.3 Create Modular Rules

Save as `rmf-tracker/.claude/rules/security.md`:

```markdown
# Security Rules for RMF Tracker

- Never hardcode credentials or sensitive data
- All input from files must be validated (SI-10)
- Use json.loads() with error handling, never eval()
- Log all control status changes (AU-3)
- Sanitize any user-provided control IDs before use
```

Save as `rmf-tracker/.claude/rules/python-style.md`:

```markdown
# Python Style Rules

- Use dataclasses or TypedDict for structured data
- Type hints on all function signatures
- Handle all exceptions specifically (no bare except)
- Use pathlib.Path for file operations
- Constants at module level in UPPER_SNAKE_CASE
```

---

### Phase 2: Create Commands (Commands)

#### 2.1 Control Checker Command

Save as `rmf-tracker/.claude/commands/check-control.md`:

```markdown
Look up the NIST SP 800-53 Rev 5 control specified in $ARGUMENTS.

1. Check if it exists in data/controls.json
2. Show its current implementation status
3. List any related findings from data/findings.json
4. Show related/dependent controls
5. Suggest next steps if it's not fully implemented

If the control doesn't exist in our catalog, explain what it is and
suggest adding it.
```

#### 2.2 POA&M Generator Command

Save as `rmf-tracker/.claude/commands/gen-poam.md`:

```markdown
Generate a Plan of Action & Milestones (POA&M) entry for the finding
or control deficiency described in $ARGUMENTS.

Use the data in data/findings.json and data/controls.json to:

1. Create a unique POA&M ID (format: POAM-YYYY-NNN)
2. Map to the relevant NIST 800-53 control(s)
3. Describe the weakness clearly
4. Assess the risk level (High/Moderate/Low)
5. Define specific milestones with dates
6. Identify required resources
7. Set a completion target date

Output as both formatted markdown and append to data/findings.json.
```

---

### Phase 3: Create a Skill (Skills)

#### 3.1 Compliance Report Skill

Save as `rmf-tracker/.claude/skills/compliance-report/SKILL.md`:

```yaml
---
name: compliance-report
description: >
  Generate a compliance status report. Use when the user wants to see
  overall compliance posture, prepare for an audit, or review control
  implementation progress.
argument-hint: "[control-family or 'all']"
---

# Compliance Report Generator

Generate a compliance status report using data from:
- `data/controls.json` — control implementation status
- `data/findings.json` — active findings and POA&Ms

Use the template in @report-template.md for formatting.

## Report Sections

1. **Executive Summary**: Overall compliance percentage, risk level
2. **Control Family Summary**: Pass/fail counts per family (AC, AU, etc.)
3. **Open Findings**: Active findings sorted by severity
4. **POA&M Status**: Overdue and upcoming milestones
5. **Trends**: Improvement since last report (if data available)
6. **Recommendations**: Top 3 actions to improve posture
```

Save as `rmf-tracker/.claude/skills/compliance-report/report-template.md`:

```markdown
# Compliance Status Report

**System**: [System Name]
**Date**: [Report Date]
**Baseline**: NIST SP 800-53 Rev 5 — Moderate
**Prepared By**: [Author]

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Controls | [N] |
| Implemented | [N] ([%]) |
| Partially Implemented | [N] ([%]) |
| Not Implemented | [N] ([%]) |
| Not Applicable | [N] ([%]) |
| Open Findings | [N] |
| Overdue POA&Ms | [N] |
| Overall Risk | [LOW/MODERATE/HIGH] |

## Control Family Summary

| Family | Total | Implemented | Partial | Not Impl | N/A |
|--------|-------|-------------|---------|----------|-----|
| AC | | | | | |
| AU | | | | | |
| CM | | | | | |
...

## Open Findings

| ID | Severity | Control | Description | Due Date | Status |
|----|----------|---------|-------------|----------|--------|

## Recommendations

1. [Highest priority action]
2. [Second priority action]
3. [Third priority action]
```

---

### Phase 4: Set Up Hooks (Hooks)

Save as `rmf-tracker/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); FILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env*|*.pem|*.key|*secret*) echo \"BLOCKED: Cannot modify sensitive file: $FILE\" >&2; exit 2;; *) exit 0;; esac"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); FILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty'); if [ -n \"$FILE\" ] && [[ \"$FILE\" == *.json ]] && [ -f \"$FILE\" ]; then python3 -c \"import json; json.load(open('$FILE'))\" 2>&1 || echo \"WARNING: Invalid JSON in $FILE\" >&2; fi; exit 0"
          }
        ]
      }
    ]
  }
}
```

This setup:
- **Blocks** edits to sensitive files (PreToolUse)
- **Validates** JSON files after every edit (PostToolUse)

---

### Phase 5: Create an Agent (Agents)

Save as `rmf-tracker/.claude/agents/security-reviewer.md`:

```yaml
---
name: security-reviewer
description: >
  Reviews code for security vulnerabilities and RMF compliance.
  Use proactively after code changes to src/ directory.
allowed-tools:
  - Read
  - Grep
  - Glob
model: sonnet
---

# Security Reviewer for RMF Tracker

Review code changes for:

## Security
- No hardcoded secrets or credentials
- Input validation on all external data (file reads, user input)
- Safe JSON parsing (json.loads, not eval)
- No path traversal vulnerabilities in file operations
- Proper error handling that doesn't leak system info

## RMF Compliance
- Control IDs referenced in relevant code comments
- Audit logging for security-relevant operations
- Access control enforcement where applicable
- Data validation meets SI-10 requirements

## Code Quality
- Type hints present
- Docstrings on public functions
- Exception handling is specific (not bare except)
- No TODO/FIXME left in production code

Output findings as a table:
| Severity | File:Line | Issue | Control | Fix |
```

---

### Phase 6: Build the Application

Now start Claude Code in the `rmf-tracker/` directory and build the app!

#### 6.1 Create Sample Data

Ask Claude:

```
"Create the data/controls.json file with 10 sample NIST 800-53 controls
from different families (AC, AU, CM, IA, SC). Include fields for:
control_id, title, family, description, implementation_status
(implemented/partial/not_implemented/na), and responsible_role."
```

```
"Create data/findings.json with 3 sample security findings mapped to
controls. Include: finding_id, control_id, severity, description,
discovered_date, due_date, status, remediation_plan."
```

#### 6.2 Build the Core Module

```
"Build src/models.py with dataclasses for Control, Finding, and POAMEntry.
Include validation and serialization to/from JSON."
```

#### 6.3 Build the Tracker

```
"Build src/tracker.py with functions to:
- Load controls and findings from JSON files
- Query controls by family, status, or ID
- Add/update findings
- Calculate compliance percentages
Include a CLI interface using argparse."
```

#### 6.4 Build Reports

```
"Build src/reports.py to generate compliance reports in markdown format
using the data from our JSON files."
```

#### 6.5 Write Tests

```
"Write tests in tests/test_tracker.py covering the core tracker functions.
Use pytest. Include tests for loading data, querying, and calculations."
```

---

### Phase 7: Use Everything Together

Now use all the features you've set up:

```
# Use the command to check a control
/check-control AC-2

# Use the command to generate a POA&M
/gen-poam "SSH root login is enabled on web servers, violating AC-6"

# Use the skill to generate a report
/compliance-report all

# Claude will automatically use the security-reviewer agent
# when you make code changes

# Hooks will block sensitive file edits and validate JSON automatically
```

---

## Verification Checklist

- [ ] **Rules**: Claude knows the project context without being told
- [ ] **Commands**: `/check-control` and `/gen-poam` work
- [ ] **Skills**: `/compliance-report` generates a formatted report
- [ ] **Hooks**: Editing `.env` is blocked; JSON is validated after edits
- [ ] **Agents**: Security reviewer activates on code changes
- [ ] **Integration**: All features work together smoothly

## Bonus Challenges

1. Add a `/assess-control` skill that walks through assessment procedures
2. Create a `documentation-writer` agent that generates SSP sections
3. Add a hook that checks for NIST control references in code comments
4. Create a command that compares your controls against FedRAMP requirements

## Congratulations!

You've built a real project using all six Claude Code features. These same
patterns scale to production systems — the only difference is scope.
