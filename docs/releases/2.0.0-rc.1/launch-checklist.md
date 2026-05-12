# ECC v2.0.0-rc.1 Launch Checklist

## Repo

- verify local `main` is synced to `origin/main`
- verify `docs/ECC-2.0-GA-ROADMAP.md` reflects the current Linear milestone plan
- verify `docs/HERMES-SETUP.md` is present
- verify `docs/architecture/cross-harness.md` is present
- verify this release directory is committed
- keep private tokens, personal docs, and raw workspace exports out of the repo

## Release Surface

- verify package, plugin, marketplace, OpenCode, and agent metadata stays at `2.0.0-rc.1`
- verify `ecc2/Cargo.toml` stays at `0.1.0` for rc.1; `ecc2/` remains an alpha control-plane scaffold
- complete `publication-readiness.md` with fresh evidence before any GitHub release, npm publish, plugin submission, or announcement post
- update release metadata in one dedicated release-version PR
- run the root test suite
- run `cd ecc2 && cargo test`

## Content

- publish the X thread from `x-thread.md`
- publish the LinkedIn draft from `linkedin-post.md`
- use `article-outline.md` for the longer writeup
- record one 30-60 second proof-of-work clip

## Demo Asset Suggestions

- Hermes plus ECC side by side
- release docs being generated or reviewed from the repo
- a workflow moving from brief to post to checklist
- `ecc2/` dashboard or session surface with alpha framing

## Messaging

Use language like:

- "release candidate"
- "sanitized operator stack"
- "cross-harness operating system for agentic work"
- "ECC is the reusable substrate; Hermes is the operator shell"
- "private/local integrations land after sanitization"
