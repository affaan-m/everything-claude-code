---
description: Sync documentation from source-of-truth (package.json, .env.example).
---

Sync documentation from source-of-truth files.

Steps:
1. Read package.json scripts section
   - Generate scripts reference table
   - Include descriptions from comments
2. Read .env.example
   - Extract all environment variables
   - Document purpose and format
3. Generate docs/CONTRIB.md: development workflow, scripts, environment setup, testing
4. Generate docs/RUNBOOK.md: deployment, monitoring, common issues, rollback
5. Identify obsolete docs (not modified in 90+ days) for manual review
6. Show diff summary

Single source of truth: package.json and .env.example
