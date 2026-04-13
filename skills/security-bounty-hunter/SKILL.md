---
name: security-bounty-hunter
description: Use this skill when scanning repositories for network-exploitable vulnerabilities that qualify for bug bounties on Huntr, HackerOne, or Bugcrowd. Knows which findings get accepted vs rejected, skips local-only patterns, and produces submission-ready reports.
origin: community
---

# Security Bounty Hunter

Systematic vulnerability scanning for bug bounty submissions. Focuses exclusively on network-exploitable findings that platforms actually accept and pay for.

## When to Use

- Scanning a GitHub repository for security vulnerabilities
- Preparing a bug bounty submission for Huntr, HackerOne, or Bugcrowd
- Evaluating whether a finding is in-scope for a bounty
- Writing a proof-of-concept for a vulnerability
- Reviewing code for SSRF, auth bypass, RCE, SQLi, or path traversal

## Core Principle: Network-Exploitable Only

Bug bounty platforms reject local-only findings. Every vulnerability must be triggerable by a remote attacker over the network.

### In-Scope (Platforms Pay For)

| Category | Examples |
|----------|---------|
| **SSRF** | Attacker-controlled URLs fetched server-side |
| **Auth Bypass** | Missing or broken authentication on endpoints |
| **RCE** | Remote code execution via user input |
| **SQLi** | SQL injection in query parameters or bodies |
| **Path Traversal** | Reading files outside intended directories |
| **XSS (Stored)** | Persistent cross-site scripting |
| **IDOR** | Accessing other users' data via ID manipulation |
| **Prototype Pollution** | Polluting Object.prototype via user input in Node.js |

### Out-of-Scope (Platforms Reject)

| Category | Why Rejected |
|----------|-------------|
| **Pickle/torch.load deserialization (local-only)** | Rejected when the data source is a local file; see In-Scope RCE for cases where attacker controls the serialized data via HTTP |
| **ReDoS** | Low severity, rarely paid |
| **Missing rate limiting** | Informational only |
| **Self-XSS** | Requires victim to paste code |
| **Open redirects** | Low severity unless chained |
| **Missing security headers** | Informational |
| **Denial of service via resource exhaustion** | Usually informational |

## How It Works

### Step 1: Identify Attack Surface

```bash
# Find all route handlers and endpoints
grep -rn "@app\.\(get\|post\|put\|delete\|patch\)" --include="*.py" .
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" --include="*.ts" --include="*.js" .
grep -rn "app\.\(get\|post\|put\|delete\|patch\)" --include="*.js" .

# Find input handling
grep -rn "request\.\(args\|form\|json\|data\|files\|headers\)" --include="*.py" .
grep -rn "req\.\(body\|params\|query\|headers\)" --include="*.ts" --include="*.js" .
```

### Step 2: Trace User Input to Dangerous Sinks

For each input point, trace data flow to these sinks:

```python
# SSRF sinks
requests.get(user_input)
urllib.request.urlopen(user_input)
httpx.get(user_input)

# SQLi sinks
cursor.execute(f"SELECT * FROM users WHERE id={user_input}")
db.engine.execute("SELECT * FROM " + user_input)

# RCE sinks
os.system(user_input)
subprocess.call(user_input, shell=True)
eval(user_input)

# Path traversal sinks
open(base_path + user_input)
send_file(user_controlled_path)
```

```javascript
// SSRF sinks
fetch(userInput)
axios.get(userInput)
http.request(userInput)

// RCE sinks
child_process.exec(userInput)
vm.runInNewContext(userInput)
eval(userInput)

// SQLi sinks
db.query(`SELECT * FROM users WHERE id=${userInput}`)
connection.query("SELECT * FROM " + userInput)

// Prototype pollution sinks
merge(target, userInput)
Object.assign(target, JSON.parse(userInput))
_.defaultsDeep(target, userInput)
```

### Step 3: Verify Exploitability

Before reporting, confirm:

1. **Input is attacker-controlled** -- comes from HTTP request, not config file
2. **No sanitization blocks the attack** -- check for input validation, WAFs, parameterized queries
3. **The sink is reachable** -- follow the code path, check for early returns or auth guards
4. **Impact is meaningful** -- data leak, code execution, or privilege escalation

