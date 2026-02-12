---
name: observability-patterns
description: Production observability patterns including structured logging, error tracking, health checks, metrics, and monitoring for Node.js and Next.js applications.
---

# Observability Patterns

Production-grade observability patterns for reliable, debuggable applications.

## Structured Logging

### Pino Configuration

```typescript
// ✅ Production-ready Pino setup
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
      service: 'my-app',
      env: process.env.NODE_ENV,
    }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token'],
    censor: '[REDACTED]',
  },
})

export default logger
```

### Log Levels

```typescript
// ✅ Use appropriate log levels
logger.fatal('Database connection lost — shutting down')  // System unusable
logger.error('Payment processing failed', { orderId, error })  // Action required
logger.warn('Rate limit approaching threshold', { current: 80, max: 100 })  // Attention
logger.info('Order created', { orderId, userId })  // Business events
logger.debug('Cache lookup', { key, hit: true })  // Development detail
logger.trace('Entering function', { fn: 'processOrder' })  // Verbose tracing

// ❌ BAD: Wrong levels
logger.error('User logged in')  // Not an error
logger.info('Database connection failed')  // This is an error
logger.debug('Payment of $10,000 processed')  // Business event, use info
```

### Request ID Propagation

```typescript
// ✅ Correlate logs across request lifecycle
import { randomUUID } from 'crypto'
import { AsyncLocalStorage } from 'async_hooks'

interface RequestContext {
  requestId: string
  userId?: string
  path: string
}

const requestStore = new AsyncLocalStorage<RequestContext>()

// Middleware to set request context (Express)
import type { Request, Response, NextFunction } from 'express'

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID()
  const context: RequestContext = {
    requestId,
    userId: (req as Record<string, any>).user?.id,
    path: req.path,
  }

  requestStore.run(context, () => {
    next()
  })
}

// Child logger with request context
export function getRequestLogger() {
  const context = requestStore.getStore()
  return logger.child({
    requestId: context?.requestId,
    userId: context?.userId,
    path: context?.path,
  })
}

// Usage in any function
async function processOrder(orderId: string) {
  const log = getRequestLogger()
  log.info('Processing order', { orderId })
  // All logs automatically include requestId, userId, path
}
```

### Sensitive Data Redaction

```typescript
// ✅ Redact PII and secrets before logging (top-level keys only)
// For nested data, use Pino's built-in redact option instead
function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'ssn', 'creditCard']
  const sanitized = { ...data }

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'
    }
  }

  return sanitized
}

// ❌ BAD: Logging raw user data
logger.info('User registered', { email, password, creditCard })

// ✅ GOOD: Sanitized logging
logger.info('User registered', { email, userId })
```

## Error Tracking

### Sentry Integration (Next.js)

```typescript
// ✅ sentry.client.config.ts (requires @sentry/nextjs v8+)
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.cookies) {
      event.request.cookies = {}
    }
    return event
  },

  ignoreErrors: [
    'ResizeObserver loop',
    'Network request failed',
    'AbortError',
    /Loading chunk \d+ failed/,
  ],
})
```

### Custom Error Classes

```typescript
// ✅ Structured error hierarchy
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404, true, { resource, id })
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError: Error) {
    super(
      `External service failed: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      true,
      { service, originalMessage: originalError.message }
    )
  }
}
```

### Error Boundary with Reporting

```tsx
// ✅ React Error Boundary with Sentry
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', errorInfo.componentStack)
      Sentry.captureException(error)
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

### Breadcrumb Trail

```typescript
// ✅ Add breadcrumbs for debugging context
import * as Sentry from '@sentry/nextjs'

// Track user navigation
Sentry.addBreadcrumb({
  category: 'navigation',
  message: `Navigated to ${pathname}`,
  level: 'info',
})

// Track API calls
Sentry.addBreadcrumb({
  category: 'api',
  message: `${method} ${url}`,
  data: { statusCode: response.status, duration: elapsed },
  level: response.ok ? 'info' : 'error',
})

// Track user actions
Sentry.addBreadcrumb({
  category: 'user',
  message: 'Clicked checkout button',
  data: { cartItems: cart.length, total: cart.total },
  level: 'info',
})
```

## Health Checks

### Basic Health Endpoint

```typescript
// ✅ /api/health - comprehensive health check
import { NextResponse } from 'next/server'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  timestamp: string
  checks: Record<string, ComponentHealth>
}

interface ComponentHealth {
  status: 'pass' | 'warn' | 'fail'
  responseTime?: number
  message?: string
}

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now()
  try {
    await db.execute('SELECT 1')
    return { status: 'pass', responseTime: Date.now() - start }
  } catch (error) {
    return { status: 'fail', responseTime: Date.now() - start, message: (error as Error).message }
  }
}

async function checkRedis(): Promise<ComponentHealth> {
  const start = Date.now()
  try {
    await redis.ping()
    return { status: 'pass', responseTime: Date.now() - start }
  } catch (error) {
    return { status: 'fail', responseTime: Date.now() - start, message: (error as Error).message }
  }
}

async function checkExternalAPI(): Promise<ComponentHealth> {
  const start = Date.now()
  try {
    const response = await fetch('https://api.example.com/status', {
      signal: AbortSignal.timeout(5000),
    })
    return {
      status: response.ok ? 'pass' : 'warn',
      responseTime: Date.now() - start,
    }
  } catch {
    return { status: 'warn', responseTime: Date.now() - start, message: 'Timeout or unreachable' }
  }
}

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalAPI: await checkExternalAPI(),
  }

  const hasFailure = Object.values(checks).some(c => c.status === 'fail')
  const hasWarning = Object.values(checks).some(c => c.status === 'warn')

  const health: HealthStatus = {
    status: hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
    version: process.env.APP_VERSION || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
  }

  return NextResponse.json(health, {
    status: hasFailure ? 503 : 200,
  })
}
```

