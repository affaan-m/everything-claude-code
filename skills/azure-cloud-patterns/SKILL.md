---
name: azure-cloud-patterns
description: Azure service patterns — Azure Functions, Cosmos DB, Blob Storage, Service Bus, AKS, Entra ID / MSAL, Key Vault, and Bicep IaC
---

# Azure Cloud Patterns

## When to Activate

- Building Azure Functions (HTTP, Durable, Service Bus, Timer triggers)
- Designing Cosmos DB containers with partition key strategy
- Working with Blob Storage (SAS tokens, lifecycle, Event Grid)
- Setting up Service Bus messaging (topics, dead-letter, sessions)
- Deploying to AKS with Workload Identity and KEDA
- Implementing authentication with Entra ID / MSAL
- Managing secrets with Key Vault; Writing Bicep IaC

## Core Principles

1. **Managed Identity everywhere** — avoid connection strings and stored credentials
2. **Partition-aware design** — choose Cosmos DB partition keys by query pattern
3. **Event-driven** — decouple with Service Bus, Event Grid, Durable Functions
4. **Bicep for IaC** — all resources defined declaratively, never portal click-ops
5. **Zero-trust** — Entra ID for auth, Key Vault for secrets, private endpoints
6. **Cost awareness** — consumption vs. premium tiers intentionally, autoscale

---

## 1. Azure Functions

### HTTP Trigger (v4 Programming Model)

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const container = new CosmosClient(process.env.COSMOS_CONNECTION!)
  .database("appdb").container("orders");

async function getOrder(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const orderId = req.params.orderId;
  if (!orderId) return { status: 400, jsonBody: { error: "Missing orderId" } };
  try {
    const { resource } = await container.item(orderId, orderId).read();
    if (!resource) return { status: 404, jsonBody: { error: "Not found" } };
    return { status: 200, jsonBody: resource };
  } catch (err) {
    context.error("Failed to read order", err);
    return { status: 500, jsonBody: { error: "Internal error" } };
  }
}

app.http("getOrder", {
  methods: ["GET"], authLevel: "function", route: "orders/{orderId}", handler: getOrder,
});
```

### Durable Functions — Fan-out / Fan-in

```typescript
import * as df from "durable-functions";
import { app } from "@azure/functions";

df.app.orchestration("processOrders", function* (ctx) {
  const orders: string[] = yield ctx.df.callActivity("getUnprocessedOrders");
  const tasks = orders.map((id) => ctx.df.callActivity("processOneOrder", id));
  const results: boolean[] = yield ctx.df.Task.all(tasks); // fan-out / fan-in
  yield ctx.df.callActivity("sendSummary", { total: orders.length, ok: results.filter(Boolean).length });
});

df.app.activity("processOneOrder", { handler: async (id: string) => { /* idempotent */ return true; } });

app.http("startOrchestration", {
  route: "orchestrations/process-orders",
  handler: df.app.durableClient(async (req, client) => {
    const instanceId = await client.startNew("processOrders");
    return client.createCheckStatusResponse(req, instanceId);
  }),
});
```

### Service Bus & Timer Triggers

```typescript
app.serviceBusTopic("processNotification", {
  connection: "SERVICE_BUS_CONNECTION",
  topicName: "notifications", subscriptionName: "email-processor",
  handler: async (message: unknown, context: InvocationContext) => {
    const n = message as { userId: string; template: string };
    context.log(`Sending ${n.template} to ${n.userId}`);
    await sendEmail(n);
  },
});

app.timer("dailyCleanup", {
  schedule: "0 0 2 * * *", // 2:00 AM UTC daily
  handler: async (_timer, context: InvocationContext) => {
    context.log(`Purged ${await purgeExpiredSessions()} expired sessions`);
  },
});
```

---

## 2. Cosmos DB
### Partition Key Strategy

| Container     | Partition Key   | Rationale                             |
|---------------|-----------------|---------------------------------------|
| orders        | /customerId     | Queries scoped to one customer        |
| products      | /categoryId     | Browse by category                    |
| events        | /tenantId       | Multi-tenant isolation                |
| sessions      | /sessionId      | Point reads; TTL auto-expire          |
| chat-messages | /conversationId | Full conversation in one partition    |

### TypeScript SDK CRUD

```typescript
import { CosmosClient, PatchOperation } from "@azure/cosmos";
const container = new CosmosClient(process.env.COSMOS_CONNECTION!)
  .database("appdb").container("orders");

