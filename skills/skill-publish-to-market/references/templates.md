# API Request Templates

## ClawHub Publish

### Verify Token
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json" \
  https://clawhub.ai/api/v1/whoami
```
Expected: `{"handle":"username",...}`

### Publish Skill
```bash
curl -s -X POST "https://clawhub.ai/api/v1/skills" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json" \
  -F 'payload={"slug":"{SLUG}","displayName":"{DISPLAY_NAME}","version":"{VERSION}","changelog":"","acceptLicenseTerms":true,"tags":["latest"]}' \
  -F "files=@{SKILL_DIR}/SKILL.md;filename=SKILL.md" \
  -F "files=@{SKILL_DIR}/references/templates.md;filename=references/templates.md" \
  -F "files=@{SKILL_DIR}/references/playbooks.md;filename=references/playbooks.md" \
  -F "files=@{SKILL_DIR}/references/fallbacks.md;filename=references/fallbacks.md" \
  -F "files=@{SKILL_DIR}/references/runbook.md;filename=references/runbook.md"
```
Expected: `{"versionId":"..."}` (HTTP 200)

### Version Bump on Conflict
If HTTP 400 with "Version already exists":
1. Parse current version: `X.Y.Z`
2. Bump: `X.Y.(Z+1)`
3. Retry with new version (max 5 retries)

---

## GitHub PR (Anthropic Skills / ECC Community)

### Verify Token
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user
```
Expected: `{"login":"username",...}`

### Fork Repository
```bash
curl -s -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/{OWNER}/{REPO}/forks \
  -d '{}'
```
Wait 3 seconds after forking.

### Get Default Branch SHA
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/{USERNAME}/{REPO}/git/ref/heads/{DEFAULT_BRANCH}
```
Extract: `.object.sha`

### Create Branch
```bash
curl -s -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/{USERNAME}/{REPO}/git/refs \
  -d '{"ref":"refs/heads/{BRANCH}","sha":"{BASE_SHA}"}'
```

### Upload File (base64)
```bash
CONTENT=$(base64 < "{FILE_PATH}")
curl -s -X PUT \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{USERNAME}/{REPO}/contents/{TARGET_PATH}" \
  -d '{"message":"Add {FILE} for skill: {SKILL_NAME}","content":"'"$CONTENT"'","branch":"{BRANCH}"}'
```

### Create Pull Request
```bash
curl -s -X POST \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/{OWNER}/{REPO}/pulls \
  -d '{"title":"Add skill: {SKILL_NAME}","head":"{USERNAME}:{BRANCH}","base":"{DEFAULT_BRANCH}","body":"Adding skill **{SKILL_NAME}** via skill-publish-to-market.\n\nFiles:\n- SKILL.md\n- references/templates.md\n- references/playbooks.md\n- references/fallbacks.md\n- references/runbook.md"}'
```
Extract: `.html_url`, `.number`

---

## Platform-Specific Configurations

| Platform | Owner/Repo | File Path Prefix | Default Branch |
|----------|------------|-----------------|----------------|
| Anthropic Skills | `anthropics/skills` | `skills/{SKILL_NAME}/` | `main` |
| ECC Community | `affaan-m/everything-claude-code` | `skills/{SKILL_NAME}/` | `main` |
| skills.sh | `skills-sh/registry` | `{SKILL_NAME}/` | `main` |

---

## Quality Gate Templates

Pre-publish validation runs three levels of checks before any platform upload. Every skill must pass Level 1 to proceed. Level 2 produces warnings. Level 3 produces a numeric score.

### Level 1: Frontmatter Validation

Regex to extract and validate YAML frontmatter:

```
^---\r?\n([\s\S]*?)\r?\n---
```

> Note: The `\r?` makes this compatible with both Unix (LF) and Windows (CRLF) line endings.

Required fields (case-sensitive match within the extracted block):
```
^name:\s+.+$
^description:\s+.+$
^version:\s+\d+\.\d+\.\d+$
```

Output format:
```
## Quality Gate: Level 1 (Frontmatter)

| Field       | Status | Value                |
|-------------|--------|----------------------|
| name        | PASS   | my-awesome-skill     |
| description | PASS   | Does something great |
| version     | PASS   | 1.2.0                |

Result: PASS (3/3 required fields present)
```

If any field is missing, result is HARD FAIL. Publishing cannot proceed.

### Level 2: Warning Checklist

Check for recommended (non-blocking) quality signals:

```
## Quality Gate: Level 2 (Warnings)

| Check                        | Status  | Note                                        |
|------------------------------|---------|---------------------------------------------|
| references/ directory exists | {CHECK} | {path found or "Missing: no reference files"}|
| description length >= 20     | {CHECK} | {char count} characters                     |
| description length <= 200    | {CHECK} | {char count} characters                     |
| Has ## Prerequisites section | {CHECK} |                                             |
| Has ## Examples section      | {CHECK} |                                             |
| Has ## Parameters section    | {CHECK} |                                             |

Warnings: {N}/6
```

Status values: `OK` or `WARN`. Warnings do not block publishing but are displayed to the user.

### Level 3: 10-Point Quick Scan

Derived from skill-scorer anti-pattern analysis. Each item scores 0 or 1. Total out of 10.

```
## Quality Gate: Level 3 (Quick Scan)

