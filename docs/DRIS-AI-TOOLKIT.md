# Dhwani RIS — AI Toolkit for Claude Code

## What is This?

This is a customized AI coding toolkit built on top of [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) — an Anthropic hackathon-winning project with 50K+ stars. We've extended it with **13 custom skills, 3 specialized agents, and 5 rule files** purpose-built for Dhwani Rural Information System's teams, tech stack, and workflows.

When anyone at Dhwani opens Claude Code in a project that uses this toolkit, Claude automatically understands our company context, follows our security rules, and provides assistance tailored to their role — whether they're a developer writing Frappe code, a PM building wireframes, or a director reviewing GitHub analytics.

---

## What We Added

### Skills (13)

Skills are knowledge modules that teach Claude how to assist with specific tasks. When a team member asks for help, Claude activates the relevant skill and provides expert-level guidance with code examples, best practices, and patterns specific to our stack.

| Skill | Department | What It Does |
|-------|-----------|--------------|
| **frappe-development** | Developers | DocType design, Frappe API patterns, hooks, dashboard building, bench commands, query builder usage |
| **angular-node-patterns** | Developers | Angular component architecture, Express.js API patterns, auth guards, HTTP interceptors, testing — for Amgrant v2 and Form |
| **mongodb-patterns** | Developers, DB Team | Mongoose schema design, aggregation pipelines, indexing, encryption for PII, NoSQL injection prevention, MongoDB-to-Frappe migration |
| **microservices-patterns** | Backend Developers | Service communication (HTTP + events), shared JWT auth, API gateway config, Docker Compose, logging, v2 to v3 migration strategy |
| **pm-workflow** | PMs, Project Managers | Figma-to-code pipeline, walkthrough generation from user stories, Playwright test generation from specs, demo preparation checklists, scope document templates |
| **qa-testing** | QA Team | Playwright Page Object Model for Frappe and Angular apps, functional testing, regression suites, permission testing, API testing, visual regression, CI integration |
| **devops-loadtesting** | DevOps | k6 and Locust load test scripts for Frappe APIs, concurrent user simulation, CI/CD pipelines for Frappe bench, PostgreSQL monitoring queries, deployment automation |
| **devops-scheduling** | DevOps | Frappe scheduler configuration, PM2 process management, node-cron setup, Supervisor and systemd timers, health monitoring scripts, alerting, site and service setup automation |
| **github-analytics** | Directors | GitHub CLI commands for PR velocity, review metrics, developer activity, DORA metrics tracking, automated weekly report generation |
| **postgres-frappe-patterns** | DB Team, Developers | Slow query identification, Frappe-specific indexing strategy, query builder vs raw SQL guidance, safe migration patches, backup automation, PostgreSQL tuning for Frappe workloads |
| **govt-csr-compliance** | Everyone | Audit trail implementation, PII handling (Aadhaar/phone masking and encryption), data retention policies, role-based access patterns, WCAG accessibility, OWASP security for Frappe, Hindi localization |
| **knowledge-base** | Everyone | Per-team CLAUDE.md templates, individual knowledge base setup, onboarding programs for new developers and PMs, monthly maintenance checklists |
| **documentation-workflow** | Everyone | API documentation templates, user guide generation for government staff, release notes, DevOps runbooks, scope documents, Claude-assisted doc generation prompts |

### Agents (3)

Agents are specialized AI reviewers that can be invoked to review code, find issues, and suggest fixes. They understand our specific tech stack and government compliance requirements.

| Agent | What It Reviews |
|-------|----------------|
| **frappe-reviewer** | Frappe code for SQL injection, permission bypasses, DocType design issues, API security, query performance, hooks misuse, government audit compliance |
| **angular-node-reviewer** | Angular components for XSS, route guard coverage, Express APIs for NoSQL injection, missing validation, MongoDB query patterns, microservice auth propagation |
| **database-reviewer** *(already existed)* | PostgreSQL/MySQL queries, schema design, indexing, performance — now enhanced with Frappe and DRIS context |

### Rules (5)

Rules are always-active guidelines that Claude follows in every interaction. They enforce our coding standards, security requirements, and safety guardrails.

| Rule | What It Enforces |
|------|-----------------|
| **frappe-coding-style** | Use frappe.qb for queries, parameterize SQL, check permissions in every API, encrypt PII, no hard deletes for government data |
| **frappe-security** | API permission validation, SQL injection prevention, 2FA for admin roles, session timeout, PII encryption, production hardening checklist |
| **frappe-testing** | Test every DocType, test permissions with different roles, single-worker Playwright for Frappe, test print formats, CI requirements |
| **ai-usage-guardrails** | Role-specific permissions (what each role CAN and CANNOT do with AI), data classification, PII prohibition in prompts, incident response procedure |
| **code-push-safety** | Branch protection rules, pre-push secret detection, PR review requirements for AI-generated code, deployment pipeline, environment access matrix by role |

