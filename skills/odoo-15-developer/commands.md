# Commands Reference - Odoo 15 Development

## Environment Configuration

Set these environment variables for your project:

```bash
# Container names
export ODOO_CONTAINER=odoo_web
export POSTGRES_CONTAINER=odoo_postgres

# Database settings
export ODOO_DB=odoo_db
export ODOO_USER=odoo
export ODOO_PASSWORD=odoo

# Ports (external)
export ODOO_PORT=8069
export POSTGRES_PORT=5432
```

## Docker Environment

### Container Information

| Component | Container | Default Port |
|-----------|-----------|--------------|
| Odoo Web | `$ODOO_CONTAINER` | 8069 |
| PostgreSQL | `$POSTGRES_CONTAINER` | 5432 |

### Access URLs

- **Odoo Web**: http://localhost:$ODOO_PORT
- **PostgreSQL**: `psql -h localhost -p $POSTGRES_PORT -U $ODOO_USER -d $ODOO_DB`

## Docker Commands

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View Odoo logs
docker logs -f $ODOO_CONTAINER

# Access Odoo container
docker exec -it $ODOO_CONTAINER bash

# Access PostgreSQL
docker exec -it $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB
```

### Debug Mode

```bash
# Run with debugger attached (if configured)
docker-compose up odoo-dev
```

## Module Management

### Install Modules

```bash
# Install single module
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -i MODULE_NAME --stop-after-init

# Install multiple modules
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -i module1,module2 --stop-after-init

# Install with dependencies
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -i hr_payroll,hr_contract --stop-after-init
```

### Update Modules

```bash
# Update single module
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u MODULE_NAME --stop-after-init

# Update multiple modules
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u module1,module2 --stop-after-init

# Update all installed modules
docker exec $ODOO_CONTAINER odoo -d $ODOO_DB -u all --stop-after-init
```

## Testing Commands

### Phase 1: Direct Database Testing

```bash
# Create test script in .0temp/ directory
cat > .0temp/test_implementation.py << 'EOF'
#!/usr/bin/env python3
import sys
sys.path.append('/odoo')
import odoo

# Test with REAL database data
# ... implementation tests ...
EOF

# Copy to container and run
docker cp .0temp/test_implementation.py $ODOO_CONTAINER:/tmp/
docker exec $ODOO_CONTAINER python3 /tmp/test_implementation.py

# Query database directly
docker exec $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB \
    -c "SELECT * FROM hr_employee LIMIT 5;"
```

### Phase 2: Odoo Standard Tests

```bash
# Run specific test file
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    MODULE_NAME.tests.test_file

# Run all module tests
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    MODULE_NAME.tests

# Run with database specification
docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader \
    MODULE_NAME.tests.test_file -d $ODOO_DB

# Using docker-compose
docker-compose exec odoo python3 -m odoo.tests.loader \
    custom_module.tests.test_calculation
```

## Database Commands

### PostgreSQL Queries

```bash
# Interactive psql
docker exec -it $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB

# Run query
docker exec $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB \
    -c "SELECT id, name FROM hr_employee LIMIT 5;"

# Export query results
docker exec $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB \
    -c "COPY (SELECT * FROM table) TO STDOUT WITH CSV HEADER;" > export.csv
```

### Common Database Queries

```sql
-- List all tables
\dt

-- Describe table
\d table_name

-- Employee with department
SELECT e.name, d.name as department
FROM hr_employee e
LEFT JOIN hr_department d ON e.department_id = d.id
WHERE e.active = true;

-- Recent attendance
SELECT e.name, a.check_in, a.check_out
FROM hr_attendance a
JOIN hr_employee e ON a.employee_id = e.id
WHERE a.check_in >= CURRENT_DATE - INTERVAL '7 days';
```

## Git Commands

```bash
# Create feature branch
git checkout -b feature/TICKET-1234-description

# Commit (clean format)
git add .
git commit -m "[module_name] type(scope): description

Detailed explanation."

# Push to remote
git push origin feature/TICKET-1234-description
```

### Branch Naming

```
feature/TICKET-XXXX-description  # New features
bugfix/TICKET-XXXX-description   # Bug fixes
hotfix/critical-description      # Critical fixes
```

### Commit Message Format

```
[module_name] type(scope): description

Type: feat, fix, refactor, docs, test, chore
```

## Temporary Files

### Management Rules

```bash
# Create temporary directory
mkdir -p .0temp/

# Place temp files here
cp test_script.py .0temp/
echo "Debug output" > .0temp/debug_log.txt

# Clean up after work (files only, keep directory)
rm .0temp/*
```

### File Types for .0temp/

- Test scripts (`test_*.py`)
- Debug files (`debug_*`, `*_debug.*`)
- Analysis outputs
- Excel files for parsing
- Temporary configurations
- Investigation files

## Search Commands

**Use `rg` (ripgrep) instead of `grep` and `find`:**

```bash
# Search for pattern
rg "pattern"

# Find Python files
rg --files -g "*.py"

# Search in specific file types
rg "search_term" -t py
```

## Odoo Shell Access

```bash
# Access Odoo shell
docker exec -it $ODOO_CONTAINER python3 /usr/bin/odoo shell \
    -c /etc/odoo/odoo.conf -d $ODOO_DB

# Inside shell
>>> env['res.partner'].search([])
>>> env['sale.order'].browse(1).name
```

## Quick Reference Card

| Task | Command |
|------|---------|
| Start env | `docker-compose up -d` |
| Stop env | `docker-compose down` |
| View logs | `docker logs -f $ODOO_CONTAINER` |
| Shell access | `docker exec -it $ODOO_CONTAINER bash` |
| Install module | `docker exec ... odoo -d $ODOO_DB -i MODULE --stop-after-init` |
| Update module | `docker exec ... odoo -d $ODOO_DB -u MODULE --stop-after-init` |
| Run tests | `docker exec ... python3 -m odoo.tests.loader MODULE.tests` |
| DB access | `docker exec -it $POSTGRES_CONTAINER psql -U $ODOO_USER -d $ODOO_DB` |
| Odoo shell | `docker exec -it $ODOO_CONTAINER python3 /usr/bin/odoo shell -d $ODOO_DB` |
