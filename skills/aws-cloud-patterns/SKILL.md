---
name: aws-cloud-patterns
description: AWS service usage patterns for Lambda, DynamoDB, S3, ECS, IAM, EventBridge, and CDK
---

# AWS Cloud Patterns

## When to Activate

- Implementing Lambda functions (handlers, layers, cold starts)
- Designing DynamoDB schemas or writing DynamoDB SDK code
- Working with S3 (presigned URLs, multipart uploads, lifecycle)
- Deploying containers on ECS/Fargate
- Writing IAM policies or setting up OIDC for CI/CD
- Configuring EventBridge rules, schedulers, or event replay
- Building CDK stacks and constructs
- Optimizing AWS costs

## Core Principles

1. **Least privilege**: Grant only the permissions required, nothing more
2. **Single-table design**: Model DynamoDB around access patterns, not entities
3. **Event-driven**: Decouple services using EventBridge, SQS, SNS
4. **Observability first**: Instrument with AWS Lambda Powertools from day one
5. **Infrastructure as code**: All resources defined in CDK, never click-ops
6. **Cost awareness**: Choose capacity modes and storage tiers intentionally

---

## Lambda Patterns

### TypeScript Handler with Powertools

```typescript
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

const logger = new Logger({ serviceName: 'orders' });
const tracer = new Tracer();
const metrics = new Metrics({ namespace: 'OrdersService' });

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  logger.appendKeys({ requestId: event.requestContext.requestId });
  const segment = tracer.getSegment();
  const subsegment = segment?.addNewSubsegment('businessLogic');
  try {
    logger.info('Processing request', { path: event.rawPath });
    metrics.addMetric('OrderProcessed', MetricUnit.Count, 1);
    return { statusCode: 200, body: JSON.stringify({ status: 'created' }) };
  } catch (error) {
    logger.error('Failed', { error });
    tracer.addErrorAsMetadata(error as Error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal error' }) };
  } finally {
    subsegment?.close();
    metrics.publishStoredMetrics();
  }
};
```

### Python Handler with Powertools

```python
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.metrics import MetricUnit
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger(service="orders")
tracer = Tracer()
metrics = Metrics(namespace="OrdersService")

@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler
@metrics.log_metrics(capture_cold_start_metric=True)
def handler(event: dict, context: LambdaContext) -> dict:
    order_id = event.get("orderId")
    logger.info("Processing order", extra={"order_id": order_id})
    metrics.add_metric(name="OrderProcessed", unit=MetricUnit.Count, value=1)
    return {"statusCode": 200, "body": {"orderId": order_id, "status": "created"}}
```

### Cold Start Mitigation & Layers (CDK)

```typescript
// Initialize SDK clients OUTSIDE handler (connection reuse across warm invocations)
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Layers + Provisioned Concurrency via CDK
const powertoolsLayer = LayerVersion.fromLayerVersionArn(
  this, 'Powertools',
  `arn:aws:lambda:${this.region}:094274105915:layer:AWSLambdaPowertoolsTypeScriptV2:22`
);
const fn = new NodejsFunction(this, 'Handler', {
  entry: 'src/handler.ts',
  runtime: Runtime.NODEJS_20_X,
  layers: [powertoolsLayer],
  bundling: { externalModules: ['@aws-lambda-powertools/*'] },
});
fn.addAlias('live', { provisionedConcurrentExecutions: 5 }); // for latency-sensitive paths
```

---

## DynamoDB Patterns

### Single-Table Design (PK/SK)

```
Entity      PK               SK
----------  ---------------  ----------------------
User        USER#<userId>    PROFILE
Order       USER#<userId>    ORDER#<orderId>
OrderItem   ORDER#<orderId>  ITEM#<itemId>
```

### SDK v3 CRUD + Transactions

```typescript
import { GetCommand, PutCommand, UpdateCommand,
         QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.TABLE_NAME!;

// Conditional put (create-only)
await ddb.send(new PutCommand({
  TableName: TABLE,
  Item: { PK: `USER#${userId}`, SK: 'PROFILE', email, createdAt: Date.now() },
  ConditionExpression: 'attribute_not_exists(PK)',
}));

// Query orders newest-first
const { Items } = await ddb.send(new QueryCommand({
  TableName: TABLE,
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
  ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':prefix': 'ORDER#' },
  ScanIndexForward: false,
}));

// Atomic multi-item transaction
await ddb.send(new TransactWriteCommand({
  TransactItems: [
    { Put: { TableName: TABLE, Item: { PK: `ORDER#${orderId}`, SK: 'META', status: 'created' },
             ConditionExpression: 'attribute_not_exists(PK)' } },
    { Update: { TableName: TABLE, Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
                UpdateExpression: 'ADD orderCount :one',
                ExpressionAttributeValues: { ':one': 1 } } },
  ],
}));

