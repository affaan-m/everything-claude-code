# Parallel Task Analysis Rules

## Purpose
Provide a consistent way to identify implementation tasks that can be safely executed in parallel while generating `tasks.md`.

## When to Consider Tasks Parallel
Only mark a task as parallel-capable when **all** of the following are true:

1. **No data dependency** on pending tasks.
2. **No conflicting files or shared mutable resources** are touched.
3. **No prerequisite review/approval** from another task is required beforehand.
4. **Environment/setup work** needed by this task is already satisfied or covered within the task itself.

## Marking Convention
- Append `(P)` immediately after the numeric identifier for each qualifying task.
  - Example: `- [ ] 2.1 (P) Build background worker for emails`
- Apply `(P)` to both major tasks and sub-tasks when appropriate.
- If sequential execution is requested (e.g. via `--sequential` flag), omit `(P)` markers entirely.
- Keep `(P)` **outside** of checkbox brackets to avoid confusion with completion state.

## Grouping & Ordering Guidelines
- Group parallel tasks under the same parent whenever the work belongs to the same theme.
- List obvious prerequisites or caveats in the detail bullets (e.g., "Requires schema migration from 1.2").
- When two tasks look similar but are not parallel-safe, call out the blocking dependency explicitly.
- Skip marking container-only major tasks (those without their own actionable detail bullets) with `(P)`—evaluate parallel execution at the sub-task level instead.

## Quality Checklist
Before marking a task with `(P)`, ensure you have:

- Verified that running this task concurrently will not create merge or deployment conflicts.
- Captured any shared state expectations in the detail bullets.
- Confirmed that the implementation can be tested independently.

If any check fails, **do not** mark the task with `(P)` and explain the dependency in the task details.
