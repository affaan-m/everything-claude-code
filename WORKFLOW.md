# GitHub Desktop + GitHub Copilot: End-to-End Workflow

A comprehensive, step-by-step playbook for developers who use **GitHub Desktop** as their primary Git UI and **GitHub Copilot** as their cloud coding agent — covering every stage from first clone to shipped artifact on macOS (Apple Silicon).

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| [GitHub Desktop](https://desktop.github.com/) | Local GUI for Git (clone, branch, commit, push, pull, diff review) | Download from desktop.github.com |
| [GitHub Copilot](https://github.com/features/copilot) | Cloud coding agent: reads issues, writes code, opens PRs | Requires GitHub Copilot subscription |
| Terminal (macOS built-in or iTerm2) | Run bootstrap, Make targets, and validation scripts | Pre-installed |
| [Homebrew](https://brew.sh/) | Package manager for macOS | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Node.js ≥ 18 | Required by repo scripts | `brew install node` |

> **Apple Silicon note:** All shell scripts use `/usr/bin/env bash` and are tested on ARM64. Docker targets should use `--platform linux/arm64` when building locally.

---

## Stage A — Clone & Open

### 1. Clone the repository via GitHub Desktop

1. Open **GitHub Desktop**.
2. Choose **File → Clone Repository…** (or press `⌘ + Shift + O`).
3. Switch to the **URL** tab and enter:
   ```
   https://github.com/alfraido86-jpg/everything-claude-code
   ```
4. Set **Local Path** to:
   ```
   ~/Documents/GitHub/everything-claude-code
   ```
5. Click **Clone**.

GitHub Desktop downloads the repository and opens it automatically.

### 2. Open the repo in Terminal from GitHub Desktop

With the repository open in GitHub Desktop:

- Click **Repository → Open in Terminal** (or press `⌘ + \``).

A new Terminal session opens, already `cd`-ed into:
```
~/Documents/GitHub/everything-claude-code
```

Keep this terminal open — you will run all `make` and `./scripts/` commands from here.

---

## Stage B — Branch

### Creating a feature branch in GitHub Desktop

1. In GitHub Desktop, click the **Current Branch** button (top centre).
2. Click **New Branch**.
3. Name it, e.g., `feature/my-task`.
4. Click **Create Branch** — GitHub Desktop switches to this branch immediately.

### How Copilot branches map to GitHub Desktop

When Copilot opens a Pull Request, it creates a branch following the pattern:

```
copilot/issue-<N>          # e.g., copilot/issue-42
copilot/fix-<description>  # e.g., copilot/fix-typo-in-readme
```

These branches live on the remote (`origin`). To see them in GitHub Desktop:

1. Click **Fetch origin** (top-right toolbar) — this downloads all new remote branches.
2. Click **Current Branch → filter** and type `copilot/` — Copilot's branch appears in the list.

### Pull a Copilot branch for local testing

Use the helper script (see [Stage E](#stage-e--review-copilots-pr-locally)) or do it manually:

```bash
# In Terminal
./scripts/fetch-copilot-branch.sh
```

Or in GitHub Desktop: select the Copilot branch from the **Current Branch** dropdown — it auto-fetches and checks it out.

---

## Stage C — Bootstrap the Environment

### Run setup from Terminal

```bash
make setup
```

This command is **idempotent** — safe to run multiple times. It:

1. Installs Node.js dependencies (`npm ci`).
2. Copies `.env.example → .env` if no `.env` exists yet.
3. Builds Docker images (if Docker is running).

> **First run only:** Copy and fill in your `.env`:
> ```bash
> cp .env.example .env   # if it exists
> $EDITOR .env            # add your API keys
> ```
> Never commit `.env` — it is in `.gitignore`.

### What GitHub Desktop shows (nothing)

Bootstrap outputs land in directories that are **gitignored**:

| Path | Tracked? | Why |
|------|----------|-----|
| `node_modules/` | ❌ No | In `.gitignore` |
| `dist/` | ❌ No | Build artifacts |
| `logs/` | ❌ No | Runtime audit trail |
| `.env` | ❌ No | Contains secrets |
| `*.key`, `*.pem` | ❌ No | Key material |
| Source code (`*.md`, `scripts/`, etc.) | ✅ Yes | Version-controlled |

GitHub Desktop's **Changes** tab will remain empty after `make setup` — this is expected.

---

## Stage D — Assign Work to Copilot

### Option 1: Open a GitHub Issue and assign it to Copilot

1. Go to [github.com/alfraido86-jpg/everything-claude-code/issues/new/choose](https://github.com/alfraido86-jpg/everything-claude-code/issues/new/choose).
2. Select the **Copilot Task** template.
3. Fill in the **Task Description** and **Acceptance Criteria**.
4. In the right sidebar, set:
   - **Assignees → `@copilot`**
   - **Labels → `copilot`**
5. Submit the issue.

Copilot reads the issue, writes code, and opens a Pull Request — usually within a few minutes.

### Option 2: Use Copilot Chat

In VS Code with the GitHub Copilot extension, open Copilot Chat and type:

```
Open a PR to fix issue #42
```

Copilot will create the branch and PR automatically.

### See the new branch in GitHub Desktop

After Copilot opens the PR:

1. In GitHub Desktop, click **Fetch origin** (top-right).
2. Click **Current Branch** — the `copilot/issue-42` branch now appears in the list.

---

## Stage E — Review Copilot's PR Locally

### Switch to the Copilot branch in GitHub Desktop

1. Click **Current Branch**.
2. Select `copilot/issue-42` (or run `./scripts/fetch-copilot-branch.sh` in Terminal for an interactive picker).
3. GitHub Desktop checks out the branch and shows the diff in the **Changes** tab.

### Visual diff in GitHub Desktop

The **Changes** tab shows every file Copilot modified with colour-coded additions (green) and removals (red). Click any file to see a side-by-side diff.

### Open in VS Code for deeper review

Click **Open in Visual Studio Code** (or press `⌘ + Shift + A`) from GitHub Desktop to open the repo in VS Code with the Copilot branch active.

### Run local validation

```bash
make validate
```

This runs the full smoke-test suite and writes a timestamped log to `logs/`. Review any failures before approving the PR.

> **CI note:** Every push to a `copilot/*` branch also triggers the `copilot-validate` job inside the unified `ci.yml` workflow, which runs `make setup && make validate` on `macos-latest` and uploads the `logs/` directory as a workflow artifact.

---

## Stage F — Iterate

### Push fixes from GitHub Desktop

If the review reveals issues you want to fix yourself:

1. Edit files in your editor.
2. In GitHub Desktop, stage the changed files in the **Changes** tab.
3. Write a commit message and click **Commit to `copilot/issue-42`**.
4. Click **Push origin**.

CI (GitHub Actions) runs automatically on every push to a `copilot/*` branch (see `copilot-ci.yml`).

### Let Copilot continue

If you leave comments on the PR, Copilot will see them and push additional commits. Click **Fetch origin** in GitHub Desktop to pull those commits locally.

---

## Stage G — Merge

### Approve and merge on GitHub.com

1. In GitHub Desktop, click **View on GitHub** (or press `⌘ + Shift + G`) to open the PR in your browser.
2. Review the CI status — all checks must be green.
3. Click **Approve** → **Merge pull request**.

### Sync `main` in GitHub Desktop

1. Switch to `main` in GitHub Desktop (**Current Branch → main**).
2. Click **Fetch origin** → **Pull origin**.

`main` is now up-to-date.

### Re-run setup after merge

```bash
make update
```

This runs `git pull --rebase && make setup` to pick up any new dependencies or config changes.

---

## Stage H — Build & Package

This repo ships **plugins, agents, commands, and Markdown documentation** — not Docker images or compiled binaries.

```bash
make build      # Prepares dist/ directory and prints the git SHA
make package    # Zips the repo source (excluding secrets and artifacts) into dist/
```

Artifacts land in `dist/` with the git SHA in the filename, e.g.:

```
dist/everything-claude-code-abc1234.zip
```

The `dist/` directory is gitignored — artifacts are never committed.

---

## Stage I — Validate & Ship

```bash
make validate   # Full smoke-test suite
make logs       # Tail the latest audit log in logs/
```

### Optional: upload release bundle

```bash
# Upload release bundle to GitHub Releases (via gh CLI)
gh release create v1.0.0 dist/*.zip --notes "Release notes here"
```

---

## Quick-Reference Cheatsheet

| Stage | Action | Where |
|-------|--------|--------|
| A | Clone repo | GitHub Desktop |
| A | Open Terminal | GitHub Desktop → Repository → Open in Terminal |
| B | Create branch | GitHub Desktop → Current Branch → New Branch |
| B | Pull Copilot branch | `./scripts/fetch-copilot-branch.sh` or GitHub Desktop |
| C | Bootstrap | `make setup` (Terminal) |
| D | Assign to Copilot | GitHub Issue → Assign `@copilot` |
| D | Fetch Copilot branch | GitHub Desktop → Fetch origin |
| E | Review diff | GitHub Desktop → Changes tab |
| E | Validate locally | `make validate` (Terminal) |
| F | Push fix | GitHub Desktop → Commit → Push origin |
| G | Merge PR | GitHub.com → Merge pull request |
| G | Sync main | GitHub Desktop → Fetch + Pull origin |
| G | Re-run setup | `make update` (Terminal) |
| H | Build artifacts | `make build && make package` (Terminal) |
| I | Validate & ship | `make validate` → deploy |

---

## Copilot Branch Naming Reference

| Pattern | Example | Source |
|---------|---------|--------|
| `copilot/issue-N` | `copilot/issue-42` | Assigned via GitHub Issue |
| `copilot/fix-*` | `copilot/fix-readme-typo` | Copilot-initiated fix |

All `copilot/*` branches are automatically picked up by the `copilot-ci.yml` workflow and by the `scripts/fetch-copilot-branch.sh` helper.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Copilot branch not visible in GitHub Desktop | Click **Fetch origin** |
| `make setup` fails with "command not found" | Install `make` via `brew install make` |
| `.env` not found | Copy `.env.example` → `.env` and fill in values |
| CI fails on `make validate` | Check `logs/` for details; run `make validate` locally |
