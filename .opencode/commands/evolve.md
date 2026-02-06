---
description: Cluster instincts into skills
agent: build
---

# Evolve Command

Cluster related instincts into structured skills: $ARGUMENTS

## Your Task

Analyze instincts and promote clusters to skills.

## Evolution Process

### Step 1: Analyze Instincts

Group instincts by:
- Trigger similarity
- Action patterns
- Category tags
- Confidence levels

### Step 2: Identify Clusters

```
Cluster: Error Handling
├── Instinct: Catch specific errors (0.85)
├── Instinct: Wrap errors with context (0.82)
├── Instinct: Log errors with stack trace (0.78)
└── Instinct: Return meaningful error messages (0.80)
```

### Step 3: Generate Skill

When cluster has:
- 3+ instincts
- Average confidence > 0.75
- Cohesive theme

Generate SKILL.md:

```markdown
# Error Handling Skill

## Overview
Patterns for robust error handling learned from session observations.

## Patterns

### 1. Catch Specific Errors
**Trigger**: When catching errors with generic catch
**Action**: Use specific error types

### 2. Wrap Errors with Context
**Trigger**: When re-throwing errors
**Action**: Add context with fmt.Errorf or Error.cause

### 3. Log with Stack Trace
**Trigger**: When logging errors
**Action**: Include stack trace for debugging

### 4. Meaningful Messages
**Trigger**: When returning errors to users
**Action**: Provide actionable error messages
```

### Step 4: Archive Instincts

Move evolved instincts to `archived/` with reference to skill.

## Evolution Report

```
Evolution Summary
=================

Clusters Found: X

Cluster 1: Error Handling
- Instincts: 5
- Avg Confidence: 0.82
- Status: ✅ Promoted to skill

Cluster 2: Testing Patterns
- Instincts: 3
- Avg Confidence: 0.71
- Status: ⏳ Needs more confidence

Cluster 3: Git Workflow
- Instincts: 2
- Avg Confidence: 0.88
- Status: ⏳ Needs more instincts

Skills Created:
- skills/error-handling/SKILL.md

Instincts Archived: 5
Remaining Instincts: 12
```

## Thresholds

| Metric | Threshold |
|--------|-----------|
| Min instincts per cluster | 3 |
| Min average confidence | 0.75 |
| Min cluster cohesion | 0.6 |

---

**TIP**: Run `/evolve` periodically to graduate instincts to skills as confidence grows.
