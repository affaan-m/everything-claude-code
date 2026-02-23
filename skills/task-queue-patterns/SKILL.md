---
name: task-queue-patterns
description: Application-layer job scheduling patterns using BullMQ (Node.js) and Celery (Python). Covers priority queues, rate limiting, job flows/DAGs, progress tracking, error handling with retries, worker scaling, and admin dashboards.
---

# Task Queue Patterns

## When to Activate

- Building background job processing with BullMQ or Celery
- Implementing job scheduling, cron jobs, or periodic tasks
- Designing priority queues or rate-limited job processing
- Creating job pipelines (chains, groups, DAGs)
- Setting up worker scaling or graceful shutdown
- Adding progress tracking for long-running jobs
- Configuring admin dashboards (Bull Board, Flower)
- Handling retries, exponential backoff, or dead letter recovery

## Core Principles

1. **Idempotency**: Every job must be safe to run more than once
2. **Observability**: Track job state, progress, and failures at all times
3. **Backpressure**: Rate limit workers to protect downstream services
4. **Graceful shutdown**: Drain in-flight jobs before terminating workers
5. **Separation of concerns**: Queue definition, worker logic, and scheduling are independent

---

## BullMQ Patterns (Node.js)

### Basic Queue and Worker

```typescript
import { Queue, Worker, Job, QueueEvents } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };
const emailQueue = new Queue('email', { connection });

await emailQueue.add(
  'welcome',
  { to: 'user@example.com', template: 'welcome' },
  {
    priority: 1,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

const worker = new Worker(
  'email',
  async (job: Job) => { await sendEmail(job.data); },
  { connection, concurrency: 5 }
);

worker.on('completed', (job) => console.log(`Job ${job.id} done`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed`, err));
```

### Scheduled and Cron Jobs

```typescript
const reportQueue = new Queue('reports', { connection });

// One-time delayed job
await reportQueue.add('generate', { reportId: 'abc' }, { delay: 60_000 });

// Repeating cron job (deduplicated by jobId)
await reportQueue.add(
  'daily-summary',
  { type: 'daily' },
  { repeat: { pattern: '0 8 * * *' }, jobId: 'daily-summary-unique' }
);
```

### Priority Queues

```typescript
const notifyQueue = new Queue('notifications', { connection });

// Lower number = higher priority
await notifyQueue.add('sms-alert', { userId: 'u1' }, { priority: 1 });
await notifyQueue.add('push', { userId: 'u2' }, { priority: 5 });
await notifyQueue.add('email-digest', { userId: 'u3' }, { priority: 10 });
```

### Rate Limiting

```typescript
// Worker-level limiter: max 10 jobs per second
const worker = new Worker('external-api', processor, {
  connection,
  concurrency: 5,
  limiter: { max: 10, duration: 1000 },
});
```

---

## Celery Patterns (Python)

### Task Decorator and Retries

```python
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0',
             backend='redis://localhost:6379/1')

@app.task(
    bind=True,
    max_retries=3,
    autoretry_for=(TransientError,),
    retry_backoff=True,       # exponential backoff
    retry_backoff_max=600,    # cap at 10 minutes
    retry_jitter=True,
    acks_late=True,
    reject_on_worker_lost=True,
)
def process_order(self, order_id: str):
    try:
        return execute_order_logic(order_id)
    except TransientError as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    except Exception as exc:
        logger.error('Permanent failure %s: %s', order_id, exc)
        raise
```

### Beat Scheduler for Periodic Tasks

```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    'daily-report': {
        'task': 'tasks.generate_report',
        'schedule': crontab(hour=8, minute=0),
        'args': ('daily',),
    },
    'cleanup': {
        'task': 'tasks.cleanup_sessions',
        'schedule': 300.0,  # every 5 minutes
    },
}
app.conf.timezone = 'UTC'
```

### Canvas: Chain, Group, and Chord

```python
from celery import chain, group, chord

