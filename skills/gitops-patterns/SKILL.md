---
name: gitops-patterns
description: GitOps patterns — ArgoCD, Flux CD, Kustomize overlays, Helm with GitOps, progressive delivery, secrets management, multi-cluster strategies, and CI/CD integration.
---

# GitOps Patterns

Production-grade GitOps patterns for declarative infrastructure and application delivery.

## When to Activate

- Setting up ArgoCD or Flux CD for Kubernetes deployments
- Structuring Kustomize overlays for multi-environment configs
- Implementing progressive delivery (canary, blue-green)
- Managing secrets in a GitOps workflow
- Designing multi-cluster or multi-tenant GitOps
- Integrating CI pipelines with GitOps CD

## Core Principles

1. **Git as single source of truth** — all desired state lives in Git
2. **Declarative over imperative** — describe what, not how
3. **Reconciliation loop** — controller continuously syncs actual to desired
4. **Pull-based deployment** — cluster pulls changes, no kubectl from CI
5. **Auditability** — every change is a Git commit with author and timestamp

## ArgoCD

### Application CRD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/k8s-manifests.git
    targetRevision: main
    path: apps/order-service/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: order-service
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### AppProject

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-orders
  namespace: argocd
spec:
  description: Order team applications
  sourceRepos:
    - "https://github.com/my-org/k8s-manifests.git"
    - "https://charts.example.com"
  destinations:
    - namespace: "order-*"
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace
  namespaceResourceWhitelist:
    - group: "apps"
      kind: Deployment
    - group: ""
      kind: Service
    - group: "networking.k8s.io"
      kind: Ingress
  roles:
    - name: developer
      policies:
        - p, proj:team-orders:developer, applications, sync, team-orders/*, allow
        - p, proj:team-orders:developer, applications, get, team-orders/*, allow
```

## Flux CD

### GitRepository and Kustomization

```yaml
# Source
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: app-manifests
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/my-org/k8s-manifests.git
  ref:
    branch: main
  secretRef:
    name: git-credentials

---
# Reconciliation
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: order-service
  namespace: flux-system
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: app-manifests
  path: ./apps/order-service/overlays/production
  prune: true
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: order-service
      namespace: order-service
  timeout: 3m
```

### HelmRelease

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: redis
  namespace: redis
spec:
  interval: 10m
  chart:
    spec:
      chart: redis
      version: "18.x"
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
  values:
    architecture: replication
    replica:
      replicaCount: 3
    auth:
      existingSecret: redis-credentials
```

## Kustomize Overlays

### Directory Structure

```
apps/order-service/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── overlays/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   ├── replicas-patch.yaml
│   │   └── env-patch.yaml
│   └── production/
│       ├── kustomization.yaml
│       ├── replicas-patch.yaml
│       ├── env-patch.yaml
│       └── resources-patch.yaml
```

### Base Kustomization

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
  - hpa.yaml
commonLabels:
  app.kubernetes.io/name: order-service
  app.kubernetes.io/managed-by: kustomize
```

### Production Overlay

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: order-service
resources:
  - ../../base
patches:
  - path: replicas-patch.yaml
  - path: resources-patch.yaml
images:
  - name: order-service
    newName: us-docker.pkg.dev/my-project/repo/order-service
    newTag: v1.5.0
configMapGenerator:
  - name: app-config
    literals:
      - LOG_LEVEL=info
      - ENVIRONMENT=production
```

## Progressive Delivery

### Argo Rollouts — Canary

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: order-service
spec:
  replicas: 10
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: order-service:v2.0.0
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: { duration: 5m }
        - analysis:
            templates:
              - templateName: success-rate
            args:
              - name: service-name
                value: order-service
        - setWeight: 50
        - pause: { duration: 10m }
        - analysis:
            templates:
              - templateName: success-rate
      canaryService: order-service-canary
      stableService: order-service-stable
```

### Analysis Template

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 1m
      count: 5
      successCondition: result[0] >= 0.95
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{service="{{args.service-name}}",status=~"2.."}[5m]))
            /
            sum(rate(http_requests_total{service="{{args.service-name}}"}[5m]))
```

## Secrets Management

### Sealed Secrets

```bash
# Encrypt secret
kubeseal --format yaml < secret.yaml > sealed-secret.yaml

# Only the cluster can decrypt
kubectl apply -f sealed-secret.yaml
```

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
  namespace: order-service
spec:
  encryptedData:
    DB_PASSWORD: AgBy3i4OJSWK+...encrypted...
    DB_USERNAME: AgBy8iKQ2KSFK+...encrypted...
```

### External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: order-service
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: gcp-secret-manager
  target:
    name: db-credentials
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: projects/my-project/secrets/db-password/versions/latest
    - secretKey: DB_USERNAME
      remoteRef:
        key: projects/my-project/secrets/db-username/versions/latest
```

## Multi-Cluster

### ArgoCD ApplicationSet

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: order-service
  namespace: argocd
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            environment: production
  template:
    metadata:
      name: "order-service-{{name}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/my-org/k8s-manifests.git
        targetRevision: main
        path: "apps/order-service/overlays/{{metadata.labels.region}}"
      destination:
        server: "{{server}}"
        namespace: order-service
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

## CI/CD Integration

### Image Updater Pattern

```yaml
# .github/workflows/ci.yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push image
        run: |
          docker build -t $REGISTRY/order-service:${{ github.sha }} .
          docker push $REGISTRY/order-service:${{ github.sha }}

      - name: Update manifests
        run: |
          cd k8s-manifests
          kustomize edit set image order-service=$REGISTRY/order-service:${{ github.sha }}
          git add .
          git commit -m "chore: update order-service to ${{ github.sha }}"
          git push
```

## Checklist

- [ ] All manifests stored in Git (no kubectl apply from local)
- [ ] Sync policy includes prune and self-heal
- [ ] Secrets encrypted (Sealed Secrets or External Secrets Operator)
- [ ] Kustomize overlays separate base from environment config
- [ ] Progressive delivery with automated analysis
- [ ] AppProject restricts namespace and resource access
- [ ] CI pushes image tags, CD reconciles desired state
- [ ] Health checks configured for deployment verification
