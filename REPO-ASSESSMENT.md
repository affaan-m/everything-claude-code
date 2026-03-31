# Repo & Fork Assessment + Setup Recommendations

**Date:** 2026-03-21

---

## What's Available

### Repo: `Infiniteyieldai/everything-claude-code`

This is a **fork of `affaan-m/everything-claude-code`** (the upstream project with 50K+ stars, 6K+ forks).

| Attribute | Value |
|-----------|-------|
| Version | 1.9.0 (current) |
| Status | Clean fork — 1 commit ahead of upstream `main` (the EVALUATION.md doc added in this session) |
| Remote branches | `main`, `claude/evaluate-repo-comparison-ASZ9Y` |
| Upstream sync | Fully synced — last upstream commit merged was the zh-CN docs PR (#728) |
| License | MIT |

**This is the right repo to work from.** It's the latest upstream version with no divergence or merge conflicts.

---

### Current `~/.claude/` Installation

| Component | Installed | Available in Repo |
|-----------|-----------|-------------------|
| Agents | 0 | 28 |
| Skills | 0 | 116 |
| Commands | 0 | 59 |
| Rules | 0 | 60+ files (12 languages) |
| Hooks | 1 (git Stop check) | Full PreToolUse/PostToolUse matrix |
| MCP configs | 0 | 1 (Context7) |

The existing Stop hook (`stop-hook-git-check.sh`) is solid — blocks session end on uncommitted/unpushed work. Keep it.

---

## Install Profile Recommendations

The repo ships 5 install profiles. Choose based on your primary use case:

### Profile: `core` (Minimum viable setup)
> Fastest to install. Gets you commands, core agents, hooks runtime, and quality workflow.

**Best for:** Trying ECC out, minimal footprint, or a constrained environment.

```bash
node scripts/install-plan.js --profile core
node scripts/install-apply.js
```

**Installs:** rules-core, agents-core, commands-core, hooks-runtime, platform-configs, workflow-quality

---

### Profile: `developer` (Recommended for daily dev work)
> The default engineering profile for most ECC users.

**Best for:** General software development across app codebases.

```bash
node scripts/install-plan.js --profile developer
node scripts/install-apply.js
```

**Adds over core:** framework-language skills, database patterns, orchestration commands

---

### Profile: `security`
> Baseline runtime + security-specific agents and rules.

**Best for:** Security-focused workflows, code audits, vulnerability reviews.

---

### Profile: `research`
> Investigation, synthesis, and publishing workflows.

**Best for:** Content creation, investor materials, market research, cross-posting.

---

### Profile: `full`
> Everything — all 18 modules.

**Best for:** Power users who want the complete toolkit.

```bash
node scripts/install-plan.js --profile full
node scripts/install-apply.js
```

---

## Priority Additions (High Value, Low Risk)

Regardless of profile, these components add immediate value:

### 1. Core Agents (highest ROI)

| Agent | Why it matters |
|-------|----------------|
| `planner.md` | Breaks complex tasks into implementation plans |
| `code-reviewer.md` | Quality and maintainability review |
| `tdd-guide.md` | TDD workflow (RED→GREEN→IMPROVE) |
| `security-reviewer.md` | Vulnerability detection |
| `architect.md` | System design & scalability decisions |

### 2. Key Commands

| Command | Why it matters |
|---------|----------------|
| `/plan` | Implementation planning before coding |
| `/tdd` | Test-driven workflow |
| `/code-review` | On-demand review |
| `/build-fix` | Automated build error resolution |
| `/learn` | Extract patterns from current session |

### 3. Hook Upgrades (from `hooks/hooks.json`)
The repo's hook system adds these over the current single Stop hook:

| Hook | Trigger | Value |
|------|---------|-------|
| `block-no-verify` | PreToolUse: Bash | Blocks `--no-verify` git flag abuse |
| `pre-bash-git-push-reminder` | PreToolUse: Bash | Pre-push review reminder |
| `doc-file-warning` | PreToolUse: Write | Warns on non-standard doc files |
| `suggest-compact` | PreToolUse: Edit/Write | Suggests compaction at logical intervals |
| Continuous learning observer | PreToolUse: * | Captures tool use patterns for skill improvement |

### 4. Rules (Always-on guidelines)
The `rules/common/` directory provides baseline guidelines that fire on every session:
- `security.md` — Security guardrails
- `testing.md` — 80%+ coverage requirement
- `git-workflow.md` — Conventional commits, branch strategy
- `coding-style.md` — Cross-language style standards

---

## What to Do With the Fork

### Option A: Use as upstream tracker (current state)
Keep the fork synced with `affaan-m/everything-claude-code` upstream. Periodically merge upstream changes:
```bash
git fetch upstream
git merge upstream/main
```
Install from the local clone. This is clean and maintainable.

### Option B: Customize the fork
Add personal skills, agents, or commands to the fork. Good for:
- Business-specific domain skills (your vertical)
- Team-specific coding conventions
- Custom hooks for your stack

The fork already has the EVALUATION.md and REPO-ASSESSMENT.md docs — that's fine for a working fork.

### Option C: Install from npm (simplest for fresh machines)
```bash
npx ecc-universal install --profile developer
```
No need to clone the repo. This is the recommended install method for most users.

---

## Recommended Setup Steps

1. **Keep the existing Stop hook** — it's doing its job
2. **Run the developer profile install** from the local fork:
   ```bash
   cd /path/to/everything-claude-code
   node scripts/install-plan.js --profile developer
   node scripts/install-apply.js
   ```
3. **Add language rules** for your primary stack (TypeScript, Python, Go, etc.):
   ```bash
   node scripts/install-plan.js --add rules/typescript
   node scripts/install-apply.js
   ```
4. **Enable MCP Context7** for live documentation lookup:
   - Copy `mcp-configs/mcp-servers.json` into your project's `.claude/` dir
5. **Review hooks** — enable the `hooks/hooks.json` additions selectively, starting with `block-no-verify` and `pre-bash-git-push-reminder`

---

## Summary

| Question | Answer |
|----------|--------|
| Is the fork healthy? | Yes — fully synced with upstream v1.9.0 |
| Other forks to consider? | None visible in this environment; upstream `affaan-m/everything-claude-code` is the source of truth |
| Best install profile? | `developer` for day-to-day dev work |
| Biggest gap in current setup? | 0 agents installed — add at minimum: planner, code-reviewer, tdd-guide, security-reviewer |
| Quickest win? | Run `node scripts/install-plan.js --profile core && node scripts/install-apply.js` |