# Sequential pipeline
pipeline = chain(
    validate_order.s(order_id),
    charge_payment.s(),
    fulfill_order.s(),
    send_confirmation.s(),
)
pipeline.delay()

# Parallel fan-out
group(check_inventory.s(item) for item in order.items).delay()

# Parallel then callback
chord(
    group(process_chunk.s(chunk) for chunk in chunks),
    aggregate_results.s(),
).delay()
```

---

## Job Flows and DAGs

### BullMQ FlowProducer

```typescript
import { FlowProducer } from 'bullmq';

const flow = await new FlowProducer({ connection }).add({
  name: 'process-order',
  queueName: 'orders',
  data: { orderId: 'ord-001' },
  children: [
    { name: 'validate-inventory', queueName: 'inventory', data: { orderId: 'ord-001' } },
    {
      name: 'charge-payment',
      queueName: 'payments',
      data: { orderId: 'ord-001', amount: 99.99 },
      children: [
        { name: 'verify-card', queueName: 'card-verification', data: { cardToken: 'tok-xyz' } },
      ],
    },
  ],
});

// Parent worker receives aggregated child results
const orderWorker = new Worker('orders', async (job: Job) => {
  const childValues = await job.getChildrenValues();
  console.log('Children completed:', childValues);
}, { connection });
```

---

## Progress Tracking

### BullMQ + WebSocket

```typescript
const worker = new Worker('video-processing', async (job: Job) => {
  const { frames } = job.data;
  for (let i = 0; i < frames; i++) {
    await processFrame(i);
    await job.updateProgress(Math.round(((i + 1) / frames) * 100));
  }
}, { connection });

const queueEvents = new QueueEvents('video-processing', { connection });
queueEvents.on('progress', ({ jobId, data }) => {
  io.to(`job:${jobId}`).emit('progress', { jobId, progress: data });
});
```

### Celery Custom States

```python
@app.task(bind=True)
def import_csv(self, file_path: str, total_rows: int):
    for i, row in enumerate(read_csv(file_path)):
        process_row(row)
        if i % 100 == 0:
            self.update_state(
                state='PROGRESS',
                meta={'current': i, 'total': total_rows,
                      'percent': int(i / total_rows * 100)},
            )
    return {'status': 'complete', 'total': total_rows}

def get_task_status(task_id: str) -> dict:
    result = app.AsyncResult(task_id)
    if result.state == 'PROGRESS':
        return result.info
    elif result.state == 'SUCCESS':
        return {'status': 'complete', 'result': result.result}
    return {'status': result.state, 'error': str(result.info)}
```

---

## Error Handling and Retries

### Exponential Backoff with Jitter (BullMQ)

```typescript
await queue.add('risky-task', data, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 2000 },
});

// Custom jitter strategy
const worker = new Worker('risky-task', processor, {
  connection,
  settings: {
    backoffStrategy: (attemptsMade: number) => {
      const base = Math.pow(2, attemptsMade) * 1000;
      return Math.round(base + base * 0.2 * (Math.random() - 0.5));
    },
  },
});
```

### Dead Letter Queue Recovery

```typescript
const dlq = new Queue('orders-dlq', { connection });

worker.on('failed', async (job: Job | undefined, err: Error) => {
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    await dlq.add('failed-order', {
      originalJob: job.toJSON(), error: err.message,
    });
  }
});

// Replay from DLQ
async function replayFromDLQ(jobId: string) {
  const dlqJob = await dlq.getJob(jobId);
  if (!dlqJob) throw new Error('DLQ job not found');
  await mainQueue.add(dlqJob.data.originalJob.name, dlqJob.data.originalJob.data);
  await dlqJob.remove();
}
```

### Idempotency

```typescript
// Deduplicate with stable jobId
await queue.add('send-email', data, {
  jobId: `email:${userId}:${eventType}:${dayStamp}`,
  attempts: 3,
});
```

```python
# Celery: Redis lock for idempotency
@app.task(bind=True, acks_late=True)
def idempotent_charge(self, payment_id: str):
    with redis.lock(f'lock:charge:{payment_id}', timeout=30):
        if already_processed(payment_id):
            return {'status': 'already_processed'}
        result = charge_payment(payment_id)
        mark_processed(payment_id)
        return result
