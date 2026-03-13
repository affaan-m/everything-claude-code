---
name: kubernetes-patterns
description: Kubernetes deployment patterns including pod design, service mesh, autoscaling, secrets management, and production-grade configurations.
origin: ECC
---

# Kubernetes Patterns

## When to Use

Use this skill when the user is:
- Deploying applications to Kubernetes clusters
- Designing pod configurations and multi-container patterns
- Setting up deployment strategies (rolling, blue-green, canary)
- Configuring service mesh (Istio, Linkerd)
- Implementing autoscaling (HPA, VPA, KEDA)
- Managing secrets in Kubernetes
- Setting up observability (Prometheus, Grafana, tracing)
- Hardening cluster security (RBAC, NetworkPolicy, Pod Security)
- Writing Helm charts or Kustomize overlays
- Troubleshooting pod failures, crashloops, or networking issues

## How It Works

### Declarative Configuration

All resources should be defined declaratively and stored in version control.

```yaml
# WRONG: Imperative commands
# kubectl run nginx --image=nginx --port=80
# kubectl expose deployment nginx --port=80 --type=LoadBalancer
# kubectl scale deployment nginx --replicas=3

# CORRECT: Declarative manifests
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: production
  labels:
    app.kubernetes.io/name: nginx
    app.kubernetes.io/version: "1.25"
    app.kubernetes.io/managed-by: helm
spec:
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: nginx
  template:
    metadata:
      labels:
        app.kubernetes.io/name: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25.3
          ports:
            - containerPort: 80
              protocol: TCP
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 250m
              memory: 256Mi
```

### Immutable Deployments

Never use `:latest` tags. Always use specific image digests or version tags.

```yaml
# WRONG: Mutable tags
containers:
  - name: app
    image: myapp:latest

# CORRECT: Immutable references
containers:
  - name: app
    image: myapp:1.4.2@sha256:abc123def456...
```

### Health Checks

Every container must define liveness, readiness, and startup probes.

```yaml
containers:
  - name: api
    image: myapp-api:2.1.0
    ports:
      - containerPort: 8080
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds: 3
      failureThreshold: 3
    startupProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
      failureThreshold: 30  # 30 * 5 = 150s max startup time
```

## Examples

### Pod Design Patterns

#### Sidecar Pattern

Add auxiliary functionality alongside the main container.

```yaml
# Logging sidecar: ships logs from the main container to a centralized system
apiVersion: v1
kind: Pod
metadata:
  name: app-with-log-shipper
spec:
  volumes:
    - name: shared-logs
      emptyDir: {}
  containers:
    - name: app
      image: myapp:2.1.0
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
      resources:
        requests:
          cpu: 200m
          memory: 256Mi
        limits:
          cpu: 500m
          memory: 512Mi

    - name: log-shipper
      image: fluent-bit:3.2
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
          readOnly: true
      resources:
        requests:
          cpu: 50m
          memory: 64Mi
        limits:
          cpu: 100m
          memory: 128Mi
      env:
        - name: FLUENT_ELASTICSEARCH_HOST
          valueFrom:
            configMapKeyRef:
              name: logging-config
              key: elasticsearch-host
```

#### Init Container Pattern

Run setup tasks before the main container starts.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  initContainers:
    # Wait for database to be ready
    - name: wait-for-db
      image: busybox:1.36
      command:
        - sh
        - -c
        - |
          until nc -z postgres-service 5432; do
            echo "Waiting for database..."
            sleep 2
          done
          echo "Database is ready"
      resources:
        requests:
          cpu: 10m
          memory: 16Mi
        limits:
          cpu: 50m
          memory: 32Mi

    # Run database migrations
    - name: run-migrations
      image: myapp:2.1.0
      command: ["python", "manage.py", "migrate", "--noinput"]
      envFrom:
        - secretRef:
            name: database-credentials
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 200m
          memory: 256Mi

  containers:
    - name: app
      image: myapp:2.1.0
      ports:
        - containerPort: 8080
      envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: database-credentials
      resources:
        requests:
          cpu: 200m
          memory: 256Mi
        limits:
          cpu: 500m
          memory: 512Mi
