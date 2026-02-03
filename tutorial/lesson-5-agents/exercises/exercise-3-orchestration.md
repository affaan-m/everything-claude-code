# Exercise 3: Multi-Agent Orchestration

## Goal

Understand how Claude can delegate to multiple agents for a complex task.

## Concept

For complex tasks, Claude can use multiple agents in sequence or parallel:

```
Your Request: "Implement user session timeout and review it"
        ↓
Claude (Project Lead):
  ├── Agent 1 (Explore): "Find how sessions work currently"
  ├── Agent 2 (Plan): "Design the timeout implementation"
  ├── Claude: Implements the code
  └── Agent 3 (Security Reviewer): "Review the implementation"
        ↓
Final Answer to You
```

## Try It

### Scenario: Security Feature Implementation + Review

Ask Claude:

```
"I need to implement automatic session timeout after 15 minutes of
inactivity. First plan the approach, then implement it, then review
the implementation for security issues. This needs to comply with
AC-11 (Session Lock) and AC-12 (Session Termination)."
```

Watch how Claude:
1. Uses the **Plan** agent to design the approach
2. Implements the code itself
3. Uses a **review agent** to check the implementation

### Scenario: Cross-Cutting Analysis

If you have the agents from the other exercises set up:

```
"Audit this entire project. Check the code for security issues,
the configs for hardening problems, and the infrastructure for
compliance gaps. Give me a unified report."
```

Claude should delegate different parts to different agents.

## Creating an Orchestration Command

You can create a skill that explicitly orchestrates agents.

Save as `.claude/skills/full-audit/SKILL.md`:

```yaml
---
name: full-audit
description: >
  Run a comprehensive audit using multiple specialized agents.
  Use when the user requests a full audit, comprehensive review,
  or pre-assessment check.
---

# Full Audit Orchestration

Run a comprehensive audit in these phases:

## Phase 1: Code Security Review
Delegate to the security-reviewer agent to scan source code.

## Phase 2: Configuration Audit
Delegate to the config-auditor agent to check all config files.

## Phase 3: Compliance Mapping
Map all findings to NIST 800-53 controls.

## Phase 4: Unified Report

Compile results into:
1. **Executive Summary**: Overall risk posture
2. **Critical Findings**: Must-fix issues (with controls)
3. **Moderate Findings**: Should-fix issues
4. **Low Findings**: Nice-to-fix issues
5. **Compliance Gaps**: Controls not fully satisfied
6. **Recommendations**: Prioritized action plan
```

## Reflection

1. How does agent orchestration compare to a real audit team?
2. What are the advantages of having isolated contexts per agent?
3. When would you use sequential vs parallel agent execution?
