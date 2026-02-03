# Lesson 3: Skills — Reusable Workflows With Superpowers

## What Are Skills?

Skills are the **evolution of commands**. While commands are simple text files that
give Claude instructions, Skills add:

- **Auto-detection**: Claude can activate them automatically when relevant
- **Supporting files**: Include templates, schemas, scripts alongside the skill
- **Isolation**: Skills can run in their own context (forked subagent)
- **Configuration**: Fine-grained control over tools, models, and invocation
- **Dynamic context**: Pull in live data before executing

Think of skills as **reusable playbooks**. A command says "do this thing." A skill
says "here's a complete workflow for this type of situation."

## Real-World Analogy

As a system engineer, you follow runbooks:

- **Incident Response Runbook**: Step-by-step procedure for handling incidents
- **Change Management Playbook**: How to submit, review, approve changes
- **Audit Preparation Guide**: What to collect and verify before an assessment

Skills are digital runbooks that Claude follows automatically.

## Skill vs Command: What's the Difference?

| Feature | Command | Skill |
|---------|---------|-------|
| File location | `.claude/commands/name.md` | `.claude/skills/name/SKILL.md` |
| Auto-activate | No | Yes (via description) |
| Supporting files | No | Yes (templates, configs) |
| Run in isolation | No | Yes (with `context: fork`) |
| Control invocation | Always manual | Manual, auto, or both |
| Tool restrictions | No | Yes (with `allowed-tools`) |

## How Skills Work

### Basic Skill Structure

```
.claude/skills/
└── my-skill/
    ├── SKILL.md          # The main skill definition (required)
    ├── template.json     # Supporting file (optional)
    ├── checklist.md      # Supporting file (optional)
    └── schema.yaml       # Supporting file (optional)
```

### SKILL.md Anatomy

```yaml
---
name: vulnerability-scan
description: >
  Analyze code for security vulnerabilities. Use when reviewing code changes,
  when the user mentions security, or when preparing for a security assessment.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(grep *)
  - Bash(find *)
---

# Vulnerability Scan Workflow

When scanning code for vulnerabilities:

1. **Identify the scope**: What files or directories to scan
2. **Check OWASP Top 10**: Look for each category
3. **Check hardcoded secrets**: Scan for API keys, passwords, tokens
4. **Check dependencies**: Look for known vulnerable packages
5. **Report findings**: Use the template below

## Finding Template

| # | Severity | Category | File:Line | Description | Fix |
|---|----------|----------|-----------|-------------|-----|
```

### Frontmatter Options Explained

```yaml
---
# Required
name: my-skill           # Becomes /my-skill command

# Important
description: >           # When should Claude auto-activate this?
  Describe the situations when this skill is relevant.
  Claude reads this to decide if it should load the skill.

# Optional controls
disable-model-invocation: true    # Only YOU can trigger it (not Claude)
user-invocable: false             # Only CLAUDE can trigger it (background)
context: fork                     # Run in isolated subagent
allowed-tools:                    # Restrict available tools
  - Read
  - Grep
  - Glob
argument-hint: "[file or directory]"  # Help text for arguments
---
```

## Creating Skills Step by Step

### Step 1: Decide the Workflow

What repetitive task do you do that follows a pattern? Examples:
- Reviewing pull requests
- Writing test cases
- Checking compliance
- Generating documentation

### Step 2: Create the Skill Directory

```bash
mkdir -p .claude/skills/my-workflow
```

### Step 3: Write SKILL.md

Define the workflow with clear steps, templates, and examples.

### Step 4: Add Supporting Files (Optional)

Templates, schemas, checklists — anything the skill references.

### Step 5: Test It

```
/my-workflow           # Manual invocation
# OR just work normally — Claude will auto-detect when relevant
```

---

## Example Skills for System Engineers

### Example 1: Change Request Generator

```
.claude/skills/change-request/
├── SKILL.md
└── template.json
```