```

#### Ambassador Pattern

Proxy network connections for the main container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-proxy
spec:
  containers:
    - name: app
      image: myapp:2.1.0
      ports:
        - containerPort: 8080
      env:
        # App connects to localhost proxy instead of remote database
        - name: DATABASE_HOST
          value: "localhost"
        - name: DATABASE_PORT
          value: "5432"
      resources:
        requests:
          cpu: 200m
          memory: 256Mi
        limits:
          cpu: 500m
          memory: 512Mi

    - name: cloud-sql-proxy
      image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.8.0
      args:
        - "--structured-logs"
        - "--port=5432"
        - "my-project:us-central1:my-instance"
      securityContext:
        runAsNonRoot: true
      resources:
        requests:
          cpu: 50m
          memory: 64Mi
        limits:
          cpu: 100m
          memory: 128Mi
```

#### Adapter Pattern

Transform output from the main container into a standardized format.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-metrics-adapter
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9113"
spec:
  containers:
    - name: nginx
      image: nginx:1.25.3
      ports:
        - containerPort: 80
      volumeMounts:
        - name: nginx-status-config
          mountPath: /etc/nginx/conf.d/status.conf
          subPath: status.conf
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 250m
          memory: 256Mi

    # Adapter: converts nginx status to Prometheus metrics
    - name: nginx-exporter
      image: nginx/nginx-prometheus-exporter:1.0
      args:
        - "-nginx.scrape-uri=http://localhost:80/nginx_status"
      ports:
        - containerPort: 9113
      resources:
        requests:
          cpu: 10m
          memory: 16Mi
        limits:
          cpu: 50m
          memory: 32Mi

  volumes:
    - name: nginx-status-config
      configMap:
        name: nginx-status-config
```

### Deployment Strategies

#### Rolling Update

Default strategy with zero-downtime deployments.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # At most 6 pods during update (5 + 1)
      maxUnavailable: 0   # All 5 must be ready at all times
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        version: v2.1.0
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: api
          image: myapp-api:2.1.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 10"]
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
```

#### Blue-Green Deployment

Switch traffic between two identical environments.

```yaml
# Blue deployment (current production)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-blue
  namespace: production
  labels:
    app: api
    slot: blue
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api
      slot: blue
  template:
    metadata:
      labels:
        app: api
        slot: blue
        version: v2.0.0
    spec:
      containers:
        - name: api
          image: myapp-api:2.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi

---
# Green deployment (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-green
  namespace: production
  labels:
    app: api
    slot: green
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api
      slot: green
  template:
    metadata:
      labels:
        app: api
        slot: green
        version: v2.1.0
    spec:
      containers:
        - name: api
          image: myapp-api:2.1.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi

---
# Service: switch selector to swap blue <-> green
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: production
spec:
  selector:
    app: api
    slot: green  # Change to "blue" to rollback
  ports:
    - port: 80
      targetPort: 8080
```

#### Canary Deployment with Argo Rollouts

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api
  namespace: production
spec:
  replicas: 10
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myapp-api:2.1.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
  strategy:
    canary:
      canaryService: api-canary
      stableService: api-stable
      trafficRouting:
        istio:
          virtualServices:
            - name: api-vsvc
              routes:
                - primary
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - analysis:
            templates:
              - templateName: success-rate
            args:
              - name: service-name
                value: api-canary
        - setWeight: 20
        - pause: { duration: 10m }
        - analysis:
            templates:
              - templateName: success-rate
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 80
        - pause: { duration: 5m }

---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 60s
      successCondition: result[0] >= 0.99
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{
              service="{{args.service-name}}",
              status=~"2.."
            }[5m])) /
            sum(rate(http_requests_total{
              service="{{args.service-name}}"
            }[5m]))
```

### Service Mesh

#### Istio Traffic Management

```yaml
# Virtual Service for traffic splitting
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api
  namespace: production
spec:
  hosts:
    - api.production.svc.cluster.local
  http:
    - match:
        - headers:
            x-canary:
              exact: "true"
      route:
        - destination:
            host: api.production.svc.cluster.local
            subset: canary
    - route:
        - destination:
            host: api.production.svc.cluster.local
            subset: stable
          weight: 95
        - destination:
            host: api.production.svc.cluster.local
            subset: canary
          weight: 5
    - retries:
        attempts: 3
        perTryTimeout: 2s
        retryOn: gateway-error,connect-failure,refused-stream
    - timeout: 10s

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: api
  namespace: production
