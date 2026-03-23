---
name: git-workflow
description: Git branching strategies, conventional commits, PR workflow, and merge patterns for team collaboration. Use when managing branches, writing commit messages, or reviewing PR processes.
origin: ECC
---

# Git Workflow

Best practices for branching, committing, and collaborating with Git in production environments.

## When to Activate

- Setting up a new project's Git workflow
- Writing commit messages
- Creating or reviewing pull requests
- Resolving merge conflicts
- Choosing a branching strategy
- Managing releases and tags

## Branching Strategies

### Trunk-Based Development (Recommended for CI/CD)

```
main (always deployable)
 ├── feat/add-login         # short-lived, < 2 days
 ├── fix/null-pointer       # short-lived
 └── chore/update-deps      # short-lived
```

- All branches merge directly into `main`
- Branches live for hours to days, not weeks
- Feature flags gate incomplete work
- Best for teams with strong CI/CD pipelines

### GitHub Flow (Simple teams)

```
main
 └── feature/my-feature → PR → main
```

- One long-lived branch (`main`)
- Deploy from `main` after every merge
- Simple, easy to understand

### GitFlow (Scheduled releases)

```
main          ← production
develop       ← integration
 ├── feature/x
 ├── release/1.2.0
 └── hotfix/critical-bug
```

- Use when releases are scheduled (mobile apps, versioned libraries)
- Heavier process — only worth it for release trains

## Branch Naming

```
<type>/<short-description>
<type>/<ticket-id>-<short-description>
```

| Type | When to Use |
|------|-------------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code restructure, no behavior change |
| `docs/` | Documentation only |
| `test/` | Adding or fixing tests |
| `chore/` | Maintenance (deps, config) |
| `ci/` | CI/CD pipeline changes |
| `hotfix/` | Urgent production fix |

```bash
git checkout -b feat/user-authentication
git checkout -b fix/ENG-123-null-pointer-login
git checkout -b chore/upgrade-node-20
```

## Conventional Commits

Format: `<type>(<scope>): <description>`

```
feat(auth): add OAuth2 login with Google
fix(api): handle null user in session middleware
refactor(db): extract query builder to separate module
docs(readme): add Docker setup instructions
test(auth): add unit tests for token refresh
chore(deps): upgrade eslint to v9
ci(github): add automated security scanning
perf(search): cache frequent queries in Redis
```

### Rules

- **type**: lowercase, from the allowed list
- **scope**: optional, the module/area affected
- **description**: imperative mood, lowercase, no period
- **body**: explain *why*, not *what* (the diff shows what)
- **breaking change**: add `!` after type or `BREAKING CHANGE:` in footer

```bash
# Breaking change
feat(api)!: rename /users endpoint to /accounts

# With body and footer
fix(auth): prevent token replay attacks

Tokens were not invalidated after password reset, allowing
reuse of old tokens for up to 24 hours.

Closes #412
BREAKING CHANGE: existing sessions are invalidated on deploy
```

### Allowed Types

```
feat     - new feature
fix      - bug fix
docs     - documentation only
style    - formatting, no logic change
refactor - restructure without behavior change
perf     - performance improvement
test     - add/fix tests
chore    - maintenance, dependencies
ci       - CI/CD changes
build    - build system changes
revert   - revert a previous commit
```

## Pull Request Workflow

### Before Opening a PR

```bash
# 1. Rebase on latest main (preferred over merge)
git fetch origin
git rebase origin/main

# 2. Run tests and linting
npm test && npm run lint

# 3. Review your own diff
git diff origin/main...HEAD

# 4. Squash fixup commits (optional)
git rebase -i origin/main
```

### PR Title & Description

```markdown
## Summary
- What changed and why (not just what the diff shows)
- Link to ticket/issue

## Test Plan
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual test: describe scenario

## Screenshots (if UI change)
```

### PR Size Guidelines

| Size | Lines Changed | Review Time |
|------|--------------|-------------|
| Tiny | < 50 | Minutes |
| Small | 50–200 | < 1 hour |
| Medium | 200–500 | Few hours |
| Large | > 500 | Split it up |

Keep PRs small. Large PRs get rubber-stamped or block the team.

## Merge Strategies

### Squash Merge (Default for feature branches)
```bash
gh pr merge --squash
```
- Collapses all commits into one clean commit on `main`
- Best for feature branches with noisy intermediate commits
- PR title becomes the commit message — make it good

### Rebase Merge (Clean linear history)
```bash
gh pr merge --rebase
```
- Replays branch commits onto `main`
- Preserves individual commits — each must be clean
- Best when every commit tells a meaningful story

### Merge Commit (Preserve context)
```bash
gh pr merge --merge
```
- Creates a merge commit; branch history is visible
- Best for long-running branches (release, hotfix)
- Avoid for routine feature work — clutters history

## Conflict Resolution

```bash
# Update branch with latest main
git fetch origin
git rebase origin/main

# If conflicts arise during rebase
git status                    # see conflicted files
# Edit files to resolve conflicts
git add <resolved-file>
git rebase --continue

# Abort if needed
git rebase --abort
```

### Resolution Principles

1. Talk to the author of the conflicting code before guessing intent
2. Prefer `rebase` over `merge` for branch updates (cleaner history)
3. After resolving, re-run tests — merges break things silently

## Tagging & Releases

```bash
# Semantic version tag
git tag -a v1.2.3 -m "Release v1.2.3: add OAuth login"
git push origin v1.2.3

# List tags
git tag -l "v*"

# Delete a tag (local + remote)
git tag -d v1.2.3
git push origin --delete v1.2.3
```

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR - breaking changes
MINOR - new features, backwards compatible
PATCH - bug fixes, backwards compatible
```

## Useful Git Commands

```bash
# See full branch history vs main
git log --oneline origin/main..HEAD

# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
# Git checks out midpoint — test and mark good/bad
git bisect good   # or: git bisect bad
git bisect reset  # when done

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Stash work in progress
git stash push -m "wip: auth refactor"
git stash list
git stash pop

# Clean up merged branches
git branch --merged main | grep -v main | xargs git branch -d
```

## Best Practices

1. **Commit early, commit often** — small commits are easier to review and revert
2. **Never force-push to main** — use protected branch rules
3. **Keep main always green** — broken main blocks the whole team
4. **Write commit messages for future you** — the diff shows *what*, commits explain *why*
5. **Delete branches after merge** — reduces clutter
6. **Use `.gitignore` religiously** — never commit secrets, build artifacts, or OS files
7. **Sign commits** when working on open source or regulated systems (`git config commit.gpgsign true`)