`SKILL.md`:
```yaml
---
name: change-request
description: >
  Generate a change request document. Use when the user wants to submit a
  change, modify infrastructure, update configurations, or deploy new code.
argument-hint: "[description of the change]"
---

# Change Request Generator

Generate a formal change request using the template in @template.json.

## Required Information

Gather or infer the following:
1. **Change Title**: Brief description
2. **Change Type**: Standard / Normal / Emergency
3. **Risk Level**: Low / Medium / High
4. **Impact**: What systems/users are affected
5. **Rollback Plan**: How to undo if it fails
6. **Testing Plan**: How to verify success
7. **Approval Required**: Based on risk level

## Output

Produce the change request in both:
- Formatted markdown for review
- JSON matching the template schema
```

`template.json`:
```json
{
  "changeRequest": {
    "id": "CR-YYYY-NNNN",
    "title": "",
    "type": "Standard|Normal|Emergency",
    "requestedBy": "",
    "date": "",
    "riskLevel": "Low|Medium|High",
    "description": "",
    "justification": "",
    "affectedSystems": [],
    "impactAssessment": "",
    "implementationPlan": [],
    "rollbackPlan": [],
    "testingPlan": [],
    "approvals": {
      "technicalReview": { "name": "", "date": "", "status": "Pending" },
      "securityReview": { "name": "", "date": "", "status": "Pending" },
      "cabApproval": { "name": "", "date": "", "status": "Pending" }
    }
  }
}
```

### Example 2: Incident Response Skill

```yaml
---
name: incident-response
description: >
  Guide through incident response procedures. Use when the user reports a
  security incident, system outage, data breach, or abnormal behavior.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(grep *)
  - Bash(tail *)
  - Bash(ps *)
  - Bash(netstat *)
---

# Incident Response Workflow

## Phase 1: Identification
- What is the nature of the incident?
- When was it detected?
- What systems are affected?
- What is the current impact?

## Phase 2: Containment
- Immediate actions to stop the spread
- Preserve evidence (logs, screenshots, memory dumps)
- Isolate affected systems if needed

## Phase 3: Investigation
- Review logs for indicators of compromise
- Check for unauthorized access
- Determine the root cause
- Assess the scope

## Phase 4: Documentation
Generate an incident report with:
- Timeline of events
- Root cause analysis
- Impact assessment
- Remediation steps taken
- Lessons learned
- Follow-up action items with owners

## NIST 800-53 Controls Referenced
- IR-4: Incident Handling
- IR-5: Incident Monitoring
- IR-6: Incident Reporting
- IR-8: Incident Response Plan
```

### Example 3: Skill with Dynamic Context

```yaml
---
name: deployment-check
description: >
  Pre-deployment verification checklist. Use before any deployment to
  staging or production environments.
context: fork
---

## Current State
- Git status: !`git status --short`
- Current branch: !`git branch --show-current`
- Last 3 commits: !`git log --oneline -3`
- Uncommitted changes: !`git diff --stat`

## Pre-Deployment Checklist

Based on the current state above:

1. [ ] All changes committed and pushed
2. [ ] Branch is up to date with main
3. [ ] Tests pass locally
4. [ ] No hardcoded secrets in diff
5. [ ] Database migrations are included
6. [ ] Documentation updated if needed
7. [ ] Rollback procedure documented
8. [ ] Change request approved (if required)

Evaluate each item and report the results.
```

The `!`backtick`` syntax runs a command and injects its output into the skill
before Claude sees it. This gives Claude live context.

---

## Exercises

### Exercise 1: Create Your First Skill

See `exercises/exercise-1-first-skill/` for a guided walkthrough.

### Exercise 2: Skill with Supporting Files

See `exercises/exercise-2-skill-with-templates/` for a skill that includes
a template file.

### Exercise 3: Auto-Detecting Skill

See `exercises/exercise-3-auto-detect/` for a skill that Claude activates
automatically without you typing a command.

---

## Tips

- **Description is key**: The description determines when Claude auto-activates
  the skill. Write it like "Use when [situation]."
- **Start simple**: Begin with just a SKILL.md. Add supporting files later.
- **Use `context: fork`** for skills that explore or read many files — this
  keeps your main conversation clean.
- **Test the auto-detection**: Work normally and see if Claude picks up the skill
  when relevant. Adjust the description if it doesn't.

## What's Next?

In **Lesson 4**, you'll learn about **Hooks** — automated actions that run at
specific points in Claude's workflow. While skills are things Claude *can* do,
hooks are things that *always* happen.
