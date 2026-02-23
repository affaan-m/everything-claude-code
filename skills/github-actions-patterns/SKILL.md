---
name: github-actions-patterns
description: GitHub Actions patterns — reusable workflows, composite actions, OIDC federation, monorepo CI, release automation, caching, and security hardening.
---

# GitHub Actions Patterns

Production-grade GitHub Actions patterns for CI/CD workflow design, automation, and security.

## When to Activate

- Designing reusable workflows (workflow_call) for shared CI/CD
- Building composite actions or JavaScript actions
- Setting up OIDC federation for secretless cloud deploys (AWS/GCP/Azure)
- Implementing monorepo CI with path filters and dynamic matrix
- Automating releases (semantic versioning, changelog, container tagging)
- Optimizing CI performance (caching, concurrency, parallelism)
- Hardening workflow security (permissions, SHA pinning, injection prevention)

## Core Principles

1. **Reuse over copy** — extract shared logic into reusable workflows or composite actions
2. **Least privilege** — set `permissions` explicitly; never use default read-write
3. **Pin by SHA** — pin third-party actions by commit SHA, not tag
4. **Fail fast** — cancel redundant runs with concurrency groups
5. **Secrets via OIDC** — use OIDC federation instead of long-lived credentials

## Reusable Workflows

### Shared CI Workflow

```yaml
# .github/workflows/ci-shared.yml
name: Shared CI

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: "20"
      working-directory:
        type: string
        default: "."
      run-e2e:
        type: boolean
        default: false
    secrets:
      NPM_TOKEN:
        required: false
    outputs:
      coverage:
        description: "Test coverage percentage"
        value: ${{ jobs.test.outputs.coverage }}

jobs:
  lint:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
        with:
          node-version: ${{ inputs.node-version }}
          cache: "npm"
          cache-dependency-path: "${{ inputs.working-directory }}/package-lock.json"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    outputs:
      coverage: ${{ steps.cov.outputs.coverage }}
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
        with:
          node-version: ${{ inputs.node-version }}
          cache: "npm"
          cache-dependency-path: "${{ inputs.working-directory }}/package-lock.json"
      - run: npm ci
      - run: npm test -- --coverage
      - id: cov
        run: echo "coverage=$(jq '.total.lines.pct' coverage/coverage-summary.json)" >> "$GITHUB_OUTPUT"

  e2e:
    if: ${{ inputs.run-e2e }}
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
        with:
          node-version: ${{ inputs.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2
        if: failure()
        with:
          name: playwright-report
          path: "${{ inputs.working-directory }}/playwright-report/"
```

### Calling a Reusable Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  ci:
    uses: ./.github/workflows/ci-shared.yml
    with:
      node-version: "20"
      run-e2e: true
    secrets: inherit
```

## Composite Actions

### Setup Action

```yaml
# .github/actions/setup-node-project/action.yml
name: "Setup Node Project"
description: "Checkout, setup Node, install deps, and restore build cache"

inputs:
  node-version:
    description: "Node.js version"
    default: "20"
  working-directory:
    description: "Working directory"
    default: "."

runs:
  using: "composite"
  steps:
    - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
    - uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
      with:
        node-version: ${{ inputs.node-version }}
        cache: "npm"
        cache-dependency-path: "${{ inputs.working-directory }}/package-lock.json"
    - shell: bash
      working-directory: ${{ inputs.working-directory }}
      run: npm ci
    - uses: actions/cache@5a3ec84eff668545956fd18022155c47e93e2684 # v4.2.3
      with:
        path: "${{ inputs.working-directory }}/.next/cache"
        key: nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
        restore-keys: nextjs-${{ hashFiles('**/package-lock.json') }}-
```

## OIDC Federation

### AWS Secretless Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

permissions:
  id-token: write   # Required for OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # GitHub environment with protection rules
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - uses: aws-actions/configure-aws-credentials@e3dd6a429d7300a6a4c196c26e071d42e0343502 # v4.0.2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
          aws-region: us-east-1

      - run: aws sts get-caller-identity  # Verify identity

      # Deploy (no AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY needed)
      - run: aws s3 sync ./dist s3://my-bucket --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ vars.CF_DIST_ID }} --paths "/*"
```

### GCP Secretless Deploy

