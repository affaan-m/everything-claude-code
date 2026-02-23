---
name: monorepo-management
description: Monorepo management patterns for Turborepo, Nx, pnpm workspaces, and npm workspaces — package structure, dependency management, build orchestration, CI optimization, and shared configuration.
---

# Monorepo Management Patterns

Scalable monorepo architecture with efficient builds, clear boundaries, and shared infrastructure.

## When to Activate

- Setting up a new monorepo with Turborepo, Nx, or pnpm workspaces
- Adding new packages or apps to an existing monorepo
- Optimizing CI/CD for monorepo builds (caching, affected-only runs)
- Resolving dependency conflicts between packages
- Sharing configurations (ESLint, TypeScript, Tailwind) across packages
- Migrating from multi-repo to monorepo (or vice versa)

## Core Principles

1. **Packages own their boundaries** — each package has its own `package.json`, `tsconfig.json`, and build config
2. **Internal packages use workspace protocol** — `"@myorg/ui": "workspace:*"` never version pinning
3. **Build graph, not build order** — define `dependsOn` in pipeline config, let the tool resolve ordering
4. **Cache everything** — local + remote caching for builds, tests, and lints
5. **Affected-only CI** — only build/test packages that changed or depend on changed packages

## Project Structure

### Turborepo Standard Layout

```
my-monorepo/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   ├── api/                    # Express/Fastify API
│   │   ├── package.json
│   │   └── src/
│   └── mobile/                 # React Native app
│       ├── package.json
│       └── src/
├── packages/
│   ├── ui/                     # Shared component library
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   ├── db/                     # Database client & schema
│   │   ├── package.json
│   │   └── src/
│   ├── config-eslint/          # Shared ESLint config
│   │   ├── package.json
│   │   └── index.js
│   ├── config-typescript/      # Shared tsconfig bases
│   │   ├── package.json
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── library.json
│   └── shared/                 # Shared types, utils, constants
│       ├── package.json
│       └── src/
├── turbo.json
├── package.json                # Root — workspace config + dev deps only
├── pnpm-workspace.yaml         # or npm workspaces in package.json
└── .github/
    └── workflows/
        └── ci.yml
```

## Package Manager Workspace Config

### pnpm (Recommended)

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"       # optional: internal CLI tools, scripts
```

```json
// Root package.json
{
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.4.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### npm Workspaces

```json
// Root package.json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

## Turborepo Pipeline Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV", "CI"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],              // build deps first
      "inputs": ["src/**", "tsconfig.json", "package.json"],
      "outputs": ["dist/**", ".next/**"],
      "env": ["DATABASE_URL"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tests/**", "**/*.test.*"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", ".eslintrc*", "eslint.config.*"],
      "outputs": []
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true                     // long-running dev servers
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig.json"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Nx Configuration

### nx.json

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.test.*",
      "!{projectRoot}/tsconfig.spec.json"
    ],
    "sharedGlobals": ["{workspaceRoot}/.github/workflows/ci.yml"]
  },
  "defaultBase": "main"
}
```

### Nx Affected Commands

```bash
# Only build/test/lint what changed
nx affected -t build
nx affected -t test
nx affected -t lint

# Visualize dependency graph
nx graph

# Run on specific projects
nx run-many -t build -p web api
```

## Shared Configuration Packages

### Shared TypeScript Config

```json
// packages/config-typescript/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

```json
// packages/config-typescript/nextjs.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

```json
// apps/web/tsconfig.json
{
  "extends": "@myorg/config-typescript/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "next-env.d.ts", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Shared ESLint Config

```javascript
// packages/config-eslint/index.js
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export const baseConfig = [
  js.configs.recommended,
  {
    languageOptions: { parser: tsParser },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

export const reactConfig = [
  ...baseConfig,
  // React-specific rules
];
```

## Internal Package Pattern

### Package Setup

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/components/button.tsx",
    "./card": "./src/components/card.tsx"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "lint": "eslint src/",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@myorg/config-eslint": "workspace:*",
    "@myorg/config-typescript": "workspace:*",
    "tsup": "^8.4.0",
    "vitest": "^3.0.0"
  }
}
```

### Consuming Internal Packages

```json
// apps/web/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/shared": "workspace:*",
    "@myorg/db": "workspace:*"
  }
}
```

```tsx
// apps/web/src/app/page.tsx
import { Button } from "@myorg/ui/button";
import { formatDate } from "@myorg/shared";
import { db } from "@myorg/db";
```

## CI/CD Optimization

### GitHub Actions with Turborepo Remote Cache

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2                       # needed for turbo to detect changes

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Build, lint, test (with remote cache)
        run: pnpm turbo run build lint test typecheck
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}

  deploy-web:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Build only web app
        run: pnpm turbo run build --filter=web
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

### Filtering Builds

```bash
# Build only web and its dependencies
turbo run build --filter=web

# Build packages that changed since main
turbo run build --filter=...[main]

# Build packages in the 'packages' directory
turbo run build --filter=./packages/*

# Build everything except mobile
turbo run build --filter=!mobile
```

## Common Issues and Solutions

### Dependency Version Conflicts

```bash
# Detect duplicate/conflicting versions
pnpm why react                          # who depends on which version?

# Force single version (pnpm)
# Add to root package.json:
```

```json
{
  "pnpm": {
    "overrides": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}
```

### TypeScript Path Resolution

```json
// If imports from workspace packages don't resolve, check:
// 1. Package exports field is correct
// 2. tsconfig paths are set (for non-bundled dev mode)
// 3. The package has "types" or "typings" field

// packages/shared/package.json
{
  "name": "@myorg/shared",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### Circular Dependencies

```bash
# Detect cycles with madge
npx madge --circular --extensions ts packages/

# Or use Nx graph
nx graph
# Look for bi-directional arrows

# Fix: extract shared code into a new package
# BEFORE: packages/a imports from packages/b, b imports from a
# AFTER:  packages/a-b-shared, both a and b import from a-b-shared
```

## Monorepo Checklist

Before creating a new package:

- [ ] Package has its own `package.json` with workspace protocol dependencies
- [ ] `tsconfig.json` extends shared base config
- [ ] `eslint.config` extends shared ESLint config
- [ ] `turbo.json` / `nx.json` pipeline tasks are configured
- [ ] Package exports are defined (not just `main`)
- [ ] Internal dependencies use `workspace:*` protocol
- [ ] CI runs affected-only builds (not full rebuilds)
- [ ] Remote cache is configured (Turbo Remote Cache or Nx Cloud)
- [ ] No circular dependencies between packages
- [ ] Root `package.json` has workspace scripts (`build`, `dev`, `lint`, `test`)
