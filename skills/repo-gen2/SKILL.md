---
name: gen2
description: Qashier Backend Services - Monorepo for backend services powering web, mobile, POS
repo: qashierpos/qashier-cloud-function-gen2
auto_generated: true
created: 2026-01-28
---

# Qashier Backend Services (gen2)

Monorepo for backend services that power Qashier web, mobile, POS, and scheduled workloads. Services are primarily deployed to shared Kubernetes (GKE) clusters.

## Repository Info

- **Org:** qashierpos
- **Repo:** qashier-cloud-function-gen2
- **Alias:** gen2

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js LTS
- **Package Manager:** Yarn 4.x (via Corepack) in `functions/`, Yarn 1.x at root
- **Database:** PostgreSQL (Kysely ORM)
- **Deployment:** GKE (Kubernetes), some legacy Cloud Run

## Project Structure

```
functions/src/services/
├── core/           # Core business logic services
│   ├── transaction/
│   ├── store/
│   ├── product/
│   ├── inventory/
│   └── ...
├── loyalty/        # Loyalty program services
├── payment/        # Payment processing
├── schedules/      # Scheduled jobs
└── shared/         # Shared utilities
```

## Key Commands

```bash
cd functions
yarn install        # Install dependencies
yarn build          # Build TypeScript
yarn pg:migrate latest   # Run migrations
yarn kysely:generate     # Generate DB types
```

## Service-Specific Skills

- [core-transaction](../repo-gen2-core-transaction/SKILL.md)
- [core-table-management](../repo-gen2-core-table-management/SKILL.md)

## Learned Patterns

_No patterns learned yet._

## Architecture Notes

_Architecture notes extracted from transcripts will be updated here._
