# Error Recovery Paths

## Case 0: Required Tools Not Available

**Detection:** `curl --version`, `base64`, or `find` returns error

**Recovery by tool:**
- `curl` missing:
  - macOS: `brew install curl`
  - Ubuntu: `sudo apt install curl`
  - Alpine: `apk add curl`
- `base64` missing:
  - Ubuntu: `sudo apt install coreutils`
  - macOS: pre-installed
- `find` missing:
  - Ubuntu: `sudo apt install findutils`
  - macOS: pre-installed

**Windows users:**
This skill requires a Unix-like environment. Options:
1. **WSL (recommended):** `wsl --install` in PowerShell, then run inside WSL
2. **Git Bash:** Install Git for Windows, use Git Bash terminal
3. **Docker:** Run inside a Linux container

**NEVER simulate tool output. If any required tool is unavailable, STOP.**

---

## Case 1: GitHub Token Invalid

**Detection:** `GET /user` returns 401
**Message:** "GitHub token is invalid or expired. Please generate a new one at https://github.com/settings/tokens/new (select repo + workflow scopes)."
**Recovery:** Ask user for a new token, re-verify.

---

## Case 2: GitHub Token Missing Scopes

**Detection:** Fork or file upload returns 403 "Resource not accessible by personal access token"
**Message:** "Your GitHub token doesn't have the required scopes. It needs `repo` and `workflow`. Please regenerate at https://github.com/settings/tokens/new."
**Recovery:** Ask user to regenerate with correct scopes.

---

## Case 3: ClawHub Token Invalid

**Detection:** `GET /api/v1/whoami` returns non-200
**Message:** "ClawHub token is invalid. Please check your token at https://clawhub.ai (Settings -> API Tokens)."
**Recovery:** Ask for new token.

---

## Case 4: ClawHub Version Already Exists

**Detection:** `POST /api/v1/skills` returns 400 with "Version already exists"
**Recovery:**
1. Parse current version X.Y.Z
2. Bump to X.Y.(Z+1)
3. Retry publish with new version
4. Max 5 retries. If all fail: "Version conflict after 5 retries. Please manually delete the old version on ClawHub or use a different version number."

---

## Case 5: GitHub Fork Already Exists

**Detection:** Fork API returns 200 (not 202)
**Recovery:** This is normal. Fork is idempotent. Proceed with existing fork.

---

## Case 6: GitHub Branch Already Exists

**Detection:** Create ref returns 422 "Reference already exists"
**Recovery:** Append `-{timestamp}` to branch name and retry.

---

## Case 7: GitHub File Already Exists (Update)

**Detection:** PUT contents returns 409 "sha was not supplied"
**Recovery:**
1. GET the existing file to obtain its SHA
2. Include `"sha": "{existing_sha}"` in the PUT request
3. Retry

---

## Case 8: Network Timeout

**Detection:** curl returns exit code 28 (timeout)
**Recovery:**
1. Wait 3 seconds
2. Retry the same request
3. Max 3 retries with exponential backoff (3s, 6s, 12s)
4. If all fail: "Network timeout. Check your internet connection and try again."

---

## Case 9: SKILL.md Not Found

**Detection:** `cat {skill_path}/SKILL.md` fails
**Message:** "No SKILL.md found at {skill_path}. Please provide the correct path to your skill directory."
**Recovery:** Ask user for correct path.

---

## Case 10: SKILL.md Missing Frontmatter

**Detection:** No `---` YAML block at the top
**Message:** "SKILL.md is missing the required frontmatter (name, description, version). Please add it."
**Recovery:** Show example frontmatter format and ask user to fix.

---

## Case 11: Rate Limited

**Detection:** GitHub API returns 403 with "rate limit exceeded" or 429
**Recovery:**
1. Parse `X-RateLimit-Reset` header for reset time
2. Inform user: "GitHub rate limit reached. Resets at {time}."
3. Wait or ask user to retry later.

---

## Case 12: Large File Rejected

**Detection:** GitHub Content API rejects files > 1MB
**Recovery:** "File {filename} is too large for GitHub API (>1MB). Consider splitting or compressing."

---

## Case 13: Quality Gate Hard Failure

**Detection:** Quality Gate Level 1 fails -- SKILL.md exists but is missing required frontmatter fields, or SKILL.md does not exist at all.

**Two sub-cases:**

### Case 13a: SKILL.md missing entirely
**Detection:** No SKILL.md file in the skill directory.
**Message:**
```
Quality Gate HARD FAIL: No SKILL.md found.

A SKILL.md file with valid frontmatter is required before publishing.
The file must contain at minimum:

---
name: your-skill-name
description: What this skill does
version: 1.0.0
---

Suggestion: Use skill-architect to generate a proper SKILL.md:
> /skill-architect create --name "your-skill-name"
```
**Recovery:** Do not proceed. The user must create SKILL.md first. Suggest skill-architect if available.

