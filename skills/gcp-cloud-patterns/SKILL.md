---
name: gcp-cloud-patterns
description: Google Cloud Platform patterns — Cloud Run, Cloud Functions, Firestore, Cloud Storage, Pub/Sub, IAM, Cloud Build, and cost optimization strategies.
---

# Google Cloud Platform Patterns

Production-grade GCP patterns for scalable cloud-native applications.

## When to Activate

- Deploying containers to Cloud Run
- Building event-driven functions with Cloud Functions Gen2
- Designing Firestore data models and security rules
- Configuring Cloud Storage with signed URLs
- Setting up Pub/Sub messaging pipelines
- Managing IAM and Workload Identity Federation
- Building CI/CD with Cloud Build

## Core Principles

1. **Managed services first** — use Cloud Run, Cloud Functions over GCE
2. **Least privilege IAM** — service accounts with minimal roles
3. **Event-driven architecture** — Pub/Sub and Eventarc for decoupling
4. **Infrastructure as code** — Terraform or gcloud for reproducibility
5. **Cost awareness** — right-size instances, use committed use discounts

## Cloud Run

### Service Deployment

```yaml
# service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: order-service
  annotations:
    run.googleapis.com/launch-stage: GA
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "100"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      serviceAccountName: order-service@my-project.iam.gserviceaccount.com
      containers:
        - image: us-docker.pkg.dev/my-project/repo/order-service:latest
          ports:
            - containerPort: 8080
          resources:
            limits:
              cpu: "2"
              memory: 1Gi
          env:
            - name: DB_CONNECTION
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: latest
          startupProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
```

### gcloud Deploy

```bash
# Build and deploy
gcloud run deploy order-service \
  --source . \
  --region us-central1 \
  --service-account order-service@my-project.iam.gserviceaccount.com \
  --set-env-vars NODE_ENV=production \
  --set-secrets DB_URL=db-credentials:latest \
  --min-instances 1 \
  --max-instances 100 \
  --concurrency 80 \
  --cpu 2 --memory 1Gi \
  --allow-unauthenticated

# Custom domain mapping
gcloud run domain-mappings create \
  --service order-service \
  --domain api.example.com \
  --region us-central1
```

## Cloud Functions Gen2

### HTTP Function

```typescript
import { HttpFunction } from "@google-cloud/functions-framework";
import { Firestore } from "@google-cloud/firestore";

const db = new Firestore();

export const getUser: HttpFunction = async (req, res) => {
  const userId = req.params[0] || req.query.id;
  if (!userId) {
    res.status(400).json({ error: "Missing user ID" });
    return;
  }

  const doc = await db.collection("users").doc(userId as string).get();
  if (!doc.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ id: doc.id, ...doc.data() });
};
```

### Pub/Sub Triggered Function

```typescript
import { CloudEvent } from "@google-cloud/functions-framework";

interface PubSubData {
  message: { data: string; attributes: Record<string, string> };
}

export const processOrder = async (event: CloudEvent<PubSubData>) => {
  const data = JSON.parse(
    Buffer.from(event.data!.message.data, "base64").toString()
  );

  console.log(`Processing order: ${data.orderId}`);
  await updateInventory(data.orderId, data.items);
};
```

### Deploy

```bash
gcloud functions deploy get-user \
  --gen2 \
  --runtime nodejs20 \
  --region us-central1 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point getUser \
  --memory 256Mi \
  --timeout 60s \
  --service-account fn-user@my-project.iam.gserviceaccount.com

gcloud functions deploy process-order \
  --gen2 \
  --runtime nodejs20 \
  --region us-central1 \
  --trigger-topic orders \
  --entry-point processOrder \
  --memory 512Mi \
  --retry
```

## Firestore

### Data Modeling

