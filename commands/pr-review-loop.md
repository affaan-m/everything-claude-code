# PR Review Loop

Automate the full PR lifecycle: push, create PR, wait for AI reviews, triage comments, fix, re-push, merge.

## Arguments

$ARGUMENTS can be:
- `(empty)` - Base branch = `main`
- `<branch-name>` - Custom base branch
- `--skip-create` - Assume PR already exists
- `--no-merge` - Stop after reviews are clean, don't merge

## Phase 0: Pre-flight

1. Run `gh auth status` — STOP if not authenticated
2. Detect current branch and repo: `git rev-parse --abbrev-ref HEAD`, `gh repo view --json nameWithOwner -q .nameWithOwner`
3. STOP with error if:
   - On `main` or `master`
   - Worktree is dirty (`git status --porcelain` is non-empty)
   - No commits ahead of base (`git log <base>..HEAD --oneline` is empty)
4. Show summary to user:
   ```
   REPO:   owner/repo
   BRANCH: feature-branch
   BASE:   main
   AHEAD:  3 commits
   ```
5. Ask user to confirm before proceeding

## Phase 1: Push & Create PR

1. `git push -u origin <branch>`
2. Check if PR exists: `gh pr view --json number,url 2>/dev/null`
   - If exists: report URL, continue
   - If `--skip-create` flag: STOP with error if no PR exists
   - Otherwise: `gh pr create --fill --base <base>` — report URL
3. Store PR number for later phases

## Phase 2: Wait for Reviews

1. Run `gh pr checks <number> --watch` — blocks until CI completes
   - If CI fails: report failing checks and STOP (user must fix CI manually)
2. Wait 30 seconds for review bots to post comments
3. Fetch review comments:
   ```
   gh api repos/{owner}/{repo}/pulls/{number}/reviews
   gh api repos/{owner}/{repo}/pulls/{number}/comments
   ```
4. If zero comments with actionable content → skip to Phase 5
5. Otherwise → proceed to Phase 3

## Phase 3: Triage Comments

Classify each review comment as **ACTIONABLE** or **SKIP**.

**ACTIONABLE** — fix these:
- Bugs, logic errors, off-by-one
- Security vulnerabilities
- Missing error handling
- Incorrect API usage
- Real performance issues

**SKIP** — ignore these:
- Style nitpicks (naming preferences, formatting)
- Requests to add unnecessary docs/comments/docstrings
- Suggestions that contradict project CLAUDE.md rules
- Overly cautious suggestions with no real risk
- Duplicate comments (same issue flagged by multiple reviewers)

Present triage table to user:

```
TRIAGE (iteration N):

| # | Action     | Reviewer | Comment Summary              | File:Line        |
|---|------------|----------|------------------------------|------------------|
| 1 | ACTIONABLE | copilot  | Missing null check on resp   | src/api.ts:42    |
| 2 | ACTIONABLE | claude   | SQL injection in query param | src/db.ts:18     |
| 3 | SKIP       | copilot  | Add JSDoc to helper fn       | src/utils.ts:7   |
| 4 | SKIP       | claude   | Consider renaming variable   | src/api.ts:55    |
```

**WAIT for user to confirm or override** before fixing anything.

## Phase 4: Fix, Commit, Push

1. For each confirmed ACTIONABLE comment:
   - Read the file at the referenced location
   - Apply the fix
   - Verify the fix doesn't break build/types
2. Stage and commit: `git add -A && git commit -m "pr-review: fix iteration N"`
3. `git push`
4. Increment iteration counter
5. Loop back to Phase 2

## Phase 5: Merge & Cleanup

1. Verify: `gh pr checks <number>` all pass
2. Verify: no unresolved review comments remain
3. If `--no-merge` flag: report clean status and STOP
4. Ask user to confirm merge
5. Execute:
   ```
   gh pr merge <number> --squash --delete-branch
   git checkout <base>
   git pull
   ```
6. Delete local branch if it still exists: `git branch -D <branch> 2>/dev/null`
7. Final report:
   ```
   MERGED: PR #<number>
   ITERATIONS: N
   COMMENTS FIXED: X
   COMMENTS SKIPPED: Y
   ```

## Stop Conditions

STOP the loop and alert user if any of these occur:
- **5+ iterations** — reviewers and fixes are ping-ponging
- **Same comment unchanged after 2 fix attempts** — fix isn't addressing the concern
- **Merge conflict** — needs manual resolution
- **Unrelated CI failure** — not caused by review fixes
- **User says `abort`** — immediate stop, no cleanup
