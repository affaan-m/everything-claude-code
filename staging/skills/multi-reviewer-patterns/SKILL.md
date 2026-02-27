---
name: multi-reviewer-patterns
description: Coordinate parallel code reviews across multiple quality dimensions with finding deduplication, severity calibration, and consolidated reporting. Use this skill when organizing multi-reviewer code reviews, calibrating finding severity, or consolidating review results.
version: 1.0.2
---

# Multi-Reviewer Patterns

Patterns for coordinating parallel code reviews across multiple quality dimensions, deduplicating findings, calibrating severity, and producing consolidated reports.

## When to Use This Skill

- Organizing a multi-dimensional code review
- Deciding which review dimensions to assign
- Deduplicating findings from multiple reviewers
- Calibrating severity ratings consistently
- Producing a consolidated review report

## Review Dimension Allocation

### Available Dimensions

| Dimension         | Focus                                   | When to Include                             |
| ----------------- | --------------------------------------- | ------------------------------------------- |
| **Security**      | Vulnerabilities, auth, input validation | Always for code handling user input or auth |
| **Performance**   | Query efficiency, memory, caching       | When changing data access or hot paths      |
| **Architecture**  | SOLID, coupling, patterns               | For structural changes or new modules       |
| **Testing**       | Coverage, quality, edge cases           | When adding new functionality               |
| **Accessibility** | WCAG, ARIA, keyboard nav                | For UI/frontend changes                     |

### Recommended Combinations

| Scenario               | Dimensions                                   |
| ---------------------- | -------------------------------------------- |
| API endpoint changes   | Security, Performance, Architecture          |
| Frontend component     | Architecture, Testing, Accessibility         |
| Database migration     | Performance, Architecture                    |
| Authentication changes | Security, Testing                            |
| Full feature review    | Security, Performance, Architecture, Testing |

## Finding Deduplication

When multiple reviewers report issues at the same location:

### Merge Rules

1. **Same file:line, same issue** — Merge into one finding, credit all reviewers
2. **Same file:line, different issues** — Keep as separate findings
3. **Same issue, different locations** — Keep separate but cross-reference
4. **Conflicting severity** — Use the higher severity rating
5. **Conflicting recommendations** — Include both with reviewer attribution

### Deduplication Process

```
For each finding in all reviewer reports:
  1. Check if another finding references the same file:line
  2. If yes, check if they describe the same issue
  3. If same issue: merge, keeping the more detailed description
  4. If different issue: keep both, tag as "co-located"
  5. Use highest severity among merged findings
```

## Severity Calibration

### Severity Criteria

| Severity     | Impact                                        | Likelihood             | Examples                                     |
| ------------ | --------------------------------------------- | ---------------------- | -------------------------------------------- |
| **Critical** | Data loss, security breach, complete failure  | Certain or very likely | SQL injection, auth bypass, data corruption  |
| **High**     | Significant functionality impact, degradation | Likely                 | Memory leak, missing validation, broken flow |
| **Medium**   | Partial impact, workaround exists             | Possible               | N+1 query, missing edge case, unclear error  |
| **Low**      | Minimal impact, cosmetic                      | Unlikely               | Style issue, minor optimization, naming      |

### Calibration Rules

- Security vulnerabilities exploitable by external users: always Critical or High
- Performance issues in hot paths: at least Medium
- Missing tests for critical paths: at least Medium
- Accessibility violations for core functionality: at least Medium
- Code style issues with no functional impact: Low

## Consolidated Report Template

```markdown
## Code Review Report

**Target**: {files/PR/directory}
**Reviewers**: {dimension-1}, {dimension-2}, {dimension-3}
**Date**: {date}
**Files Reviewed**: {count}

### Critical Findings ({count})

#### [CR-001] {Title}

**Location**: `{file}:{line}`
**Dimension**: {Security/Performance/etc.}
**Description**: {what was found}
**Impact**: {what could happen}
**Fix**: {recommended remediation}

### High Findings ({count})

...

### Medium Findings ({count})

...

### Low Findings ({count})

...

### Summary

| Dimension    | Critical | High  | Medium | Low   | Total  |
| ------------ | -------- | ----- | ------ | ----- | ------ |
| Security     | 1        | 2     | 3      | 0     | 6      |
| Performance  | 0        | 1     | 4      | 2     | 7      |
| Architecture | 0        | 0     | 2      | 3     | 5      |
| **Total**    | **1**    | **3** | **9**  | **5** | **18** |

### Recommendation

{Overall assessment and prioritized action items}
```
