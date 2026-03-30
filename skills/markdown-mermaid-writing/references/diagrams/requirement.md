<!-- Source: https://github.com/SuperiorByteWorks-LLC/agent-project | License: Apache-2.0 | Author: Clayton Young / Superior Byte Works, LLC (Boreal Bytes) -->

# Requirement Diagram

> **Back to [Style Guide](../mermaid_style_guide.md)** — Read the style guide first for emoji, color, and accessibility rules.

**Syntax keyword:** `requirementDiagram`
**Best for:** System requirements traceability, compliance mapping, formal requirements engineering
**When NOT to use:** Informal task tracking (use [Kanban](kanban.md)), general relationships (use [ER](er.md))

---

## Exemplar Diagram

```mermaid
requirementDiagram

    requirement high_availability {
        id: 1
        text: System shall maintain 99.9 percent uptime
        risk: high
        verifymethod: test
    }

    requirement data_encryption {
        id: 2
        text: All data at rest shall be AES-256 encrypted
        risk: medium
        verifymethod: inspection
    }

    requirement session_timeout {
        id: 3
        text: Sessions expire after 30 minutes idle
        risk: low
        verifymethod: test
    }

    element auth_service {
        type: service
        docref: auth-service-v2
    }

    element crypto_module {
        type: module
        docref: crypto-lib-v3
    }

    auth_service - satisfies -> high_availability
    auth_service - satisfies -> session_timeout
    crypto_module - satisfies -> data_encryption
```

---

## Tips

- Each requirement needs: `id`, `text`, `risk`, `verifymethod`
- **`id` must be numeric** — use `id: 1`, `id: 2`, etc. (dashes like `REQ-001` can cause parse errors)
- Risk levels: `low`, `medium`, `high` (all lowercase)
- Verify methods: `analysis`, `inspection`, `test`, `demonstration` (all lowercase)
- Use `element` for design components that satisfy requirements
- Relationship types: `- satisfies ->`, `- traces ->`, `- contains ->`, `- derives ->`, `- refines ->`, `- copies ->`
- Keep to **3–5 requirements** per diagram
- Avoid special characters in text fields — spell out symbols (e.g., "99.9 percent" not "99.9%")
- Use 4-space indentation inside `{ }` blocks

---

## Template

```mermaid
requirementDiagram

    requirement your_requirement {
        id: 1
        text: The requirement statement here
        risk: medium
        verifymethod: test
    }

    element your_component {
        type: service
        docref: component-ref
    }

    your_component - satisfies -> your_requirement
```