// TTL: add numeric epoch attribute; enable via CDK table.addAttribute or CLI
const ttl = Math.floor(Date.now() / 1000) + 3600;
```

### GSI Usage (CDK)

```typescript
const table = new Table(this, 'OrdersTable', {
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: 'ttl',
  removalPolicy: RemovalPolicy.RETAIN,
});
table.addGlobalSecondaryIndex({
  indexName: 'GSI1',
  partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
  sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
});
```

---

## S3 Patterns

### Presigned URLs

```typescript
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET_NAME!;

const downloadUrl = await getSignedUrl(s3,
  new GetObjectCommand({ Bucket: BUCKET, Key: `uploads/${fileKey}` }),
  { expiresIn: 3600 });

const uploadUrl = await getSignedUrl(s3,
  new PutObjectCommand({ Bucket: BUCKET, Key: `uploads/${userId}/${fileName}`,
                         ContentType: 'image/jpeg' }),
  { expiresIn: 300 });
```

### Multipart Upload

```typescript
import { CreateMultipartUploadCommand, UploadPartCommand,
         CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

const { UploadId } = await s3.send(new CreateMultipartUploadCommand(
  { Bucket: BUCKET, Key: 'large-file.zip' }));
const parts: { ETag: string; PartNumber: number }[] = [];
const chunkSize = 5 * 1024 * 1024;
for (let i = 0; i * chunkSize < fileBuffer.length; i++) {
  const { ETag } = await s3.send(new UploadPartCommand({
    Bucket: BUCKET, Key: 'large-file.zip', UploadId,
    PartNumber: i + 1, Body: fileBuffer.slice(i * chunkSize, (i + 1) * chunkSize),
  }));
  parts.push({ ETag: ETag!, PartNumber: i + 1 });
}
await s3.send(new CompleteMultipartUploadCommand(
  { Bucket: BUCKET, Key: 'large-file.zip', UploadId, MultipartUpload: { Parts: parts } }));
```

### Lifecycle Rules and CORS (CDK)

```typescript
const bucket = new Bucket(this, 'Assets', {
  versioned: true,
  lifecycleRules: [{
    transitions: [
      { storageClass: StorageClass.INFREQUENT_ACCESS, transitionAfter: Duration.days(30) },
      { storageClass: StorageClass.GLACIER, transitionAfter: Duration.days(90) },
    ],
    expiration: Duration.days(365),
  }],
  cors: [{ allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
           allowedOrigins: ['https://example.com'], allowedHeaders: ['*'] }],
});
```

---

## ECS / Fargate Patterns

```typescript
const cluster = new Cluster(this, 'Cluster', { vpc, containerInsights: true });
const taskDef = new FargateTaskDefinition(this, 'Task', { cpu: 512, memoryLimitMiB: 1024 });
taskDef.addContainer('App', {
  image: ContainerImage.fromEcrRepository(repo, 'latest'),
  portMappings: [{ containerPort: 3000 }],
  logging: LogDriver.awsLogs({ streamPrefix: 'app' }),
  secrets: { DB_PASSWORD: Secret.fromSecretsManager(dbSecret, 'password') },
  healthCheck: { command: ['CMD-SHELL', 'curl -f http://localhost:3000/health || exit 1'] },
});
const service = new ApplicationLoadBalancedFargateService(this, 'Service', {
  cluster, taskDefinition: taskDef, desiredCount: 2,
  deploymentController: { type: DeploymentControllerType.CODE_DEPLOY }, // blue/green
});
const scaling = service.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 10 });
scaling.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 60 });
```

---

## IAM Patterns

### Least Privilege with Conditions

```typescript
fn.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem'],
  resources: [table.tableArn],
  conditions: { 'ForAllValues:StringEquals': { 'dynamodb:LeadingKeys': ['${aws:userid}'] } },
}));

fn.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['s3:GetObject', 's3:PutObject'],
  resources: [`${bucket.bucketArn}/uploads/\${aws:userid}/*`],
}));
```

### OIDC for GitHub Actions

```typescript
const provider = new OpenIdConnectProvider(this, 'GitHubOIDC', {
  url: 'https://token.actions.githubusercontent.com',
  clientIds: ['sts.amazonaws.com'],
  thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1'], // AWS no longer validates for GitHub OIDC; placeholder OK
});
const deployRole = new Role(this, 'GitHubDeployRole', {
  assumedBy: new WebIdentityPrincipal(provider.openIdConnectProviderArn, {
    StringLike: {
      'token.actions.githubusercontent.com:sub': 'repo:myorg/myrepo:ref:refs/heads/main',
    },
    StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
  }),
});
```

```yaml
# .github/workflows/deploy.yml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubDeployRole
    aws-region: us-east-1
```

---

## EventBridge Patterns

### Event Rules and Publishing

```typescript
const bus = new EventBus(this, 'AppBus', { eventBusName: 'app-events' });
new Rule(this, 'OrderCreated', {
  eventBus: bus,
  eventPattern: { source: ['com.example.orders'], detailType: ['OrderCreated'] },
  targets: [new LambdaFunction(processingFn)],
});

