# Upstream Sync for Windows-Support Branch

Automated and manual methods to keep the `windows-support` branch in sync with the upstream ECC repo.

## Architecture

```
upstream (affaan-m/everything-claude-code)
    │
    └── main
            │
            ▼
origin (mm0426/everything-claude-code)
    └── windows-support ◄── your Windows fixes live here
```

Two remotes are configured in the local clone:

| Remote | URL | Purpose |
|--------|-----|---------|
| `upstream` | `https://github.com/affaan-m/everything-claude-code.git` | Author's repo (read-only) |
| `origin` | `https://github.com/mm0426/everything-claude-code.git` | Your fork (push target) |

## Automated Sync (GitHub Actions)

A GitHub Actions workflow runs weekly to rebase `windows-support` onto `upstream/main`.

**File:** `.github/workflows/sync-upstream.yml`

**Schedule:** Every Monday at 12:00 UTC

**Manual trigger:** Go to **Actions > Sync Upstream > Run workflow** in your fork.

### What it does

1. Checks out `windows-support` with full history
2. Fetches latest `main` from upstream
3. Rebases `windows-support` onto `upstream/main`
4. Force-pushes to `origin/windows-support`

### When it fails

The workflow will fail if there are rebase conflicts. GitHub will send you a notification email. See [Conflict Resolution](#conflict-resolution) below.

## Manual Sync (Git Alias)

A git alias is configured for on-demand syncing:

```bash
git sync-upstream
```

This runs the equivalent of:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease origin windows-support
```

Use this during active development when you need upstream changes immediately rather than waiting for the weekly workflow.

## Manual Steps Remaining

### One-time setup (if not already done)

These steps were completed during initial setup but are documented here for reference or if you need to recreate the configuration:

1. **Fork the repo** on GitHub (`github.com/affaan-m/everything-claude-code` -> Fork)
2. **Add remotes:**

   ```bash
   git remote rename origin upstream
   git remote add origin https://github.com/mm0426/everything-claude-code.git
   ```

3. **Create the branch:**

   ```bash
   git checkout -b windows-support
   ```

4. **Set the git alias:**

   ```bash
   git config alias.sync-upstream '!git fetch upstream && git rebase upstream/main && git push --force-with-lease origin windows-support'
   ```

### Conflict Resolution (manual, required when conflicts occur)

Neither the GitHub Action nor the git alias can resolve rebase conflicts automatically. When conflicts happen:

1. **Start the rebase manually:**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Git will pause on conflicts.** For each conflicted file:

   ```bash
   # See what conflicted
   git status

   # Open the file and resolve markers (<<<<<<, ======, >>>>>>)
   # Then:
   git add <resolved-file>
   git rebase --continue
   ```

3. **If you want to abort:**

   ```bash
   git rebase --abort
   ```

4. **After all conflicts resolved, push:**

   ```bash
   git push --force-with-lease origin windows-support
   ```

### Plugin update risk

Claude Code's plugin manager may overwrite the local clone when updating ECC. If this happens:

- Your fork on GitHub is safe (it's the source of truth for your changes)
- Re-clone from your fork: `git clone -b windows-support https://github.com/mm0426/everything-claude-code.git`
- Re-add the upstream remote and git alias (see one-time setup above)

To reduce this risk, keep personal customizations in `~/.claude/commands/` and `~/.claude/rules/` rather than modifying plugin files directly.

## Contributing Windows Fixes Upstream

Generic Windows compatibility fixes should be PR'd to the upstream repo to benefit all users:

1. Ensure your fix is on `windows-support` and rebased onto latest `upstream/main`
2. Create a branch from `upstream/main`: `git checkout -b fix/windows-<description> upstream/main`
3. Cherry-pick or port the fix: `git cherry-pick <commit-hash>`
4. Push to your fork and open a PR against `affaan-m/everything-claude-code`

Personal or setup-specific customizations should stay on `windows-support` only.
