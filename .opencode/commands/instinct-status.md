---
description: View learned instincts with confidence scores
agent: build
---

# Instinct Status Command

Display learned instincts and their confidence scores: $ARGUMENTS

## Your Task

Read and display instincts from the continuous-learning-v2 system.

## Instinct Location

Global: `~/.claude/instincts/`
Project: `.claude/instincts/`

## Status Display

### Instinct Summary

| Category | Count | Avg Confidence |
|----------|-------|----------------|
| Coding | X | 0.XX |
| Testing | X | 0.XX |
| Security | X | 0.XX |
| Git | X | 0.XX |

### High Confidence Instincts (>0.8)

```
[trigger] → [action] (confidence: 0.XX)
```

### Learning Progress

- Total instincts: X
- This session: X
- Promoted to skills: X

### Recent Instincts

Last 5 instincts learned:

1. **[timestamp]** - [trigger] → [action]
2. **[timestamp]** - [trigger] → [action]
...

## Instinct Structure

```json
{
  "id": "instinct-123",
  "trigger": "When I see a try-catch without specific error type",
  "action": "Suggest using specific error types for better handling",
  "confidence": 0.75,
  "applications": 5,
  "successes": 4,
  "source": "session-observation",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Confidence Calculation

```
confidence = (successes + 1) / (applications + 2)
```

Bayesian smoothing ensures new instincts don't have extreme confidence.

---

**TIP**: Use `/evolve` to cluster related instincts into skills when confidence is high.
