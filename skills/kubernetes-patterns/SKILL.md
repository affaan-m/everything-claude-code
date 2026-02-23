---
name: kubernetes-patterns
description: Kubernetes patterns for pod design, deployments, services, health checks, resource management, Helm charts, Kustomize overlays, and CI/CD integration.
---

# Kubernetes Patterns

Production-grade Kubernetes patterns for deploying, scaling, and managing containerized applications.

## When to Activate

- Writing Kubernetes manifests (Deployments, Services, Ingress)
- Configuring health checks and resource limits
- Designing Helm charts or Kustomize overlays
- Setting up Horizontal Pod Autoscaler (HPA)
- Managing ConfigMaps and Secrets
- Integrating Kubernetes deployments into CI/CD

## Core Principles

1. **Declarative over imperative** — always use manifests, never `kubectl run` in production
2. **Immutable deployments** — change the image tag, don't patch running pods
3. **Health checks are mandatory** — liveness, readiness, and startup probes on every container
4. **Resource limits on everything** — prevent noisy-neighbor and OOM issues
5. **Labels and selectors** — consistent labeling for discovery, monitoring, and management

## Deployment

### Standard Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  labels:
    app: api-server
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: api-server
        version: v1
    spec:
      containers:
        - name: api
          image: myregistry/api-server:1.2.3
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: api-config
            - secretRef:
                name: api-secrets
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            failureThreshold: 30
            periodSeconds: 2
      terminationGracePeriodSeconds: 30
```

## Service and Ingress

### ClusterIP Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-server
spec:
  selector:
    app: api-server
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  type: ClusterIP
```

### Ingress with TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-server
                port:
                  number: 80
```

## ConfigMap and Secrets

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  CACHE_TTL: "300"
```

### Sealed Secrets (GitOps-safe)

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: api-secrets
spec:
  encryptedData:
    DATABASE_URL: AgBy3i4OJSWK+PiTySYZZA9rO...
    JWT_SECRET: AgCtr8OJSWK+LiTaSYZZA1bR2...
```

## Resource Management

### Resource Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
```

### LimitRange (Defaults)

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
spec:
  limits:
    - default:
        cpu: 250m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      type: Container
```

## Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

## Helm Chart Structure

```
charts/api-server/
├── Chart.yaml
├── values.yaml
├── values-staging.yaml
├── values-production.yaml
└── templates/
    ├── _helpers.tpl
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── hpa.yaml
    ├── configmap.yaml
    └── serviceaccount.yaml
```

### values.yaml

```yaml
replicaCount: 2

image:
  repository: myregistry/api-server
  tag: "1.2.3"  # Override per environment; never use "latest" in production
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPU: 70

ingress:
  enabled: true
  host: api.example.com
```

### Templated Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "api-server.fullname" . }}
  labels:
    {{- include "api-server.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "api-server.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "api-server.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

## Kustomize Overlays

```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/
    ├── staging/
    │   ├── kustomization.yaml
    │   └── replica-patch.yaml
    └── production/
        ├── kustomization.yaml
        ├── replica-patch.yaml
        └── resource-patch.yaml
```

### Base kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml
commonLabels:
  app: api-server
```

### Production Overlay

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - path: replica-patch.yaml
  - path: resource-patch.yaml
namespace: production
```

## CI/CD Integration

### GitHub Actions Deploy

```yaml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - run: aws eks update-kubeconfig --name my-cluster

      - name: Deploy with Helm
        run: |
          helm upgrade --install api-server ./charts/api-server \
            --namespace production \
            --set image.tag=${{ github.sha }} \
            --values ./charts/api-server/values-production.yaml \
            --wait --timeout 5m
```

## Checklist

- [ ] All containers have liveness, readiness, and startup probes
- [ ] Resource requests and limits set on every container
- [ ] Secrets managed via SealedSecrets, External Secrets, or SOPS — never plain text in Git
- [ ] Rolling update strategy with `maxUnavailable` and `maxSurge`
- [ ] HPA configured for CPU/memory with scale-down stabilization
- [ ] Namespace isolation between environments
- [ ] Network policies restrict pod-to-pod traffic
- [ ] Pod disruption budgets for high-availability workloads
- [ ] Image tags are immutable (commit SHA or semver) — never `latest` in production
