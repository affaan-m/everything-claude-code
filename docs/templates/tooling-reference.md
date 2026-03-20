# Claude Code Tooling Reference

Exact install commands, agent inventories, and usage patterns for the three repos
that every generated spec must reference.

---

## 1. Everything Claude Code (ECC)

**Repo:** `github.com/Brainmetrix/everything-claude-code`  
**Type:** Claude Code plugin — agents, skills, hooks, commands, rules

### Install

```bash
# Plugin install (recommended)
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code

# Then install rules manually (plugins can't distribute rules)
git clone https://github.com/Brainmetrix/everything-claude-code.git /tmp/ecc
cp -r /tmp/ecc/rules/frappe/ .claude/rules/frappe/
cp -r /tmp/ecc/rules/common/ .claude/rules/common/
cp -r /tmp/ecc/rules/python/ .claude/rules/python/
```

### Frappe Agents (13)

| Agent | File | Purpose |
|---|---|---|
| frappe-planner | agents/frappe/frappe-planner.md | Implementation blueprints before coding |
| frappe-api-agent | agents/frappe/frappe-api-agent.md | Generate whitelisted API endpoints |
| frappe-architect | agents/frappe/frappe-architect.md | Validate data model and relationships |
| frappe-tdd-guide | agents/frappe/frappe-tdd-guide.md | Write tests for controllers |
| frappe-reviewer | agents/frappe/frappe-reviewer.md | Code review with Frappe conventions |
| frappe-security-reviewer | agents/frappe/frappe-security-reviewer.md | Security audit of Frappe code |
| frappe-bg-agent | agents/frappe/frappe-bg-agent.md | Background jobs and scheduled tasks |
| frappe-integrator | agents/frappe/frappe-integrator.md | Third-party integrations |
| frappe-perf-agent | agents/frappe/frappe-perf-agent.md | Query optimization and performance |
| frappe-db-agent | agents/frappe/frappe-db-agent.md | Database operations and migrations |
| frappe-doc-agent | agents/frappe/frappe-doc-agent.md | Documentation generation |
| frappe-migrate-agent | agents/frappe/frappe-migrate-agent.md | Migration patches |

### Frappe Commands (25)

| Command | File | Purpose |
|---|---|---|
| /frappe-new | commands/frappe/frappe-new.md | Create new DocType with scaffolding |
| /frappe-workflow | commands/frappe/frappe-workflow.md | Generate workflow fixture + notifications |
| /frappe-api | commands/frappe/frappe-api.md | Generate whitelisted API endpoint |
| /frappe-test | commands/frappe/frappe-test.md | Generate test file for DocType |
| /frappe-permission | commands/frappe/frappe-permission.md | Set up role permissions |
| /frappe-hook | commands/frappe/frappe-hook.md | Add doc_events to hooks.py |
| /frappe-fixture | commands/frappe/frappe-fixture.md | Export fixtures |
| /frappe-deploy | commands/frappe/frappe-deploy.md | Deploy checklist |
| /frappe-review | commands/frappe/frappe-review.md | Full code review |
| /frappe-print | commands/frappe/frappe-print.md | Create Print Format |
| /frappe-script | commands/frappe/frappe-script.md | Client scripts |
| /frappe-page | commands/frappe/frappe-page.md | Custom Frappe Page |
| /frappe-dashboard | commands/frappe/frappe-dashboard.md | Dashboard Page |
| /frappe-report | commands/frappe/frappe-report.md | Script Report |
| /frappe-integrate | commands/frappe/frappe-integrate.md | Third-party integration |
| /frappe-bg | commands/frappe/frappe-bg.md | Background job setup |
| /frappe-migrate | commands/frappe/frappe-migrate.md | Migration patch |
| /frappe-patch | commands/frappe/frappe-patch.md | One-off patch |
| /frappe-fix | commands/frappe/frappe-fix.md | Fix Frappe errors |
| /frappe-import | commands/frappe/frappe-import.md | Data import |
| /frappe-notify | commands/frappe/frappe-notify.md | Notification setup |
| /frappe-vue | commands/frappe/frappe-vue.md | Frappe UI (Vue 3) |
| /frappe-perf | commands/frappe/frappe-perf.md | Performance audit |

### Frappe Rules (4 — always enforced)

| Rule | Key Enforcement |
|---|---|
| frappe-security.md | `frappe.has_permission()` first in every whitelist, no SQL interpolation, Password fieldtype for secrets |
| frappe-coding-style.md | Naming conventions, controller patterns, import ordering |
| frappe-performance.md | No N+1 queries, `frappe.enqueue()` for >2s operations, proper indexing |
| frappe-testing.md | Test file per DocType, factory pattern, lifecycle testing |

---

## 2. Autoresearch

**Repo:** `github.com/uditgoenka/autoresearch`  
**Type:** Claude Code plugin — autonomous iteration loops

