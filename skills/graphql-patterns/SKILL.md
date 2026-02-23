---
name: graphql-patterns
description: GraphQL API design patterns — schema design, resolvers, DataLoader, pagination, subscriptions, authentication, error handling, and performance optimization with TypeScript examples.
---

# GraphQL Development Patterns

Production-grade GraphQL API patterns for type-safe, performant, and secure APIs.

## When to Activate

- Designing GraphQL schemas (types, queries, mutations, subscriptions)
- Implementing resolvers with DataLoader for N+1 prevention
- Adding authentication and authorization to GraphQL APIs
- Building pagination, filtering, and sorting
- Setting up error handling and validation
- Optimizing query performance (complexity, depth limiting)
- Writing tests for GraphQL endpoints

## Core Principles

1. **Schema-first design** — define your API contract in SDL before implementing resolvers
2. **Prevent N+1** — use DataLoader for every database/service call in resolvers
3. **Explicit nullability** — mark fields non-null (`!`) only when guaranteed
4. **Thin resolvers** — resolvers call services, they don't contain business logic
5. **Cursor pagination** — use Relay-style connections for all list fields

## Schema Design

### Type Definitions

```graphql
type Query {
  user(id: ID!): User
  users(first: Int = 20, after: String, filter: UserFilter): UserConnection!
  viewer: User!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

type Subscription {
  orderStatusChanged(orderId: ID!): Order!
}

type User {
  id: ID!
  email: String!
  name: String!
  role: Role!
  orders(first: Int = 10, after: String): OrderConnection!
  createdAt: DateTime!
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

input CreateUserInput {
  email: String!
  name: String!
  role: Role = VIEWER
}

# Mutation payloads — always include userErrors
type CreateUserPayload {
  user: User
  userErrors: [UserError!]!
}

type UserError {
  field: [String!]
  message: String!
  code: ErrorCode!
}

enum ErrorCode {
  INVALID_INPUT
  NOT_FOUND
  UNAUTHORIZED
  CONFLICT
}
```

### Relay Connection Pattern

```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

input UserFilter {
  role: Role
  search: String
  createdAfter: DateTime
}
```

## Resolver Patterns

### DataLoader for N+1 Prevention

```typescript
import DataLoader from "dataloader";

// Create loaders per request (in context factory)
function createLoaders(db: Database) {
  return {
    userLoader: new DataLoader<string, User | null>(async (ids) => {
      const users = await db.users.findMany({ where: { id: { in: [...ids] } } });
      const userMap = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => userMap.get(id) ?? null);
    }),

    ordersByUserLoader: new DataLoader<string, Order[]>(async (userIds) => {
      const orders = await db.orders.findMany({
        where: { userId: { in: [...userIds] } },
      });
      const grouped = new Map<string, Order[]>();
      for (const order of orders) {
        const list = grouped.get(order.userId) ?? [];
        list.push(order);
        grouped.set(order.userId, list);
      }
      return userIds.map((id) => grouped.get(id) ?? []);
    }),
  };
}

type Context = {
  loaders: ReturnType<typeof createLoaders>;
  currentUser: User | null;
  db: Database;
};
```

### Resolver Implementation

```typescript
const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }, ctx: Context) => {
      return ctx.loaders.userLoader.load(id);
    },

    users: async (_: unknown, args: ConnectionArgs & { filter?: UserFilter }, ctx: Context) => {
      return paginateConnection(ctx.db.users, args, args.filter);
    },

    viewer: (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.currentUser) throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
      return ctx.currentUser;
    },
  },

  User: {
    orders: (parent: User, args: ConnectionArgs, ctx: Context) => {
      return ctx.loaders.ordersByUserLoader.load(parent.id);
    },
  },

  Mutation: {
    createUser: async (_: unknown, { input }: { input: CreateUserInput }, ctx: Context) => {
      const errors = validateCreateUser(input);
      if (errors.length > 0) return { user: null, userErrors: errors };

      try {
        const user = await ctx.db.users.create({ data: input });
        return { user, userErrors: [] };
      } catch (err) {
        if (isUniqueViolation(err)) {
          return {
            user: null,
            userErrors: [{ field: ["email"], message: "Email already taken", code: "CONFLICT" }],
          };
        }
        throw err;
      }
    },
  },
};
```

### Cursor Pagination Helper

```typescript
interface ConnectionArgs {
  first?: number;
  after?: string;
}

async function paginateConnection<T extends { id: string }>(
  model: PrismaModel<T>,
  { first = 20, after }: ConnectionArgs,
  filter?: Record<string, unknown>,
): Promise<Connection<T>> {
  const take = Math.min(first, 100) + 1;
  const where = { ...filter, ...(after ? { id: { gt: decodeCursor(after) } } : {}) };

  const items = await model.findMany({ where, take, orderBy: { id: "asc" } });
  const hasNextPage = items.length > first;
  const nodes = hasNextPage ? items.slice(0, -1) : items;

  return {
    edges: nodes.map((node) => ({ node, cursor: encodeCursor(node.id) })),
    pageInfo: {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: nodes[0] ? encodeCursor(nodes[0].id) : null,
      endCursor: nodes.at(-1) ? encodeCursor(nodes.at(-1)!.id) : null,
    },
    totalCount: await model.count({ where: filter }),
  };
}

function encodeCursor(id: string): string {
  return Buffer.from(id).toString("base64url");
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64url").toString();
}
```

