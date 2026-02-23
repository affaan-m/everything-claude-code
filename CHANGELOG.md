# CHANGELOG

All notable changes to this project will be documented in this file.

## [Unreleased] — 2026-02-23 (Ecosystem Sync)

### Maintenance
- **SYNCED:** Git repository updated from 6 commits behind origin/main to current (commit 64964f5). Fast-forward merge completed successfully.
- **SYNCED:** Upstream remote (`affaan-m/everything-claude-code`) added and fetched. Ready for upstream-based development workflow.
- **ACTION:** Code CLI git sync completed as part of cross-surface ecosystem repair (ACTION 1/3).

---

## [1.0.0] — 2026-02-22 (Post-Migration Baseline)

This release marks the finalization of the macOS-only migration and includes critical security and CI hygiene fixes. It establishes a clean baseline for future development.

### Security & Integrity
- **FIXED:** Critical vulnerability where literal `$HOME` in MCP deny-list JSON was not resolving, leaving filesystem protections inactive. Setup script now injects absolute paths at config generation time. (PR #13)
- **FIXED:** Release artifact zip now explicitly excludes `.env`, `.git/`, `node_modules/`, `__pycache__/`, `.pytest_cache/`, `venv/`, `build/`, and `.DS_Store`. (PR #15)
- **ADDED:** Pre-release CI step (`validate-artifact.sh`) that asserts banned files are absent from release artifacts using anchored regex patterns.
- **ADDED:** Security test (`test/test_session_start.sh`) that validates `session-start.sh` resolves `$HOME` correctly and protects all four designated filesystem roots.

### Build & CI
- **RETIRED:** Windows ARM64 CI support officially removed. All workflows simplified to macOS-only (`runs-on: macos-14`). (PRs #16, #18)
- **FIXED:** Shellcheck CI scoped to changed files only using `$GITHUB_BASE_REF`, unblocking development while legacy violations are cleaned up. (PR #14)
- **FIXED:** Reverted unintentional markdownlint-cli downgrade from `^0.47.0` to `^0.12.0` caused by `npm audit fix`. (PR #17)
- **ADDED:** `.github/CODEOWNERS` requiring review of `package.json`, `package-lock.json`, workflow YAMLs, `session-start.sh`, and `Makefile`.
- **ADDED:** CODEOWNERS syntax validation CI workflow.
- **ADDED:** `.env.example` documenting required environment variables.

### Documentation & Technical Debt
- **ADDED:** This `CHANGELOG.md` establishing v1.0.0 post-migration baseline.

### Known Limitations
- **ACCEPTED RISK:** `scripts/fetch-copilot-branch.sh` uses destructive `git checkout -B`. Risk is accepted for single-platform (macOS) use with documented warning. Follow-up task: refactor to `git fetch` + `git switch --create`.
- **SCHEDULED:** Full repository shellcheck cleanup (dedicated technical debt PR).
- **SCHEDULED:** Branch protection rules enforcement via GitHub API or UI.

### Maintenance Notes
- Future `npm audit fix` runs should use `--package-lock-only` to prevent unintended dependency resolution changes.
- CI runner OS is pinned to `macos-14`. Update via GitHub repo variable `CI_RUNNER_OS` when intentional.
