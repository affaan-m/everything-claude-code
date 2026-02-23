---
name: vite-build-patterns
description: Vite/esbuild/Rollup patterns — project configuration, plugin system, build optimization, library mode, environment variables, SSR, monorepo integration, and migration from Webpack.
---

# Vite Build Patterns

Production-grade Vite configuration covering optimization, plugins, library mode, SSR, and monorepo setups.

## When to Activate

- Setting up a new Vite project (React, Vue, Svelte, Vanilla)
- Configuring dev server proxies, aliases, or HMR behavior
- Optimizing bundle size with code splitting, tree shaking, or asset optimization
- Building a reusable library with ESM/CJS/UMD output formats
- Managing environment variables across development, staging, and production
- Configuring SSR with Node.js or edge runtimes
- Integrating Vite into a Turborepo or Nx monorepo
- Migrating an existing Webpack project to Vite

## Core Principles

1. **ESM native** — Vite serves ES modules directly in dev; no bundling until production
2. **Rollup in production** — the production build uses Rollup under the hood; all Rollup options apply
3. **Plugin order matters** — plugins run in array order; use `enforce: 'pre'` / `'post'` when needed
4. **Pre-bundle once** — `optimizeDeps` runs at startup; add missing CommonJS deps explicitly
5. **Env isolation** — only `VITE_` prefixed variables are exposed to client code

## Project Configuration

### Base Config (React + TypeScript)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: { alias: { '@': '/src' } },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### Framework Plugins

```typescript
import vue from '@vitejs/plugin-vue';                  // Vue
import { svelte } from '@sveltejs/vite-plugin-svelte'; // Svelte
import react from '@vitejs/plugin-react-swc';           // React (SWC — faster than Babel)
```

## Plugin System

### Custom Plugin Hooks

```typescript
import type { Plugin } from 'vite';

function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    enforce: 'pre', // 'pre' | 'post' | undefined

    resolveId(id) {
      if (id === 'virtual:my-module') return '\0virtual:my-module';
    },

    load(id) {
      if (id === '\0virtual:my-module')
        return `export const greeting = 'hello from virtual module';`;
    },

    transform(code, id) {
      if (!id.endsWith('.ts')) return null;
      return { code, map: null };
    },

    configureServer(server) {
      server.middlewares.use('/health', (_req, res) => res.end('ok'));
    },
  };
}
```

### Virtual Modules Pattern

```typescript
function virtualRoutesPlugin(): Plugin {
  const virtualId = 'virtual:routes';
  const resolvedId = '\0' + virtualId;

  return {
    name: 'virtual-routes',
    resolveId(id) { if (id === virtualId) return resolvedId; },
    load(id) {
      if (id === resolvedId) {
        const routes = [{ path: '/', component: 'Home' }]; // generated at build time
        return `export const routes = ${JSON.stringify(routes)};`;
      }
    },
  };
}

// Application code
import { routes } from 'virtual:routes';
```

## Build Optimization

### Code Splitting

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### Dynamic Imports (Route-level Splitting)

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
// Each page becomes a separate chunk automatically
```

### Asset and Bundle Optimization

```typescript
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,    // Inline assets < 4 KB as base64
    cssCodeSplit: true,          // One CSS file per JS chunk
    sourcemap: false,            // Disable for production
    minify: 'esbuild',           // 'esbuild' (fast) | 'terser' (smaller)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      treeshake: { moduleSideEffects: false },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    include: ['lodash-es', 'some-cjs-package > nested-dep'],
    exclude: ['@my-org/local-package'],
  },
});
```

## Library Mode

### Library Config

```typescript
// vite.config.ts (library)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), dts({ include: ['src'], insertTypesEntry: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLibrary',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `my-library.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
    copyPublicDir: false,
  },
});
```

### Library package.json Exports

```json
{
  "type": "module",
  "main": "./dist/my-library.cjs.js",
  "module": "./dist/my-library.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-library.es.js",
      "require": "./dist/my-library.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" }
}
```

## Environment Variables

### VITE_ Prefix Requirement

```bash
# .env
VITE_API_URL=https://api.example.com   # Exposed to client
SECRET_KEY=never-exposed               # No VITE_ prefix — stays server-side

# .env.production
VITE_API_URL=https://api.prod.example.com

# .env.staging
VITE_API_URL=https://api.staging.example.com
# Run: vite build --mode staging
```

### Type-Safe env.d.ts

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FEATURE_FLAG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Access Patterns

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isProd  = import.meta.env.PROD;   // built-in boolean
const isDev   = import.meta.env.DEV;    // built-in boolean
const mode    = import.meta.env.MODE;   // 'development' | 'production' | custom

// Server-only variables in vite.config.ts
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { define: { __VERSION__: JSON.stringify(env.npm_package_version) } };
});
```

