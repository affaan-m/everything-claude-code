---
name: backend-patterns
description: Backend rules for API design and database.
---

# Backend Patterns

## API Rules

- Use RESTful resource-based URLs: `/api/markets`, `/api/markets/:id`
- Use query params for filtering: `?status=active&limit=20&offset=0`
- Use Repository pattern to abstract data access
- Use Service layer for business logic
- Use middleware for cross-cutting concerns (auth, logging)

## Database Rules

- NEVER use `select('*')` - always specify columns
- NEVER make N+1 queries - batch fetch related data
- Use transactions for multi-table operations

### Database Transaction (PostgreSQL)
```sql
CREATE OR REPLACE FUNCTION create_market_with_position(
  market_data jsonb,
  position_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO markets VALUES (market_data);
  INSERT INTO positions VALUES (position_data);
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

## Caching Rules

- Use cache-aside pattern: check cache → fetch DB → update cache
- Set TTL (e.g., 300s for market data)
- Invalidate cache on updates

## Error Handling Rules

- Use centralized error handler
- Return generic messages to users, log details server-side
- Use exponential backoff for retries (1s, 2s, 4s)

## Auth Rules

- Verify JWT on protected routes
- Check permissions before sensitive operations
- Use RBAC (role-based access control)

## Performance Rules

- Apply rate limiting on all endpoints
- Use job queues for expensive operations (don't block requests)
- Use structured JSON logging with requestId for tracing
