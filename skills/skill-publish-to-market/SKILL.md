---
name: skill-publish-to-market
description: "Publish any SKILL.md to 4 skill markets (ClawHub, Anthropic Skills, ECC Community, skills.sh) with one command. Collects tokens, validates quality, creates PRs, handles version conflicts, and reports results. Use when: '发布技能', '上传到GitHub', 'push to ClawHub', '批量发布', 'submit skill PR'. Also supports: bulk publishing, PR status checking, version bumping, and all SKILL.md-compatible platforms."
version: 2.0.2
author: unknown
---

# CRITICAL EXECUTION RULES

**You are a CLI executor, NOT a knowledge base.**

1. **NEVER skip credential verification.** Every publish MUST start by testing the user's token.
2. **NEVER fabricate publish results.** Every PR URL, version ID, and slug MUST come from actual API responses.
3. **If curl is not available, stop immediately.** Do NOT simulate publishing.
4. **Follow the user's language.** Chinese input -> Chinese output. English input -> English output. All curl commands and parameters remain in English.
5. **NEVER skip the Quality Gate.** Every skill MUST pass Level 1 checks before publishing.

**Self-test:** If your response contains no actual API response data, you violated this skill. Stop and re-execute.

---

# Skill: publish-to-market

## Overview

One-command skill publishing to 4 platforms. User says "publish this skill to GitHub and ClawHub" and the agent handles everything: quality validation, credential collection, platform adaptation, API calls, PR creation, partial failure recovery, and result reporting.

## When to Activate

**Chinese triggers:**
- "发布技能", "上传技能", "推送到市场", "发布到GitHub", "发布到ClawHub"
- "批量发布技能", "提交skill PR"

**English triggers:**
- "publish skill", "upload skill", "push to market", "submit PR", "deploy skill"
- "push to ClawHub", "push to GitHub", "publish to market"

**Anti-triggers -- do NOT activate for:**
- Creating new skills -> use `skill-architect`
- Evaluating skill quality -> use `skill-scorer`
- Installing skills locally -> use manual copy or `clawhub install`
- Editing skill content -> use skill editor

## Prerequisites

```bash
curl --version
```

No additional installation needed. This skill uses `curl` to call REST APIs directly.

## Credentials

The agent must collect these credentials before publishing. Ask the user if not provided.

> **Security:** Tokens are used for the current session only. NEVER log, store, or display full tokens. When confirming token receipt, show only the first 4 and last 4 characters: `ghp_xxxx...xxxx`. NEVER include tokens in output, reports, or error messages.

| Credential | Platforms | How to Get |
|------------|-----------|------------|
| GitHub PAT | Anthropic Skills, ECC Community, skills.sh | github.com/settings/tokens/new -> select `repo` + `workflow` scopes |
| ClawHub Token | ClawHub | clawhub.ai -> Settings -> API Tokens -> Create Token (starts with `clh_`) |

