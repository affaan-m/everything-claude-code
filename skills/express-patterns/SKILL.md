---
name: express-patterns
description: Express.js patterns for TypeScript APIs — project structure, middleware chains, input validation, authentication, error handling, and testing with supertest.
---

# Express.js Development Patterns

Production-grade Express.js patterns with TypeScript for building scalable, maintainable APIs.

## When to Activate

- Building Express.js REST APIs
- Setting up TypeScript + Express projects
- Designing middleware chains
- Implementing authentication and authorization
- Writing integration tests for Express endpoints

## Project Structure

### Recommended Layout

```
src/
├── index.ts                 # Server entry point
├── app.ts                   # Express app setup
├── config.ts                # Environment config
├── routes/
│   ├── index.ts             # Route aggregator
│   ├── users.ts             # /users routes
│   └── auth.ts              # /auth routes
├── controllers/
│   ├── user.controller.ts   # Request handling
│   └── auth.controller.ts
├── services/
│   ├── user.service.ts      # Business logic
│   └── auth.service.ts
├── middleware/
│   ├── auth.ts              # Authentication
│   ├── validate.ts          # Request validation
│   ├── error-handler.ts     # Global error handler
│   └── rate-limit.ts        # Rate limiting
├── models/
│   └── user.ts              # Data models
├── types/
│   └── express.d.ts         # Type augmentations
└── tests/
    ├── setup.ts
    ├── users.test.ts
    └── auth.test.ts
```

## Application Setup

### Express App with TypeScript

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler";
import { routes } from "./routes";

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api", routes);

// Global error handler (must be last)
app.use(errorHandler);

export { app };
```

### Configuration

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const config = envSchema.parse(process.env);
```

## Middleware Patterns

### Authentication Middleware

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

interface AuthPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
```

### Input Validation with Zod

```typescript
import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten(),
      });
    }

    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    next();
  };
}

// Usage
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    password: z.string().min(8),
  }),
});

router.post("/", validate(createUserSchema), userController.create);
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter for auth endpoints
});
```

## Error Handling

### Custom Error Classes

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, `${resource} with id ${id} not found`, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}
```

### Global Error Handler

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
}
```

## Controller Pattern

### Async Handler Wrapper

```typescript
import { Request, Response, NextFunction } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
```

### Controller Example

```typescript
import { asyncHandler } from "../middleware/async-handler";
import { UserService } from "../services/user.service";
import { NotFoundError } from "../errors";

const userService = new UserService();

export const userController = {
  list: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.list({ page: Number(page), limit: Number(limit) });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    if (!user) throw new NotFoundError("User", req.params.id);
    res.json(user);
  }),

  create: asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  }),
};
```

## Route Registration

```typescript
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { apiLimiter } from "../middleware/rate-limit";
import { userController } from "../controllers/user.controller";
import { createUserSchema } from "../schemas/user";

const router = Router();

router.use(apiLimiter);

router.get("/", authenticate, userController.list);
router.get("/:id", authenticate, userController.getById);
router.post("/", authenticate, authorize("admin"), validate(createUserSchema), userController.create);

export { router as userRouter };
```

## Testing with Supertest

### Test Setup

```typescript
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";
import { config } from "../config";

function authHeader(userId = "1", role = "user") {
  const token = jwt.sign({ userId, role }, config.JWT_SECRET);
  return `Bearer ${token}`;
}

describe("GET /api/users", () => {
  it("returns 401 without auth", async () => {
    await request(app).get("/api/users").expect(401);
  });

  it("returns users list", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader())
      .expect(200);

    expect(res.body).toHaveProperty("items");
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

describe("POST /api/users", () => {
  it("validates input", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader("1", "admin"))
      .send({ email: "not-an-email" })
      .expect(400);

    expect(res.body.error).toBe("Validation failed");
  });

  it("creates a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader("1", "admin"))
      .send({ email: "new@test.com", name: "New User", password: "securepass123" })
      .expect(201);

    expect(res.body.email).toBe("new@test.com");
  });
});
```

## Checklist

- [ ] All async route handlers wrapped with `asyncHandler` or try/catch
- [ ] Global error handler is the last middleware registered
- [ ] Input validation on all mutation endpoints (POST, PUT, PATCH)
- [ ] Authentication middleware on protected routes
- [ ] Rate limiting on public-facing and auth endpoints
- [ ] Environment config validated at startup (fail fast)
- [ ] Helmet enabled for security headers
- [ ] Tests cover auth, validation, and error paths
