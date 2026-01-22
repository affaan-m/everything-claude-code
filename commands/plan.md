---
description: Create implementation plan and WAIT for user confirmation before coding.
---

# /plan

Invokes the **planner** agent.

## When to Use

- Starting a new feature
- Significant architectural changes
- Complex refactoring
- Multiple files affected
- Unclear requirements

## What It Does

1. Restate requirements clearly
2. Break down into phases with specific steps
3. Identify dependencies and risks
4. **WAIT for user confirmation before coding**

## Example

```
/plan I need to add real-time notifications when markets resolve

Agent output:
# Plan: Real-Time Notifications

## Phases
1. Database schema (notifications table)
2. Notification service with queue
3. Integration with market resolution
4. Frontend components

## Risks
- HIGH: Email deliverability
- MEDIUM: Performance at scale

**WAITING FOR CONFIRMATION**: Proceed? (yes/no/modify)
```

## Responses

- "yes" / "proceed" → Start implementation
- "modify: [changes]" → Revise plan
- "no" → Cancel

See `agents/planner.md` for details.
