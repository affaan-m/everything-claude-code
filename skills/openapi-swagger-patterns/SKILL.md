---
name: openapi-swagger-patterns
description: OpenAPI 3.1 specification authoring, schema design, code generation, and API documentation patterns.
---

# OpenAPI / Swagger Patterns

## When to Activate
- Designing or documenting REST APIs
- Writing or reviewing OpenAPI/Swagger specification files
- Setting up API code generation pipelines
- Implementing contract-first API development

## Core Principles
- **Spec-first**: Write the OpenAPI spec before implementation
- **Single source of truth**: Generate code/docs from the spec, not the other way around
- **Reusable schemas**: Use `$ref` and `components` to avoid duplication
- **Versioning**: Plan for API evolution from day one

---

## 1. OpenAPI 3.1 Document Structure

```yaml
openapi: "3.1.0"
info:
  title: My API
  version: "1.0.0"
  description: Production API
  contact:
    email: api@example.com
servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      tags: [Users]
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserList"
components:
  schemas: {}
  parameters: {}
  securitySchemes: {}
```

**Key rules:**
- Always set `operationId` — code generators use it for method names
- Use `tags` to group endpoints logically
- Put all reusable pieces in `components`

---

## 2. Schema Design

### Reusable Schemas with $ref

```yaml
components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          $ref: "#/components/schemas/Role"
    Role:
      type: string
      enum: [admin, editor, viewer]
```

### Composition with allOf / oneOf

```yaml
# Inheritance pattern
AdminUser:
  allOf:
    - $ref: "#/components/schemas/User"
    - type: object
      properties:
        permissions:
          type: array
          items:
            type: string

# Union type with discriminator
Event:
  oneOf:
    - $ref: "#/components/schemas/ClickEvent"
    - $ref: "#/components/schemas/ViewEvent"
  discriminator:
    propertyName: type
    mapping:
      click: "#/components/schemas/ClickEvent"
      view: "#/components/schemas/ViewEvent"
```

---

## 3. Request / Response Patterns

### Pagination

```yaml
UserList:
  type: object
  required: [data, meta]
  properties:
    data:
      type: array
      items:
        $ref: "#/components/schemas/User"
    meta:
      type: object
      properties:
        total:
          type: integer
        page:
          type: integer
        limit:
          type: integer

parameters:
  PageParam:
    name: page
    in: query
    schema:
      type: integer
      default: 1
      minimum: 1
  LimitParam:
    name: limit
    in: query
    schema:
      type: integer
      default: 20
      minimum: 1
      maximum: 100
```

### Error Format (RFC 7807)

```yaml
ProblemDetail:
  type: object
  required: [type, title, status]
  properties:
    type:
      type: string
      format: uri
    title:
      type: string
    status:
      type: integer
    detail:
      type: string
    instance:
      type: string
      format: uri
```

### File Upload

```yaml
/uploads:
  post:
    requestBody:
      content:
        multipart/form-data:
          schema:
            type: object
            properties:
              file:
                type: string
                format: binary
              description:
                type: string
```

---

## 4. Authentication Schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/authorize
          tokenUrl: https://auth.example.com/token
          scopes:
            read:users: Read user data
            write:users: Modify user data

security:
  - BearerAuth: []
```

Apply security globally or per-operation. Per-operation overrides global.

---

## 5. Code Generation

### TypeScript Client

```bash
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o src/api/generated \
  --additional-properties=supportsES6=true,typescriptThreePlus=true
```

### Python Client

```bash
openapi-generator generate \
  -i openapi.yaml \
  -g python \
  -o sdk/python \
  --package-name my_api_client
```

### Server Stub (Node/Express)

```bash
openapi-generator generate \
  -i openapi.yaml \
  -g nodejs-express-server \
  -o server/
```

**Tip:** Commit generated code or use `.openapi-generator-ignore` to protect manual edits.

---

## 6. API Versioning

| Strategy | Pros | Cons |
|----------|------|------|
| URL path (`/v1/`) | Simple, explicit | URL changes on bump |
| Header (`Api-Version: 2`) | Clean URLs | Easy to forget |
| Media type (`application/vnd.api.v2+json`) | RESTful | Complex |

**Recommended:** URL path versioning for public APIs — simplest for consumers.

### Breaking Change Detection

```bash
# Using oasdiff
oasdiff breaking openapi-v1.yaml openapi-v2.yaml
```

---

## 7. Documentation

### Swagger UI

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/spec/openapi.yaml \
  -v $(pwd):/spec \
  swaggerapi/swagger-ui
```

### Redoc

```html
<redoc spec-url="openapi.yaml"></redoc>
<script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
```

### Enriching Docs

- Add `description` to every schema property
- Include `example` values for realistic output
- Use `externalDocs` for linking to guides

---

## 8. CI/CD Integration

### Spectral Linting

```yaml
# .spectral.yaml
extends: ["spectral:oas", "spectral:asyncapi"]
rules:
  operation-operationId: error
  operation-description: warn
  oas3-api-servers: error
```

```bash
npx @stoplight/spectral-cli lint openapi.yaml
```

### Mock Server

```bash
npx @stoplight/prism-cli mock openapi.yaml --port 4010
```

### Contract Testing

```typescript
import { OpenAPIValidator } from "express-openapi-validator";

app.use(
  OpenAPIValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateResponses: true,
  })
);
```

---

## Checklist

- [ ] Every endpoint has `operationId`, `summary`, and `tags`
- [ ] All reusable types are in `components/schemas` with `$ref`
- [ ] Error responses use a consistent format (RFC 7807)
- [ ] Authentication scheme is defined and applied
- [ ] Pagination parameters are standardized
- [ ] Spec passes `spectral lint` with zero errors
- [ ] Code generation produces compilable output
- [ ] Breaking changes are detected in CI before merge
