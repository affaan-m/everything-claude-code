---
name: mongodb-patterns
description: MongoDB patterns for schema design, CRUD operations, indexing, aggregation pipelines, transactions, and Mongoose ODM with TypeScript and Python examples.
---

# MongoDB Development Patterns

Production-grade MongoDB patterns for document database design, querying, and optimization.

## When to Activate

- Designing MongoDB document schemas (embedding vs referencing)
- Writing CRUD operations with the MongoDB driver or Mongoose
- Creating indexes for query optimization
- Building aggregation pipelines
- Implementing transactions across multiple documents
- Setting up connection pooling and replica sets
- Troubleshooting slow MongoDB queries

## Core Principles

1. **Design for access patterns** — schema follows queries, not the other way around
2. **Embed when possible** — co-locate data that's read together to avoid joins
3. **Reference when necessary** — unbounded arrays or independent entities should be separate
4. **Index what you query** — every query pattern needs a supporting index
5. **Avoid unbounded arrays** — arrays that grow without limit cause document migration and poor performance

## Schema Design

### Embedding vs Referencing

```
Embed when:                          Reference when:
- Data is read together              - Data is shared across entities
- 1:1 or 1:few relationship          - 1:many (unbounded) relationship
- Data changes at same rate           - Data changes independently
- Sub-document < 16MB limit           - Sub-document is large or growing

Example: Embed addresses in User      Example: Reference orders from User
```

### TypeScript Schema Examples

```typescript
import { ObjectId } from "mongodb";

// Embedded pattern — address belongs to user
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  address: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Reference pattern — orders reference user
interface Order {
  _id: ObjectId;
  userId: ObjectId;        // Reference to User
  items: OrderItem[];      // Embedded (bounded)
  status: "pending" | "confirmed" | "shipped" | "delivered";
  total: number;
  createdAt: Date;
}

interface OrderItem {
  productId: ObjectId;
  name: string;            // Denormalized for read performance
  price: number;
  quantity: number;
}
```

### JSON Schema Validation

```typescript
await db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
        name: { bsonType: "string", minLength: 1, maxLength: 100 },
        role: { enum: ["admin", "editor", "viewer"] },
        createdAt: { bsonType: "date" },
      },
    },
  },
});
```

## CRUD Operations

### TypeScript (Native Driver)

```typescript
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("myapp");
const users = db.collection<User>("users");

// Create
const result = await users.insertOne({
  email: "alice@example.com",
  name: "Alice",
  address: { street: "123 Main St", city: "NYC", country: "US", zip: "10001" },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Read
const user = await users.findOne({ _id: new ObjectId(userId) });
const activeUsers = await users
  .find({ role: "editor" })
  .sort({ createdAt: -1 })
  .limit(20)
  .toArray();

// Update — atomic operators
await users.updateOne(
  { _id: new ObjectId(userId) },
  {
    $set: { name: "Alice Smith", updatedAt: new Date() },
    $inc: { loginCount: 1 },
    $push: { tags: "verified" },
  },
);

// Upsert
await users.updateOne(
  { email: "bob@example.com" },
  { $set: { name: "Bob", updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true },
);

// Delete
await users.deleteOne({ _id: new ObjectId(userId) });

// Bulk operations
await users.bulkWrite([
  { updateOne: { filter: { _id: id1 }, update: { $set: { role: "admin" } } } },
  { updateOne: { filter: { _id: id2 }, update: { $set: { role: "editor" } } } },
  { deleteOne: { filter: { _id: id3 } } },
]);
```

### Python (PyMongo)

```python
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone

client = MongoClient(os.environ["MONGODB_URI"])
db = client["myapp"]
users = db["users"]

# Create
result = users.insert_one({
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": datetime.now(timezone.utc),
})

# Read
user = users.find_one({"_id": ObjectId(user_id)})
active = list(users.find({"role": "editor"}).sort("created_at", -1).limit(20))

# Update
users.update_one(
    {"_id": ObjectId(user_id)},
    {"$set": {"name": "Alice Smith"}, "$inc": {"login_count": 1}},
)

# Aggregation
pipeline = [
    {"$match": {"status": "confirmed"}},
    {"$group": {"_id": "$userId", "total_spent": {"$sum": "$total"}, "order_count": {"$sum": 1}}},
    {"$sort": {"total_spent": -1}},
    {"$limit": 10},
]
top_customers = list(db["orders"].aggregate(pipeline))
```