### Case 13b: SKILL.md exists but frontmatter is invalid
**Detection:** Quality Gate Level 1 reports missing or malformed fields.
**Message:**
```
Quality Gate HARD FAIL: Frontmatter validation failed.

| Field       | Status | Issue                         |
|-------------|--------|-------------------------------|
| name        | FAIL   | Missing                       |
| description | PASS   | OK                            |
| version     | FAIL   | "v1" is not valid semver      |

Required format:
---
name: lowercase-with-hyphens
description: At least 10 characters
version: X.Y.Z (semantic versioning)
---

Fix the frontmatter in SKILL.md and retry.
Alternatively: /skill-architect can regenerate the frontmatter block.
```
**Recovery:** Show exactly which fields failed and why. Provide the corrected format. Do not proceed until Level 1 passes.

---

## Case 14: Partial Publish Success

**Detection:** At least one platform returned success and at least one returned failure during the same publish session.

This is not an error in the traditional sense -- it is an expected outcome in distributed publishing. The key concern is avoiding duplicate publishes on platforms that already succeeded.

**Recovery:**

### Step 1: Classify each platform
For each platform, record:
- **Succeeded**: publish completed, artifact is live
- **Failed**: publish did not complete, no artifact created
- **Indeterminate**: request sent but no clear success/failure response (e.g., timeout after PR creation -- PR may or may not exist)

### Step 2: Determine idempotency per platform

| Platform | Idempotent? | Safe to re-publish? | Risk of duplicate |
|----------|-------------|---------------------|-------------------|
| ClawHub | Yes (same version = 400, bump version = new) | Yes | No -- version conflict rejects exact duplicate |
| Anthropic Skills | No (PR is created) | Check first | Yes -- could create duplicate PR |
| ECC Community | No (PR is created) | Check first | Yes -- could create duplicate PR |
| skills.sh | No (PR is created) | Check first | Yes -- could create duplicate PR |

### Step 3: Safe retry procedure
For failed platforms:
- **ClawHub**: Retry directly. If same version already exists, the version bump logic handles it.
- **GitHub-based platforms**: Before retrying, check if a PR already exists:
  ```bash
  curl -s \
    -H "Authorization: Bearer {TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/{OWNER}/{REPO}/pulls?head={USERNAME}:add-skill-{name}&state=open"
  ```
  - If a PR exists: report it and do NOT create another
  - If no PR exists: safe to retry from scratch

### Step 4: Report
```
## Partial Success Recovery

| Platform | Original Status | Retry Safe? | Action |
|----------|----------------|-------------|--------|
| ClawHub | Succeeded | -- | No action needed |
| Anthropic | Failed (timeout) | Yes (no existing PR) | Retry available |
| ECC | Failed (403) | Check token first | Fix scopes, then retry |
| skills.sh | Succeeded | -- | No action needed |

To retry failed platforms:
> publish {skill} --platforms anthropic,ecc
```

---

## Case 15: Batch Interruption

**Detection:** A batch publish of multiple skills was interrupted -- the process stopped (Ctrl+C, crash, network loss, or a fatal error on one skill) before all skills were processed.

**Recovery:**

### Step 1: Save progress
At the point of interruption, record:
- **Completed skills**: list of skills that finished publishing to all requested platforms
- **Partially completed skill**: the skill that was mid-publish when interruption occurred (with per-platform status)
- **Pending skills**: skills that were never started

```
## Batch Interrupted at Skill #12 of 20

### Completed (11 skills)
api-design, code-reviewer, e2e-testing, frontend-patterns,
golang-testing, python-patterns, react-ui, security-review,
tailwind-css, tdd-workflow, web-accessibility

### Interrupted (1 skill)
django-patterns:
  ClawHub: OK
  Anthropic: OK
  ECC: TIMEOUT (mid file-upload, step 3/5)
  skills.sh: NOT STARTED

### Pending (8 skills)
django-tdd, laravel-patterns, laravel-tdd, nodejs-backend,
rust-patterns, rust-testing, springboot-patterns, vue

### Resume
> publish --resume
This will:
1. Skip the 11 completed skills
2. Retry ECC and skills.sh for django-patterns
3. Continue with the 8 pending skills
```

### Step 2: Resume logic
When the user runs resume:
1. Read the saved progress state
2. For completed skills: skip entirely
3. For the interrupted skill: apply Case 14 logic (check idempotency, retry failed platforms only)
4. For pending skills: publish normally starting from the next one
5. Continue with normal batch logic (batches of 5, pauses between batches)

### Step 3: Final reconciliation
After resume completes, produce a combined report that merges results from the original run and the resumed run:
```
## Batch Complete (Original + Resume)

Total: 20 skills
Succeeded: 19 (all platforms)
Partial: 1 (django-patterns: ECC still failing)

> Retry single failure: publish django-patterns --platforms ecc
```

---

## General Recovery Pattern

For any unhandled error:
1. Show the HTTP status code and response body (first 200 chars)
2. Identify which platform failed
3. Continue with remaining platforms
4. Include failure details in the results table