// Create
await container.items.create({ id: orderId, customerId, items, status: "pending", createdAt: Date.now() });

// Point read (lowest RU cost)
const { resource } = await container.item(orderId, customerId).read();

// Query within partition
const { resources } = await container.items.query({
  query: "SELECT * FROM c WHERE c.customerId=@cid AND c.status=@s ORDER BY c.createdAt DESC",
  parameters: [{ name: "@cid", value: customerId }, { name: "@s", value: "pending" }],
}).fetchAll();

// Patch (cheaper than full replace)
await container.item(orderId, customerId).patch([
  { op: "replace", path: "/status", value: "shipped" } as PatchOperation,
  { op: "add", path: "/shippedAt", value: Date.now() } as PatchOperation,
]);

// Optimistic concurrency
const { resource: existing, etag } = await container.item(orderId, customerId).read();
await container.items.upsert({ ...existing, status: "completed" },
  { accessCondition: { type: "IfMatch", condition: etag! } });
```

### Change Feed (Azure Functions Trigger)

```typescript
app.cosmosDB("orderChangeFeed", {
  connection: "COSMOS_CONNECTION", databaseName: "appdb",
  containerName: "orders", createLeaseContainerIfNotExists: true,
  handler: async (documents: unknown[], context: InvocationContext) => {
    for (const doc of documents) await projectToReadModel(doc);
  },
});
```

### Consistency Levels

| Level             | Lag    | Cost  | Use case                       |
|-------------------|--------|-------|--------------------------------|
| Strong            | 0      | 2x RU | Financial, inventory           |
| Bounded Staleness | ~K ops | 2x RU | Leaderboards                   |
| Session (default) | 0*     | 1x RU | User-facing (read-your-writes) |
| Consistent Prefix | Varies | 1x RU | Activity feeds                 |
| Eventual          | Varies | 1x RU | Analytics, counters            |

*Within the same session token.

---

## 3. Azure Blob Storage

### SAS Token Generation

```typescript
import { generateBlobSASQueryParameters, BlobSASPermissions,
  StorageSharedKeyCredential, SASProtocol } from "@azure/storage-blob";

function generateUploadSas(account: string, key: string, container: string, blob: string): string {
  const cred = new StorageSharedKeyCredential(account, key);
  const sas = generateBlobSASQueryParameters({
    containerName: container, blobName: blob, permissions: BlobSASPermissions.parse("cw"),
    startsOn: new Date(), expiresOn: new Date(Date.now() + 15 * 60_000), protocol: SASProtocol.Https,
  }, cred);
  return `https://${account}.blob.core.windows.net/${container}/${blob}?${sas}`;
} // Production: prefer User Delegation SAS with Managed Identity
```

### Lifecycle Management (Bicep)

```bicep
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: { accessTier: 'Hot', allowBlobPublicAccess: false, minimumTlsVersion: 'TLS1_2' }
}
resource lifecycle 'Microsoft.Storage/storageAccounts/managementPolicies@2023-01-01' = {
  parent: storage
  name: 'default'
  properties: { policy: { rules: [{ name: 'archiveOldBlobs', type: 'Lifecycle', definition: {
    filters: { blobTypes: ['blockBlob'], prefixMatch: ['logs/'] }
    actions: { baseBlob: {
      tierToCool: { daysAfterModificationGreaterThan: 30 }
      tierToArchive: { daysAfterModificationGreaterThan: 90 }
      delete: { daysAfterModificationGreaterThan: 365 } }}
  }}]}}
}
```

### Event Grid Trigger (Blob Created)

```typescript
app.eventGrid("blobCreated", {
  handler: async (event, context) => {
    const { url, contentLength } = event.data as { url: string; contentLength: number };
    context.log(`New blob: ${url} (${contentLength} bytes)`);
    await processUploadedFile(url);
  },
});
```

---

## 4. Azure Service Bus
### Topic / Subscription Pub/Sub

```typescript
import { ServiceBusClient } from "@azure/service-bus";
const sbClient = new ServiceBusClient(process.env.SERVICE_BUS_CONNECTION!);

// Publisher
const sender = sbClient.createSender("order-events");
await sender.sendMessages({
  body: { orderId, action: "created", timestamp: Date.now() },
  applicationProperties: { eventType: "order.created" }, contentType: "application/json",
});