### Company Context

| File | Purpose |
|------|---------|
| **contexts/dris-company.md** | Complete company profile — Amgrant v2/v3/Form product details, full tech stack, team structure, department responsibilities, current AI usage patterns, domain context for government/CSR projects |

---

## How This Benefits Dhwani

### For Developers

**Problem**: Developers spend time looking up Frappe/Angular/Node patterns, writing boilerplate, and sometimes introduce security vulnerabilities without realizing it.

**Solution**: Claude now knows our exact tech stack. Ask it to build a DocType controller, an Express API endpoint, or a MongoDB aggregation pipeline — it generates code that follows our coding standards, includes permission checks, encrypts PII, and avoids hard deletes. The `frappe-reviewer` and `angular-node-reviewer` agents catch issues before code review.

**Impact**:
- Faster feature development with stack-specific code generation
- Fewer security vulnerabilities caught in review (caught by AI first)
- Consistent code quality across the team
- New developers ramp up faster with the knowledge base and onboarding guides

### For PMs and Project Managers

**Problem**: PMs need to create wireframes, walkthroughs, and demos but may not be deeply technical. They also need Playwright test scripts but don't know the testing framework.

**Solution**: The `pm-workflow` skill teaches Claude how to convert Figma designs into HTML prototypes, generate walkthroughs from user stories, create Playwright test scripts from acceptance criteria, and prepare client demos with proper checklists. The safety guardrails ensure PMs can't accidentally modify production code or expose real data.

**Impact**:
- PMs can produce first demos and wireframes independently
- Walkthrough documents generated in minutes instead of hours
- Test scripts generated from user stories (QA reviews before running)
- Client demo preparation is systematic with checklists
- No risk of accidental production changes

### For QA Team

**Problem**: QA needs to write E2E tests for both Frappe and Angular apps, manage regression suites, and test permissions across roles — all manually.

**Solution**: The `qa-testing` skill provides ready-to-use Page Object Models for Frappe (login, list view, form view) and Angular apps. It includes patterns for permission testing, API testing, visual regression, and CI integration. QA can describe a test scenario and get a complete Playwright test script.

**Impact**:
- 60-70% of test script writing automated
- Consistent Page Object Model architecture across all tests
- Permission testing patterns catch access control bugs early
- Regression suites built systematically, not ad-hoc
- CI integration ensures tests run on every PR

### For DevOps

**Problem**: DevOps manages both Frappe bench and Node.js microservices, sets up monitoring, scheduling, and load testing — each with different tooling.

**Solution**: Two dedicated skills cover everything: `devops-loadtesting` provides k6 and Locust scripts pre-configured for Frappe APIs and Node services, while `devops-scheduling` covers Frappe scheduler, PM2, systemd timers, health monitoring, and deployment automation. All scripts are production-ready with proper error handling.

**Impact**:
- Load test scripts ready to run against staging (k6 and Locust)
- Monitoring scripts detect issues before users notice
- Deployment automation reduces human error
- Scheduling is consistent across Frappe and Node services
- Capacity planning backed by actual load test data

### For Directors

**Problem**: Directors need visibility into developer productivity, PR velocity, and team health but don't want to dig through GitHub manually.

**Solution**: The `github-analytics` skill provides ready-to-use GitHub CLI commands and Python scripts that generate weekly reports: PRs merged, review turnaround, stale PRs, DORA metrics, and team contribution patterns. Directors can ask Claude to run these and get executive summaries.

**Impact**:
- Weekly team reports generated in seconds
- Bottlenecks (slow reviews, stale PRs) identified automatically
- DORA metrics tracked without additional tooling
- Data-driven decisions on team capacity and process improvements
- Read-only access — no risk of accidental changes

### For Sales and HR

**Problem**: Sales needs to create proposals and scope documents quickly. HR needs onboarding materials and policy documents. Both are non-technical.

**Solution**: The `knowledge-base` skill includes role-specific CLAUDE.md templates that define exactly what Sales and HR can and cannot do with AI. The `documentation-workflow` skill provides templates for proposals, scope documents, user guides, and onboarding checklists. Safety guardrails prevent any accidental access to technical systems.