| #  | Check                        | Score | Detail                              |
|----|------------------------------|-------|-------------------------------------|
| 1  | Valid YAML frontmatter       | {0/1} | Parseable frontmatter block         |
| 2  | Identity lock present        | {0/1} | "You are..." or "Act as..." found   |
| 3  | Prerequisites listed         | {0/1} | ## Prerequisites section exists     |
| 4  | Step 0 (setup/validation)    | {0/1} | First step checks environment       |
| 5  | Parameters documented        | {0/1} | ## Parameters with typed entries     |
| 6  | Examples provided            | {0/1} | ## Examples with concrete usage      |
| 7  | Validation / error handling  | {0/1} | Error cases or edge cases addressed  |
| 8  | Knowledge disclaimer         | {0/1} | Limitations or scope stated          |
| 9  | Self-contained instructions  | {0/1} | No dangling external-only references |
| 10 | Output format specified      | {0/1} | Expected output shape documented     |

Score: {N}/10
```

---

## Platform Adaptation Templates

When publishing to different platforms, files and metadata may need transformation. Apply these rules before uploading.

### ClawHub Adaptation

**Slug generation:**
1. Take skill directory name (e.g., `my-awesome-skill`)
2. Lowercase, replace spaces and underscores with hyphens: `[^a-z0-9-]` -> `-`
3. Collapse consecutive hyphens: `--+` -> `-`
4. Strip leading/trailing hyphens
5. If user provides a prefix (e.g., `cs-`), prepend: `cs-my-awesome-skill`

**Display name from slug:**
- Split on hyphens, capitalize each word: `my-awesome-skill` -> `My Awesome Skill`

**Tags extraction:**
1. First, check frontmatter for `tags:` field (YAML list)
2. If no tags in frontmatter, extract keywords from `description:` (nouns over 4 chars)
3. Always include `"latest"` as the first tag
4. Maximum 5 tags total

### Anthropic Skills Adaptation

**Frontmatter requirements:**
- `license`: must be present; default to `MIT` if missing
- `author`: must be present; use GitHub username from token verification if missing
- `tags`: must be a YAML list; generate from description if missing

**File path mapping:**
```
{SKILL_DIR}/SKILL.md           -> skills/{slug}/SKILL.md
{SKILL_DIR}/references/*.md    -> skills/{slug}/references/*.md
```

### ECC Community Adaptation

**File path mapping:**
```
{SKILL_DIR}/SKILL.md           -> skills/{slug}/SKILL.md
{SKILL_DIR}/references/*.md    -> skills/{slug}/references/*.md
```

**PR body template:**
```markdown
## New Skill: {SKILL_NAME}

**Description:** {description from frontmatter}
**Version:** {version from frontmatter}

### Files
- `skills/{slug}/SKILL.md`
- `skills/{slug}/references/templates.md`
- `skills/{slug}/references/playbooks.md`
- `skills/{slug}/references/fallbacks.md`
- `skills/{slug}/references/runbook.md`

### Quality Gate
- Frontmatter: PASS
- Quick Scan Score: {N}/10

---
Submitted via skill-publish-to-market
```

### skills.sh Adaptation

**File path mapping:**
```
{SKILL_DIR}/SKILL.md           -> {slug}/SKILL.md
{SKILL_DIR}/references/*.md    -> {slug}/references/*.md
{SKILL_DIR}/README.md          -> {slug}/README.md  (if present)
```

**README.md inclusion:** If `{SKILL_DIR}/README.md` exists, include it in the upload. skills.sh uses README.md as the landing page for the skill registry entry.

---

## Output Template

```
## Publishing Results: {SKILL_NAME} v{VERSION}

| Platform | Status | Details |
|----------|--------|---------|
| ClawHub | {STATUS} | {DETAILS} |
| Anthropic Skills | {STATUS} | {DETAILS} |
| ECC Community | {STATUS} | {DETAILS} |
| skills.sh | {STATUS} | {DETAILS} |

Published via skill-publish-to-market
```

Status values: Success / Failed / Skipped
Details: PR URL, slug@version, or error message

---

## Partial Success Report Template

When some platforms succeed and others fail, use this combined report:

```
## Publishing Results: {SKILL_NAME} v{VERSION}

### Succeeded ({SUCCESS_COUNT}/{TOTAL_COUNT})

| Platform | Details |
|----------|---------|
| {PLATFORM} | {slug@version or PR URL} |

### Failed ({FAILURE_COUNT}/{TOTAL_COUNT})

| Platform | Error | Retryable |
|----------|-------|-----------|
| {PLATFORM} | {error message} | {Yes/No} |

### Recommended Actions
- {action 1, e.g., "Retry `anthropic` -- token scopes may need `repo`"}
- {action 2}

To retry failed platforms only:
> publish {SKILL_NAME} --platforms {failed_platform_1},{failed_platform_2}
```

---

## Follow-up Command Templates

After publishing, users may want to check status or retry. These are the curl implementations for follow-up actions.

### Status Check: ClawHub
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json" \
  "https://clawhub.ai/api/v1/skills/{SLUG}"
```
Returns: version info, download count, publish date.

### Status Check: GitHub PR
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{OWNER}/{REPO}/pulls/{PR_NUMBER}"
```
Extract: `.state` (open/closed/merged), `.mergeable`, `.merged_at`

### Retry Failed Platform
Re-run the publish sequence for a single platform using the same tokens and skill directory. The retry command is identical to the original publish curl for that platform.

### Publish (New Version)
Same as initial publish, but with an incremented version. Bump `version:` in SKILL.md frontmatter before re-running.

---

## Batch Progress Template

When publishing multiple skills, show incremental progress:

```
## Batch Publishing Progress

| # | Skill | ClawHub | Anthropic | ECC | skills.sh |
|---|-------|---------|-----------|-----|-----------|
| 1 | {name} | OK | OK | OK | OK |
| 2 | {name} | OK | FAIL | OK | -- |
| 3 | {name} | ... | ... | ... | ... |

Progress: {completed}/{total} skills
Elapsed: {time}s
```

Individual cell values: `OK`, `FAIL`, `SKIP`, `--` (pending), `...` (in progress)