```typescript
import { Firestore, FieldValue } from "@google-cloud/firestore";

const db = new Firestore();

// Create with auto-ID
async function createOrder(userId: string, items: Item[]) {
  const orderRef = db.collection("orders").doc();
  await orderRef.set({
    userId,
    items,
    status: "pending",
    totalCents: items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    createdAt: FieldValue.serverTimestamp(),
  });
  return orderRef.id;
}

// Composite query
async function getUserOrders(userId: string, status?: string) {
  let query = db.collection("orders")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(20);

  if (status) query = query.where("status", "==", status);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Transaction
async function transferCredits(fromId: string, toId: string, amount: number) {
  await db.runTransaction(async (tx) => {
    const fromRef = db.collection("accounts").doc(fromId);
    const toRef = db.collection("accounts").doc(toId);
    const [fromDoc, toDoc] = await Promise.all([tx.get(fromRef), tx.get(toRef)]);

    const fromBalance = fromDoc.data()!.balance;
    if (fromBalance < amount) throw new Error("Insufficient balance");

    tx.update(fromRef, { balance: fromBalance - amount });
    tx.update(toRef, { balance: toDoc.data()!.balance + amount });
  });
}
```

### Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == "pending";
      allow update: if false; // Only via backend
    }
  }
}
```

## Cloud Storage

### Signed URLs

```typescript
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucket = storage.bucket("my-uploads");

async function generateUploadUrl(fileName: string, contentType: string) {
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });
  return url;
}

async function generateDownloadUrl(fileName: string) {
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return url;
}
```

### Lifecycle Policy

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
        "condition": { "age": 30, "matchesStorageClass": ["STANDARD"] }
      },
      {
        "action": { "type": "Delete" },
        "condition": { "age": 365 }
      }
    ]
  }
}
```

## Pub/Sub

### Publisher

```typescript
import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();
const topic = pubsub.topic("orders", {
  batching: { maxMessages: 100, maxMilliseconds: 100 },
});

async function publishOrder(order: Order) {
  const data = Buffer.from(JSON.stringify(order));
  const messageId = await topic.publishMessage({
    data,
    attributes: { type: "order.created", version: "1" },
    orderingKey: order.userId, // Ensures ordering per user
  });
  return messageId;
}
```

### Subscriber with Dead-Letter

```bash
# Create subscription with dead-letter
gcloud pubsub subscriptions create orders-sub \
  --topic orders \
  --ack-deadline 60 \
  --max-delivery-attempts 5 \
  --dead-letter-topic orders-dlq \
  --min-retry-delay 10s \
  --max-retry-delay 600s
```

## IAM

### Workload Identity Federation for CI/CD

```bash
# Create workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Grant access to service account
gcloud iam service-accounts add-iam-policy-binding \
  deploy@my-project.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/github-pool/attribute.repository/my-org/my-repo"
```

### GitHub Actions with Workload Identity

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: "projects/123/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
          service_account: "deploy@my-project.iam.gserviceaccount.com"

      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: order-service
          region: us-central1
          image: us-docker.pkg.dev/my-project/repo/order-service:${{ github.sha }}
```

## Cloud Build

```yaml
# cloudbuild.yaml
steps:
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "${_IMAGE}", "."]

  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "${_IMAGE}"]

  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: gcloud
    args:
      - "run"
      - "deploy"
      - "${_SERVICE}"
      - "--image=${_IMAGE}"
      - "--region=${_REGION}"
      - "--quiet"

substitutions:
  _SERVICE: order-service
  _REGION: us-central1
  _IMAGE: "us-docker.pkg.dev/${PROJECT_ID}/repo/${_SERVICE}:${SHORT_SHA}"

options:
  logging: CLOUD_LOGGING_ONLY
```

## Checklist

- [ ] Cloud Run services use dedicated service accounts
- [ ] Secrets stored in Secret Manager, not env vars
- [ ] Firestore security rules enforce authentication
- [ ] Cloud Storage uses signed URLs for upload/download
- [ ] Pub/Sub subscriptions have dead-letter topics
- [ ] IAM follows least-privilege principle
- [ ] Workload Identity Federation used for CI/CD (no JSON keys)
- [ ] Cloud Build automates deployment pipeline