spec:
  host: api.production.svc.cluster.local
  trafficPolicy:
    connectionPool:
      http:
        h2UpgradePolicy: DEFAULT
        maxRequestsPerConnection: 100
      tcp:
        maxConnections: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 60s
      maxEjectionPercent: 50
  subsets:
    - name: stable
      labels:
        version: v2.0.0
    - name: canary
      labels:
        version: v2.1.0
```

#### Circuit Breaking

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: payments-service
  namespace: production
spec:
  host: payments.production.svc.cluster.local
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        maxRequestsPerConnection: 10
        maxRetries: 3
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 30
    loadBalancer:
      simple: LEAST_REQUEST
```

### Autoscaling

#### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
        - type: Percent
          value: 100
          periodSeconds: 60
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
      selectPolicy: Min
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
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
```

#### Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  updatePolicy:
    updateMode: "Auto"  # "Off" for recommendations only
  resourcePolicy:
    containerPolicies:
      - containerName: api
        minAllowed:
          cpu: 100m
          memory: 128Mi
        maxAllowed:
          cpu: 2
          memory: 4Gi
        controlledResources:
          - cpu
          - memory
```

#### KEDA Event-Driven Autoscaling

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker-scaler
  namespace: production
spec:
  scaleTargetRef:
    name: worker
  minReplicaCount: 1
  maxReplicaCount: 50
  pollingInterval: 15
  cooldownPeriod: 300
  triggers:
    - type: rabbitmq
      metadata:
        host: amqp://rabbitmq.production.svc.cluster.local:5672
        queueName: tasks
        queueLength: "10"  # Scale up when > 10 messages per pod
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: task_processing_time_seconds
        query: |
          avg(rate(task_processing_time_seconds_sum[5m])
          / rate(task_processing_time_seconds_count[5m]))
        threshold: "5"  # Scale up when avg processing > 5s
```

### Secrets Management

#### Sealed Secrets

Encrypt secrets for safe storage in Git.

```yaml
# Install sealed-secrets controller, then encrypt:
# kubeseal --format yaml < secret.yaml > sealed-secret.yaml

apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  encryptedData:
    DB_HOST: AgBy3i4OKD...encrypted...
    DB_PORT: AgBy3i4OKD...encrypted...
    DB_USERNAME: AgBy3i4OKD...encrypted...
    DB_PASSWORD: AgBy3i4OKD...encrypted...
  template:
    metadata:
      name: database-credentials
      namespace: production
    type: Opaque
```

#### External Secrets Operator

Sync secrets from external providers (AWS Secrets Manager, Vault, GCP).

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
    - secretKey: DB_HOST
      remoteRef:
        key: production/database
        property: host
    - secretKey: DB_PORT
      remoteRef:
        key: production/database
        property: port
    - secretKey: DB_USERNAME
      remoteRef:
        key: production/database
        property: username
    - secretKey: DB_PASSWORD
      remoteRef:
        key: production/database
        property: password
```

#### Vault Integration

```yaml
# Vault Agent injector annotations
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "api-production"
        vault.hashicorp.com/agent-inject-secret-db-creds: "secret/data/production/database"
        vault.hashicorp.com/agent-inject-template-db-creds: |
          {{- with secret "secret/data/production/database" -}}
          export DB_HOST="{{ .Data.data.host }}"
          export DB_PORT="{{ .Data.data.port }}"
          export DB_USERNAME="{{ .Data.data.username }}"
          export DB_PASSWORD="{{ .Data.data.password }}"
          {{- end -}}
    spec:
      serviceAccountName: api
      containers:
        - name: api
          image: myapp-api:2.1.0
          command:
            - /bin/sh
            - -c
            - source /vault/secrets/db-creds && exec ./app
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
```

### Observability

#### Prometheus Metrics

```yaml
# ServiceMonitor for Prometheus Operator
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-metrics
  namespace: production
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
    - port: metrics
      interval: 15s
      path: /metrics
  namespaceSelector:
    matchNames:
      - production

---
# PrometheusRule for alerting
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-alerts
  namespace: production
spec:
  groups:
    - name: api.rules
      rules:
        - alert: HighErrorRate
          expr: |
            sum(rate(http_requests_total{job="api", status=~"5.."}[5m]))
            / sum(rate(http_requests_total{job="api"}[5m])) > 0.01
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on API"
            description: "Error rate is {{ $value | humanizePercentage }} (threshold: 1%)"

        - alert: HighLatency
          expr: |
            histogram_quantile(0.99,
              sum(rate(http_request_duration_seconds_bucket{job="api"}[5m]))
              by (le)
            ) > 1
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High P99 latency on API"
            description: "P99 latency is {{ $value }}s (threshold: 1s)"

        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total{namespace="production"}[15m]) > 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Pod {{ $labels.pod }} is crash looping"
```