## Subscriptions

```typescript
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    orderStatusChanged: {
      subscribe: (_: unknown, { orderId }: { orderId: string }, ctx: Context) => {
        if (!ctx.currentUser) throw new GraphQLError("Not authenticated");
        return pubsub.asyncIterableIterator(`ORDER_STATUS_${orderId}`);
      },
    },
  },

  Mutation: {
    updateOrderStatus: async (_: unknown, { id, status }: { id: string; status: string }, ctx: Context) => {
      const order = await ctx.db.orders.update({ where: { id }, data: { status } });
      pubsub.publish(`ORDER_STATUS_${id}`, { orderStatusChanged: order });
      return { order, userErrors: [] };
    },
  },
};
```

## Authentication & Authorization

### Context-Based Auth

```typescript
import { GraphQLError } from "graphql";

// Context factory — extract user from token
async function createContext({ req }: { req: Request }): Promise<Context> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  let currentUser: User | null = null;

  if (token) {
    try {
      const payload = await verifyToken(token);
      currentUser = await db.users.findUnique({ where: { id: payload.sub } });
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }

  return { currentUser, loaders: createLoaders(db), db };
}

// Auth helpers for resolvers
function requireAuth(ctx: Context): User {
  if (!ctx.currentUser) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.currentUser;
}

function requireRole(ctx: Context, ...roles: Role[]): User {
  const user = requireAuth(ctx);
  if (!roles.includes(user.role)) {
    throw new GraphQLError("Insufficient permissions", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}
```

### Directive-Based Auth

```graphql
directive @auth(requires: Role = VIEWER) on FIELD_DEFINITION

type Query {
  users: [User!]! @auth(requires: ADMIN)
  viewer: User! @auth
}
```

## Error Handling

### Structured Errors

```typescript
import { GraphQLError, GraphQLFormattedError } from "graphql";

function createError(message: string, code: string, field?: string[]) {
  return new GraphQLError(message, {
    extensions: { code, field },
  });
}

// Error formatter — strip internal details in production
function formatError(error: GraphQLFormattedError): GraphQLFormattedError {
  if (process.env.NODE_ENV === "production") {
    const code = (error.extensions as Record<string, unknown>)?.code;
    if (!code || code === "INTERNAL_SERVER_ERROR") {
      return { message: "An unexpected error occurred", extensions: { code: "INTERNAL_SERVER_ERROR" } };
    }
  }
  return error;
}
```

## Performance

### Query Complexity and Depth Limiting

```typescript
import { createComplexityLimitRule } from "graphql-validation-complexity";
import depthLimit from "graphql-depth-limit";

const complexityLimit = createComplexityLimitRule(1000, {
  scalarCost: 1,
  objectCost: 2,
  listFactor: 10,
  onCost: (cost: number) => {
    if (cost > 800) console.warn(`High query complexity: ${cost}`);
  },
});

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(10), complexityLimit],
  persistedQueries: { ttl: 900 },
  introspection: process.env.NODE_ENV !== "production",
});
```

## Testing

```typescript
import { createTestClient } from "apollo-server-testing";

const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) { id email name role }
  }
`;

describe("User queries", () => {
  it("returns user by id", async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: GET_USER, variables: { id: "1" } });

    expect(res.errors).toBeUndefined();
    expect(res.data?.user).toMatchObject({ id: "1", email: "alice@test.com" });
  });

  it("requires authentication for viewer", async () => {
    const { query } = createTestClient(server);
    const res = await query({ query: `{ viewer { id } }` });

    expect(res.errors?.[0].extensions?.code).toBe("UNAUTHENTICATED");
  });
});

const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user { id email }
      userErrors { field message code }
    }
  }
`;

describe("User mutations", () => {
  it("creates a user", async () => {
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_USER,
      variables: { input: { email: "new@test.com", name: "New" } },
    });

    expect(res.data?.createUser.userErrors).toHaveLength(0);
    expect(res.data?.createUser.user.email).toBe("new@test.com");
  });

  it("returns error for duplicate email", async () => {
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_USER,
      variables: { input: { email: "existing@test.com", name: "Dup" } },
    });

    expect(res.data?.createUser.userErrors[0].code).toBe("CONFLICT");
  });
});
```

## GraphQL Checklist

Before shipping a GraphQL API:

- [ ] DataLoader used for all resolver-level database/service calls (N+1 prevention)
- [ ] Cursor-based pagination on all list fields (Relay connection spec)
- [ ] Mutations return payload types with `userErrors` array
- [ ] Authentication checked in context factory or resolver guards
- [ ] Field-level authorization for sensitive data
- [ ] Query depth limit configured (<= 10)
- [ ] Query complexity limit configured
- [ ] Introspection disabled in production
- [ ] Error formatter strips internal details in production
- [ ] Input validation on all mutation inputs
- [ ] Subscriptions authenticate on connection
- [ ] Persisted queries enabled for known clients
- [ ] Schema documented with descriptions on types and fields
