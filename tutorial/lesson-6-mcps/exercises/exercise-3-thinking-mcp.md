# Exercise 3: Sequential Thinking MCP

## Goal

Set up the Sequential Thinking MCP, which helps Claude break down complex
problems into structured reasoning steps.

## Why This Matters

For complex system engineering decisions — like designing a security
architecture, planning a migration, or assessing risk — Claude benefits
from structured thinking. The Sequential Thinking MCP forces Claude to
think step-by-step instead of jumping to conclusions.

## Step 1: Install

```bash
claude mcp add --transport stdio thinking -- \
  npx -y @anthropic/mcp-sequential-thinking
```

## Step 2: Try a Complex Problem

Start Claude Code and present a complex scenario:

```
"I need to migrate our application from an on-prem data center to
AWS GovCloud while maintaining our FedRAMP Moderate authorization.

Consider:
- Current architecture: 3-tier web app (nginx, Django, PostgreSQL)
- 200+ NIST controls currently satisfied
- Zero downtime requirement
- Data sovereignty requirements
- Current ATO expires in 6 months

Help me think through this systematically."
```

Watch how Claude uses the thinking MCP to break this down into
structured steps rather than giving a monolithic answer.

## Step 3: Another Example

```
"A vulnerability scanner found CVE-2024-XXXX in our web framework.
The CVE has a CVSS score of 8.1 (High). The affected component handles
user authentication.

Think through the incident response and risk decision:
- Should we patch immediately or wait for the next maintenance window?
- What's the blast radius if exploited?
- What compensating controls do we have?
- How does this affect our ATO?"
```

## Verification

- [ ] Claude breaks down problems into numbered steps
- [ ] Each step builds on the previous one
- [ ] The reasoning is transparent and reviewable
- [ ] Complex decisions include trade-off analysis
- [ ] The final recommendation is well-supported

## When to Use This

- Architecture decisions
- Risk assessments
- Migration planning
- Incident analysis
- Trade-off evaluations
- Any decision that affects multiple stakeholders
