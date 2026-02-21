# AUTOMATION.md — Developer Guide for the Lifecycle Pipeline

## Overview

This repository ships a **production-grade, fully automated lifecycle pipeline**
that covers dependency installation, environment configuration, build, packaging,
and validation — all from a single entry point.

---

## Quick Start

```bash
# Clone the repo (or open it via GitHub Desktop)
git clone https://github.com/alfraido86-jpg/everything-claude-code.git
cd everything-claude-code

# Make scripts executable (one-time, already set in the repo)
chmod +x bootstrap.sh scripts/*.sh

# Run the full pipeline
./bootstrap.sh
```

Or use the Makefile for granular control:

```bash
make setup     # Install deps + configure env + install packages + validate
make build     # Build artifacts and create a release bundle
make validate  # Run the validation suite only
make clean     # Remove dist/ and logs/
make update    # git pull --rebase + make setup
make logs      # List recent log files
```

---

## Running `bootstrap.sh`

`bootstrap.sh` is the single entry point that orchestrates all pipeline stages
in order:

| Stage | Script | Description |
|---|---|---|
| 1 | `scripts/check-deps.sh` | Detect & install system dependencies |
| 2 | `scripts/configure-env.sh` | Generate/load `.env`, prompt for secrets |
| 3 | `scripts/build.sh --install-only` | Install npm/Python packages |
| 4 | `scripts/validate.sh` | Post-install validation suite |
| 5 | `scripts/build.sh` | Build artifacts & create release bundle |

### Options

```bash
./bootstrap.sh --skip-deps        # Skip dependency check
./bootstrap.sh --skip-env         # Skip .env configuration
./bootstrap.sh --skip-build       # Skip build & packaging
./bootstrap.sh --non-interactive  # Never prompt (CI mode)
```

---

## Environment Variables

### How it works

1. `.env.example` is the **canonical list** of required variables with descriptions.
2. On first run, `scripts/configure-env.sh` reads `.env.example` and prompts for
   any unset variables, writing them to `.env`.
3. On subsequent runs, `.env` is loaded automatically — no prompts.
4. `.env` is **gitignored** and never committed.

### Adding a new variable

1. Add it to `.env.example` with a comment:
   ```
   MY_NEW_VAR= # Description of what this variable does
   ```
2. The pipeline will prompt for it on the next fresh setup.

### CI / non-interactive environments

Set variables directly in your CI environment secrets and pass
`--non-interactive` or set `NON_INTERACTIVE=true`:

```bash
NON_INTERACTIVE=true ./bootstrap.sh --skip-deps
```

---

## GitHub Desktop Integration

The pipeline is designed to work seamlessly with repos opened via
[GitHub Desktop](https://desktop.github.com/):

1. Open the repo in GitHub Desktop.
2. Use **Open in Terminal** (or your preferred terminal).
3. Run `./bootstrap.sh` or `make setup`.

To pull the latest changes and re-run setup (equivalent to GitHub Desktop's
"Fetch origin" + re-setup):

```bash
make update
```

This runs `git pull --rebase` on the current branch, then re-runs the full
setup pipeline.

---

## Reading Logs & Debugging Failures

Every `bootstrap.sh` run writes a structured log to:

```
logs/bootstrap-<YYYYMMDD_HHMMSS>.log
```

List recent logs:

```bash
make logs
# or
ls -lt logs/*.log
```

Each log line has the format:

```
2026-01-01T12:00:00 [LEVEL] [stage-name] message
```

Levels: `RUNNING`, `OK`, `WARN`, `FAIL`.

If a stage fails, the log will show the exact error. Example:

```bash
tail -50 logs/bootstrap-20260101_120000.log
```

---

## Adding New Tools or Dependencies

### System tools (macOS, via Homebrew)

Edit `scripts/check-deps.sh` and add a `require_cmd` / `brew_install` block
following the existing pattern.

### Node.js packages

Add to `package.json` and commit — the pipeline runs `npm ci` automatically.

### Python packages

Add to `requirements.txt` or `pyproject.toml` — the pipeline runs
`pip install -r requirements.txt` or `uv sync` automatically.

### asdf / mise tools

Add a line to `.tool-versions`:

```
mytool 1.2.3
```

The pipeline calls `asdf install` if `asdf` is available.

---

## CI/CD

The pipeline mirrors to GitHub Actions in `.github/workflows/ci.yml`.

The workflow runs on every push and pull request to `main` and includes:

- **test** — Matrix across OS × Node version × package manager
- **validate** — Component validators (agents, hooks, commands, skills, rules)
- **security** — `npm audit`
- **lint** — ESLint + markdownlint

No secrets are required for the CI workflow itself.
For workflows that need `ANTHROPIC_API_KEY` or `GITHUB_TOKEN`, add them to
**Settings → Secrets and variables → Actions** in the GitHub repo.
