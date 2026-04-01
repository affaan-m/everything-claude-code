---
description: Quality Gate bundle — code review, security, testing, and verification before shipping.
---

# Quality Gate Bundle

Full quality pipeline. Run BEFORE committing or creating PRs.

## Skills (sequential)
1. **tdd-workflow** — Ensure tests exist and pass (80%+ coverage)
2. **test-coverage** — Verify coverage numbers
3. **code-review** — General code quality review
4. **python-review** / **typescript-reviewer** — Language-specific review (pick by project)
5. **security-review** — OWASP top 10, secrets, auth, input validation
6. **verification-loop** — Comprehensive verification system
7. **web-design-guidelines** — UI compliance (if frontend changes)
8. **safety-guard** — Prevent destructive ops on production systems
9. **santa-method** — Multi-agent adversarial verification (two reviewers must pass)
10. **click-path-audit** — Trace buttons/touchpoints through full state sequence to find bugs
11. **browser-qa** — Automated visual testing and UI interaction verification
12. **benchmark** — Measure performance baselines, detect regressions before/after PRs
13. **skill-comply** — Verify skills/rules/agents are actually followed (scenario generation)
14. **gan-style-harness** — GAN-inspired Generator-Evaluator for autonomous quality

## Agents to invoke
- **code-reviewer** (sonnet) → general review
- **security-reviewer** (sonnet) → security scan
- **tdd-guide** (sonnet) → test coverage
- Language-specific reviewer based on project

## Quality checklist
- [ ] All tests pass
- [ ] Coverage >= 80%
- [ ] No CRITICAL or HIGH security issues
- [ ] No hardcoded secrets
- [ ] Error handling at all boundaries
- [ ] Frontend: design quality check passed (if applicable)

## Task
$ARGUMENTS
