---
name: cicd-patterns
description: CI/CD pipeline patterns for GitHub Actions, GitLab CI, and automated deployment workflows with security gates and quality checks.
origin: ECC
---

# CI/CD Pipeline Patterns

Patterns for building fast, reliable, and secure CI/CD pipelines.

## When to Activate

- Setting up CI/CD pipelines
- Adding quality gates and security scans
- Implementing deployment automation
- Optimizing build performance

## Core Principles

- **Fast feedback**: Cheap checks first (lint, format), expensive last (E2E, deploy)
- **Reproducible builds**: Pin versions, use lockfiles, cache dependencies
- **Security gates**: SAST, dependency scanning, secret detection before deploy

## GitHub Actions

### Reusable Workflow

```yaml
# .github/workflows/reusable-test.yml
name: Test
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
    secrets:
      DATABASE_URL:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Composite Action

```yaml
# .github/actions/setup/action.yml
name: Setup
description: Common setup for all jobs

runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
      shell: bash
    - run: npx playwright install --with-deps
      shell: bash
```

## Complete Pipeline

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  security:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3

  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: myapp/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: kubectl set image deployment/api api=myapp/api:${{ github.sha }}
      - run: kubectl rollout status deployment/api --timeout=300s

  e2e:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: npx playwright test
        env:
          BASE_URL: https://staging.example.com
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-production:
    needs: e2e
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: kubectl set image deployment/api api=myapp/api:${{ github.sha }}
      - run: kubectl rollout status deployment/api --timeout=300s
```

## Deployment Strategies

### Environment Promotion with Approval

```yaml
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.example.com
    steps:
      - run: echo "Deploying to production"
      # GitHub environment protection rules enforce approval
```

### Automated Rollback

```yaml
  rollback:
    if: failure()
    needs: deploy-production
    runs-on: ubuntu-latest
    steps:
      - run: kubectl rollout undo deployment/api
      - run: kubectl rollout status deployment/api
```

## Security in CI/CD

### Dependency Review

```yaml
  dependency-review:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
```

### Secret Detection

```yaml
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

### OIDC for Cloud Auth

```yaml
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions
          aws-region: us-east-1
      # No long-lived secrets needed
```

## Caching Strategies

### Dependency Cache

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # Built-in caching
```

### Docker Layer Cache

```yaml
      - uses: docker/build-push-action@v5
        with:
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Monorepo CI

### Path Filters

```yaml
on:
  pull_request:
    paths:
      - 'packages/api/**'
      - 'packages/shared/**'
```

### Turborepo Affected Detection

```yaml
      - name: Build affected
        run: npx turbo build --filter='...[origin/main]'

      - name: Test affected
        run: npx turbo test --filter='...[origin/main]'
```

## Semantic Versioning

```yaml
  release:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: google-github-actions/release-please-action@v4
        with:
          release-type: node
```

**Remember**: A good pipeline is fast (< 10 min for PRs), reliable (no flaky tests), and secure (scan before deploy). Optimize for developer feedback speed.