// Subscriber
const receiver = sbClient.createReceiver("order-events", "analytics-sub");
for (const msg of await receiver.receiveMessages(10, { maxWaitTimeInMs: 5000 })) {
  try { await handleEvent(msg.body); await receiver.completeMessage(msg); }
  catch { await receiver.abandonMessage(msg); }
}
```

### Dead-Letter Queue Processing

```typescript
const dlq = sbClient.createReceiver("order-events", "analytics-sub", { subQueueType: "deadLetter" });
for (const msg of await dlq.receiveMessages(20)) {
  console.log(`DLQ: ${msg.deadLetterReason}`, msg.body);
  await repairAndResubmit(msg); await dlq.completeMessage(msg);
}
```

### Session-based Ordering

```typescript
await sender.sendMessages({ body: { step: 1 }, sessionId: orderId }); // FIFO per session
const sess = await sbClient.acceptSession("order-pipeline", "processor", orderId);
for (const m of await sess.receiveMessages(10)) { await processStep(m.body); await sess.completeMessage(m); }
await sess.close();
```

---

## 5. AKS (Azure Kubernetes Service)
### Workload Identity Federation

```bicep
resource fedCred 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: managedIdentity
  name: 'aks-order-service'
  properties: {
    issuer: aksCluster.properties.oidcIssuerProfile.issuerURL
    subject: 'system:serviceaccount:${namespace}:order-service-sa'
    audiences: ['api://AzureADTokenExchange']
  }
}
```

```yaml
# K8s ServiceAccount annotated for Workload Identity
apiVersion: v1
kind: ServiceAccount
metadata:
  name: order-service-sa
  annotations: { azure.workload.identity/client-id: "<managed-identity-client-id>" }
  labels: { azure.workload.identity/use: "true" }
```

### Bicep Cluster Definition

```bicep
resource aks 'Microsoft.ContainerService/managedClusters@2024-01-01' = {
  name: clusterName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    kubernetesVersion: '1.29'
    dnsPrefix: clusterName
    oidcIssuerProfile: { enabled: true }
    securityProfile: { workloadIdentity: { enabled: true } }
    networkProfile: { networkPlugin: 'azure', networkPolicy: 'calico' }
    agentPoolProfiles: [{ name: 'system', count: 3, vmSize: 'Standard_D4s_v5', mode: 'System'
      enableAutoScaling: true, minCount: 2, maxCount: 5, availabilityZones: ['1','2','3'] }]
  }
}
```

### KEDA Auto-Scaler

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata: { name: order-processor-scaler, namespace: production }
spec:
  scaleTargetRef: { name: order-processor }
  minReplicaCount: 1
  maxReplicaCount: 30
  triggers:
    - type: azure-servicebus
      metadata: { queueName: orders, messageCount: "5", connectionFromEnv: SERVICE_BUS_CONNECTION }
```

---

## 6. Authentication (Entra ID / MSAL)
### Confidential Client (Service-to-Service)

```typescript
import { ConfidentialClientApplication } from "@azure/msal-node";
const cca = new ConfidentialClientApplication({ auth: {
  clientId: process.env.AZURE_CLIENT_ID!, clientSecret: process.env.AZURE_CLIENT_SECRET!,
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
}});
const { accessToken } = (await cca.acquireTokenByClientCredential({ scopes: ["https://graph.microsoft.com/.default"] }))!;
```

### On-Behalf-Of Flow

```typescript
async function getOnBehalfOfToken(userToken: string): Promise<string> {
  const r = await cca.acquireTokenOnBehalfOf({
    oboAssertion: userToken, scopes: ["api://downstream-api/.default"],
  });
  return r!.accessToken;
}
```

### Managed Identity (Recommended)

```typescript
import { DefaultAzureCredential } from "@azure/identity";
const credential = new DefaultAzureCredential(); // Managed Identity on Azure, CLI creds locally
// Pass credential to any Azure SDK client — no secrets to manage
```

---

## 7. Key Vault

### Secret Reference in App Service (Bicep)