## Index Strategies

### Index Types

```javascript
// Single field
db.users.createIndex({ email: 1 }, { unique: true });

// Compound — equality first, then sort, then range (ESR rule)
db.orders.createIndex({ status: 1, createdAt: -1 });

// Text index for search
db.products.createIndex({ name: "text", description: "text" });

// TTL index — auto-delete expired documents
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Partial index — smaller index, only relevant docs
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { deletedAt: { $exists: false } } },
);

// Wildcard index for flexible schemas
db.events.createIndex({ "metadata.$**": 1 });
```

### Analyzing Queries

```javascript
// Check if query uses an index
db.orders.find({ status: "pending" }).sort({ createdAt: -1 }).explain("executionStats");

// Key metrics to check:
// - winningPlan.stage should be "IXSCAN" (not "COLLSCAN")
// - totalDocsExamined should be close to nReturned
// - executionTimeMillis should be low

// List all indexes
db.users.getIndexes();

// Index usage statistics
db.users.aggregate([{ $indexStats: {} }]);
```

## Aggregation Pipeline

### Common Patterns

```typescript
// Revenue report with facets
const report = await orders.aggregate([
  { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
  {
    $facet: {
      byStatus: [
        { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ],
      byDay: [
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ],
      topProducts: [
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ],
    },
  },
]).toArray();

// Lookup (join) — use sparingly, prefer embedding
const ordersWithUsers = await orders.aggregate([
  { $match: { status: "pending" } },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  { $project: { total: 1, "user.name": 1, "user.email": 1, createdAt: 1 } },
]).toArray();
```

## Transactions

```typescript
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    // Transfer credits between users — both or neither
    const debit = await users.updateOne(
      { _id: senderId, credits: { $gte: amount } },
      { $inc: { credits: -amount } },
      { session },
    );
    if (debit.modifiedCount === 0) {
      throw new Error("Insufficient credits");
    }

    await users.updateOne(
      { _id: receiverId },
      { $inc: { credits: amount } },
      { session },
    );

    await transactions.insertOne(
      { senderId, receiverId, amount, createdAt: new Date() },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```

## Mongoose ODM Patterns

```typescript
import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, maxlength: 100 },
    role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

// Middleware — hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await argon2.hash(this.password);
  next();
});

// Instance method
userSchema.methods.verifyPassword = async function (plain: string): Promise<boolean> {
  return argon2.verify(this.password, plain);
};

// Static method
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual
userSchema.virtual("displayName").get(function () {
  return this.name || this.email.split("@")[0];
});

const User = model("User", userSchema);

// Populate (reference resolution)
const order = await Order.findById(orderId).populate("userId", "name email");
```

## Connection Management

```typescript
const client = new MongoClient(process.env.MONGODB_URI!, {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true,
  readPreference: "secondaryPreferred",
  w: "majority",
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await client.close();
  process.exit(0);
});
```

## MongoDB Checklist

Before deploying to production:

- [ ] Every query pattern has a supporting index (`explain()` shows IXSCAN)
- [ ] Compound indexes follow ESR rule (Equality, Sort, Range)
- [ ] No unbounded array growth in embedded documents
- [ ] Schema validation configured for critical collections
- [ ] TTL indexes on session/token collections for auto-cleanup
- [ ] Connection pool sized for workload (`maxPoolSize`)
- [ ] Read preference set appropriately for read-heavy workloads
- [ ] Write concern `majority` for data durability
- [ ] Transactions used for multi-document atomic operations
- [ ] Bulk operations used for batch inserts/updates
- [ ] Sensitive fields excluded from default queries (`select: false`)
- [ ] Graceful shutdown closes database connections
