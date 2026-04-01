# Publishing Playbooks

## Playbook 1: Publish to All Platforms

**Trigger:** User says "publish to all" or "发布到所有平台"

**Sequence:**
1. Collect GitHub PAT + ClawHub token
2. Verify both tokens
3. Read skill files
4. Run Quality Gate (all 3 levels) -- STOP if Level 1 fails
5. Apply Platform Adaptation for each target
6. Publish to ClawHub (fastest, no PR needed)
7. Publish to Anthropic Skills (fork + PR)
8. Publish to ECC Community (fork + PR)
9. Publish to skills.sh (file upload)
10. Report all results (use Partial Success Report if mixed outcomes)

**Key:** Each platform is independent. One failure does NOT block others.

---

## Playbook 2: ClawHub Only

**Trigger:** User says "publish to ClawHub" or "上传到 ClawHub"

**Sequence:**
1. Collect ClawHub token
2. Verify: `GET /api/v1/whoami`
3. Read SKILL.md + reference files
4. Run Quality Gate Level 1 (frontmatter required)
5. Apply ClawHub Adaptation (slug, displayName, tags)
6. POST to `/api/v1/skills`
7. Handle version conflict -> bump and retry
8. Report: slug@version

**Slug rules:**
- Lowercase, hyphens only
- If user provides prefix (e.g., `cs-`): prepend to skill name
- Display name auto-generated: `my-skill` -> `My Skill`

---

## Playbook 3: GitHub PR (Anthropic Skills or ECC)

**Trigger:** User says "submit PR to anthropic" or "提交到 ECC"

**Sequence:**
1. Collect GitHub PAT
2. Verify: `GET /user`
3. Run Quality Gate Level 1 (frontmatter required)
4. Apply platform-specific adaptation (Anthropic or ECC)
5. Fork target repo (idempotent)
6. Wait 3 seconds (fork propagation)
7. Get default branch ref
8. Create feature branch: `add-skill-{name}-{timestamp}`
9. Upload each file (base64 encoded)
10. Create PR against default branch (use ECC PR body template for ECC)
11. Report: PR URL

**File mapping for Anthropic Skills:**
```
skills/{skill-name}/SKILL.md
skills/{skill-name}/references/templates.md
skills/{skill-name}/references/playbooks.md
skills/{skill-name}/references/fallbacks.md
skills/{skill-name}/references/runbook.md
```

**File mapping for ECC Community:**
```
skills/{skill-name}/SKILL.md
skills/{skill-name}/references/templates.md
skills/{skill-name}/references/playbooks.md
skills/{skill-name}/references/fallbacks.md
skills/{skill-name}/references/runbook.md
```

---

## Playbook 4: First-Time User

**Trigger:** User has no tokens yet

**Sequence:**
1. Detect missing tokens
2. Show credential tutorial:
   - GitHub: "Open https://github.com/settings/tokens/new, select repo + workflow, generate"
   - ClawHub: "Open https://clawhub.ai, Settings -> API Tokens -> Create"
3. Wait for user to provide tokens
4. Verify tokens
5. Proceed with publish

**Important:** Never store tokens. They are used for the current session only.

---

## Playbook 5: Batch Publish (Multiple Skills)

**Trigger:** User says "publish all skills in this directory"

**Sequence:**
1. Find all directories containing SKILL.md
2. List discovered skills for confirmation
3. Collect tokens once
4. Publish each skill sequentially
5. Report aggregated results table

**Rate limiting:**
- GitHub API: max 30 requests/minute for authenticated users
- GitHub Abuse Detection: creating multiple forks/PRs rapidly can trigger secondary rate limits
- ClawHub: no documented rate limit, but add 1s delay between publishes
- For >10 skills: add 2s delay between each to avoid rate limits

**Anti-abuse strategy for GitHub:**
- After every 3 consecutive fork operations: pause 10 seconds
- If HTTP 429 or 403 with "abuse detection" received:
  1. Parse `Retry-After` header (seconds) or `X-RateLimit-Reset` (Unix timestamp)
  2. Wait the indicated time (or 60s if no header)
  3. Resume from the failed operation
  4. If 3 consecutive 429s: STOP and report to user
- Between each PR creation: minimum 3 second delay

---

## Playbook 6: Degraded Publishing

**Trigger:** Network instability detected (timeouts, intermittent failures), or user reports connectivity issues

Publishing should be resilient. Not every platform needs to succeed in the same session. This playbook handles graceful degradation.

**Sequence:**
1. Collect tokens and run Quality Gate as usual
2. **Attempt ClawHub first** -- HTTP-based, most reliable, fastest round-trip
   - ClawHub uses a single POST with FormData; no multi-step fork/branch/upload chain
   - If ClawHub succeeds: at least one platform is covered
3. **Attempt GitHub-based platforms** (Anthropic, ECC, skills.sh) in order
   - Each GitHub publish involves 5+ sequential API calls (fork, ref, branch, upload x N, PR)
   - If any step times out mid-chain:
     a. Record which step failed and the partial state (e.g., "branch created but files not uploaded")
     b. Do NOT retry the entire chain automatically -- partial state makes blind retry dangerous
     c. Move to the next platform
4. **After all attempts, classify results:**
   - Full success: all requested platforms succeeded
   - Partial success: at least one succeeded, others failed
   - Full failure: nothing succeeded

