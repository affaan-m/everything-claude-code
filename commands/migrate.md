# Database Migration Command

Generate, validate, and apply database migrations safely.

## Instructions

Execute migration workflow in this order:

1. **Detect ORM/Framework**
   - Search for: `schema.prisma` (Prisma), `drizzle.config.ts` (Drizzle), `ormconfig` (TypeORM), `knexfile` (Knex), `alembic.ini` (Alembic), `db/migrate/` (Rails), `django` in requirements (Django), `*.csproj` with `EntityFramework` (EF Core)
   - Report: `Detected: <framework>`

2. **Analyze Schema Changes**
   - Compare current models/schema with latest migration state
   - Identify: new tables, added columns, removed columns, type changes, index changes
   - Report summary of detected changes

3. **Generate Migration**
   - Run the framework-specific generation command:
     - Prisma: `npx prisma migrate dev --name $NAME --create-only`
     - Drizzle: `npx drizzle-kit generate`
     - TypeORM: `npx typeorm migration:generate -n $NAME`
     - Knex: `npx knex migrate:make $NAME`
     - Alembic: `alembic revision --autogenerate -m "$NAME"`
     - Rails: `bundle exec rails generate migration $NAME`
     - Django: `python manage.py makemigrations --name $NAME`
     - EF Core: `dotnet ef migrations add $NAME`
   - If `--name` not provided, auto-generate from changes (e.g., `add_email_to_users`)

4. **Safety Check**
   - Review generated migration for:
     - **Destructive changes**: column/table drops → WARN and require confirmation
     - **Large table risk**: adding index without concurrency on tables with 1M+ rows → WARN
     - **NOT NULL without default**: adding non-nullable column to populated table → BLOCK
     - **Irreversible**: migration without rollback/down method → WARN
   - Report: `Safety: [PASS/WARN/BLOCK]` with details

5. **Apply Migration**
   - If `--dry-run`: show SQL output only, do not apply
   - If `--sql`: output raw SQL and exit
   - Otherwise: apply migration and verify success
   - Run framework-specific status command to confirm

6. **Post-Apply Verification**
   - Run migration status check
   - Verify schema matches expected state
   - Report: `Migration: [APPLIED/DRY-RUN/BLOCKED]`

## Arguments

$ARGUMENTS can be:
- `--name <name>` - Migration name (auto-generated if omitted)
- `--dry-run` - Generate and validate without applying
- `--rollback` - Rollback the last applied migration
- `--sql` - Output raw SQL instead of applying
- `--status` - Show current migration status only

## Output

```
MIGRATION: [APPLIED/DRY-RUN/BLOCKED/ROLLED-BACK]

Framework: <detected>
Changes:   <summary>
Safety:    [PASS/WARN/BLOCK]
File:      <migration file path>
Status:    <current migration state>
```