### Readiness and Liveness Probes

```typescript
// ✅ app/api/health/live/route.ts — is the process running?
export async function GET() {
  return NextResponse.json({ status: 'alive' })
}
```

```typescript
// ✅ app/api/health/ready/route.ts — can the process accept traffic?
export async function GET() {
  const dbReady = await checkDatabase()
  const cacheReady = await checkRedis()

  if (dbReady.status === 'fail') {
    return NextResponse.json(
      { status: 'not ready', reason: 'Database unavailable' },
      { status: 503 }
    )
  }

  return NextResponse.json({ status: 'ready' })
}
```

### Graceful Shutdown

```typescript
// ✅ Clean shutdown with connection draining
let isShuttingDown = false

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return
  isShuttingDown = true

  logger.info(`Received ${signal}, starting graceful shutdown`)

  // Stop accepting new requests
  server.close()

  // Drain existing connections (with timeout)
  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30_000)

  try {
    await Promise.all([
      db.end(),
      redis.quit(),
      flushMetrics(),
    ])
    clearTimeout(shutdownTimeout)
    logger.info('Graceful shutdown complete')
    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown', error as Error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Health check returns 503 during shutdown
export async function GET() {
  if (isShuttingDown) {
    return NextResponse.json({ status: 'shutting down' }, { status: 503 })
  }
  // ... normal health check
}
```

## Metrics & Monitoring

### OpenTelemetry Basic Setup

```typescript
// ✅ instrumentation.ts (Next.js)
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'my-app',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    }),
    exportIntervalMillis: 60_000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
```

### Custom Metrics

```typescript
// ✅ Application-level metrics
import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('my-app')

// Counter: total requests
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
})

// Histogram: response time
const responseTimeHistogram = meter.createHistogram('http_response_time_ms', {
  description: 'HTTP response time in milliseconds',
})

// UpDownCounter: active connections (synchronous, can increment and decrement)
const activeConnections = meter.createUpDownCounter('active_connections', {
  description: 'Number of active connections',
})

// Usage in Express middleware
import type { Request, Response, NextFunction } from 'express'

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  const path = req.path

  activeConnections.add(1)

  res.on('finish', () => {
    const duration = Date.now() - start
    const labels = { method: req.method, path, status: String(res.statusCode) }

    requestCounter.add(1, labels)
    responseTimeHistogram.record(duration, labels)
    activeConnections.add(-1)
  })

  next()
}
```

### API Latency Middleware

```typescript
// ✅ Next.js middleware for request annotation (measures middleware overhead only)
// Note: For actual API handler latency, use OpenTelemetry spans within route handlers
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  // Add timing header
  response.headers.set('Server-Timing', `total;dur=${Date.now() - start}`)

  // Log slow requests
  const duration = Date.now() - start
  if (duration > 1000) {
    console.warn(JSON.stringify({
      level: 'warn',
      message: 'Slow request detected',
      path: request.nextUrl.pathname,
      method: request.method,
      duration,
    }))
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### Alert Thresholds

```typescript
// ✅ Define alert thresholds for monitoring
const ALERT_THRESHOLDS = {
  // Response time (P95)
  api: {
    warning: 500,   // ms
    critical: 2000,  // ms
  },

  // Error rate
  errorRate: {
    warning: 0.01,   // 1%
    critical: 0.05,  // 5%
  },

  // Resource usage
  memory: {
    warning: 0.80,   // 80%
    critical: 0.95,  // 95%
  },

  // Queue depth
  queue: {
    warning: 100,
    critical: 1000,
  },

  // Health check failures
  healthCheck: {
    warning: 1,       // consecutive failures
    critical: 3,
  },
} as const

// Check thresholds
function evaluateMetric(value: number, thresholds: { warning: number; critical: number }) {
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.warning) return 'warning'
  return 'ok'
}
```

## Anti-Patterns

### What NOT to Do

```typescript
// ❌ BAD: console.log in production
console.log('user data:', userData)

// ❌ BAD: Swallowing errors silently
try {
  await processPayment(order)
} catch (error) {
  // Nothing here — payment failure is invisible
}

// ❌ BAD: Logging sensitive data
logger.info('Login attempt', {
  email: user.email,
  password: user.password,  // NEVER log passwords
  token: session.token,     // NEVER log tokens
})

// ❌ BAD: Unstructured string concatenation
console.log('Order ' + orderId + ' created by ' + userId + ' at ' + Date.now())

// ❌ BAD: Logging everything at the same level
logger.info('Starting server')
logger.info('Database connection failed')
logger.info('User clicked button')
logger.info('Out of memory')

// ❌ BAD: No request correlation
logger.info('Processing order')  // Which request? Which user?
logger.info('Order complete')    // How to connect these?
```

### Correct Alternatives

```typescript
// ✅ GOOD: Structured logger with levels
logger.info('Order created', { orderId, userId })

// ✅ GOOD: Errors tracked and reported
try {
  await processPayment(order)
} catch (error) {
  logger.error('Payment failed', { orderId: order.id, error: (error as Error).message })
  Sentry.captureException(error, { extra: { orderId: order.id } })
  throw error  // Re-throw for caller to handle
}

// ✅ GOOD: Sanitized logging (no password/token, PII hashed if required by GDPR)
logger.info('Login attempt', { userId: user.id, success: true })

// ✅ GOOD: Correlated logs
const log = getRequestLogger()  // Includes requestId, userId
log.info('Processing order', { orderId })
log.info('Order complete', { orderId, duration: elapsed })
```

**Remember**: Observability is not optional for production. You cannot fix what you cannot see. Invest in structured logging, error tracking, and health checks from day one — retrofitting is far more expensive.
