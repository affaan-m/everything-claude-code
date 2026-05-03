---
name: production-audit
description: Use this skill when the user asks "is this production-ready", "what would break in prod", "score my project", "audit my repo", or right after merging a feature to main. Audits a SHIPPED repo (deployed URL + GitHub signals + repo structure) for the 14 production-readiness gaps that ~70% of AI-coded projects miss — RLS coverage, webhook idempotency, secret-in-bundle, column GRANT mismatches, Stripe API idempotency, mobile input zoom, and 8 others. Distinct from in-session security skills (security-review, vibesec, owasp) — those scan the editor buffer at write-time; this scans the deployed product post-merge. Run both for serious launches.
origin: commitshow/production-audit
---

# Production Audit

Run an external audit on the repo's shipped state — deployed URL, GitHub signals, secrets exposure, RLS gaps, webhook idempotency, indexes, observability, prompt injection, and ten other failure modes that AI-assisted projects routinely miss.

This is **complementary** to in-session security skills (`security-review`, `vibesec`, OWASP-style). Those scan the editor buffer while you're coding. This scans the deployed product after you commit. Use both — they catch different things.

## When to Activate

- User asks "is this production-ready", "what would break in prod", "score my project", "what did I miss", "audit my repo", "ready to ship".
- Right after merging a feature branch to `main` (helpful as a pre-deploy gate).
- Before a public launch / Show HN post / investor demo.
- When `git log` shows >20 commits since the last `.commitshow/audit.md` was written.

## When NOT to Activate

- During active in-session coding — use `security-review` / in-session skills for line-level patterns. Production-audit is for post-merge / pre-ship review.
- For library or scaffold-form repos — the engine handles **app form** best; libraries get a partial-substitute score.
- If `.commitshow/audit.json` already exists and is < 1 hour old, read that instead of re-running. Audit is rate-limited (anonymous: 20/IP/day · 5/repo/day · 2000/day global).
- Inside a private/non-GitHub repo — the audit pulls public GitHub signals, so private repos return a `not_found` error.

## Procedure

### 1. Run the Audit

From the repo root:

```bash
npx commitshow@latest audit . --json > .commitshow/audit.json 2>&1
```

This also writes a human-readable `.commitshow/audit.md` next to it. Subsequent invocations should diff against the prior `audit.json` if it exists, so you can lead with "+5 since yesterday's audit" instead of just an absolute number.

If the user pointed at a remote URL instead of `.`, swap in the URL: `npx commitshow@latest audit github.com/owner/repo --json`.

### 2. Parse the Envelope

The JSON envelope is stable (`schema_version: "1"`, additive-only). Read these fields:

| Field | Meaning |
|---|---|
| `score.total` | 0-100 production-readiness score |
| `score.delta_since_last` | change vs. parent snapshot · positive = improving |
| `score.band` | `strong` (80+) · `mid` (60-79) · `early` (<60) |
| `concerns[]` | top issues, ordered by impact · each has `axis` + `bullet` |
| `strengths[]` | top 3 things that work · for context only |
| `standing` | optional · only when project is auditioning on commit.show |
| `snapshot.created_at` / `trigger_type` | when the audit ran |

Concerns are sorted by decision-impact, not severity. Position 1 is the bullet to lead with.

### 3. Surface to the User

Lead with score + trajectory in **one sentence**, then the top concerns. Do not dump the full JSON. Format:

```
Score: 82/100 (+5 since yesterday) · band: strong

Top concerns:
  ↓ [Security] No API rate limiting on /auth — IP cap missing
  ↓ [Infrastructure] webhook handler at api/stripe.ts — signature verified, but no
    idempotency-key check (replay attack window open)

Want me to fix the webhook idempotency gap first?
```

Rules:
- Use the exact bullet from `concerns[].bullet` — the audit engine already wrote action-oriented copy.
- Don't list strengths unless the user explicitly asks. They're not actionable in this context.
- Always end with a follow-up question that names a specific concern. Don't ask "what do you want to do?" — ask "fix X first?".
- If `score.delta_since_last` is negative or null, lead with the absolute score only.

### 4. If the User Picks a Concern, Scope a Fix

For the chosen concern:
1. Read the file(s) cited in the bullet.
2. Confirm the gap matches the description (the engine occasionally over-flags when the issue is mitigated elsewhere).
3. Propose a minimal patch — single-file when possible.
4. **Don't apply without explicit approval.** Show the diff first. The user is deciding what to ship; you're a lens.

After applying a fix, suggest re-running `npx commitshow audit --refresh` so the next audit reflects the change.

## Output Format Expectations

Always end your response with one of:
- A specific fix proposal (if the user picked a concern).
- A clarifying question naming the top concern (if the user hasn't picked yet).
- "Already up-to-date — last audit was X minutes ago, score unchanged." (if `audit.json` is fresh and you didn't re-run).

Never end with a generic "let me know if you need anything else."

## Trade-offs

- **External dependency**: the audit hits commit.show's API. Behind a corp firewall blocking `*.supabase.co` it won't work.
- **Cold audit latency**: first audit on a fresh repo takes 60-90s. Cached audits (within 7 days) return instantly. Use `--refresh` to force-bypass cache (counts against rate limits).
- **App-form bias**: scoring is calibrated for deployed apps with a live URL. CLIs / libraries / scaffolds get a partial-substitute score (max ~45/50 on the audit pillar) — fair but not flattering.

## Companion Skills

This skill works **alongside**, not in place of:

| Skill | When |
|---|---|
| `security-review` (ECC built-in) | Editor-buffer scan during coding. Line-level patterns. |
| **`production-audit`** (this) | Post-merge scan of shipped state. Catches deployment-time gaps the in-session lens can't see. |
| `tdd-workflow` / `test-coverage` | Test-quality lens. Different axis — covers what audit's `tests` slot signals only loosely. |

Both lenses miss things the other catches. Run both for serious launches.

## Reference

- Canonical repo: <https://github.com/commitshow/production-audit>
- Audit engine source: <https://github.com/commitshow/commitshow/blob/main/supabase/functions/analyze-project/index.ts>
- 14-frame failure framework documented in the engine source above.
- JSON schema: stable at `schema_version: "1"` · additive-only changes.
- CLI: <https://github.com/commitshow/cli>
- API: `https://api.commit.show/audit?repo=...&format=json`
