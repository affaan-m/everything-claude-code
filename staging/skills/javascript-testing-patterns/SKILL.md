---
name: javascript-testing-patterns
description: Implement comprehensive testing strategies using Jest, Vitest, and Testing Library for unit tests, integration tests, and end-to-end testing with mocking, fixtures, and test-driven development. Use when writing JavaScript/TypeScript tests, setting up test infrastructure, or implementing TDD/BDD workflows.
---

# JavaScript Testing Patterns

Patterns for testing JavaScript/TypeScript applications with Vitest and Testing Library.

## Vitest Setup

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.d.ts", "**/*.config.ts", "**/dist/**"],
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

## Dependency Injection for Testing

Prefer DI over module mocking. Easier to test, easier to reason about.

```typescript
// services/user.service.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    const user = { id: generateId(), ...userData };
    return this.userRepository.create(user);
  }
}

// services/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService, IUserRepository } from "./user.service";

describe("UserService", () => {
  let service: UserService;
  let mockRepository: IUserRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
    };
    service = new UserService(mockRepository);
  });

  describe("getUser", () => {
    it("should return user if found", async () => {
      const mockUser = { id: "1", name: "John", email: "john@example.com" };
      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);

      const user = await service.getUser("1");

      expect(user).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should throw error if user not found", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);
      await expect(service.getUser("999")).rejects.toThrow("User not found");
    });
  });
});
```

## Module Mocking

When DI is not possible (third-party libraries, legacy code):

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./email.service";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "123" }),
    })),
  },
}));

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(() => {
    service = new EmailService();
  });

  it("should send email successfully", async () => {
    await service.sendEmail("test@example.com", "Subject", "<p>Body</p>");

    expect(service["transporter"].sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Subject",
      }),
    );
  });
});
```

## Test Factories with Faker

Consistent, realistic test data. Override only what matters per test.

```typescript
// tests/fixtures/user.fixture.ts
import { faker } from "@faker-js/faker";

export function createUserFixture(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

export function createUsersFixture(count: number): User[] {
  return Array.from({ length: count }, () => createUserFixture());
}

// Usage
const user = createUserFixture({ name: "John Doe" }); // only override what test cares about
const users = createUsersFixture(10);
```

## Hook Testing with renderHook

```typescript
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("should initialize with custom value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("should increment count", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("should reset to initial value", () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(12);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

## Integration Test Setup

### API Tests with Supertest

```typescript
import request from "supertest";
import { app } from "../../src/app";
import { pool } from "../../src/config/database";

describe("User API Integration Tests", () => {
  beforeAll(async () => {
    await pool.query("CREATE TABLE IF NOT EXISTS users (...)");
  });

  afterAll(async () => {
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE users CASCADE");
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ name: "John", email: "john@example.com", password: "pass123" })
        .expect(201);

      expect(response.body).toMatchObject({ name: "John", email: "john@example.com" });
      expect(response.body).toHaveProperty("id");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 409 if email already exists", async () => {
      const userData = { name: "John", email: "john@example.com", password: "pass123" };
      await request(app).post("/api/users").send(userData);

      const response = await request(app).post("/api/users").send(userData).expect(409);
      expect(response.body.error).toContain("already exists");
    });
  });

  describe("Authentication", () => {
    it("should require authentication for protected routes", async () => {
      await request(app).get("/api/users/me").expect(401);
    });

    it("should allow access with valid token", async () => {
      await request(app).post("/api/users").send({
        name: "John", email: "john@example.com", password: "pass123",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "john@example.com", password: "pass123",
      });

      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(response.body.email).toBe("john@example.com");
    });
  });
});
```

### Database Tests

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { UserRepository } from "../../src/repositories/user.repository";

describe("UserRepository Integration Tests", () => {
  let pool: Pool;
  let repository: UserRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    repository = new UserRepository(pool);
    await pool.query(`CREATE TABLE IF NOT EXISTS users (...)`);
  });

  afterAll(async () => {
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE users CASCADE");
  });

  it("should create and find user by email", async () => {
    await repository.create({
      name: "John Doe", email: "john@example.com", password: "hashed",
    });

    const user = await repository.findByEmail("john@example.com");
    expect(user).toBeTruthy();
    expect(user?.name).toBe("John Doe");
  });

  it("should return null if user not found", async () => {
    const user = await repository.findByEmail("nonexistent@example.com");
    expect(user).toBeNull();
  });
});
```

## Testing Timers

```typescript
import { vi } from "vitest";

it("should call function after delay", () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  expect(callback).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```
