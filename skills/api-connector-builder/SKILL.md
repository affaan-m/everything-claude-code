---
name: api-connector-builder
description: 通过精确匹配目标仓库现有集成模式来构建新的 API 连接器或 provider。适用场景：增加一个新集成而不引入第二套架构。
origin: ECC direct-port adaptation
version: "1.0.0"
---

# API Connector Builder

Use this when the job is to add a repo-native integration surface, not just a generic HTTP client.

The point is to match the host repository's pattern:

- connector layout
- config schema
- auth model
- error handling
- test style
- registration/discovery wiring

## When to Use

- "Build a Jira connector for this project"
- "Add a Slack provider following the existing pattern"
- "Create a new integration for this API"
- "Build a plugin that matches the repo's connector style"

## Guardrails

- do not invent a new integration architecture when the repo already has one
- do not start from vendor docs alone; start from existing in-repo connectors first
- do not stop at transport code if the repo expects registry wiring, tests, and docs
- do not cargo-cult old connectors if the repo has a newer current pattern

## Workflow

### 1. Learn the house style

Inspect at least 2 existing connectors/providers and map:

- file layout
- abstraction boundaries
- config model
- retry / pagination conventions
- registry hooks
- test fixtures and naming

### 2. Narrow the target integration

Define only the surface the repo actually needs:

- auth flow
- key entities
- core read/write operations
- pagination and rate limits
- webhook or polling model

### 3. Build in repo-native layers

Typical slices:

- config/schema
- client/transport
- mapping layer
- connector/provider entrypoint
- registration
- tests

### 4. Validate against the source pattern

The new connector should look obvious in the codebase, not imported from a different ecosystem.

## Reference Shapes

### Provider-style

```text
providers/
  existing_provider/
    __init__.py
    provider.py
    config.py
```

### Connector-style

```text
integrations/
  existing/
    client.py
    models.py
    connector.py
```

### TypeScript plugin-style

```text
src/integrations/
  existing/
    index.ts
    client.ts
    types.ts
    test.ts
```

## Quality Checklist

- [ ] matches an existing in-repo integration pattern
- [ ] config validation exists
- [ ] auth and error handling are explicit
- [ ] pagination/retry behavior follows repo norms
- [ ] registry/discovery wiring is complete
- [ ] tests mirror the host repo's style
- [ ] docs/examples are updated if expected by the repo

## Related Skills

- `backend-patterns`
- `mcp-server-patterns`
- `github-ops`
