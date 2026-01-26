---
description: PostgreSQL planning for kernel/extension changes.
---

# /plan

Planning command for PostgreSQL kernel or extension work. Invokes the `planner` agent.

## Use When

- Adding kernel functionality or touching core modules
- Designing extension features or upgrade paths
- Modifying lock/WAL/memory-context semantics
- Changing catalog or cache behavior

## Output

1. Requirement summary and module mapping
2. Step-by-step plan with file paths
3. Regression and performance test checklist
4. Compatibility risks and mitigations

## Example

```
/plan Add a new stats view to the extension, support PG14-17
```

## Note

The plan must be approved before any code changes.
