# Deployment Standards

[Purpose: safe, repeatable releases with clear environment and pipeline patterns]

## Philosophy
- Automate; test before deploy; verify after deploy
- Prefer incremental rollout with fast rollback
- Production changes must be observable and reversible

## Environments
- Dev: fast iteration; debugging enabled
- Staging: mirrors prod; release validation
- Prod: hardened; monitored; least privilege

## CI/CD Flow
```
Code → Test → Build → Scan → Deploy (staged) → Verify
```
Principles:
- Fail fast on tests/scans; block deploy
- Artifact builds are reproducible (lockfiles, pinned versions)
- Manual approval for prod; auditable trail

## Deployment Strategies
- Rolling: gradual instance replacement
- Blue-Green: switch traffic between two pools
- Canary: small % users first, expand on health
Choose per risk profile; document default.

## Zero-Downtime & Migrations
- Health checks gate traffic; graceful shutdown
- Backwards-compatible DB changes during rollout
- Separate migration step; test rollback paths

## Rollback
- Keep previous version ready; automate revert
- Rollback faster than fix-forward; document triggers

## Configuration & Secrets
- 12-factor config via env; never commit secrets
- Secret manager; rotate; least privilege; audit access
- Validate required env vars at startup

## Health & Monitoring
- Endpoints: `/health`, `/health/live`, `/health/ready`
- Monitor latency, error rate, throughput, saturation
- Alerts on SLO breaches/spikes; tune to avoid fatigue

## Incident Response & DR
- Standard playbook: detect → assess → mitigate → communicate → resolve → post-mortem
- Backups with retention; test restore; defined RPO/RTO

---
_Focus on rollout patterns and safeguards. No provider-specific steps._
