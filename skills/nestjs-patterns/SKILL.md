---
name: nestjs-patterns
description: NestJS patterns — modules, dependency injection, controllers, validation, guards, interceptors, exception filters, database integration, testing, and microservices with TypeScript.
---

# NestJS Development Patterns

Production-grade NestJS patterns for scalable, maintainable TypeScript backend applications.

## When to Activate

- Building NestJS APIs (REST, GraphQL, WebSocket)
- Structuring modules, providers, and dependency injection
- Implementing validation with class-validator and pipes
- Adding authentication guards and role-based authorization
- Creating interceptors for logging, caching, and response mapping
- Writing exception filters for consistent error handling
- Integrating databases with TypeORM or Prisma
- Writing unit and e2e tests with NestJS testing utilities
- Setting up microservices (TCP, Redis, gRPC)

## Core Principles

1. **Modular architecture** — each feature is a self-contained module
2. **Dependency injection** — let NestJS manage instances and lifecycle
3. **Thin controllers** — controllers validate and route, services contain logic
4. **Pipes for validation** — always validate input with `ValidationPipe`
5. **Guards for auth** — separate authentication from business logic

## Project Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Bootstrap
├── common/                    # Decorators, filters, guards, interceptors, pipes
├── auth/                      # Auth module (controller, service, guard, DTOs)
├── users/                     # Users module (controller, service, entities, DTOs)
└── config/                    # Configuration
```

## Modules and DI

### Feature Module

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Dynamic Module

```typescript
import { Module, type DynamicModule } from "@nestjs/common";

@Module({})
export class MailModule {
  static forRoot(config: MailConfig): DynamicModule {
    return {
      module: MailModule,
      global: true,
      providers: [
        { provide: "MAIL_CONFIG", useValue: config },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
```

## Controllers and DTOs

### Controller with Validation

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, HttpCode, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll(@Query("page") page: number = 1, @Query("limit") limit: number = 20) {
    return this.usersService.findAll({ page, limit });
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
```

### DTO with Validation

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
```

### Global Validation Pipe

```typescript
// main.ts
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(",") });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## Guards and Authorization

### JWT Auth Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) throw new UnauthorizedException("Missing token");

    try {
      request["user"] = await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
```

### Role-Based Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}

// Usage
@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get("stats")
  @Roles("admin")
  getStats() { /* ... */ }
}
```

## Interceptors

### Logging Interceptor

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        this.logger.log(`${method} ${url} ${res.statusCode} ${Date.now() - start}ms`);
      }),
    );
  }
}
```

## Exception Filters

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let code = "INTERNAL_ERROR";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === "string" ? body : (body as Record<string, unknown>).message as string;
      code = HttpStatus[status] ?? "ERROR";
    } else {
      this.logger.error("Unhandled exception", exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({ error: code, message, statusCode: status });
  }
}
```

## Database Integration (TypeORM)

### Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ type: "enum", enum: Role, default: Role.VIEWER })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Service with Repository

```typescript
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already registered");

    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async findAll({ page = 1, limit = 20 }: { page: number; limit: number }) {
    const [items, total] = await this.usersRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`User ${id} not found`);
  }
}
```

## Testing

### Unit Test

```typescript
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

describe("UsersService", () => {
  let service: UsersService;
  const mockRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it("creates a user", async () => {
    const dto = { email: "test@test.com", name: "Test", password: "pass" };
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue({ id: "1", ...dto });

    const result = await service.create(dto);
    expect(result.email).toBe("test@test.com");
  });

  it("throws on duplicate email", async () => {
    mockRepo.findOne.mockResolvedValue({ id: "1" });
    await expect(service.create({ email: "dup@test.com", name: "Dup", password: "pass" }))
      .rejects.toThrow("Email already registered");
  });
});
```

### E2E Test

```typescript
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Users (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it("POST /users — validates input", async () => {
    await request(app.getHttpServer())
      .post("/users")
      .send({ email: "not-an-email" })
      .expect(400);
  });

  it("POST /users — creates user", async () => {
    const res = await request(app.getHttpServer())
      .post("/users")
      .send({ email: "e2e@test.com", name: "E2E", password: "securepass123" })
      .expect(201);

    expect(res.body.email).toBe("e2e@test.com");
  });
});
```

## Microservices

NestJS supports TCP, Redis, gRPC, MQTT, NATS, and Kafka transports. Use `@MessagePattern` for request/reply and `@EventPattern` for fire-and-forget. Register clients with `ClientsModule.register()`.

## NestJS Checklist

Before deploying to production:

- [ ] Global `ValidationPipe` configured with `whitelist` and `transform`
- [ ] DTOs validate all input fields with `class-validator` decorators
- [ ] `AuthGuard` protects all non-public endpoints
- [ ] `RolesGuard` enforces role-based access where needed
- [ ] Global exception filter returns consistent error format
- [ ] Logging interceptor records request method, URL, status, and duration
- [ ] Services throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`)
- [ ] Database entities use proper indexes and column types
- [ ] Environment config validated at startup with `ConfigModule`
- [ ] Unit tests mock repository/service dependencies
- [ ] E2E tests cover auth, validation, and CRUD flows
- [ ] Circular dependencies resolved with `forwardRef()`
