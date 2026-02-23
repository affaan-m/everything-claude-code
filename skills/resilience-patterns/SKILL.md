---
name: resilience-patterns
description: Error handling and resilience patterns for distributed systems — circuit breaker, retry with backoff, bulkhead, timeout, fallback, dead letter queues, and graceful degradation across TypeScript, Python, and Go.
---

# Resilience Patterns

Build fault-tolerant systems that degrade gracefully under failure.

## When to Activate

- Calling external APIs or third-party services
- Designing microservice communication (HTTP, gRPC, message queues)
- Implementing retry logic for transient failures
- Adding circuit breakers to prevent cascade failures
- Handling partial system outages gracefully
- Building frontend error boundaries and offline support
- Reviewing error handling for production readiness

## Core Principles

1. **Assume everything fails** — network calls, databases, file systems, and even local code
2. **Fail fast, recover faster** — detect failures quickly, don't hold resources waiting
3. **Degrade gracefully** — serve stale data or reduced functionality rather than an error page
4. **Make failures visible** — log, alert, and track every failure for observability
5. **Idempotency first** — retryable operations must be safe to repeat

## Retry with Exponential Backoff

### TypeScript Implementation

```typescript
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;         // milliseconds
  maxDelay: number;          // cap the backoff
  jitter: boolean;           // add randomness to prevent thundering herd
  retryOn?: (error: Error) => boolean;  // which errors to retry
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, baseDelay: 1000, maxDelay: 30000, jitter: true }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-retryable errors
      if (options.retryOn && !options.retryOn(lastError)) {
        throw lastError;
      }

      if (attempt === options.maxRetries) break;

      // Exponential backoff: 1s, 2s, 4s, 8s...
      let delay = Math.min(
        options.baseDelay * Math.pow(2, attempt),
        options.maxDelay
      );

      // Add jitter (±50%) to prevent thundering herd
      if (options.jitter) {
        delay = delay * (0.5 + Math.random());
      }

      console.warn(
        `Retry ${attempt + 1}/${options.maxRetries} after ${Math.round(delay)}ms: ${lastError.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage
const data = await withRetry(
  () => fetch("https://api.example.com/data").then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    jitter: true,
    retryOn: (err) => {
      // Only retry 5xx and network errors, not 4xx
      const status = err.message.match(/HTTP (\d+)/)?.[1];
      return !status || Number(status) >= 500;
    },
  }
);
```

### Python Implementation

```python
import asyncio
import random
import logging
from functools import wraps
from typing import TypeVar, Callable, Awaitable

T = TypeVar("T")
logger = logging.getLogger(__name__)

def with_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    jitter: bool = True,
    retry_on: Callable[[Exception], bool] | None = None,
):
    def decorator(fn: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @wraps(fn)
        async def wrapper(*args, **kwargs) -> T:
            last_error: Exception | None = None

            for attempt in range(max_retries + 1):
                try:
                    return await fn(*args, **kwargs)
                except Exception as e:
                    last_error = e

                    if retry_on and not retry_on(e):
                        raise

                    if attempt == max_retries:
                        break

                    delay = min(base_delay * (2 ** attempt), max_delay)
                    if jitter:
                        delay *= 0.5 + random.random()

                    logger.warning(
                        f"Retry {attempt + 1}/{max_retries} after {delay:.1f}s: {e}"
                    )
                    await asyncio.sleep(delay)

            raise last_error  # type: ignore[misc]

        return wrapper
    return decorator

# Usage (pip install httpx)
import httpx

@with_retry(max_retries=3, retry_on=lambda e: isinstance(e, (ConnectionError, TimeoutError)))
async def fetch_user(user_id: str) -> dict:
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(f"https://api.example.com/users/{user_id}")
        resp.raise_for_status()
        return resp.json()
```

## Circuit Breaker

Prevents repeated calls to a failing service, allowing it time to recover.

### States

```
CLOSED  →  (failures exceed threshold)  →  OPEN
OPEN    →  (timeout expires)            →  HALF-OPEN
HALF-OPEN → (probe succeeds)           →  CLOSED
HALF-OPEN → (probe fails)              →  OPEN
```

### TypeScript Implementation

```typescript
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private readonly options: {
      failureThreshold: number;    // failures before opening
      resetTimeout: number;         // ms before trying half-open
      halfOpenMax: number;          // successful probes to close
    } = { failureThreshold: 5, resetTimeout: 30000, halfOpenMax: 3 }
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        if (fallback) return fallback();
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.halfOpenMax) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState() {
    return this.state;
  }
}

// Usage
const paymentCircuit = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 60000,
  halfOpenMax: 2,
});

