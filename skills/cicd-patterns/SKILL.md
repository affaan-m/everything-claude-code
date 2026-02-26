---
name: cicd-patterns
description: CI/CD pipeline patterns for GitHub Actions, GitLab CI, and automated deployment workflows with security gates and quality checks.
origin: ECC
---

# CI/CD Patterns

## When to Use

Use this skill when the user is:
- Setting up CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins)
- Automating build, test, and deploy workflows
- Adding quality gates (linting, testing, security scanning)
- Implementing deployment strategies (blue-green, canary, rolling)
- Configuring caching for faster builds
- Setting up monorepo CI with path filters
- Managing artifacts, releases, and container registries
- Implementing OIDC authentication for cloud deployments
- Creating reusable workflows and composite actions
- Troubleshooting CI/CD pipeline failures

## How It Works

### Fast Feedback

Optimize pipelines for the fastest possible feedback loop. Fail fast on cheap checks first.

```yaml
# WRONG: Run expensive tests before cheap checks
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:integration  # 10 minutes
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint  # 30 seconds

# CORRECT: Cheap checks first, expensive checks later
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint  # 30 seconds, fails fast

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run type-check  # 1 minute

  unit-tests:
    needs: [lint, type-check]  # Only run after cheap checks pass
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:unit  # 2 minutes

  integration-tests:
    needs: [unit-tests]  # Only run after unit tests pass
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:integration  # 10 minutes
```

### Reproducible Builds

Every build should produce identical output given the same inputs.

```yaml
# Pin all action versions to SHA for reproducibility and security
steps:
  - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
  - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
    with:
      node-version-file: '.nvmrc'
      cache: 'npm'

  # Use lockfiles for deterministic installs
  - run: npm ci  # NOT npm install

  # Pin tool versions
  - uses: hashicorp/setup-terraform@a1502cd9e758c50496cc9ac5308c4843bcd56d36  # v3.0.0
    with:
      terraform_version: "1.7.0"  # Exact version, not range
```

### Security Gates

Every pipeline must include security checks before deployment.

```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Run SAST
      uses: github/codeql-action/analyze@v3

    - name: Dependency audit
      run: npm audit --audit-level=high

    - name: Secret scanning
      uses: trufflesecurity/trufflehog@v3.88.0
      with:
        extra_args: --only-verified

    - name: Container scanning
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: '${{ env.IMAGE_NAME }}:${{ github.sha }}'
        severity: 'CRITICAL,HIGH'
        exit-code: '1'
```

## Examples

## GitHub Actions Patterns

### Reusable Workflows

Define workflows that can be called from other workflows.

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      image-tag:
        required: true
        type: string
      region:
        required: false
        type: string
        default: 'us-east-1'
    secrets:
      AWS_ACCOUNT_ID:
        required: true
    outputs:
      deployment-url:
        description: "URL of the deployed application"
        value: ${{ jobs.deploy.outputs.url }}

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    outputs:
      url: ${{ steps.deploy.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/deploy-${{ inputs.environment }}
          aws-region: ${{ inputs.region }}

      - name: Deploy to ECS
        id: deploy
        run: |
          aws ecs update-service \
            --cluster ${{ inputs.environment }} \
            --service api \
            --force-new-deployment \
            --task-definition "$(aws ecs register-task-definition \
              --cli-input-json file://task-definition.json \
              --query 'taskDefinition.taskDefinitionArn' \
              --output text)"

          echo "url=https://api.${{ inputs.environment }}.example.com" >> "$GITHUB_OUTPUT"

      - name: Wait for stable deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ inputs.environment }} \
            --services api

      - name: Smoke test
        run: |
          for i in $(seq 1 10); do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.${{ inputs.environment }}.example.com/health")
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i: status=$STATUS, retrying in 10s..."
            sleep 10
          done
          echo "Health check failed after 10 attempts"
          exit 1
```

```yaml
# .github/workflows/deploy.yml - Caller workflow
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'

  deploy-staging:
    needs: build
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      image-tag: ${{ needs.build.outputs.image-tag }}
    secrets:
      AWS_ACCOUNT_ID: ${{ secrets.AWS_ACCOUNT_ID }}

  deploy-production:
    needs: deploy-staging
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
      image-tag: ${{ needs.build.outputs.image-tag }}
    secrets:
      AWS_ACCOUNT_ID: ${{ secrets.AWS_ACCOUNT_ID }}
```

### Composite Actions

Create reusable action steps for common patterns.

```yaml
# .github/actions/setup-node-project/action.yml
name: Setup Node Project
description: Checkout, setup Node.js, install dependencies with caching

inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '20'
  install-command:
    description: 'Install command'
    required: false
    default: 'npm ci'

runs:
  using: composite
  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'

    - name: Install dependencies
      shell: bash
      run: ${{ inputs.install-command }}

    - name: Cache build artifacts
      uses: actions/cache@v4
      with:
        path: |
          .next/cache
          dist
          node_modules/.cache
        key: build-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('src/**') }}
        restore-keys: |
          build-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-
          build-${{ runner.os }}-
```

```yaml
# Usage in a workflow
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/setup-node-project
        with:
          node-version: '20'
      - run: npm test
```

### Matrix Builds

Test across multiple configurations in parallel.

```yaml
name: Cross-Platform Test

on:
  pull_request:

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20, 22]
        exclude:
          - os: windows-latest
            node-version: 18
        include:
          - os: ubuntu-latest
            node-version: 20
            coverage: true

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm test

      - name: Upload coverage
        if: matrix.coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
```

## Pipeline Stages

### Complete Pipeline Example

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

permissions:
  contents: read
  pull-requests: write
  security-events: write

jobs:
  # Stage 1: Quick validation
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  # Stage 2: Testing
  unit-tests:
    needs: [lint, type-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: unit

  integration-tests:
    needs: [lint, type-check]
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379

  # Stage 3: Build
  build:
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name == 'push' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Stage 4: Security scanning
  security-scan:
    needs: build
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository }}:${{ needs.build.outputs.image-tag }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Stage 5: Deploy
  deploy-staging:
    needs: [build, security-scan]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      image-tag: ${{ needs.build.outputs.image-tag }}
    secrets: inherit

  # Stage 6: E2E tests against staging
  e2e-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ needs.deploy-staging.outputs.deployment-url }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # Stage 7: Production deployment
  deploy-production:
    needs: e2e-tests
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
      image-tag: ${{ needs.build.outputs.image-tag }}
    secrets: inherit
```

## Deployment Strategies

### Environment Promotion

```yaml
# Promote through environments with manual approval
deploy-staging:
  needs: build
  environment: staging
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to staging
      run: ./deploy.sh staging ${{ needs.build.outputs.image-tag }}

deploy-production:
  needs: deploy-staging
  environment:
    name: production
    url: https://api.example.com
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: ./deploy.sh production ${{ needs.build.outputs.image-tag }}
```

### Feature Flags

```yaml
# Deploy with feature flags for gradual rollout
deploy-with-flags:
  runs-on: ubuntu-latest
  steps:
    - name: Update feature flags
      run: |
        curl -X PATCH "https://api.launchdarkly.com/api/v2/flags/production/new-checkout-flow" \
          -H "Authorization: ${{ secrets.LAUNCHDARKLY_TOKEN }}" \
          -H "Content-Type: application/json" \
          -d '{
            "patch": [{
              "op": "replace",
              "path": "/environments/production/rules/0/percentage/100000",
              "value": 10000
            }]
          }'

    - name: Monitor rollout
      run: |
        echo "Feature flag set to 10% rollout"
        echo "Monitor error rates at: https://grafana.example.com/d/feature-rollout"
```

### Rollback Automation

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to rollback to (leave empty for previous)'
        required: false
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}

    steps:
      - uses: actions/checkout@v4

      - name: Determine rollback version
        id: version
        run: |
          if [ -n "${{ inputs.version }}" ]; then
            echo "tag=${{ inputs.version }}" >> "$GITHUB_OUTPUT"
          else
            PREVIOUS=$(aws ecs describe-services \
              --cluster ${{ inputs.environment }} \
              --services api \
              --query 'services[0].deployments[1].taskDefinition' \
              --output text | rev | cut -d: -f1 | rev)
            echo "tag=$PREVIOUS" >> "$GITHUB_OUTPUT"
          fi

      - name: Execute rollback
        run: |
          echo "Rolling back ${{ inputs.environment }} to version ${{ steps.version.outputs.tag }}"
          aws ecs update-service \
            --cluster ${{ inputs.environment }} \
            --service api \
            --task-definition "api:${{ steps.version.outputs.tag }}" \
            --force-new-deployment

      - name: Wait for stable
        run: |
          aws ecs wait services-stable \
            --cluster ${{ inputs.environment }} \
            --services api

      - name: Notify team
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d "{
              \"text\": \"Rollback completed: ${{ inputs.environment }} -> v${{ steps.version.outputs.tag }}\"
            }"
