<!-- Source: https://github.com/SuperiorByteWorks-LLC/agent-project | License: Apache-2.0 | Author: Clayton Young / Superior Byte Works, LLC (Boreal Bytes) -->

# C4 Diagram

> **Back to [Style Guide](../mermaid_style_guide.md)** — Read the style guide first for emoji, color, and accessibility rules.

**Syntax keyword:** `C4Context`, `C4Container`, `C4Component`
**Best for:** System architecture at varying zoom levels — context, containers, components
**When NOT to use:** Infrastructure topology (use [Architecture](architecture.md)), runtime sequences (use [Sequence](sequence.md))

---

## Exemplar Diagram — System Context

```mermaid
C4Context
    accTitle: Online Store System Context
    accDescr: C4 context diagram showing how a customer interacts with the store and its external payment dependency

    title Online Store - System Context

    Person(customer, "Customer", "Places orders")
    System(store, "Online Store", "Catalog and checkout")
    System_Ext(payment, "Payment Provider", "Card processing")

    Rel(customer, store, "Orders", "HTTPS")
    Rel(store, payment, "Pays", "API")

    UpdateRelStyle(customer, store, $offsetY="-40", $offsetX="-30")
    UpdateRelStyle(store, payment, $offsetY="-40", $offsetX="-30")
```

---

## C4 Zoom Levels

| Level         | Keyword       | Shows                                   | Audience        |
| ------------- | ------------- | --------------------------------------- | --------------- |
| **Context**   | `C4Context`   | Systems + external actors               | Everyone        |
| **Container** | `C4Container` | Apps, databases, queues within a system | Technical leads |
| **Component** | `C4Component` | Internal modules within a container     | Developers      |

## Tips

- Use `Person()` for human actors
- Use `System()` for internal systems, `System_Ext()` for external
- Use `Container()`, `ContainerDb()`, `ContainerQueue()` at the container level
- Label relationships with **verbs** and **protocols**: `"Reads from", "SQL/TLS"`
- Use `Container_Boundary(id, "name") { ... }` to group containers
- **Keep descriptions short** — long text causes label overlaps
- **Limit to 4–5 elements** at the Context level to avoid crowding
- **Avoid emoji in C4 labels** — the C4 renderer handles its own styling
- Use `UpdateRelStyle()` to adjust label positions if overlaps occur

---

## Template

```mermaid
C4Context
    accTitle: Your System Context
    accDescr: Describe the system boundaries and external interactions

    Person(user, "User", "Role description")

    System(main_system, "Your System", "What it does")
    System_Ext(external, "External Service", "What it provides")

    Rel(user, main_system, "Uses", "HTTPS")
    Rel(main_system, external, "Calls", "API")
```

---

## Complex Example

A C4 Container diagram for an e-commerce platform with 3 `Container_Boundary` groups, 10 containers, and 2 external systems. Shows how to use boundaries to organize services by layer, with `UpdateRelStyle` offsets preventing label overlaps.

```mermaid
C4Container
    accTitle: E-Commerce Platform Container View
    accDescr: C4 container diagram showing web and mobile frontends, core backend services, and data stores with external payment and email dependencies

    Person(customer, "Customer", "Shops online")

    Container_Boundary(frontend, "Frontend") {
        Container(spa, "Web App", "React", "Single-page app")
        Container(bff, "BFF API", "Node.js", "Backend for frontend")
    }

    Container_Boundary(services, "Core Services") {
        Container(order_svc, "Order Service", "Go", "Order processing")
        Container(catalog_svc, "Product Catalog", "Go", "Product data")
        Container(user_svc, "User Service", "Go", "Auth and profiles")
    }

    Container_Boundary(data, "Data Layer") {
        ContainerDb(pg, "PostgreSQL", "SQL", "Primary data store")
        ContainerDb(redis, "Redis", "Cache", "Session and cache")
        ContainerDb(search, "Elasticsearch", "Search", "Product search")
    }

    System_Ext(payment_gw, "Payment Gateway", "Card processing")
    System_Ext(email_svc, "Email Service", "Transactional email")

    Rel(customer, spa, "Browses", "HTTPS")
    Rel(spa, bff, "Calls", "GraphQL")
    Rel(bff, order_svc, "Places orders", "gRPC")
    Rel(bff, catalog_svc, "Queries", "gRPC")
    Rel(bff, user_svc, "Authenticates", "gRPC")
    Rel(order_svc, pg, "Reads/writes", "SQL")
    Rel(order_svc, payment_gw, "Charges", "API")
    Rel(order_svc, email_svc, "Sends", "SMTP")
    Rel(catalog_svc, search, "Indexes", "REST")
    Rel(user_svc, redis, "Sessions", "TCP")
    Rel(catalog_svc, pg, "Reads", "SQL")

    UpdateRelStyle(customer, spa, $offsetY="-40", $offsetX="-50")
    UpdateRelStyle(spa, bff, $offsetY="-30", $offsetX="10")
    UpdateRelStyle(bff, order_svc, $offsetY="-30", $offsetX="-40")
    UpdateRelStyle(bff, catalog_svc, $offsetY="-30", $offsetX="10")
    UpdateRelStyle(bff, user_svc, $offsetY="-30", $offsetX="50")
    UpdateRelStyle(order_svc, pg, $offsetY="-30", $offsetX="-50")
    UpdateRelStyle(order_svc, payment_gw, $offsetY="-30", $offsetX="10")
    UpdateRelStyle(order_svc, email_svc, $offsetY="10", $offsetX="10")
    UpdateRelStyle(catalog_svc, search, $offsetY="-30", $offsetX="10")
    UpdateRelStyle(user_svc, redis, $offsetY="-30", $offsetX="10")
    UpdateRelStyle(catalog_svc, pg, $offsetY="10", $offsetX="30")
```

### Why this works

- **Container_Boundary groups map to deployment units** — frontend, core services, and data layer each correspond to real infrastructure boundaries (CDN, Kubernetes namespace, managed databases)
- **Every `Rel` has `UpdateRelStyle`** — C4's auto-layout stacks labels on top of each other by default. Offset every relationship to prevent overlaps, even if it seems fine at first (adding elements later will shift things)
- **Descriptions are kept to 1-3 words** — "Card processing", "Session and cache", "Auth and profiles". Long descriptions are the #1 cause of C4 rendering issues
- **Container types are semantic** — `ContainerDb` for databases gives them the cylinder icon, `Container` for services. The C4 renderer provides its own visual differentiation
