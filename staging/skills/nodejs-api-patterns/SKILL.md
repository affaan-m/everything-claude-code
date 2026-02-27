---
name: nodejs-api-patterns
description: "Use when building Node.js/Express REST APIs, designing endpoint structure, implementing middleware patterns, or handling errors in TypeScript backends."
---

# Node.js API Patterns

Express + TypeScript patterns for REST APIs: architecture, validation, error handling, database integration.

## 1. API Design

### REST Conventions

| Method   | Route                    | Purpose              | Idempotent |
|----------|--------------------------|----------------------|------------|
| `GET`    | `/api/users`             | List (paginated)     | Yes        |
| `POST`   | `/api/users`             | Create               | No         |
| `GET`    | `/api/users/:id`         | Read one             | Yes        |
| `PUT`    | `/api/users/:id`         | Full replace         | Yes        |
| `PATCH`  | `/api/users/:id`         | Partial update       | Yes        |
| `DELETE` | `/api/users/:id`         | Delete               | Yes        |
| `GET`    | `/api/users/:id/orders`  | Nested sub-resource  | Yes        |

Plural nouns for collections, HTTP verbs for actions, never `/api/createUser`.

### Response Envelope

```typescript
import { Response } from "express";

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({ status: "success", data });
  }
  static error(res: Response, message: string, statusCode = 500, errors?: unknown[]) {
    return res.status(statusCode).json({ status: "error", message, ...(errors && { errors }) });
  }
  static paginated<T>(res: Response, data: T[], page: number, limit: number, total: number) {
    return res.json({
      status: "success", data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
}
```

### Versioning

Prefer URL prefix -- simplest to route and document: `/api/v1/users`, `/api/v2/users`.

---

## 2. Architecture

### Layered Pattern (Controller / Service / Repository)

```
src/
  controllers/     # Parse HTTP, call service, send response
  services/        # Business logic, throws domain errors
  repositories/    # SQL queries, data access only
  middleware/      # Validation, auth, logging
  utils/           # Error classes, helpers
  config/          # DB pool, env, DI container
```

**Controller** -- thin HTTP adapter:

```typescript
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private svc: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.svc.create(req.body);
      res.status(201).json({ status: "success", data: user });
    } catch (error) { next(error); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.svc.getById(req.params.id);
      res.json({ status: "success", data: user });
    } catch (error) { next(error); }
  };
}
```

**Service** -- business rules, never touches `req`/`res`:

```typescript
import { UserRepository } from "../repositories/user.repository";
import { NotFoundError, ValidationError } from "../utils/errors";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private repo: UserRepository) {}

  async create(data: { name: string; email: string; password: string }) {
    if (await this.repo.findByEmail(data.email)) throw new ValidationError("Email taken");
    const hashed = await bcrypt.hash(data.password, 10);
    const { password, ...safe } = await this.repo.create({ ...data, password: hashed });
    return safe;
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError("User", id);
    const { password, ...safe } = user;
    return safe;
  }
}
```

**Repository** -- parameterized queries only:

```typescript
import { Pool } from "pg";

export class UserRepository {
  constructor(private db: Pool) {}

  async create(data: { name: string; email: string; password: string }) {
    const { rows } = await this.db.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.email, data.password],
    );
    return rows[0];
  }

  async findById(id: string) {
    const { rows } = await this.db.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ?? null;
  }

  async findByEmail(email: string) {
    const { rows } = await this.db.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] ?? null;
  }
}
```

### DI Container

```typescript
class Container {
  private factories = new Map<string, () => unknown>();
  singleton<T>(key: string, factory: () => T): void {
    let instance: T;
    this.factories.set(key, () => (instance ??= factory()));
  }
  resolve<T>(key: string): T {
    const f = this.factories.get(key);
    if (!f) throw new Error(`No binding for "${key}"`);
    return f() as T;
  }
}
export const container = new Container();
container.singleton("db", () => pool);
container.singleton("userRepo", () => new UserRepository(container.resolve("db")));
container.singleton("userSvc", () => new UserService(container.resolve("userRepo")));
container.singleton("userCtrl", () => new UserController(container.resolve("userSvc")));
```

