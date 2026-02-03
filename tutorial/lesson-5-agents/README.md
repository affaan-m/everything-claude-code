# Lesson 5: Agents — Specialized Team Members

## What Are Agents?

Agents (also called **subagents**) are **specialized AI assistants** that run in
their own isolated context. When Claude encounters a task that needs focused
expertise, it can delegate to an agent.

Think of agents as **expert team members** on a project. You (the main Claude session)
are the project lead. You don't do everything yourself — you delegate to specialists.

## Real-World Analogy

On your RMF project team, you have:

| Person | Expertise | You Ask Them... |
|--------|-----------|-----------------|
| Security Engineer | Vulnerability assessment | "Is this config secure?" |
| Compliance Officer | NIST controls, auditing | "Does this meet AC-2?" |
| DevOps Engineer | CI/CD, infrastructure | "Deploy this to staging" |
| QA Engineer | Testing | "Write tests for this module" |

Claude Code agents work the same way. Each agent has:
- A **specific role** (what they're good at)
- **Limited tools** (what they can access)
- **Isolated context** (they don't clutter your main conversation)
- A **model preference** (fast/cheap vs powerful/expensive)

## Built-In Agents

Claude Code comes with these agents pre-configured:

| Agent | Purpose | Model |
|-------|---------|-------|
| **Explore** | Search/analyze codebases quickly | Haiku (fast) |
| **Plan** | Design implementation strategies | Sonnet |
| **General-purpose** | Complex multi-step tasks | Default |
| **Bash** | Run terminal commands | Default |

## How Agents Work

### Flow

```
You ask Claude something
        ↓
Claude decides: "This needs specialized help"
        ↓
Claude launches an agent (subagent)
        ↓
Agent works in its own context with its own tools
        ↓
Agent returns results to Claude
        ↓
Claude presents results to you
```

### Key Properties

- **Isolated context**: Agents don't see your full conversation. They get a
  focused prompt and work independently.
- **Limited tools**: You control what each agent can access. A code reviewer
  might only get Read/Grep (no editing).
- **Model selection**: Use cheaper models (Haiku) for simple tasks, powerful
  models (Opus) for complex reasoning.
- **Results flow back**: The agent's output becomes part of your conversation.

## Creating Custom Agents

### Method 1: Agent Files (Persistent)

Create a `.md` file in `.claude/agents/` (project) or `~/.claude/agents/` (user).

### Method 2: Interactive

```
/agents
```

### Method 3: CLI Flag (Temporary)

```bash
claude --agents '{
  "reviewer": {
    "description": "Reviews code for security issues",
    "prompt": "You are a security code reviewer...",
    "tools": ["Read", "Grep", "Glob"],
    "model": "sonnet"
  }
}'
```

### Agent File Format

Save as `.claude/agents/security-reviewer.md`:

```yaml
---
name: security-reviewer
description: >
  Reviews code for security vulnerabilities and compliance issues.
  Use proactively after code changes or when security review is needed.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(grep *)
  - Bash(find *)
model: sonnet
---

# Security Code Reviewer

You are a senior security engineer reviewing code for an RMF project
operating under NIST SP 800-53 Rev 5, FedRAMP Moderate baseline.

## Your Review Checklist

### 1. Authentication & Access Control (AC family)
- Check for hardcoded credentials
- Verify access control enforcement
- Look for missing authentication checks

### 2. Audit & Accountability (AU family)
- Verify sensitive operations are logged
- Check that logs don't contain secrets
- Ensure log integrity protections

### 3. System & Communications Protection (SC family)
- Verify encryption in transit (TLS)
- Check encryption at rest
- Look for insecure protocols

### 4. System & Information Integrity (SI family)
- Check input validation
- Look for injection vulnerabilities
- Verify error handling doesn't leak info

## Output Format

For each finding:
| Severity | Control | File:Line | Issue | Fix |
|----------|---------|-----------|-------|-----|

End with an overall risk rating: LOW / MODERATE / HIGH / CRITICAL
```

## More Agent Examples for System Engineers

### Compliance Assessor Agent

Save as `.claude/agents/compliance-assessor.md`:

```yaml
---
name: compliance-assessor
description: >
  Assesses code and configurations against NIST 800-53 controls.
  Use when evaluating compliance posture or preparing for audits.
allowed-tools:
  - Read
  - Grep
  - Glob
model: opus
---

# Compliance Assessor

You are an independent security assessor evaluating a federal information
system for NIST SP 800-53 Rev 5 compliance.

## Assessment Methodology

1. **Examine**: Read the implementation artifacts
2. **Interview**: Ask clarifying questions about the implementation
3. **Test**: Suggest tests to verify control effectiveness

## For Each Control Assessed

- **Control ID**: e.g., AC-2
- **Determination**: Satisfied / Other Than Satisfied / Not Applicable
- **Depth**: Basic / Focused / Comprehensive
- **Evidence**: What artifacts support this determination
- **Findings**: Any deficiencies identified
- **Recommendations**: How to improve

## Assessment Standards

- Be objective and evidence-based
- If you can't determine compliance from artifacts, say so
- Reference specific file locations as evidence
- Distinguish between documentation gaps vs actual implementation gaps
```

### Infrastructure Auditor Agent

Save as `.claude/agents/infra-auditor.md`:

```yaml
---
name: infra-auditor
description: >
  Audits infrastructure-as-code (Terraform, Ansible, CloudFormation)
  for security and compliance. Use when reviewing infrastructure changes.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(terraform *)
model: sonnet
---

# Infrastructure Auditor

Review infrastructure-as-code for:

1. **Security**: Encryption, network isolation, access controls
2. **Compliance**: CIS Benchmarks, NIST controls
3. **Cost**: Unnecessarily expensive resources
4. **Reliability**: Single points of failure, backup configs
5. **Tagging**: Required tags present (Name, Environment, Owner, System)

## Check Categories

### Network Security
- Security groups/NACLs too permissive?
- Public access where not needed?
- VPC flow logs enabled?

### Data Protection
- Encryption at rest enabled?
- Encryption in transit enforced?
- Backup retention adequate?

### Access Management
- IAM roles follow least privilege?
- No inline policies?
- MFA delete on S3 buckets?

### Logging
- CloudTrail enabled?
- VPC flow logs enabled?
- Access logging on load balancers?

Output a scored report: each category gets a 1-5 rating.
```

### Test Writer Agent

Save as `.claude/agents/test-writer.md`:

```yaml
---
name: test-writer
description: >
  Writes unit and integration tests for code changes.
  Use after implementing features or fixing bugs.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - Bash(pytest *)
  - Bash(python *)
model: sonnet
---

# Test Writer

Write comprehensive tests for the given code. Follow these principles:

1. **Arrange-Act-Assert** pattern for all tests
2. **Test names**: `test_<function>_<scenario>_<expected_result>`
3. **Coverage targets**: Cover happy path, edge cases, error cases
4. **No mocking internals**: Only mock external dependencies
5. **Deterministic**: No random data, no time-dependent assertions

## Test Categories

- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test component interactions
- **Security tests**: Test authentication, authorization, input validation
- **Compliance tests**: Test that audit logging works, access controls enforce

## Output

1. Write the test file
2. Run the tests to verify they pass
3. Report coverage numbers
```

---

## How Claude Decides Which Agent to Use

Claude reads the `description` field of each agent. When your request matches
an agent's description, Claude delegates to it.

You can influence this:
- **"Use proactively"** in the description = Claude uses it without being asked
- **Specific triggers** = "Use when the user asks for a code review"
- **Broad triggers** = "Use for any security-related question"

---

## Exercises

### Exercise 1: Use a Built-In Agent

See `exercises/exercise-1-builtin-agents.md`

### Exercise 2: Create a Custom Agent

See `exercises/exercise-2-custom-agent.md`

### Exercise 3: Multi-Agent Orchestration

See `exercises/exercise-3-orchestration.md`

---

## Tips

- **Read-only agents are safe**: Agents with only Read/Grep/Glob can't modify
  anything. Great for review tasks.
- **Model matters**: Use `haiku` for quick lookups, `sonnet` for moderate tasks,
  `opus` for complex reasoning.
- **Description is the trigger**: Write descriptions like you're explaining when
  to call this expert. Be specific about situations.
- **Don't over-agent**: If a task is simple, Claude handles it directly. Agents
  add overhead (context switching). Use them for tasks that benefit from isolation
  or specialization.

## What's Next?

In **Lesson 6**, you'll learn about **MCPs (Model Context Protocol)** — connectors
that give Claude access to external services like GitHub, databases, and monitoring
tools. Agents are Claude's team; MCPs are their tools.