## SSR Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: { middlewareMode: true },
  appType: 'custom', // Disable Vite's built-in HTML serving
  ssr: {
    external: ['express', 'fs', 'path'],      // Use Node.js require at runtime
    noExternal: ['some-esm-only-package'],     // Bundle into SSR build
  },
});

// dev-server.ts
import express from 'express';
import { createServer as createViteServer } from 'vite';

const app = express();
const vite = await createViteServer({ server: { middlewareMode: true } });

app.use(vite.middlewares);
app.use('*', async (req, res) => {
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
  res.send(await render(req.originalUrl));
});
```

## Monorepo Integration

### Shared Base Config

```typescript
// packages/config/vite.base.ts
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export function createBaseConfig() {
  return defineConfig({
    plugins: [tsconfigPaths()],
    resolve: { dedupe: ['react', 'react-dom'] },
    optimizeDeps: { include: ['react', 'react-dom'] },
  });
}

// apps/web/vite.config.ts
import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createBaseConfig } from '@my-org/config/vite.base';

export default mergeConfig(createBaseConfig(), {
  plugins: [react()],
  server: { port: 3000 },
});
```

### Turborepo + Local Package Aliasing

```json
// turbo.json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev":   { "cache": false, "persistent": true }
  }
}
```

```typescript
// Point local workspace packages to their source for HMR
export default defineConfig({
  resolve: {
    alias: { '@my-org/ui': '/packages/ui/src/index.ts' },
  },
  optimizeDeps: { include: ['@my-org/ui'] },
});
```

## Migration from Webpack

| Concern | Webpack | Vite |
|---|---|---|
| Dev server | Bundles everything upfront | Serves ES modules natively |
| Entry point | `entry: './src/index.js'` | `index.html` with `<script type="module">` |
| Env variables | `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |
| Code splitting | `SplitChunksPlugin` | `build.rollupOptions.output.manualChunks` |
| CSS modules | `css-loader modules: true` | Built-in; name files `*.module.css` |
| Static assets | `file-loader` / `url-loader` | Built-in; use `?url` / `?raw` suffix |
| TypeScript | `ts-loader` / `babel-loader` | Built-in via esbuild |
| Bundle analysis | `BundleAnalyzerPlugin` | `rollup-plugin-visualizer` |
| HTML injection | `HtmlWebpackPlugin` | Built-in (root `index.html`) |
| Compression | `CompressionPlugin` | `vite-plugin-compression` |

### Migration Steps

```bash
# 1. Install
npm install -D vite @vitejs/plugin-react

# 2. Move index.html to project root; update script tag:
#    <script type="module" src="/src/main.tsx"></script>

# 3. Replace process.env.REACT_APP_* → import.meta.env.VITE_*

# 4. Rename .env vars from REACT_APP_ → VITE_

# 5. Delete webpack.config.js; create vite.config.ts

# 6. Update package.json scripts:
#    "dev": "vite",  "build": "vite build",  "preview": "vite preview"

# 7. Add src/env.d.ts for typed import.meta.env
```

## Checklist

### New Project
- [ ] `vite.config.ts` uses `defineConfig` with the correct framework plugin
- [ ] Path alias defined in both `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`paths`)
- [ ] Dev server port and proxy rules configured
- [ ] `src/env.d.ts` created with `ImportMetaEnv` interface
- [ ] `.env`, `.env.production`, `.env.staging` use `VITE_` prefix for all client-side vars

### Build Optimization
- [ ] `manualChunks` groups vendor/router/UI into dedicated chunks
- [ ] Route-level dynamic imports for lazy loading
- [ ] `optimizeDeps.include` lists any CommonJS-only packages
- [ ] `build.sourcemap` disabled or set to `'hidden'` in production
- [ ] Bundle analyzed with `rollup-plugin-visualizer` before release

### Library Mode
- [ ] `build.lib.entry` points to `src/index.ts`
- [ ] `rollupOptions.external` lists all peer dependencies
- [ ] `vite-plugin-dts` configured to generate `.d.ts` declarations
- [ ] `package.json` has `main`, `module`, `types`, and `exports` fields

### SSR
- [ ] `server.middlewareMode: true` and `appType: 'custom'` for custom server
- [ ] Separate `entry-client.tsx` and `entry-server.tsx` entry points
- [ ] `ssr.external` lists Node.js built-ins and server-only packages

### Security
- [ ] No secrets in `VITE_` prefixed variables (they ship to the browser)
- [ ] Server-only secrets accessed only in `vite.config.ts` via `loadEnv`
- [ ] `build.minify` enabled for production builds
