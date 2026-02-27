# File Ownership Decision Framework

How to assign file ownership when decomposing features for parallel development.

## Ownership Decision Process

### Step 1: Map All Files

List every file that needs to be created or modified for the feature.

### Step 2: Identify Natural Clusters

Group files by:

- Directory proximity (files in the same directory)
- Functional relationship (files that import each other)
- Layer membership (all UI files, all API files)

### Step 3: Assign Clusters to Owners

Each cluster becomes one implementer's ownership boundary:

- No file appears in multiple clusters
- Each cluster is internally cohesive
- Cross-cluster dependencies are minimized

### Step 4: Define Interface Points

Where clusters interact, define:

- Shared type definitions (owned by lead or a designated implementer)
- API contracts (function signatures, request/response shapes)
- Event contracts (event names and payload shapes)

## Ownership by Project Type

### React/Next.js Frontend

```
implementer-1: src/components/{feature}/   (UI components)
implementer-2: src/hooks/{feature}/        (custom hooks, state)
implementer-3: src/api/{feature}/          (API client, types)
shared:        src/types/{feature}.ts      (owned by lead)
```

### Express/Fastify Backend

```
implementer-1: src/routes/{feature}.ts, src/controllers/{feature}.ts
implementer-2: src/services/{feature}.ts, src/validators/{feature}.ts
implementer-3: src/models/{feature}.ts, src/repositories/{feature}.ts
shared:        src/types/{feature}.ts      (owned by lead)
```

### Full-Stack (Next.js)

```
implementer-1: app/{feature}/page.tsx, app/{feature}/components/
implementer-2: app/api/{feature}/route.ts, lib/{feature}/
implementer-3: tests/{feature}/
shared:        types/{feature}.ts          (owned by lead)
```

### Python Django

```
implementer-1: {app}/views.py, {app}/urls.py, {app}/forms.py
implementer-2: {app}/models.py, {app}/serializers.py, {app}/managers.py
implementer-3: {app}/tests/
shared:        {app}/types.py              (owned by lead)
```

## Conflict Resolution

When two implementers need to modify the same file:

1. **Preferred: Split the file** — Extract the shared concern into its own file
2. **If can't split: Designate one owner** — The other implementer sends change requests
3. **Last resort: Sequential access** — Implementer A finishes, then implementer B takes over
4. **Never**: Let both modify the same file simultaneously