**Impact**:
- Proposal drafts generated from requirement discussions
- Onboarding checklists created for each new hire's role
- Policy documents drafted faster with consistent formatting
- Zero risk of accessing production systems or code

### For the Company as a Whole

**Security**: Every piece of AI-generated code is governed by safety rules. The `ai-usage-guardrails` rule defines what each role can and cannot do. The `code-push-safety` rule prevents secrets from being committed, enforces branch protection, and requires human review for all AI-generated code. PII (Aadhaar, phone, PAN) is never stored unencrypted and never exposed to unauthorized roles.

**Compliance**: Government projects require audit trails, role-based access, data retention, and accessibility. The `govt-csr-compliance` skill bakes these requirements into every piece of code Claude generates — not as an afterthought, but as a default.

**Knowledge Retention**: The `knowledge-base` skill creates institutional memory. When a developer learns a Frappe pattern, a PM discovers an effective demo flow, or DevOps solves a deployment issue — it becomes part of the team's knowledge base. New hires benefit from Day 1.

**Consistency**: Whether a junior developer or a senior architect asks Claude for help, the output follows the same coding standards, security rules, and compliance patterns. This eliminates the "it depends on who wrote it" problem.

---

## What Was Already Available (From Original Repo)

The original Everything Claude Code repo provides 109+ skills and 27 agents that are immediately useful:

- `/code-review` command and `code-reviewer` agent — general code quality review
- `/tdd` command — test-driven development workflow
- `/e2e` command and `e2e-runner` agent — Playwright E2E test generation
- `/plan` command and `planner` agent — implementation planning
- `/build-fix` command — auto-fix build errors
- `database-reviewer` agent — PostgreSQL specialist
- `security-reviewer` agent — vulnerability detection
- Security, coding style, testing, and git workflow rules
- MCP configs for GitHub, Playwright, and more

Our DRIS additions build on top of all of this.

---

## How to Use

### For Any Team Member

1. Open Claude Code in any DRIS project directory
2. The toolkit is automatically loaded from the repo
3. Just ask for what you need — Claude will use the right skill

### Examples by Role

**Developer**: "Create a Frappe DocType for tracking CSR project milestones with fields for milestone name, target date, status, and assigned team member"

**PM**: "Generate a walkthrough document for the beneficiary registration workflow. Include steps, expected behavior, and error scenarios."

**QA**: "Write Playwright E2E tests for the project creation form. Cover happy path, validation errors, and permission checks for different roles."

**DevOps**: "Create a k6 load test script that simulates 50 concurrent users accessing the project dashboard API on staging."

**Director**: "Show me the PR merge velocity and review turnaround for the last 2 weeks across all Amgrant repos."

**Sales**: "Draft a scope document for a new district-level beneficiary tracking system. Include modules, timeline, and technical requirements."

---

## File Reference

```
everything-claude-code/
├── agents/
│   ├── frappe-reviewer.md          # Frappe code reviewer
│   └── angular-node-reviewer.md    # Angular/Node code reviewer
├── skills/
│   ├── frappe-development/         # Frappe patterns and best practices
│   ├── angular-node-patterns/      # Angular + Express + MongoDB patterns
│   ├── mongodb-patterns/           # MongoDB schema, aggregation, security
│   ├── microservices-patterns/     # Microservice architecture for Amgrant v2
│   ├── pm-workflow/                # PM wireframing, walkthroughs, demos
│   ├── qa-testing/                 # QA E2E, functional, regression testing
│   ├── devops-loadtesting/         # k6, Locust, CI/CD, monitoring
│   ├── devops-scheduling/          # Cron, PM2, Supervisor, timers
│   ├── github-analytics/           # GitHub metrics for directors
│   ├── postgres-frappe-patterns/   # PostgreSQL optimization for Frappe
│   ├── govt-csr-compliance/        # Government compliance patterns
│   ├── knowledge-base/             # Team knowledge base setup
│   └── documentation-workflow/     # Documentation generation patterns
├── rules/
│   ├── frappe/
│   │   ├── frappe-coding-style.md  # Frappe coding standards
│   │   ├── frappe-security.md      # Frappe security rules
│   │   └── frappe-testing.md       # Frappe testing rules
│   └── safety/
│       ├── ai-usage-guardrails.md  # Role-specific AI safety rules
│       └── code-push-safety.md     # Code push and deployment safety
└── contexts/
    └── dris-company.md             # DRIS company context and products
```

---

*Built on Everything Claude Code v1.8.0 | Customized for Dhwani Rural Information System | March 2026*