**On partial success:**
```
## Degraded Publishing Report

Succeeded: ClawHub (cs-my-skill@1.0.0)
Failed: Anthropic (timeout at file upload step 3/5), ECC (timeout at fork)

Save these for retry:
- Anthropic: branch `add-skill-my-skill-1711929600` exists on fork; resume from file upload
- ECC: no partial state; safe to retry from scratch

> Retry failed platforms when network stabilizes:
> publish my-skill --platforms anthropic,ecc --retry
```

**On full failure -- diagnose the cause:**
1. **Network down?** Run `curl -s -o /dev/null -w "%{http_code}" https://api.github.com` -- if no response, it is a connectivity issue
2. **Token expired?** Re-verify tokens; if 401, ask for new tokens
3. **API outage?** Check `https://www.githubstatus.com/` or `https://clawhub.ai/status` (if available)
4. Report diagnosis to user with actionable next step

---

## Playbook 7: Post-Publish Status Check

**Trigger:** User says "check publish status", "检查发布状态", or time has passed since publishing

After publishing, users want to know whether PRs were merged, whether ClawHub shows the new version, and basic engagement metrics. This playbook gathers that information.

**Sequence:**

### Step 1: Gather publish records
Retrieve the results from the most recent publish session (from the execution log). Extract:
- ClawHub slug and version
- GitHub PR URLs and numbers for each platform

### Step 2: Check ClawHub status
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json" \
  "https://clawhub.ai/api/v1/skills/{SLUG}"
```
Extract and report:
- Current published version
- Download count (if available in API response)
- Publish date

### Step 3: Check GitHub PR status (for each PR)
```bash
curl -s \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{OWNER}/{REPO}/pulls/{PR_NUMBER}"
```
Extract and report:
- `.state`: open / closed
- `.merged`: true / false
- `.merged_at`: merge timestamp (if merged)
- `.comments`: comment count (indicates reviewer activity)
- `.review_comments`: review comment count

### Step 4: Report
```
## Post-Publish Status: {SKILL_NAME}

| Platform | Status | Details |
|----------|--------|---------|
| ClawHub | Live v{version} | {download_count} downloads |
| Anthropic Skills | PR #{number} {state} | {merged_at or "Awaiting review"} |
| ECC Community | PR #{number} {state} | {comments} comments |
| skills.sh | PR #{number} {state} | {merged_at or "Awaiting review"} |

Last checked: {timestamp}
```

---

## Playbook 8: Batch Publishing (5+ Skills)

**Trigger:** User has 5 or more skills to publish, or says "batch publish", "批量发布"

For large batches, sequential one-by-one publishing is too slow and error-prone. This playbook adds structure: discovery, pre-check, batched execution, and aggregated reporting.

**Sequence:**

### Step 1: Discover skill directories
```bash
find {BASE_DIR} -name "SKILL.md" -maxdepth 3 | sort
```
List all discovered skills and ask for confirmation before proceeding:
```
Found 12 skills:
  1. api-design (v1.0.0)
  2. code-reviewer (v2.1.0)
  3. e2e-testing (v1.3.0)
  ...
  12. web-performance (v1.0.0)

Publish all 12? [Y/n]
```

### Step 2: Batch Quality Gate
Run Quality Gate Level 1 on ALL skills before publishing any. This prevents discovering failures mid-batch.

```
## Batch Quality Gate

| # | Skill | Level 1 | Level 3 Score | Ready |
|---|-------|---------|---------------|-------|
| 1 | api-design | PASS | 8/10 | Yes |
| 2 | code-reviewer | PASS | 9/10 | Yes |
| 3 | broken-skill | FAIL (no version) | -- | No |

11/12 ready to publish. 1 blocked.
Proceed with 11? [Y/n]
```

Skills that fail Level 1 are excluded from the batch. The user can fix them and re-run.

### Step 3: Publish in batches of 5
Split the ready skills into groups of 5. Publish each group sequentially within the group, with a pause between groups.

- Within a batch: publish each skill to all requested platforms, 1-second delay between skills
- Between batches: 10-second pause to avoid rate limits and GitHub abuse detection
- After each batch: print incremental progress table

```
## Batch 1/3 Complete

| # | Skill | ClawHub | Anthropic | ECC | skills.sh |
|---|-------|---------|-----------|-----|-----------|
| 1 | api-design | OK | OK | OK | OK |
| 2 | code-reviewer | OK | OK | OK | OK |
| 3 | e2e-testing | OK | FAIL | OK | OK |
| 4 | frontend-patterns | OK | OK | OK | OK |
| 5 | golang-testing | OK | OK | OK | OK |

Pausing 5s before batch 2...
```

### Step 4: Aggregate results
After all batches complete, produce a final summary:

```
## Batch Publishing Complete

Total: 11 skills across 4 platforms = 44 publish operations
Succeeded: 42
Failed: 2
Skipped: 0

### Failures
| Skill | Platform | Error |
|-------|----------|-------|
| e2e-testing | Anthropic | 403 token scope |
| web-perf | skills.sh | 404 repo not found |

### Retry
> publish e2e-testing --platforms anthropic
> publish web-perf --platforms skills-sh
```

### Step 5: Pause between batches
If the user presses Ctrl+C or says "pause" during batch execution:
1. Finish the current skill (do not interrupt mid-publish)
2. Record progress: which skills completed, which are pending
3. Offer: "Paused after skill #{N}. Resume with: `publish --resume`"