```

## Security in CI/CD

### SAST/DAST

```yaml
security:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    # Static Application Security Testing
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript-typescript
        queries: security-extended

    - name: CodeQL Analysis
      uses: github/codeql-action/analyze@v3

    # Software Composition Analysis
    - name: Dependency review
      if: github.event_name == 'pull_request'
      uses: actions/dependency-review-action@v4
      with:
        fail-on-severity: high
        deny-licenses: GPL-3.0, AGPL-3.0

    # Secret detection
    - name: Detect secrets
      uses: trufflesecurity/trufflehog@v3.88.0
      with:
        extra_args: --only-verified --results=verified
```

### OIDC Authentication

Use OpenID Connect for keyless cloud authentication. No long-lived secrets.

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # AWS OIDC
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions
          aws-region: us-east-1
          # No access keys needed

      # GCP OIDC
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: projects/123456/locations/global/workloadIdentityPools/github/providers/github
          service_account: deploy@my-project.iam.gserviceaccount.com
          # No service account key needed

      # Azure OIDC
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # No client secret needed
```

### Dependency Scanning

```yaml
# .github/workflows/dependency-scan.yml
name: Dependency Security

on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6 AM
  pull_request:
    paths:
      - 'package-lock.json'
      - 'requirements.txt'
      - 'go.sum'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Node.js audit
        if: hashFiles('package-lock.json') != ''
        run: |
          npm audit --audit-level=high --production
          npx better-npm-audit audit --level high

      - name: Python audit
        if: hashFiles('requirements.txt') != ''
        run: |
          pip install pip-audit
          pip-audit -r requirements.txt --desc on --fix --dry-run

      - name: Go audit
        if: hashFiles('go.sum') != ''
        run: |
          go install golang.org/x/vuln/cmd/govulncheck@latest
          govulncheck ./...

      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Security: Dependency vulnerabilities detected',
              body: `Dependency audit found vulnerabilities. See [workflow run](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}).`,
              labels: ['security', 'dependencies']
            });
```

## Caching Strategies

### Dependency Cache

```yaml
# Node.js caching
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Built-in npm caching

# Python caching
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'

# Go caching
- uses: actions/setup-go@v5
  with:
    go-version: '1.22'
    cache: true

# Custom cache for complex scenarios
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cache/pip
      ~/go/pkg/mod
    key: deps-${{ runner.os }}-${{ hashFiles('**/package-lock.json', '**/requirements.txt', '**/go.sum') }}
    restore-keys: |
      deps-${{ runner.os }}-
```

### Build Cache

```yaml
# Next.js build cache
- uses: actions/cache@v4
  with:
    path: |
      .next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('src/**/*.ts', 'src/**/*.tsx') }}
    restore-keys: |
      nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-
      nextjs-${{ runner.os }}-

# Turbo cache for monorepos
- uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      turbo-${{ runner.os }}-
```

### Docker Layer Cache

```yaml
# Using GitHub Actions cache backend
- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max

# Using registry-based cache (faster for large images)
- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache
    cache-to: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache,mode=max

# Multi-stage Dockerfile optimized for caching
# Dockerfile
# Stage 1: Dependencies (cached unless lockfile changes)
# FROM node:20-alpine AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci --production
#
# Stage 2: Build (cached unless source changes)
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN npm run build
#
# Stage 3: Runtime (minimal final image)
# FROM node:20-alpine AS runner
# WORKDIR /app
# RUN addgroup -S app && adduser -S app -G app
# COPY --from=builder /app/dist ./dist
# COPY --from=deps /app/node_modules ./node_modules
# USER app
# CMD ["node", "dist/main.js"]
```

## Monorepo CI

### Path Filters

Only run jobs when relevant files change.

```yaml
name: Monorepo CI

on:
  pull_request:

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      api: ${{ steps.filter.outputs.api }}
      web: ${{ steps.filter.outputs.web }}
      shared: ${{ steps.filter.outputs.shared }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            api:
              - 'packages/api/**'
              - 'packages/shared/**'
            web:
              - 'packages/web/**'
              - 'packages/shared/**'
            shared:
              - 'packages/shared/**'

  test-api:
    needs: detect-changes
    if: needs.detect-changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx turbo run test --filter=api...

  test-web:
    needs: detect-changes
    if: needs.detect-changes.outputs.web == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx turbo run test --filter=web...

  test-shared:
    needs: detect-changes
    if: needs.detect-changes.outputs.shared == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx turbo run test --filter=shared
```

### Affected Detection with Nx/Turbo

```yaml
# Using Turborepo for affected detection
affected-test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Full history for affected detection

    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - run: npm ci

    # Run tests only for affected packages
    - name: Test affected packages
      run: npx turbo run test --filter='...[origin/main...HEAD]'

    # Build only affected packages
    - name: Build affected packages
      run: npx turbo run build --filter='...[origin/main...HEAD]'

    # Lint only affected packages
    - name: Lint affected packages
      run: npx turbo run lint --filter='...[origin/main...HEAD]'
```

