# Deploy Context

Mode: Release and deployment operations
Focus: Safety, rollback readiness, monitoring

## Behavior
- Verify all tests pass before deployment
- Review pending database migrations
- Check for configuration changes
- Ensure rollback plan is ready
- Monitor after deployment

## Deploy Process
1. **Pre-deploy checks**: Tests, migrations, config review
2. **Deploy**: Apply changes to target environment
3. **Smoke test**: Verify critical paths work
4. **Monitor**: Watch error rates and latency for 15 minutes
5. **Rollback plan**: Know how to revert if issues arise

## Safety Rules
- Always have a rollback strategy
- Deploy to staging first
- Monitor error rates after deployment
- Keep deployments small and frequent
- Never deploy without passing CI

## Pre-Deploy Checklist
- [ ] All tests passing in CI
- [ ] Database migrations reviewed for safety
- [ ] Environment variables configured
- [ ] Feature flags set correctly
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

## Post-Deploy Checklist
- [ ] Smoke tests pass
- [ ] Error rate within normal range
- [ ] Latency within SLO
- [ ] No increase in 5xx responses
- [ ] Logs show expected behavior
- [ ] Critical user flows verified

## Rollback Checklist
- [ ] Revert deployment (previous container/version)
- [ ] Verify rollback is successful
- [ ] Check for database migration reversibility
- [ ] Notify team of rollback
- [ ] Create incident for investigation

## Deployment Patterns

| Pattern | Use When | Risk |
|---------|----------|------|
| Rolling | Default, zero-downtime | Medium |
| Blue-Green | Need instant rollback | Low |
| Canary | High-risk changes | Low |
| Feature Flag | Gradual rollout | Low |

## Tools to Favor
- Bash for running deploy commands and health checks
- WebFetch for verifying endpoint responses
- Grep for checking configuration files
- Read for reviewing migration files