```yaml
- uses: google-github-actions/auth@71f986c55a44e10e001a615a8ddfef4d7a9454b0 # v2.1.8
  with:
    workload_identity_provider: "projects/123456/locations/global/workloadIdentityPools/github/providers/github-actions"
    service_account: "deploy@my-project.iam.gserviceaccount.com"

- uses: google-github-actions/deploy-cloudrun@5091a384e8c64e6f4d7d0d24e01762d4db100549 # v2.7.5
  with:
    service: my-service
    region: us-central1
    image: gcr.io/my-project/my-service:${{ github.sha }}
```

## Monorepo CI

### Path Filters + Dynamic Matrix

```yaml
# .github/workflows/monorepo-ci.yml
name: Monorepo CI
on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: dorny/paths-filter@de90cc6fb38fc0963ad72b210f1f284cd68cea36 # v3.0.2
        id: filter
        with:
          filters: |
            web:
              - 'packages/web/**'
            api:
              - 'packages/api/**'
            shared:
              - 'packages/shared/**'

  ci:
    needs: detect-changes
    if: ${{ needs.detect-changes.outputs.packages != '[]' }}
    strategy:
      matrix:
        package: ${{ fromJSON(needs.detect-changes.outputs.packages) }}
      fail-fast: false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx turbo run lint test build --filter=${{ matrix.package }}
```

## Release Automation

### Semantic Release

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write
  packages: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          fetch-depth: 0  # Full history for changelog

      - uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci

      - name: Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

### Container Build + Tag

```yaml
# .github/workflows/docker.yml
name: Build & Push Container
on:
  push:
    tags: ["v*"]

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - uses: docker/metadata-action@902fa8ec7d6ecbf8d84d538b9b233a880e428804 # v5.7.0
        id: meta
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - uses: docker/setup-buildx-action@b5ca514318bd6ebac0fb2aedd5d36ec1b5c232a2 # v3.10.0
      - uses: docker/login-action@74a5d142397b4f367a81961eba4e8cd7edddf772 # v3.4.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@263435318d21b8e681c14492fe198e19c3bc03bc # v6.18.0
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Performance

### Caching Strategies

```yaml
# Dependency cache (built-in to setup-node)
- uses: actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0
  with:
    node-version: "20"
    cache: "npm"

# Build artifact cache
- uses: actions/cache@5a3ec84eff668545956fd18022155c47e93e2684 # v4.2.3
  with:
    path: |
      .next/cache
      node_modules/.cache
    key: build-${{ runner.os }}-${{ hashFiles('package-lock.json') }}-${{ hashFiles('src/**') }}
    restore-keys: |
      build-${{ runner.os }}-${{ hashFiles('package-lock.json') }}-
      build-${{ runner.os }}-

# Docker layer cache (BuildKit)
- uses: docker/build-push-action@263435318d21b8e681c14492fe198e19c3bc03bc # v6.18.0
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Concurrency Groups

```yaml
# Cancel previous runs for same PR
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

## Security Hardening

### Permissions & SHA Pinning

```yaml
# Always set explicit permissions at workflow level
permissions:
  contents: read
  pull-requests: write  # Only if needed

# Pin actions by full SHA (not tag)
# BAD:  uses: actions/checkout@v4
# GOOD: uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

# Use Dependabot to keep SHA pins updated
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Injection Prevention

```yaml
# BAD: Direct use of untrusted input in run (command injection)
# - run: echo "PR title: ${{ github.event.pull_request.title }}"

# GOOD: Use environment variable (shell escaping)
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "PR title: $PR_TITLE"

# GOOD: Use an intermediate step for complex expressions
- id: sanitize
  uses: actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea # v7.0.1
  with:
    result-encoding: string
    script: |
      return context.payload.pull_request.title.replace(/[`$]/g, '');
```

### CODEOWNERS for Workflow Files

```
# .github/CODEOWNERS
/.github/workflows/  @org/platform-team
/.github/actions/    @org/platform-team
```

## Checklist

```
Before merging GitHub Actions workflows:
- [ ] permissions set explicitly (not using defaults)
- [ ] All third-party actions pinned by full commit SHA
- [ ] Dependabot configured for github-actions ecosystem
- [ ] Concurrency groups prevent redundant runs
- [ ] OIDC used instead of long-lived cloud credentials
- [ ] No untrusted input directly in run commands (injection risk)
- [ ] Reusable workflows used for shared CI logic
- [ ] Caching configured (deps, build artifacts, Docker layers)
- [ ] Environment protection rules for production deploys
- [ ] CODEOWNERS restricts workflow file changes
- [ ] Monorepo jobs use path filters (no full rebuild on every change)
- [ ] Artifacts uploaded on test failure for debugging
```
