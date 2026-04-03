---
name: unified-notifications-ops
description: Operate notifications as one ECC-native workflow across GitHub, Linear, desktop alerts, and connected communication surfaces. Use when the user needs one inbox for review requests, CI failures, issue updates, session alerts, or cross-harness operator notifications instead of disconnected raw tool calls.
origin: ECC
---

# Unified Notifications Ops

Use this skill when the real problem is notification flow design, triage, routing, or cleanup.

Do not treat notifications as isolated pings. The job is to turn scattered events into one operator system with clear priorities, channels, and follow-up actions.

## When to Use

- The user wants a unified notification lane across GitHub, Linear, desktop alerts, chat, or email
- CI failures, review requests, issue updates, and operator events are arriving in disconnected places
- The user wants to reduce noisy alerts without losing critical events
- The workspace already has hooks, MCP servers, or connected tools, but ECC lacks a clean notification workflow
- The user wants to rebuild or consolidate notification-related surfaces in ECC

## Preferred Surface

- Start from the event sources that already exist in the repo or workspace:
  - GitHub issues, PRs, reviews, and CI
  - Linear issue and project state
  - hook events and local session lifecycle signals
  - desktop notification primitives
  - connected operator tools such as email, chat, or app webhooks when they are actually available
- Prefer ECC-native orchestration over telling the user to install another notification product
- If a source exists only as a primitive, wrap it into an operator workflow instead of exposing it raw

## Non-Negotiable Rules

- Never expose secret values, webhook secrets, API keys, or internal tokens
- Separate these clearly:
  - event source
  - routing channel
  - notification payload
  - operator action
- Default to review-first and digest-first when the blast radius is unclear
- Do not recommend fan-out to every channel by default
- Notifications should create action, not just noise
- If the real fix is better issue triage, project flow, or hook policy, say so explicitly

## Operating Model

Treat the notification lane as a pipeline:

1. **Capture** the important event
2. **Classify** its urgency and owner
3. **Route** it to the right channel
4. **Collapse** duplicates and low-signal chatter
5. **Attach** the next operator action

The ideal outcome is not "more notifications." It is:

- fewer channels to monitor
- clearer escalation rules
- one canonical summary for each important event
- obvious next actions for the operator

## Event Classes

Use these default classes:

| Class | Examples | Default handling |
|----------|----------|------------------|
| Critical | production failure, blocked release, security incident, broken CI on default branch | immediate route |
| High | review requested, failing PR, stale blocker, unresolved owner handoff | notify same day |
| Medium | backlog movement, issue state change, new comments worth review | digest or queue |
| Low | noisy status churn, redundant updates, repeated success markers | suppress or fold into summary |

If the user has no severity model yet, create one before proposing automation.

## Workflow

### 1. Inventory the current notification surface

List:

- sources already producing events
- channels already used
- existing hooks or scripts that emit alerts
- duplicate paths for the same event
- silent failure cases where something important is not being surfaced

Call out whether ECC already owns part of the path. Examples:

- "GitHub PR creation is already logged, but review-failure escalation is not wrapped."
- "Desktop notifications exist, but there is no unified digest lane."

### 2. Classify what deserves interruption

Do not route everything the same way.

For each event family, decide:

- who needs to know
- how fast they need to know
- whether the event needs interruption, batching, or only audit logging

Use these defaults:

- **interrupt now** for release, CI, security, and owner-blocking events
- **digest later** for state churn, routine updates, and repeat events
- **log only** for telemetry and low-signal lifecycle markers

### 3. Collapse duplicates before adding channels

Before proposing a new lane, look for:

- the same PR event appearing in GitHub, Linear, and local logs
- repeated hook notifications for the same underlying failure
- multiple tools telling the operator the same thing in different words
- comment churn that should be summarized instead of forwarded one by one

Prefer:

- one canonical event summary
- one owner
- one primary channel
- one fallback channel

### 4. Design the ECC-native workflow

For each real notification need, define:

- **source**: where the event originates
- **gate**: what qualifies as worth surfacing
- **shape**: immediate alert, digest, queue, or dashboard-only
- **channel**: desktop, issue tracker, email draft, chat, or internal task surface
- **action**: what the operator should do next

If ECC already has the raw primitive, the default solution should be:

- a skill for repeatable operator triage
- a hook for automatic event emission or enforcement
- an agent for delegated review or classification
- an MCP or connector only when a true external bridge is missing

### 5. Return the notification design with action bias

End with a small, executable plan:

- what to keep
- what to suppress
- what to merge
- what ECC should wrap next

## Output Format

Use:

```text
CURRENT SURFACE
- sources
- channels
- obvious duplicates or gaps

EVENT MODEL
- critical
- high
- medium
- low

ROUTING PLAN
- source -> channel
- why this path is correct
- who acts on it

CONSOLIDATION
- what to suppress
- what to merge
- what should become one canonical notification

NEXT ECC MOVE
- skill / hook / agent / MCP
- exact workflow to build next
```

## Recommendation Rules

- Prefer one strong notification lane over many weak ones
- Prefer digests for medium and low-signal updates
- Prefer hooks when the signal should be emitted automatically
- Prefer operator skills when the work is triage, routing, or review-first decision-making
- Prefer `project-flow-ops` when the root cause is issue or PR coordination, not alerts
- Prefer `workspace-surface-audit` when the user first needs to know what tools are actually connected
- If desktop notifications are enough, do not invent a complex external bridge

## Good Use Cases

- "We have GitHub, Linear, and local hook alerts, but no single operator flow"
- "Our CI failures are noisy and people ignore them"
- "I want one notification policy across Claude, OpenCode, and Codex surfaces"
- "Figure out what should be an immediate alert vs a daily digest"
- "Design the ECC-native replacement for overlapping notification PRs"

## Related Skills

- `workspace-surface-audit` to inspect what sources and connectors already exist
- `project-flow-ops` when notification pain is really backlog and PR triage pain
- `google-workspace-ops` when the output channel or coordination layer lives in Google surfaces
- `customer-billing-ops` when billing events need an operator workflow, not a generic alert lane