### Express Bootstrap

```typescript
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
const app = express();
app.use(helmet());                                                  // security headers
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") })); // CORS
app.use(compression());                                             // gzip
app.use(express.json({ limit: "10mb" }));                           // body parsing
app.use(requestLogger);                                             // logging
app.use("/api/v1/users", userRoutes);                               // routes
app.use(errorHandler);                                              // MUST be last
```

---

## 3. Validation & Error Handling

### Zod Validation Middleware

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = error.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
        next(new ValidationError("Validation failed", fields));
      } else { next(error); }
    }
  };

// Route usage
import { z } from "zod";

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

router.post("/users", validate(createUserSchema), userCtrl.create);
```

### Error Class Hierarchy

```typescript
export class AppError extends Error {
  constructor(
    message: string, public code: string,
    public statusCode = 500, public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ValidationError extends AppError {
  constructor(message: string, public fields?: { field: string; message: string }[]) {
    super(message, "VALIDATION_ERROR", 400, fields ? { fields } : undefined);
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) { super(`${resource} not found`, "NOT_FOUND", 404, { resource, id }); }
}
export class ConflictError extends AppError {
  constructor(message: string) { super(message, "CONFLICT", 409); }
}
export class ExternalServiceError extends AppError {
  constructor(message: string, public service: string) { super(message, "EXTERNAL_SERVICE_ERROR", 502, { service }); }
}
```

### Global Error Handler & Async Wrapper

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error", code: err.code, message: err.message,
      ...(err instanceof ValidationError && err.fields && { errors: err.fields }),
    });
  }
  // Unexpected: log details, return generic message in production
  logger.error({ error: err.message, stack: err.stack, url: req.url });
  res.status(500).json({ status: "error",
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

// Wraps async handlers so thrown errors reach errorHandler
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);
```

### Result Type

For service-layer operations where throwing is undesirable (config parsing, multi-step validation):

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

function parseConfig(raw: string): Result<AppConfig, string> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.port) return Err("Missing port");
    return Ok(parsed as AppConfig);
  } catch { return Err("Invalid JSON"); }
}
```

### Circuit Breaker

Prevent cascading failures when calling external services:

```typescript
type CircuitState = "closed" | "open" | "half-open";

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;

  constructor(
    private failureThreshold = 5,
    private timeoutMs = 60_000,
    private successThreshold = 2,
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = "half-open";
        this.successCount = 0;
        this.failureCount = 0;
      } else {
        throw new ExternalServiceError("Circuit breaker is OPEN", "upstream");
      }
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === "half-open" && ++this.successCount >= this.successThreshold) {
      this.state = "closed";
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) this.state = "open";
  }
}

// Usage
const paymentBreaker = new CircuitBreaker(3, 30_000);
const charge = (amt: number) => paymentBreaker.call(() => paymentApi.charge(amt));
```

---

## 4. Database Integration

### PostgreSQL Connection Pool

```typescript
import { Pool, PoolClient } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 2_000,
});
pool.on("error", (err) => { logger.error({ err }, "Unexpected pool error"); process.exit(1); });
export const closeDatabase = () => pool.end();
```

### Transaction Helper

```typescript
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

// Usage: multi-table write in one atomic operation
const orderId = await withTransaction(async (tx) => {
  const { rows } = await tx.query("INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id", [userId, total]);
  await tx.query("UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2", [qty, productId]);
  return rows[0].id;
});
```

---

## 5. Anti-Patterns

| Anti-Pattern | Why It Hurts | Fix |
|---|---|---|
| Business logic in controllers | Untestable, duplicated | Service layer |
| `catch (e) {}` empty catch | Silently hides bugs | Log or rethrow |
| `any` on request bodies | No runtime safety | Zod + `validate` middleware |
| String-concat SQL | Injection | Parameterized queries (`$1`) |
| One mega error handler | Can't distinguish types | `AppError` hierarchy |
| `new Pool()` per request | Connection exhaustion | Single pool via DI |
| Log-and-rethrow same error | Duplicate log entries | Log only at boundary |
| Using `req.body` unvalidated | Shape crashes | Always validate first |