```

---

## Worker Scaling

### Horizontal Scaling

```typescript
// Scale by running multiple worker processes
const worker = new Worker('email', processor, {
  connection,
  concurrency: 10,
  maxStalledCount: 1,
  stalledInterval: 30_000,
});
```

```bash
# Celery: multiple named workers
celery -A tasks worker --concurrency=10 --hostname=worker1@%h
celery -A tasks worker --concurrency=10 --hostname=worker2@%h
# Per-queue autoscale
celery -A tasks worker -Q high-priority --autoscale=20,4
```

### Kubernetes HPA via KEDA

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: email-worker-scaler
spec:
  scaleTargetRef:
    name: email-worker
  minReplicaCount: 1
  maxReplicaCount: 20
  triggers:
    - type: redis
      metadata:
        address: redis:6379
        listName: bull:email:wait
        listLength: "10"
```

### Graceful Shutdown

```typescript
async function shutdown() {
  await worker.close(); // waits for current job to finish
  await queue.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

```python
# Celery warm shutdown: finishes current task before stopping
# celery -A tasks control shutdown  (remote)
# Or send SIGTERM to worker process
```

---

## Admin and Monitoring

### Bull Board Dashboard

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(dlq)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

### Flower for Celery

```bash
pip install flower
celery -A tasks flower --port=5555 --basic_auth=admin:secret
# Prometheus endpoint available at http://flower-host:5555/metrics
```

### Prometheus Metrics (BullMQ)

```typescript
import { Gauge, register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();
const waitingGauge = new Gauge({
  name: 'bullmq_queue_waiting_total',
  help: 'Waiting jobs per queue',
  labelNames: ['queue'],
});

setInterval(async () => {
  const { waiting } = await emailQueue.getJobCounts('waiting');
  waitingGauge.set({ queue: 'email' }, waiting);
}, 5000);

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

---

## Checklist

**Job Definition**
- [ ] Jobs carry only serializable, minimal data (IDs, not full objects)
- [ ] Each job has `attempts` and `backoff` configured
- [ ] Repeating jobs use a stable `jobId` to prevent duplicates
- [ ] `removeOnComplete` / `removeOnFail` set to avoid Redis memory bloat

**Reliability**
- [ ] All tasks are idempotent (safe to execute multiple times)
- [ ] `acks_late=True` (Celery) to prevent data loss on worker crash
- [ ] Dead letter queue exists for permanently failed jobs
- [ ] DLQ replay mechanism tested end-to-end

**Performance**
- [ ] Concurrency tuned to downstream service limits
- [ ] Rate limiter configured for external API queues
- [ ] Priority levels assigned and verified under load

**Flows and DAGs**
- [ ] Parent/child dependencies modeled with FlowProducer or Canvas
- [ ] Chord callbacks handle partial group failures gracefully

**Progress and Observability**
- [ ] Long-running jobs call `updateProgress` / `update_state` regularly
- [ ] Progress events forwarded to clients via WebSocket or polling
- [ ] Structured logs include `jobId`, `queue`, `attempt`, `duration`

**Scaling and Operations**
- [ ] Workers handle `SIGTERM` with graceful drain (no mid-job kills)
- [ ] KEDA or equivalent scales workers on queue depth metric
- [ ] Admin dashboard deployed (Bull Board or Flower) with authentication
- [ ] Prometheus metrics scraped; Grafana alerts set for queue depth and failure rate
- [ ] Stalled job detection enabled (`stalledInterval`, `maxStalledCount`)