### Parallel Jobs for Monorepo Packages

```yaml
# Dynamic matrix from workspace packages
jobs:
  list-packages:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.list.outputs.packages }}
    steps:
      - uses: actions/checkout@v4
      - id: list
        run: |
          packages=$(ls -d packages/*/ | jq -R -s -c 'split("\n") | map(select(. != "")) | map(split("/")[1])')
          echo "packages=$packages" >> "$GITHUB_OUTPUT"

  test:
    needs: list-packages
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        package: ${{ fromJson(needs.list-packages.outputs.packages) }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=packages/${{ matrix.package }}
```

## Artifacts and Releases

### Semantic Versioning

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # Determine version bump from commit messages
      - name: Get next version
        id: version
        uses: anothrNick/github-tag-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DEFAULT_BUMP: patch
          WITH_V: true
          DRY_RUN: true

      - name: Build
        run: npm ci && npm run build

      - name: Create release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.version.outputs.new_tag }}
          generate_release_notes: true
          files: |
            dist/*.tar.gz
            dist/*.zip

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Container Registry

```yaml
# Build and push to multiple registries
build-and-push:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - uses: docker/setup-buildx-action@v3

    - uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - uses: docker/login-action@v3
      with:
        registry: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
        username: ${{ secrets.AWS_ACCESS_KEY_ID }}
        password: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Docker meta
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: |
          ghcr.io/${{ github.repository }}
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/${{ github.event.repository.name }}
        tags: |
          type=sha,format=long
          type=ref,event=branch
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}

    - uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        provenance: true
        sbom: true

    - name: Sign image
      run: |
        cosign sign --yes ${{ steps.meta.outputs.tags }}
      env:
        COSIGN_EXPERIMENTAL: "1"
```

### Changelog Generation

```yaml
# .github/workflows/changelog.yml
name: Generate Changelog

on:
  release:
    types: [published]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          PREVIOUS_TAG=$(git describe --abbrev=0 --tags HEAD~1 2>/dev/null || echo "")
          CURRENT_TAG=${GITHUB_REF#refs/tags/}

          echo "## What's Changed" > CHANGELOG_ENTRY.md
          echo "" >> CHANGELOG_ENTRY.md

          # Group commits by type
          for type in feat fix perf refactor docs chore; do
            commits=$(git log ${PREVIOUS_TAG}..${CURRENT_TAG} --pretty=format:"- %s (%h)" --grep="^${type}:" 2>/dev/null || true)
            if [ -n "$commits" ]; then
              case $type in
                feat) header="Features" ;;
                fix) header="Bug Fixes" ;;
                perf) header="Performance" ;;
                refactor) header="Refactoring" ;;
                docs) header="Documentation" ;;
                chore) header="Maintenance" ;;
              esac
              echo "### ${header}" >> CHANGELOG_ENTRY.md
              echo "$commits" >> CHANGELOG_ENTRY.md
              echo "" >> CHANGELOG_ENTRY.md
            fi
          done

      - name: Update release notes
        uses: softprops/action-gh-release@v2
        with:
          body_path: CHANGELOG_ENTRY.md
          append_body: true
```

## GitLab CI Reference

For teams using GitLab CI, here is the equivalent pattern structure.

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - build
  - security
  - deploy

variables:
  DOCKER_BUILDKIT: "1"

# Templates for reuse
.node-setup:
  image: node:20-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
    policy: pull
  before_script:
    - npm ci

lint:
  extends: .node-setup
  stage: validate
  script:
    - npm run lint
    - npm run format:check

type-check:
  extends: .node-setup
  stage: validate
  script:
    - npm run type-check

unit-tests:
  extends: .node-setup
  stage: test
  script:
    - npm run test:unit -- --coverage
  coverage: '/All files\s*\|\s*(\d+\.?\d*)\s*\|/'
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  extends: .node-setup
  stage: test
  services:
    - postgres:16
    - redis:7
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql://test:test@postgres:5432/testdb
    REDIS_URL: redis://redis:6379
  script:
    - npm run test:integration

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t ${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA} .
    - docker push ${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}
  only:
    - main

deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - ./deploy.sh staging ${CI_COMMIT_SHA}
  only:
    - main

deploy-production:
  stage: deploy
  environment:
    name: production
    url: https://example.com
  script:
    - ./deploy.sh production ${CI_COMMIT_SHA}
  when: manual
  only:
    - main
```
