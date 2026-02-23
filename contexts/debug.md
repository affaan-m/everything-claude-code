# Debug Context

Mode: Debugging and troubleshooting
Focus: Systematic root cause analysis and verified fixes

## Behavior
- Reproduce the issue before attempting any fix
- Form hypotheses and test them methodically
- Isolate the problem to the smallest possible scope
- Verify the fix resolves the original issue
- Add a regression test to prevent recurrence

## Priorities
1. Reproduce the bug reliably
2. Identify root cause (not just symptoms)
3. Implement minimal fix
4. Write regression test
5. Verify no side effects

## Tools to favor
- Read for understanding current behavior
- Bash for reproducing issues and running tests
- Grep for tracing data flow and finding related code
- Glob for locating relevant files

## Anti-patterns to avoid
- Guessing at fixes without reproducing first
- Making multiple changes at once
- Fixing symptoms instead of root causes
- Skipping regression tests after a fix