#### Distributed Tracing

```yaml
# OpenTelemetry Collector configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
  namespace: observability
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318

    processors:
      batch:
        timeout: 5s
        send_batch_size: 1000
      memory_limiter:
        check_interval: 1s
        limit_mib: 512
        spike_limit_mib: 128

    exporters:
      otlp/jaeger:
        endpoint: jaeger-collector:14250
        tls:
          insecure: true
      prometheus:
        endpoint: 0.0.0.0:8889

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [otlp/jaeger]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [prometheus]
```

### Security

#### Pod Security Standards

```yaml
# Namespace-level Pod Security Standards
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted

---
# Restricted pod configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          image: myapp-api:2.1.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir:
            sizeLimit: 100Mi
```

#### NetworkPolicy

```yaml
# Default deny all ingress and egress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# Allow specific traffic for the API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - port: 8080
          protocol: TCP
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - port: 5432
          protocol: TCP
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - port: 6379
          protocol: TCP
    - to:  # Allow DNS
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - port: 53
          protocol: UDP
        - port: 53
          protocol: TCP
```

#### RBAC

```yaml
# Service account for the application
apiVersion: v1
kind: ServiceAccount
metadata:
  name: api
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/api-production

---
# Role with minimum required permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: api-role
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["api-config"]
    verbs: ["get"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: api-role-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: api
    namespace: production
roleRef:
  kind: Role
  name: api-role
  apiGroup: rbac.authorization.k8s.io
```

### Helm Chart Patterns

#### Values Templating

```yaml
# values.yaml (defaults)
replicaCount: 3

image:
  repository: myapp-api
  tag: "2.1.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 500m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilization: 70
  targetMemoryUtilization: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: api-tls
      hosts:
        - api.example.com

env: {}
secrets: {}

podDisruptionBudget:
  enabled: true
  minAvailable: "50%"
```

```yaml
# values-production.yaml (environment override)
replicaCount: 5

resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 1
    memory: 2Gi

autoscaling:
  minReplicas: 5
  maxReplicas: 50

env:
  LOG_LEVEL: "info"
  CACHE_TTL: "3600"

podDisruptionBudget:
  minAvailable: "60%"
```

#### Deployment Template

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "mychart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
      labels:
        {{- include "mychart.selectorLabels" . | nindent 8 }}
    spec:
      serviceAccountName: {{ include "mychart.serviceAccountName" . }}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          {{- if .Values.env }}
          envFrom:
            - configMapRef:
                name: {{ include "mychart.fullname" . }}
          {{- end }}
          {{- if .Values.secrets }}
          envFrom:
            - secretRef:
                name: {{ include "mychart.fullname" . }}
          {{- end }}
          livenessProbe:
            httpGet:
              path: /healthz
              port: {{ .Values.service.targetPort }}
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /ready
              port: {{ .Values.service.targetPort }}
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

#### Helm Hooks

```yaml
# templates/pre-upgrade-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "mychart.fullname" . }}-migrate
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded,before-hook-creation
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command: ["python", "manage.py", "migrate", "--noinput"]
          envFrom:
            - secretRef:
                name: {{ include "mychart.fullname" . }}-db
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi

---
# templates/post-upgrade-test.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "mychart.fullname" . }}-smoke-test
  annotations:
    "helm.sh/hook": post-upgrade
    "helm.sh/hook-weight": "5"
    "helm.sh/hook-delete-policy": hook-succeeded,before-hook-creation
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: smoke-test
          image: curlimages/curl:8.5.0
          command:
            - /bin/sh
            - -c
            - |
              echo "Running smoke tests..."
              curl -sf http://{{ include "mychart.fullname" . }}:{{ .Values.service.port }}/healthz || exit 1
              echo "Smoke tests passed"
          resources:
            requests:
              cpu: 10m
              memory: 16Mi
            limits:
              cpu: 50m
              memory: 32Mi
```
