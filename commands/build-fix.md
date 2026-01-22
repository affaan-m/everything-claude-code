---
description: Incrementally fix TypeScript and build errors.
---

Fix TypeScript and build errors incrementally.

Steps:
1. Run build: `npm run build` or `pnpm build`
2. Parse error output, group by file, sort by severity
3. For each error:
   - Show error context (5 lines before/after)
   - Explain the issue
   - Propose and apply fix
   - Re-run build
   - Verify error resolved
4. Stop if:
   - Fix introduces new errors
   - Same error persists after 3 attempts
   - User requests pause
5. Show summary: errors fixed, remaining, new errors introduced

Fix one error at a time for safety.