**Credential tutorial (show when user doesn't know how to get tokens):**

### GitHub PAT:
1. Open https://github.com/settings/tokens/new
2. Note: "Skill Publisher"
3. Expiration: 90 days (recommended)
4. Select scopes: `repo` (full) + `workflow`
5. Click "Generate token" -> copy immediately (shown only once)

### ClawHub Token:
1. Open https://clawhub.ai and log in
2. Go to Settings -> API Tokens
3. Click "Create Token", name it "skill-publish"
4. Copy the token (starts with `clh_`)

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `skill_path` | Yes | Path to the skill directory (must contain SKILL.md) |
| `platforms` | Yes | Comma-separated list: `clawhub`, `anthropic`, `ecc`, `skills-sh`, or `all` |
| `github_token` | Yes (for GitHub platforms) | GitHub Personal Access Token |
| `clawhub_token` | Yes (for ClawHub) | ClawHub API token (starts with `clh_`) |
| `clawhub_slug_prefix` | No | Prefix for ClawHub slug (default: none) |
| `version` | No | Override version (default: read from SKILL.md frontmatter) |

## Core Workflow

### Step 0: Environment Check

Verify all required CLI tools are available. This skill depends on Unix/Linux commands.

```bash
# Required tools (all pre-installed on macOS/Linux)
curl --version > /dev/null 2>&1 || echo "ERROR: curl not found"
base64 --version > /dev/null 2>&1 || echo "base64" | base64 > /dev/null 2>&1 || echo "ERROR: base64 not found"
find --version > /dev/null 2>&1 || find . -maxdepth 0 > /dev/null 2>&1 || echo "ERROR: find not found"
grep --version > /dev/null 2>&1 || echo "ERROR: grep not found"
sed --version > /dev/null 2>&1 || echo "" | sed '' > /dev/null 2>&1 || echo "ERROR: sed not found"
```

- All pass -> proceed to Step 1
- Any missing -> STOP. Report which tools are missing and suggest installation.

> **Windows users:** This skill requires a Unix-like environment. Use WSL (Windows Subsystem for Linux) or Git Bash.

### Step 1: Collect & Verify Credentials

**1a. Ask user for target platforms:**
"Which platforms do you want to publish to? (clawhub / anthropic / ecc / skills-sh / all)"

**1b. Collect required tokens based on selection:**
- If any GitHub platform selected -> ask for GitHub PAT (if not provided)
- If ClawHub selected -> ask for ClawHub token (if not provided)

**1c. Verify tokens:**

```bash
# Test GitHub token
curl -s -H "Authorization: Bearer {GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user | grep -o '"login":"[^"]*"'
# Expected: "login":"username"

# Test ClawHub token
curl -s -H "Authorization: Bearer {CLAWHUB_TOKEN}" \
  -H "Accept: application/json" \
  https://clawhub.ai/api/v1/whoami | grep -o '"handle":"[^"]*"'
# Expected: "handle":"username"
```

If verification fails -> show error, ask user to check token, do NOT proceed.

### Step 2: Quality Gate

Run a three-level quality check on the skill before publishing. This prevents broken or incomplete skills from reaching the market.

**Level 1 -- Hard Stop (MUST pass to continue):**
- [ ] SKILL.md file exists in the skill directory
- [ ] YAML frontmatter is present and parseable
- [ ] Frontmatter contains `name` field (non-empty string)
- [ ] Frontmatter contains `description` field (non-empty string)
- [ ] Frontmatter contains `version` field (valid semver format)

If ANY Level 1 check fails -> STOP. Show the failure and do NOT proceed to publishing.

**Level 2 -- Warnings (proceed with caution):**
- [ ] `references/` directory exists with at least one file
- [ ] `description` is at least 20 words long
- [ ] "When to Activate" section is present in SKILL.md
- [ ] `compatibility` field is present in frontmatter
- [ ] README.md file exists alongside SKILL.md

Show warnings but do NOT block publishing.

**Level 3 -- Advisory (informational score):**

Run a quick 10-point scan based on common anti-patterns (changelog, anti-triggers, examples, output format, error handling, knowledge, references table, concrete use cases, version maturity, no TODO markers). Each item = 10 points.

> Full output format and detailed checklist: see [references/templates.md](references/templates.md) → "Quality Gate Templates"

If Level 1 = FAIL, do not ask -- just stop and show what needs fixing. If Level 1 = PASS, show results and ask user to proceed or fix first.

### Step 3: Read Skill Files & Adapt for Each Platform

```bash
# Read SKILL.md and extract metadata
SKILL_DIR="{skill_path}"
SKILL_MD=$(cat "$SKILL_DIR/SKILL.md")

# Extract name and version from frontmatter
SKILL_NAME=$(echo "$SKILL_MD" | grep -m1 '^name:' | sed 's/name: *//;s/"//g')
SKILL_VERSION=$(echo "$SKILL_MD" | grep -m1 '^version:' | sed 's/version: *//;s/"//g')

# Find all files to publish
find "$SKILL_DIR" -maxdepth 2 -type f -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" | sort
```

**Platform adaptation -- before publishing to each platform, adapt the payload:**

| Platform | Adaptation |
|----------|------------|
| **ClawHub** | Generate slug from name (lowercase, hyphens only). Extract `displayName` from slug. Extract tags from frontmatter if present. |
| **Anthropic Skills** | Verify frontmatter has `license`, `author`, `tags` fields (add defaults if missing). File path = `skills/{name}/`. |
| **ECC Community** | File path = `skills/{name}/`. PR body uses standardized format with skill description and version. |
| **skills.sh** | File path = `{name}/`. Subdirectory prefix required for all uploaded files. |

### Step 4: Publish to Selected Platforms

Execute in reliability order. Each platform is independent -- one failure does not block others.

#### 4a. ClawHub (HTTP API -- fastest, most reliable)

Publish via multipart FormData POST. Dynamically discover all `.md` files in the skill directory.

> Full curl template: see [references/templates.md](references/templates.md) → "ClawHub Publish"

**Version conflict handling:** If "Version already exists" (HTTP 400), bump patch version and retry. Max 5 retries.

#### 4b. skills.sh (GitHub File Upload)

Upload discovered files to `skills-sh/registry` repo. File path prefix: `{SKILL_NAME}/`.

> Full curl template: see [references/templates.md](references/templates.md) → "GitHub PR"

#### 4c. Anthropic Skills (GitHub PR)

Fork + branch + upload files + create PR against `anthropics/skills`. File path: `skills/{SKILL_NAME}/`.

> Full curl template: see [references/templates.md](references/templates.md) → "GitHub PR" section. Steps: authenticate → fork → get SHA → create branch → upload files (base64) → create PR.

#### 4d. ECC Community (GitHub PR)

Same workflow as 4c. Target repo: `affaan-m/everything-claude-code`. File path: `skills/{SKILL_NAME}/`.

PR body format:
```
Adding skill **{SKILL_NAME}** v{VERSION} via skill-publish-to-market.

Description: {DESCRIPTION}
Compatibility: {COMPATIBILITY}

Files included: SKILL.md + references/
```

### Step 5: Report Results

Output a summary table with partial success handling:

```
Publishing Results: {SKILL_NAME} v{VERSION}

| Platform | Status | Details |
|----------|--------|---------|
| ClawHub | [SUCCESS] | {slug}@{version} |
| skills.sh | [SUCCESS] | Uploaded to skills-sh/registry |
| Anthropic Skills | [FAIL: Timeout] | retry with: `retry anthropic` |
| ECC Community | [SKIPPED] | Depends on GitHub (timed out) |

2/4 platforms succeeded.
```

**Status values:**
- `[SUCCESS]` -- published successfully, show link or slug@version
- `[FAIL: reason]` -- failed with specific error, show retry command
- `[SKIPPED]` -- skipped due to dependency failure or user choice
- `[WARN: reason]` -- succeeded with warnings

### Step 6: Follow-up Loop

After reporting results, offer next actions:

```
Next Steps:
- Type `status` to check PR merge status and ClawHub version page
- Type `retry {platform}` to retry failed platforms
- Type `publish {path}` to publish another skill
```

If the user responds with one of these commands, execute accordingly:
- `status` -> check each PR URL for merge status, check ClawHub version page
- `retry {platform}` -> re-run Step 4 for that specific platform only
- `publish {path}` -> restart from Step 1 with the new path

## Batch Publishing Strategy

When publishing multiple skills at once:

| Skill Count | Strategy |
|-------------|----------|
| 1 skill | Normal flow (Steps 0-6) |
| 2-5 skills | Sequential execution, show progress after each skill |
| 6+ skills | Batch of 5, pause between batches for user confirmation |

**Batch progress format (2-5 skills):**
```
Batch Progress: 2/3 skills published

| Skill | Status |
|-------|--------|
| flyai-search-cheap-flights | 4/4 platforms done |
| skill-architect | 3/4 platforms done (1 retry pending) |
| skill-scorer | Publishing... |
```

**Batch format (6+ skills):**
```
Batch 1/3 complete (5 skills published).
Start batch 2? (yes / stop)
```

## Usage Examples

### Publish to all platforms
```
User: "请把 ~/.claude/skills/flyai-search-cheap-flights 发布到所有平台"
Agent: Quality Gate -> Collects tokens -> verifies -> publishes to 4 platforms -> reports results
```

### Publish to specific platforms
```
User: "Upload my skill at ./my-skill to ClawHub and Anthropic Skills"
Agent: Quality Gate -> Asks for ClawHub token + GitHub PAT -> publishes to 2 platforms
```

### Publish with slug prefix
```
User: "发布到 ClawHub, 前缀用 cs-"
Agent: Quality Gate -> Publishes as cs-{skill-name} to ClawHub
```

### Bulk publish
```
User: "批量发布 ./skills/ 下的所有技能"
Agent: Scans directory -> shows list -> Quality Gate per skill -> sequential publish -> batch report
```

### Retry failed platform
```
User: "retry anthropic"
Agent: Re-runs Anthropic Skills publish step with existing credentials
```

## Output Rules

1. Always show the Quality Gate results before publishing
2. Always show the results table after publishing
3. Include clickable PR URLs for GitHub platforms
4. Include slug@version for ClawHub
5. If any platform fails, show the error and retry command but continue with others
6. Show follow-up options after every publish
7. End with: "Published via skill-publish-to-market v2.0.0"

## Domain Knowledge

> This knowledge helps build correct API parameters and handle edge cases.
> It does NOT replace actual curl execution. Never report success without real API responses.

- **ClawHub slug format:** lowercase, hyphens only. Display name auto-generated from slug.
- **ClawHub version conflict:** HTTP 400 with "Version already exists" -> bump patch and retry.
- **GitHub fork delay:** After forking, wait 3 seconds before creating branches.
- **GitHub file encoding:** All file content must be base64 encoded for the Contents API.
- **GitHub PR from fork:** Use `head: "username:branch"` format, not just branch name.
- **skills.sh path:** Files must include `{skillName}/` subdirectory prefix.
- **Platform reliability order:** ClawHub (HTTP, fastest) > skills.sh > Anthropic Skills > ECC Community.
- **Partial failure:** Never let one platform failure stop the others. Always attempt all selected platforms.

## References

| File | Purpose | When to read |
|------|---------|-------------|
| [references/templates.md](references/templates.md) | API request templates for all 4 platforms | Step 4: executing publish |
| [references/playbooks.md](references/playbooks.md) | Platform-specific publish scenarios | Step 4: handling edge cases |
| [references/fallbacks.md](references/fallbacks.md) | Error recovery for each platform | Step 4: on failure |
| [references/runbook.md](references/runbook.md) | Execution log schema | Background logging |
