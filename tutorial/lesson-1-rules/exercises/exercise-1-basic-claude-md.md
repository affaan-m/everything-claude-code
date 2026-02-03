# Exercise 1: Create Your First CLAUDE.md

## Instructions

Below is a template for a system engineering project CLAUDE.md. Fill it in with
details relevant to your RMF work, then save it as `CLAUDE.md` in your project root.

## Template

```markdown
# Project: [Your Project Name]

## Overview
[One sentence about what this system/project does]

## Tech Stack
- Language: [e.g., Python 3.11, Bash, Go]
- Framework: [e.g., Django, Flask, none]
- Infrastructure: [e.g., AWS, Azure, on-prem]
- CI/CD: [e.g., GitHub Actions, Jenkins, GitLab CI]

## Project Structure
- `src/` — Application source code
- `tests/` — Test files
- `docs/` — Documentation (SSPs, POA&Ms, etc.)
- `configs/` — Configuration files
- `scripts/` — Automation scripts

## Common Commands
- `[your test command]` — Run tests
- `[your lint command]` — Run linter
- `[your build command]` — Build the project

## Code Style
- [indentation preference]
- [naming convention]
- [import ordering]

## Important Context
- [key architectural decisions]
- [things Claude should always remember]
- [files or directories to be careful with]
```

## Example: Filled In for an RMF Project

```markdown
# Project: RMF Compliance Automation

## Overview
Automated tooling for generating and validating RMF artifacts (SSPs, POA&Ms,
SAR) against NIST SP 800-53 Rev 5 controls.

## Tech Stack
- Language: Python 3.11
- Framework: Django 5.0 (admin + REST API)
- Database: PostgreSQL 15
- Infrastructure: AWS GovCloud
- CI/CD: GitHub Actions with STIG-hardened runners

## Project Structure
- `src/controls/` — NIST 800-53 control mappings
- `src/scanner/` — OpenSCAP integration layer
- `src/reports/` — SSP/POA&M document generators
- `tests/` — pytest test suite
- `docs/ssp/` — System Security Plans
- `docs/poam/` — Plan of Action & Milestones
- `configs/oscap/` — OpenSCAP profiles and tailoring files
- `scripts/` — Deployment and scanning automation

## Common Commands
- `pytest tests/ -v` — Run test suite
- `ruff check src/` — Run Python linter
- `python manage.py migrate` — Apply database migrations
- `python manage.py runserver` — Start dev server
- `./scripts/scan.sh` — Run compliance scan

## Code Style
- 4-space indentation (PEP 8)
- snake_case for functions and variables
- PascalCase for classes
- isort for import ordering (profile=black)
- Black formatter (line-length=88)

## Important Context
- Never hardcode credentials; use AWS Secrets Manager
- All API endpoints require CAC/PIV authentication
- Control mappings in `src/controls/nist800_53.json` are authoritative
- Changes to security documents in `docs/` require review from ISSO
```

## Try It!

1. Copy the filled example (or create your own) and save it as `CLAUDE.md`
2. Start Claude Code in that directory: `claude`
3. Ask: "What do you know about this project?"
4. Claude should reference your CLAUDE.md content in its response

## Verification

Claude should be able to answer these without you telling it again:
- What language is this project written in?
- Where are the test files?
- What's the command to run tests?
- What security considerations exist?
