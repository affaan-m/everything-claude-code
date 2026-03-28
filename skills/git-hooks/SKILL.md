---
name: git-hooks
description: Git hooks for automated quality gates — pre-commit linting/formatting, commit-msg validation, and pre-push testing. Covers husky, lint-staged, and commitlint setup.
origin: ECC
---

# Git Hooks

Automate quality checks at the right point in the Git workflow using hooks.

## When to Activate

- Setting up a new project with automated checks
- Adding commit message validation
- Configuring pre-commit formatting or linting
- Preventing broken commits from reaching CI
- Onboarding a team to consistent standards

## Hook Types & When to Use Them

| Hook | Runs When | Use For |
|------|-----------|---------|
| `pre-commit` | Before commit is created | Lint, format, type-check staged files |
| `commit-msg` | After commit message is written | Validate conventional commit format |
| `pre-push` | Before push to remote | Run full test suite, security scan |
| `prepare-commit-msg` | Before editor opens for message | Inject ticket ID from branch name |
| `post-merge` | After a merge completes | Install dependencies if lockfile changed |

## Recommended Stack

```
husky        — installs and manages Git hooks
lint-staged  — runs tools only on staged files (fast)
commitlint   — validates commit message format
```

## Setup

### 1. Install dependencies

```bash
# npm
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# pnpm
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# bun
bun add -d husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 2. Initialize husky

```bash
npx husky init
```

This creates `.husky/` directory and adds a `prepare` script to `package.json`.

### 3. Configure lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.py": [
      "ruff check --fix",
      "ruff format"
    ]
  }
}
```

### 4. Configure commitlint

Create `commitlint.config.js`:

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'build', 'revert'
    ]],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 100]
  }
}
```

## Hook Files

### `.husky/pre-commit`

```bash
#!/bin/sh
npx lint-staged
```

Runs lint-staged, which only processes files staged for this commit — fast even on large repos.

### `.husky/commit-msg`

```bash
#!/bin/sh
npx --no -- commitlint --edit "$1"
```

Validates the commit message against your commitlint rules before the commit lands.

### `.husky/pre-push`

```bash
#!/bin/sh
npm test
```

Runs the full test suite before pushing. Catches failures before CI does.

### `.husky/post-merge`

```bash
#!/bin/sh
# Reinstall deps if lockfile changed
changed=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)
echo "$changed" | grep -q "package-lock.json" && npm install
echo "$changed" | grep -q "pnpm-lock.yaml" && pnpm install
echo "$changed" | grep -q "bun.lockb" && bun install
```

Automatically installs dependencies when the lockfile changes after a pull or merge.

### `.husky/prepare-commit-msg` (optional — inject ticket ID)

```bash
#!/bin/sh
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)
TICKET=$(echo "$BRANCH" | grep -oE '[A-Z]+-[0-9]+')
if [ -n "$TICKET" ] && [ "$2" != "merge" ]; then
  sed -i.bak "1s/^/$TICKET: /" "$1"
fi
```

Automatically prepends the Jira/Linear ticket ID from the branch name (e.g., `feat/ENG-123-login` → `ENG-123: `).

## Full package.json Example

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## Without husky (raw Git hooks)

For projects that can't use Node tooling, write hooks directly:

```bash
# Create hook file
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
set -e
npm run lint
npm run type-check
EOF

chmod +x .git/hooks/pre-commit
```

To share raw hooks with the team, store them in a `git-hooks/` directory and add a setup script:

```bash
# scripts/setup-hooks.sh
#!/bin/sh
cp git-hooks/* .git/hooks/
chmod +x .git/hooks/*
echo "Git hooks installed."
```

## CI/CD Alignment

Hooks run locally; CI must run the same checks independently. Do not rely on hooks as the only gate.

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    steps:
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npx commitlint --from origin/main
```

The hook prevents the bad commit locally; CI catches anything that slipped through (e.g., `--no-verify`).

## Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit and commit-msg hooks
git commit --no-verify -m "fix: emergency hotfix"

# Skip pre-push hook
git push --no-verify
```

Only use `--no-verify` for genuine emergencies. Track uses in your incident log.

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Hook not running | Not executable | `chmod +x .husky/pre-commit` |
| `husky: command not found` | `prepare` script not run | `npm install` (runs `prepare`) |
| Hook runs on all files (slow) | Not using lint-staged | Replace direct tool calls with `npx lint-staged` |
| CI passes but hook fails | Different tool versions | Pin versions in `package.json` |
| `ORIG_HEAD` not found in post-merge | First-ever merge | Guard with `git rev-parse --verify ORIG_HEAD` |

## Best Practices

1. **Keep pre-commit fast** — target < 5 seconds using lint-staged (staged files only)
2. **Don't run full tests in pre-commit** — use pre-push or CI for that
3. **Commit `.husky/` to version control** — hooks should be shared with the team
4. **Document bypass procedure** — tell the team when `--no-verify` is acceptable
5. **Mirror hooks in CI** — hooks are a developer convenience, not a security gate
6. **Fail fast, fail clearly** — output the exact file and line that failed