### Step 4: Build Proof of Concept

```python
# PoC template for SSRF
import requests

target = "https://vulnerable-app.com/api/fetch"
payload = {"url": "http://169.254.169.254/latest/meta-data/"}
response = requests.post(target, json=payload)
print(f"Status: {response.status_code}")
print(f"Body: {response.text[:500]}")
```

```python
# PoC template for SQLi
import requests

target = "https://vulnerable-app.com/api/users"
payload = {"id": "1' OR '1'='1' --"}
response = requests.get(target, params=payload)
print(f"Status: {response.status_code}")
try:
    data = response.json()
    print(f"Returned {len(data)} records (expected 1)")
except Exception:
    print(f"Body: {response.text[:500]}")
```

## Report Template

```markdown
## Summary

[One sentence describing the vulnerability]

## Vulnerability Type

[SSRF / SQLi / RCE / Auth Bypass / Path Traversal / XSS / IDOR]

## Affected Component

- **File:** `path/to/vulnerable/file.py`
- **Line:** 42
- **Function:** `fetch_remote_resource()`
- **Endpoint:** `POST /api/fetch`

## Description

[2-3 paragraphs explaining the vulnerability, how user input reaches
the dangerous sink, and what an attacker can achieve]

## Steps to Reproduce

1. Send a POST request to `/api/fetch`
2. Observe the response contains internal data
3. This confirms the server processes attacker-controlled input unsafely

## Proof of Concept

[Include working PoC script]

## Impact

[Describe what an attacker can achieve: data exfiltration, RCE, etc.]

## Suggested Fix

[Provide a concrete code fix]
```

## Anti-Patterns

### WRONG: Reporting local-only findings

```python
# DO NOT report pickle deserialization as a bounty
# Platforms mark this "informative" -- requires local file access
torch.load(model_path)  # Not a bounty
pickle.loads(data)       # Only a bounty if data comes from HTTP request
```

### WRONG: Reporting without verifying the code path

```python
# DO NOT report a sink behind authentication you cannot bypass
@require_admin        # <-- This blocks unauthenticated attackers
def dangerous_endpoint(request):
    os.system(request.data["cmd"])  # Sink exists but is not reachable
```

### WRONG: Submitting duplicate findings

Always check existing reports on the platform before submitting. Search the repo's security advisories and closed issues for prior reports of the same finding.

## Best Practices

- Read the program's scope and rules before scanning
- Check if the repository has a `SECURITY.md` or bug bounty program link
- One vulnerability per report -- do not bundle multiple findings
- Include exact file paths, line numbers, and commit hashes
- Provide a working PoC, not just a theoretical description
- Suggest a fix with a code snippet
- Be professional and concise in report language
- Follow responsible disclosure timelines

## Platform-Specific Notes

### Huntr
- Focuses on open-source repositories
- Fastest triage (usually 48-72 hours)
- Pays for confirmed vulnerabilities in popular packages
- Rejects: local deserialization, ReDoS, missing headers

### HackerOne
- Scope varies per program -- always read program policy
- Requires clear impact statement
- Duplicate reports get closed, check first

### Bugcrowd
- P1-P4 severity scale determines payout
- P1 (critical): RCE, auth bypass on admin
- P2 (high): SQLi, SSRF with internal access
- P3 (medium): stored XSS, IDOR
- P4 (low): rarely paid

## Examples

```
User: "Scan this Flask app for vulnerabilities"
→ Skill identifies routes, traces user input to sinks, finds SSRF in /api/proxy endpoint, generates PoC and submission-ready report.

User: "Is this eval() call exploitable?"
→ Skill traces input source — if from HTTP request with no sanitization, confirms RCE and builds PoC. If from config file, marks out-of-scope.

User: "Write a bounty report for this SQLi"
→ Skill generates report using the template: summary, affected component, description, steps to reproduce, PoC script, impact, and suggested fix.
```

## Related Skills

- `security-review` -- general security checklist
- `security-scan` -- automated scanning patterns
- `django-security` -- Django-specific security
- `springboot-security` -- Spring Boot security
