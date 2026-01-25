# API Standards

[Purpose: consistent API patterns for naming, structure, auth, versioning, and errors]

## Philosophy
- Prefer predictable, resource-oriented design
- Be explicit in contracts; minimize breaking changes
- Secure by default (auth first, least privilege)

## Endpoint Pattern
```
/{version}/{resource}[/{id}][/{sub-resource}]
```
Examples:
- `/api/v1/users`
- `/api/v1/users/:id`
- `/api/v1/users/:id/posts`

HTTP verbs:
- GET (read, safe, idempotent)
- POST (create)
- PUT/PATCH (update)
- DELETE (remove, idempotent)

## Request/Response

Request (typical):
```json
{ "data": { ... }, "metadata": { "requestId": "..." } }
```

Success:
```json
{ "data": { ... }, "meta": { "timestamp": "...", "version": "..." } }
```

Error:
```json
{ "error": { "code": "ERROR_CODE", "message": "...", "field": "optional" } }
```
(See error-handling for rules.)

## Status Codes (pattern)
- 2xx: Success (200 read, 201 create, 204 delete)
- 4xx: Client issues (400 validation, 401/403 auth, 404 missing)
- 5xx: Server issues (500 generic, 503 unavailable)
Choose the status that best reflects the outcome.

## Authentication
- Credentials in standard location
```
Authorization: Bearer {token}
```
- Reject unauthenticated before business logic

## Versioning
- Version via URL/header/media-type
- Breaking change → new version
- Non-breaking → same version
- Provide deprecation window and comms

## Pagination/Filtering (if applicable)
- Pagination: `page`, `pageSize` or cursor-based
- Filtering: explicit query params
- Sorting: `sort=field:asc|desc`
Return pagination metadata in `meta`.

---
_Focus on patterns and decisions, not endpoint catalogs._