### Install

```bash
/plugin marketplace add uditgoenka/autoresearch
/plugin install autoresearch@autoresearch
```

### Commands (9)

| Command | Purpose | When to Use |
|---|---|---|
| `/autoresearch` | Autonomous improvement loop (unbounded or `Iterations: N`) | Optimize any metric |
| `/autoresearch:plan` | Setup wizard → Goal, Scope, Metric, Verify | When unsure what metric to use |
| `/autoresearch:fix` | Fix errors until zero remain | After each build phase — pass tests |
| `/autoresearch:security` | STRIDE + OWASP + red-team audit | After each phase — security gate |
| `/autoresearch:ship` | Universal shipping workflow (8 phases) | Before marking a phase complete |
| `/autoresearch:debug` | Scientific bug hunting loop | When something is broken and unclear why |
| `/autoresearch:scenario` | Scenario/edge-case exploration | Before writing tests — discover edge cases |
| `/autoresearch:predict` | Multi-persona prediction (5 experts) | Before major architecture decisions |
| `/autoresearch:learn` | Documentation generation/update | After all phases — generate docs |

### Quality Gate Chain (use after every phase)

```bash
# Step 1: Fix all errors
/autoresearch:fix --target "<test command>" --guard "<build command>"

# Step 2: Security audit
/autoresearch:security --scope <app_path>/ --fail-on high

# Step 3: Ship readiness
/autoresearch:ship --checklist-only --type code-pr
```

### Key Flags

| Flag | Command | Purpose |
|---|---|---|
| `Iterations: N` | /autoresearch | Run exactly N iterations then stop |
| `Guard: <cmd>` | /autoresearch | Safety net — must pass for changes to be kept |
| `--fix` | /autoresearch:security | Auto-fix Critical/High findings |
| `--fail-on <sev>` | /autoresearch:security | Exit non-zero for CI gating |
| `--target <cmd>` | /autoresearch:fix | Explicit verify command |
| `--from-debug` | /autoresearch:fix | Read findings from debug session |
| `--dry-run` | /autoresearch:ship | Validate without shipping |
| `--checklist-only` | /autoresearch:ship | Just check readiness |

---

## 3. Paperclip (Optional)

**Repo:** `github.com/paperclipai/paperclip`  
**Type:** Multi-agent orchestration server + React dashboard

### Setup

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
# API: http://localhost:3100
# UI: http://localhost:3100 (served by API)
```

### When to Use

Use Paperclip ONLY when running 3+ Claude Code sessions in parallel on different phases.
For sequential execution (one phase at a time), Paperclip adds overhead without benefit.

### Agent Team Template (for Frappe + Flutter projects)

| Agent | Role | Assigned Phases |
|---|---|---|
| frappe-backend | Senior Developer | Phase 0 (mobile_auth) + Phase 1 (DocTypes) |
| frappe-integration | Integration Developer | Phase 2 (Razorpay, S3, FCM, PDF) |
| frappe-frontend | Frontend Developer | Phase 3 (Custom Pages — allocation, MIS dashboard) |
| flutter-mobile | Mobile Developer | Phase 4 (Flutter app, SDK integration) |
| qa-engineer | QA | Runs /autoresearch:fix + /autoresearch:security after each phase |

### Key Concepts

- **Heartbeats:** Agents wake on a schedule, check work, act, exit. Not continuously running.
- **Task checkout:** Atomic — no two agents work the same task. 409 Conflict if already claimed.
- **Cost tracking:** Monthly budgets per agent. Auto-pause when budget hit.
- **Org chart:** Hierarchies, reporting lines, delegation flows up and down.

---

## Phase-to-Tool Mapping Template

Use this table in every generated spec, adapting agent/command names to the project:

| Phase | ECC Agent | ECC Command | Autoresearch | Paperclip Agent |
|---|---|---|---|---|
| 0 — Auth/Controller | frappe-planner, frappe-api-agent, frappe-security-reviewer | /frappe-api | /autoresearch:fix, /autoresearch:security | frappe-backend |
| 1 — DocTypes | frappe-planner, frappe-architect, frappe-tdd-guide, frappe-reviewer | /frappe-new, /frappe-workflow, /frappe-test, /frappe-permission | /autoresearch:fix, /autoresearch:security | frappe-backend |
| 2 — APIs/Integrations | frappe-api-agent, frappe-bg-agent, frappe-integrator | /frappe-api, /frappe-bg, /frappe-integrate | /autoresearch:fix, /autoresearch:security, /autoresearch:debug | frappe-integration |
| 3 — Admin Pages | frappe-planner, frappe-perf-agent | /frappe-page, /frappe-dashboard | /autoresearch, /autoresearch:ship | frappe-frontend |
| 4 — Mobile App | code-reviewer | — | /autoresearch:fix, /autoresearch:ship | flutter-mobile |
