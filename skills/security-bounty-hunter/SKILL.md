---
name: security-bounty-hunter
description: Scan any GitHub repository for exploitable security vulnerabilities that qualify for bug bounties on Huntr, HackerOne, and similar platforms. Focuses on network-exploitable issues only — skips local-only patterns that get rejected. Use when asked to find security bugs, scan repos for vulnerabilities, or prepare bounty submissions.
origin: community
---

# Security Bounty Hunter Skill

Scan repositories for vulnerabilities that actually pay bounties — not theoretical issues that get marked informative.

## When to Activate

- "Scan this repo for security vulnerabilities"
- "Find bugs for bounty submission"
- "Check this codebase for exploitable issues"
- "Prepare a Huntr/HackerOne report"

## What to Scan For (IN SCOPE)

These patterns pay bounties because they are remotely exploitable:

| Pattern | CWE | Bounty Range |
|---------|-----|-------------|
| SSRF via user-controlled URLs in HTTP handlers | CWE-918 | $500-3,000 |
| Auth bypass in API middleware | CWE-287 | $500-5,000 |
| RCE via remote file upload → deserialization | CWE-502 | $1,000-4,000 |
| SQL injection in web endpoints | CWE-89 | $500-3,000 |
| Command injection in HTTP request handlers | CWE-78 | $500-3,000 |
| Path traversal in file serving endpoints | CWE-22 | $500-2,000 |
| XSS with auto-trigger (not self-XSS) | CWE-79 | $200-1,000 |

## What to SKIP (OUT OF SCOPE)

These get rejected on every platform — do not waste time:

- `torch.load` / `pickle.loads` on local files (Huntr: "local deserialization not in scope")
- `eval()` / `exec()` in CLI tools without network exposure
- `subprocess` with `shell=True` on hardcoded commands
- Missing HTTP headers (HSTS, CSP, clickjacking)
- Rate limiting issues
- Self-XSS requiring victim to paste code
- CI/CD injection (GitHub Actions command injection)
- Test/example/demo code vulnerabilities

## Workflow

1. **Check scope first**: Does the repo have a SECURITY.md? Is it on Huntr/HackerOne?
2. **Identify web surface**: Find HTTP servers, API endpoints, file upload handlers
3. **Run Semgrep**: `semgrep --config=auto --severity=ERROR --severity=WARNING --json`
4. **Filter results**: Remove test files, examples, docs, vendored code
5. **Verify each finding**: Read 50+ lines of context. Check if input is user-controlled AND reaches a sink via network path
6. **Check for duplicates**: Search GitHub issues and security advisories
7. **Draft report**: Include PoC, impact statement, CVSS score, affected versions

## Report Template

```markdown
## Description
[One paragraph: what the vulnerability is and why it matters]

## Vulnerable Code
[File path + line numbers + code snippet]

## Proof of Concept
[Working script/curl command that demonstrates the issue]

## Impact
[What an attacker can achieve: RCE, data theft, auth bypass, etc.]

## Affected Version
[Version tested against]
```

## Quality Gate

Before submitting ANY report, verify:
- [ ] The vulnerable code path is reachable from a network request
- [ ] The input is user-controlled (not hardcoded or admin-only)
- [ ] No existing CVE or security advisory covers this exact issue
- [ ] The PoC actually works (not just a theoretical code path)
- [ ] The repo is in scope on the target bounty platform