// Publish from Lambda
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
const eb = new EventBridgeClient({});
await eb.send(new PutEventsCommand({ Entries: [{
  EventBusName: process.env.EVENT_BUS_NAME,
  Source: 'com.example.orders',
  DetailType: 'OrderCreated',
  Detail: JSON.stringify({ orderId, userId, amount }),
}]}));
```

### Scheduler and Archive

```typescript
// Cron-based scheduler
new CfnSchedule(this, 'DailyReport', {
  scheduleExpression: 'cron(0 8 * * ? *)',
  flexibleTimeWindow: { mode: 'OFF' },
  target: { arn: reportFn.functionArn, roleArn: schedulerRole.roleArn,
            retryPolicy: { maximumRetryAttempts: 3 } },
});

// Archive for replay capability
bus.archive('Archive', {
  archiveName: 'app-events-archive',
  retention: Duration.days(30),
  eventPattern: { source: ['com.example'] },
});
```

---

## CDK Infrastructure

### Environment-Aware Stack with Testing

```typescript
export class OrdersStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const isProd = this.node.tryGetContext('env') === 'prod';

    const table = new Table(this, 'Table', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    const fn = new NodejsFunction(this, 'Handler', {
      entry: 'src/handler.ts',
      reservedConcurrentExecutions: isProd ? 100 : 10,
      environment: { TABLE_NAME: table.tableName,
                     LOG_LEVEL: isProd ? 'WARN' : 'DEBUG' },
    });
    table.grantReadWriteData(fn);
    if (isProd) fn.addAlias('live', { provisionedConcurrentExecutions: 5 });
  }
}
```

```typescript
// CDK Assertions test
test('DynamoDB table has TTL and Lambda has correct env var', () => {
  const template = Template.fromStack(new OrdersStack(new App(), 'Test'));
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TimeToLiveSpecification: { AttributeName: 'ttl', Enabled: true },
  });
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: { Variables: { TABLE_NAME: { Ref: expect.stringContaining('Table') } } },
  });
});
```

---

## Cost Optimization

| Service | Tip |
|---|---|
| Lambda | Run aws-lambda-power-tuning SAR to find optimal memory/cost curve |
| DynamoDB | On-demand for spiky traffic; Provisioned + auto-scaling for steady load |
| S3 | Intelligent-Tiering for unknown access patterns; lifecycle to Glacier for archives |
| ECS | Spot instances for batch workloads; right-size CPU/memory in task definitions |
| General | Tag all resources (`Team`, `Env`, `Service`); enable Cost Anomaly Detection |

```typescript
// DynamoDB provisioned with auto-scaling for predictable workloads
const table = new Table(this, 'Table', {
  billingMode: BillingMode.PROVISIONED, readCapacity: 5, writeCapacity: 5,
});
const readScale = table.autoScaleReadCapacity({ minCapacity: 5, maxCapacity: 100 });
readScale.scaleOnUtilization({ targetUtilizationPercent: 70 });
```

---

## Checklist

### Lambda
- [ ] SDK clients initialized outside the handler function (warm reuse)
- [ ] Powertools Logger, Tracer, and Metrics configured with service name
- [ ] Cold start profiled; Provisioned Concurrency added if p99 exceeds SLA
- [ ] Timeout set conservatively (not default 15 min)
- [ ] Dead-letter queue configured for async invocations
- [ ] Layers used for shared large dependencies

### DynamoDB
- [ ] Access patterns documented before table schema design
- [ ] Single-table PK/SK supports all access patterns
- [ ] GSIs added only for required additional query patterns
- [ ] TTL attribute enabled for ephemeral/session data
- [ ] Point-in-time recovery (PITR) enabled in production
- [ ] Transactions used for multi-item atomic operations

### S3
- [ ] Bucket versioning enabled for critical data
- [ ] Server-side encryption enabled (SSE-S3 or SSE-KMS)
- [ ] Block all public access enforced
- [ ] Lifecycle rules transition objects to cheaper tiers
- [ ] CORS configured only for required origins

### ECS / Fargate
- [ ] Container health checks defined
- [ ] Task role follows least privilege
- [ ] Auto-scaling configured with CPU and/or request-based metrics
- [ ] Blue/green deployment enabled for zero-downtime releases
- [ ] Container Insights enabled on cluster

### IAM
- [ ] No wildcard `*` actions or resources without documented justification
- [ ] Condition keys restrict resource access where possible
- [ ] OIDC used for CI/CD instead of long-lived IAM access keys
- [ ] IAM Access Analyzer used to detect overly permissive policies

### EventBridge
- [ ] Custom event bus used instead of default bus for application events
- [ ] Dead-letter queue attached to targets for failed delivery
- [ ] Archive configured on custom bus for replay capability
- [ ] Event schema registered in Schema Registry

### CDK
- [ ] All resources tagged with `Env`, `Team`, and `Service`
- [ ] Removal policies set to RETAIN for production data stores
- [ ] CDK unit tests cover critical resource properties (Template.fromStack)
- [ ] `cdk diff` reviewed before every deployment to production
- [ ] Secrets in Secrets Manager, not plaintext environment variables