```bicep
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: { siteConfig: { appSettings: [
    { name: 'COSMOS_CONNECTION', value: '@Microsoft.KeyVault(VaultName=${kvName};SecretName=cosmos-conn)' }
    { name: 'SB_CONNECTION', value: '@Microsoft.KeyVault(VaultName=${kvName};SecretName=sb-conn)' }
  ]}}
}
// Grant App Service access to Key Vault secrets via access policy or RBAC
```

### TypeScript SecretClient

```typescript
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
const kv = new SecretClient("https://my-vault.vault.azure.net", new DefaultAzureCredential());

const secret = await kv.getSecret("cosmos-connection");                              // Read
await kv.setSecret("api-key", newValue, {                                            // Set with expiry
  expiresOn: new Date(Date.now() + 90 * 24 * 3600_000), tags: { env: "prod" },
});
for await (const v of kv.listPropertiesOfSecretVersions("api-key")) {                // Audit
  console.log(`${v.version} created ${v.createdOn}`);
}
```

---

## 8. Bicep IaC
### Module Pattern

```bicep
// modules/cosmos.bicep — reusable module with typed params
param accountName string
param location string = resourceGroup().location
param databaseName string
param containers array // [{ name, partitionKey, ttl?, maxRU? }]

resource account 'Microsoft.DocumentDB/databaseAccounts@2024-02-15-preview' = {
  name: accountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: { defaultConsistencyLevel: 'Session' }
    locations: [{ locationName: location, failoverPriority: 0 }]
  }
}
resource db 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-02-15-preview' = {
  parent: account
  name: databaseName
  properties: { resource: { id: databaseName } }
}
resource coll 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = [for c in containers: {
  parent: db
  name: c.name
  properties: {
    resource: { id: c.name, partitionKey: { paths: [c.partitionKey], kind: 'Hash' }, defaultTtl: c.?ttl ?? -1 }
    options: { autoscaleSettings: { maxThroughput: c.?maxRU ?? 4000 } }
  }
}]
output endpoint string = account.properties.documentEndpoint

// main.bicep — consumes modules
targetScope = 'resourceGroup'
param environment string
param location string = resourceGroup().location
module cosmos 'modules/cosmos.bicep' = {
  name: 'cosmos-deploy'
  params: {
    accountName: 'cosmos-${environment}', location: location, databaseName: 'appdb'
    containers: [
      { name: 'orders', partitionKey: '/customerId', maxRU: 8000 }
      { name: 'sessions', partitionKey: '/sessionId', ttl: 3600 }
    ]
  }
}
```

### Deployment Commands

```bash
az deployment group validate --resource-group rg-app-prod -f main.bicep -p parameters/prod.bicepparam
az deployment group what-if  --resource-group rg-app-prod -f main.bicep -p parameters/prod.bicepparam
az deployment group create   --resource-group rg-app-prod -f main.bicep -p parameters/prod.bicepparam \
  --name "release-$(date +%Y%m%d-%H%M%S)"
```

---

## 9. Checklist

### Azure Functions
- [ ] SDK clients initialized outside handler (warm reuse)
- [ ] v4 programming model with typed bindings
- [ ] Durable Functions for orchestration over chained HTTP calls
- [ ] Application Insights connected; host.json retry policies configured

### Cosmos DB
- [ ] Partition key chosen by primary query pattern
- [ ] Point reads preferred over queries (lowest RU cost)
- [ ] Patch for partial updates; TTL on ephemeral containers
- [ ] Autoscale throughput for traffic spikes

### Blob Storage
- [ ] Public access disabled at account level
- [ ] User Delegation SAS over account key SAS
- [ ] Lifecycle rules transition to Cool/Archive tiers
- [ ] Soft delete and versioning for critical data

### Service Bus
- [ ] Dead-letter queue monitored and processed
- [ ] Sessions for ordered processing; duplicate detection enabled
- [ ] Premium tier for production with predictable throughput

### AKS
- [ ] Workload Identity Federation (no pod-level secrets)
- [ ] Network policy (Calico); KEDA for event-driven scaling
- [ ] System and user node pools separated

### Security (Entra ID / Key Vault)
- [ ] Managed Identity for all Azure-hosted services
- [ ] Key Vault references in App Service config, not plaintext
- [ ] Secret rotation policy with expiry alerts; RBAC over access policies

### Bicep IaC
- [ ] Resources organized in reusable modules
- [ ] `what-if` reviewed before every production deployment
- [ ] Parameter files per environment; resources tagged `environment`, `team`, `service`
