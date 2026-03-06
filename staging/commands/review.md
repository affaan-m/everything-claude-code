# Review

**Purpose:** Quick review of recent code changes. Find what's wrong, prove what's right.

**Mindset:** Your confidence is not evidence. Compiling is not working. "Looks fine" is not verified.

---

## Step 1: Auto-Detect Scope

Determine what to review without asking:

```bash
git diff --cached --stat          # Staged changes
git diff --stat                   # Unstaged changes
git log --oneline main..HEAD      # Branch diff
git show --stat HEAD              # Last commit
```

Pick the first non-empty result. Tell the user what scope you detected.

## Step 2: Read Every Changed File

Read the FULL file, not just the diff. Understand context. Check imports, callers, and call sites.

## Step 3: Hunt for Issues

For each changed function or block:

- What happens if inputs are null, undefined, empty, negative, or absurdly large?
- What happens if this throws? Is the error caught? Does the caller handle it?
- Race conditions under concurrent access?
- Malicious input? SQL injection, XSS, command injection?
- Consistent with the rest of the codebase?

### Red Flags to Hunt

```typescript
const data = response as UserData;          // Type assertion hiding issues
const user = getUser()!;                    // Non-null assertion without justification
try { riskyOp() } catch (e) { }            // Swallowing errors
query(`SELECT * FROM users WHERE id = ${userId}`);  // String interpolation in queries
function process(data: any) { ... }         // Untyped escape hatch
await db.users.update(id, req.body);        // Mass assignment from request body
```

## Step 4: Report

```markdown
## Review: [scope description]

### Critical (must fix)
- **file:line** -- [description]
  Impact: [what breaks] | Fix: [concrete fix]

### Important (should fix)
- **file:line** -- [description]

### Minor (nice to fix)
- **file:line** -- [description]

### Verified Correct
- [What you checked and confirmed works, with evidence]

### Not Reviewed
- [What was out of scope]
```

---

## After Review

If issues found: "Should I fix these now?" -- fix one by one, re-verify each.
If no issues: State what was verified and how. Never claim "no issues" without evidence.

For formal quality gate before merging: use `/ship`
For deep codebase health check: use `/audit`