const result = await paymentCircuit.execute(
  () => paymentService.charge(amount),
  () => ({ status: "queued", message: "Payment will be processed shortly" })
);
```

## Timeout Pattern

Never wait indefinitely for any external call.

```typescript
async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  label: string = "Operation"
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Usage — pass signal to fetch for proper cancellation
const user = await withTimeout(
  (signal) => fetch("/api/users/123", { signal }).then((r) => r.json()),
  5000,
  "Fetch user"
);
```

## Bulkhead Pattern

Isolate failures to prevent one slow service from consuming all resources.

```typescript
class Bulkhead {
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(
    private readonly maxConcurrent: number,
    private readonly maxQueue: number = 100
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueue) {
        throw new Error("Bulkhead queue full — rejecting request");
      }
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// Isolate services with separate bulkheads
const paymentBulkhead = new Bulkhead(10);  // max 10 concurrent
const emailBulkhead = new Bulkhead(5);     // max 5 concurrent
```

## Fallback Strategies

### Stale Data (Cache Fallback)

```typescript
async function fetchWithCacheFallback<T>(
  key: string,
  fetcher: () => Promise<T>,
  cache: Map<string, { data: T; timestamp: number }>,
  ttl: number = 60000
): Promise<{ data: T; stale: boolean }> {
  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return { data, stale: false };
  } catch {
    const cached = cache.get(key);
    if (cached) {
      console.warn(`Serving stale data for ${key} (age: ${Date.now() - cached.timestamp}ms)`);
      return { data: cached.data, stale: true };
    }
    throw new Error(`No cached data available for ${key}`);
  }
}
```

### Default Value Fallback

```typescript
async function fetchConfig(): Promise<AppConfig> {
  try {
    const resp = await fetch("/api/config");
    return await resp.json();
  } catch {
    // Return safe defaults when config service is unavailable
    return {
      featureFlags: {},
      rateLimit: 100,
      maintenanceMode: false,     // default to operational
    };
  }
}
```

## Go Resilience Patterns

### Retry with Context

```go
func WithRetry(ctx context.Context, maxRetries int, fn func() error) error {
    var lastErr error

    for attempt := 0; attempt <= maxRetries; attempt++ {
        if err := ctx.Err(); err != nil {
            return fmt.Errorf("context cancelled: %w", err)
        }

        if err := fn(); err != nil {
            lastErr = err

            if attempt == maxRetries {
                break
            }

            delay := time.Duration(1<<attempt) * time.Second
            jitter := time.Duration(rand.Int63n(int64(delay / 2)))
            timer := time.NewTimer(delay + jitter)

            select {
            case <-timer.C:
                continue
            case <-ctx.Done():
                timer.Stop()
                return ctx.Err()
            }
        } else {
            return nil
        }
    }

    return fmt.Errorf("after %d retries: %w", maxRetries, lastErr)
}
```

### Circuit Breaker (Go)

Use [sony/gobreaker](https://github.com/sony/gobreaker) for production Go circuit breakers with configurable thresholds, half-open probes, and state change callbacks.

## Frontend Resilience

### React Error Boundary

```tsx
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { this.props.onError?.(error, info); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// Usage — isolate failures to specific components
function App() {
  return (
    <div>
      <ErrorBoundary fallback={<p>Dashboard unavailable</p>}>
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>Chat offline</p>}>
        <ChatWidget />
      </ErrorBoundary>
    </div>
  );
}
```

## Dead Letter Queue Pattern

For async message processing — capture failed messages for later inspection.

```typescript
interface DeadLetterEntry<T> {
  originalMessage: T;
  error: string;
  failedAt: Date;
  retryCount: number;
  processorName: string;
}

class DeadLetterQueue<T> {
  private entries: DeadLetterEntry<T>[] = [];

  add(message: T, error: Error, processorName: string, retryCount: number) {
    this.entries.push({ originalMessage: message, error: error.message, failedAt: new Date(), retryCount, processorName });
    // In production: persist to database, S3, or a dedicated DLQ service
  }

  getEntries() { return [...this.entries]; }
  reprocess(handler: (msg: T) => Promise<void>) {
    return Promise.allSettled(this.entries.splice(0, 10).map((e) => handler(e.originalMessage)));
  }
}
```

## Resilience Checklist

Before deploying to production:

- [ ] All external HTTP calls have timeouts configured
- [ ] Retry logic uses exponential backoff with jitter
- [ ] Retried operations are idempotent (safe to repeat)
- [ ] Circuit breakers protect against cascade failures
- [ ] Fallback strategies defined for critical paths (stale cache, defaults)
- [ ] Bulkheads isolate resource consumption per service
- [ ] Error boundaries in frontend prevent full-page crashes
- [ ] Dead letter queues capture permanently failed messages
- [ ] Health checks expose circuit breaker states
- [ ] Alerting configured for circuit breaker state changes
- [ ] Load shedding configured for extreme traffic spikes
