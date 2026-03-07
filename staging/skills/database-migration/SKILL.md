---
name: database-migration
description: "When migrating database schemas, switching ORMs, or deploying schema changes with zero downtime. Covers Sequelize, TypeORM, and Prisma."
---

# Database Migration

## Decision Table

| Scenario | Strategy | Risk |
|----------|----------|------|
| Add nullable column | Single migration, no downtime | Low |
| Add NOT NULL column | Add nullable + backfill + alter | Medium |
| Rename column | Expand-contract (3-phase) | Medium |
| Change column type | Add new + copy + drop old | High |
| Drop column | Deploy code first, then drop | Medium |
| Drop table | Verify zero references, then drop | High |
| Large data backfill | Batched updates with progress | Medium |

## ORM Migration Patterns

### Sequelize

```javascript
// migrations/20240101-add-status-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.STRING,
      defaultValue: "active",
      allowNull: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "status");
  },
};
// Run: npx sequelize-cli db:migrate
// Rollback: npx sequelize-cli db:migrate:undo
```

### TypeORM

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToUsers1704067200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "status",
        type: "varchar",
        default: "'active'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "status");
  }
}
// Run: npm run typeorm migration:run
// Rollback: npm run typeorm migration:revert
```

### Prisma

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
}
// Generate: npx prisma migrate dev --name add_status
// Deploy:   npx prisma migrate deploy
```

## Zero-Downtime: Expand-Contract Pattern

Renaming a column or changing its type without downtime requires 3 phases deployed separately.

### Phase 1: Expand (add new column)

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "full_name", {
      type: Sequelize.STRING,
    });
    await queryInterface.sequelize.query(
      "UPDATE users SET full_name = name",
    );
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "full_name");
  },
};
```

### Phase 2: Deploy code writing to BOTH columns, reading from new column

### Phase 3: Contract (remove old column)

```javascript
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn("users", "name");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "name", {
      type: Sequelize.STRING,
    });
  },
};
```

## Transaction-Wrapped Migrations

Every multi-step migration MUST use transactions to prevent partial application.

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "users",
        "verified",
        { type: Sequelize.BOOLEAN, defaultValue: false },
        { transaction },
      );
      await queryInterface.sequelize.query(
        "UPDATE users SET verified = true WHERE email_verified_at IS NOT NULL",
        { transaction },
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "verified");
  },
};
```

## Safe Rollback with Backup

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create backup inside transaction
      await queryInterface.sequelize.query(
        "CREATE TABLE users_backup AS SELECT * FROM users",
        { transaction },
      );
      // Perform destructive migration
      await queryInterface.removeColumn("users", "legacy_field", {
        transaction,
      });
      // Verify
      const [result] = await queryInterface.sequelize.query(
        "SELECT COUNT(*) as count FROM users",
        { transaction },
      );
      if (result[0].count === 0) {
        throw new Error("Migration verification failed: no rows");
      }
      // Cleanup backup and commit
      // WARNING: DROP TABLE is a destructive operation requiring explicit user
      // approval per safety rules. Never include DROP TABLE in automated
      // migrations without confirmation. Consider keeping backup tables for a
      // rollback window before dropping.
      await queryInterface.sequelize.query("DROP TABLE users_backup", {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
```

## Batched Data Migration

For large tables, avoid locking the entire table. Process in batches.

```javascript
module.exports = {
  up: async (queryInterface) => {
    const batchSize = 1000;
    let affected = batchSize;

    while (affected === batchSize) {
      const [, meta] = await queryInterface.sequelize.query(`
        UPDATE users
        SET full_name = CONCAT(first_name, ' ', last_name)
        WHERE id IN (
          SELECT id FROM users
          WHERE full_name IS NULL
          LIMIT ${batchSize}
        )
      `);
      affected = meta?.rowCount ?? meta?.affectedRows ?? 0;
    }
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      "UPDATE users SET full_name = NULL",
    );
  },
};
```

## Cross-Dialect Handling

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    const jsonType = dialect === "postgres" ? Sequelize.JSONB : Sequelize.JSON;

    await queryInterface.addColumn("users", "metadata", {
      type: jsonType,
      defaultValue: dialect === "postgres" ? "'{}'" : "'{}'",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "metadata");
  },
};
```

## Checklist

Before migrating:
- [ ] Backup database (or verify automated backups exist)
- [ ] Test migration on staging with production-sized data
- [ ] Verify rollback works (`down` function tested)
- [ ] Check for long-running locks on large tables

During migration:
- [ ] Monitor query performance and lock wait times
- [ ] Watch application error rates

After migration:
- [ ] Verify row counts and data integrity
- [ ] Run application smoke tests
- [ ] Keep rollback plan ready for 24 hours

## Testing Migrations

Test migrations against a dedicated test database. Verify both up and down migrations. Use the project's test framework (Vitest for TypeScript, pytest for Python) to automate migration testing where possible. At minimum, write tests that:

- Run the `up` migration and verify the schema matches expectations
- Run the `down` migration and verify it cleanly reverts
- Seed test data before migration and verify data integrity after

## Pitfalls

- **No transaction wrapping**: Multi-step migrations without transactions leave partial state on failure
- **Locking large tables**: `ALTER TABLE` on millions of rows blocks writes; use batched approach or `pt-online-schema-change`
- **Forgetting NULL handling**: Adding NOT NULL without a default fails on tables with existing rows
- **Skipping rollback testing**: `down()` functions that have never been run will fail in production
- **Ignoring foreign keys**: Dropping a column referenced by a foreign key silently breaks referential integrity in some databases
