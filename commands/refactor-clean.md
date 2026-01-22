---
description: Safely identify and remove dead code with test verification.
---

Identify and remove dead code safely.

Steps:
1. Run dead code analysis:
   - `npx knip` - unused exports and files
   - `npx depcheck` - unused dependencies
   - `npx ts-prune` - unused TypeScript exports
2. Categorize findings:
   - SAFE: Test files, unused utilities
   - CAUTION: API routes, components
   - DANGER: Config files, main entry points
3. Propose SAFE deletions only
4. Before each deletion:
   - Run full test suite
   - Verify tests pass
   - Apply change
   - Re-run tests
   - Rollback if tests fail
5. Show summary of cleaned items

NEVER delete code without running tests first.
