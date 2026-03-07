---
name: github-actions-templates
description: Use when setting up CI/CD with GitHub Actions, creating workflows for testing, building, or deploying applications
---

# GitHub Actions Templates

Production-ready GitHub Actions workflow patterns. All actions pinned to SHA digests for supply-chain security.

## When to Use

- Automate testing and deployment
- Build Docker images and push to registries
- Deploy to Kubernetes clusters
- Run security scans
- Implement matrix builds for multiple environments

## Pattern 1: Test Workflow

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@0561704f0f02c16a585d4c7555e57fa2e44cf909 # v5
        with:
          files: ./coverage/lcov.info
```

## Pattern 2: Build and Push Docker Image

```yaml
name: Build and Push

on:
  push:
    branches: [main]
    tags: ["v*"]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - name: Log in to Container Registry
        uses: docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9 # v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@c299e40c65443455700f0fdfc63efafe5b349051 # v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@10e90e3645eae34f1e60eeb005ba3a3d33f178e8 # v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Pattern 3: Deploy to Kubernetes

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      # Long-lived access keys are deprecated. Use OIDC federation for keyless authentication.
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@ff717079ee2060e4bcee96c4779b553acc87447c # v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-deploy
          aws-region: us-west-2

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --name production-cluster --region us-west-2

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
          kubectl rollout status deployment/my-app -n production
          kubectl get services -n production

      - name: Rollback on failure
        if: failure()
        run: |
          kubectl rollout undo deployment/my-app -n production

      - name: Verify deployment
        run: |
          kubectl get pods -n production
          kubectl describe deployment my-app -n production
```

## Pattern 4: Matrix Build (Python)

```yaml
name: Matrix Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        python-version: ["3.10", "3.11", "3.12", "3.13"]

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - name: Set up Python
        uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065 # v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run tests
        run: pytest
```

## Pattern 5: Security Scanning

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@e368e328979b113139d6f9068e03accaed98a518 # v0.34.1
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@c4a7bc332abaec03596ff2803dd7f3ca3a238975 # v3
        with:
          sarif_file: "trivy-results.sarif"

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@9adf32b1121593767fc3c057af55b55db032dc04 # v1.0.0
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## Pattern 6: Reusable Workflows

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
    secrets:
      NPM_TOKEN:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm test
```

**Calling a reusable workflow:**

```yaml
jobs:
  call-test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: "22.x"
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Pattern 7: Deploy with Approvals

```yaml
name: Deploy to Production

on:
  push:
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com

    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4

      - name: Deploy application
        run: |
          echo "Deploying to production..."
          rsync -avz --delete ./dist/ user@server:/var/www/app/

      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@91efab103c0de0a537f72a35f6b8cda0ee76bf0a # v2.1.1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Deployment to production completed successfully!"
            }
```

## Best Practices

1. **Pin actions to SHA digests** -- version tags can be moved; SHAs are immutable
2. **Add version comment after SHA** -- `@<sha> # v4` for readability
3. **Cache dependencies** to speed up builds
4. **Use secrets** for sensitive data (never hardcode)
5. **Set minimal permissions** on each job
6. **Use matrix builds** for multi-version testing
7. **Use reusable workflows** for shared patterns across repos
8. **Implement environment approval gates** for production deploys
9. **Keep Node.js versions current** -- test on active LTS (20.x) and current (22.x)
10. **Review action updates** -- when updating SHAs, audit the changelog between versions
