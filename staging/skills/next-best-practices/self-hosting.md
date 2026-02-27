# Self-Hosting Next.js

Deploy Next.js outside of Vercel with confidence.

## Quick Start: Standalone Output

For Docker or any containerized deployment, use standalone output:

```js
// next.config.js
module.exports = {
  output: 'standalone',
};
```

This creates a minimal `standalone` folder with only production dependencies:

```
.next/
├── standalone/
│   ├── server.js          # Entry point
│   ├── node_modules/      # Only production deps
│   └── .next/             # Build output
└── static/                # Must be copied separately
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## PM2 Deployment

For traditional server deployments:

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs',
    script: '.next/standalone/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

```bash
npm run build
pm2 start ecosystem.config.js
```

## ISR and Cache Handlers

### The Problem

ISR (Incremental Static Regeneration) uses filesystem caching by default. This **breaks with multiple instances**:

- Instance A regenerates page → saves to its local disk
- Instance B serves stale page → doesn't see Instance A's cache
- Load balancer sends users to random instances → inconsistent content

### Solution: Custom Cache Handler

Next.js 14+ supports custom cache handlers for shared storage:

```js
// next.config.js
module.exports = {
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0, // Disable in-memory cache
};
```

#### Redis Cache Handler Example

```js
// cache-handler.js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);
const CACHE_PREFIX = 'nextjs:';

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    const data = await redis.get(CACHE_PREFIX + key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      value: parsed.value,
      lastModified: parsed.lastModified,
    };
  }

  async set(key, data, ctx) {
    const cacheData = {
      value: data,
      lastModified: Date.now(),
    };

    // Set TTL based on revalidate option
    if (ctx?.revalidate) {
      await redis.setex(
        CACHE_PREFIX + key,
        ctx.revalidate,
        JSON.stringify(cacheData)
      );
    } else {
      await redis.set(CACHE_PREFIX + key, JSON.stringify(cacheData));
    }
  }

  async revalidateTag(tags) {
    // Implement tag-based invalidation
    // This requires tracking which keys have which tags
  }
};
```

#### S3 Cache Handler Example

```js
// cache-handler.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.CACHE_BUCKET;

module.exports = class CacheHandler {
  async get(key) {
    try {
      const response = await s3.send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: `cache/${key}`,
      }));
      const body = await response.Body.transformToString();
      return JSON.parse(body);
    } catch (err) {
      if (err.name === 'NoSuchKey') return null;
      throw err;
    }
  }

  async set(key, data, ctx) {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `cache/${key}`,
      Body: JSON.stringify({
        value: data,
        lastModified: Date.now(),
      }),
      ContentType: 'application/json',
    }));
  }
};
```

## What Works vs What Needs Setup

| Feature | Single Instance | Multi-Instance | Notes |
|---------|----------------|----------------|-------|
| SSR | Yes | Yes | No special setup |
| SSG | Yes | Yes | Built at deploy time |
| ISR | Yes | Needs cache handler | Filesystem cache breaks |
| Image Optimization | Yes | Yes | CPU-intensive, consider CDN |
| Middleware | Yes | Yes | Runs on Node.js |
| Edge Runtime | Limited | Limited | Some features Node-only |
| `revalidatePath/Tag` | Yes | Needs cache handler | Must share cache |
| `next/font` | Yes | Yes | Fonts bundled at build |
| Draft Mode | Yes | Yes | Cookie-based |

## Image Optimization

Next.js Image Optimization works out of the box but is CPU-intensive.

### Option 1: Built-in (Simple)

Works automatically, but consider:
- Set `deviceSizes` and `imageSizes` in config to limit variants
- Use `minimumCacheTTL` to reduce regeneration

```js
// next.config.js
module.exports = {
  images: {
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 1080, 1920], // Limit sizes
  },
};
```

### Option 2: External Loader (Recommended for Scale)

Offload to Cloudinary, Imgix, or similar:

```js
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
};
```

```js
// lib/image-loader.js
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
  return `https://res.cloudinary.com/demo/image/upload/${params.join(',')}${src}`;
}
```

## Environment Variables

### Build-time vs Runtime

```js
// Available at build time only (baked into bundle)
NEXT_PUBLIC_API_URL=https://api.example.com

// Available at runtime (server-side only)
DATABASE_URL=postgresql://...
API_SECRET=...
```

### Runtime Configuration

For truly dynamic config, don't use `NEXT_PUBLIC_*`. Instead:

```tsx
// app/api/config/route.ts
export async function GET() {
  return Response.json({
    apiUrl: process.env.API_URL,
    features: process.env.FEATURES?.split(','),
  });
}
```

## OpenNext: Serverless Without Vercel

[OpenNext](https://open-next.js.org/) adapts Next.js for AWS Lambda, Cloudflare Workers, etc.

```bash
npx create-sst@latest
# or
npx @opennextjs/aws build
```

Supports:
- AWS Lambda + CloudFront
- Cloudflare Workers
- Netlify Functions
- Deno Deploy

## Health Check Endpoint

Always include a health check for load balancers:

```tsx
// app/api/health/route.ts
export async function GET() {
  try {
    // Optional: check database connection
    // await db.$queryRaw`SELECT 1`;

    return Response.json({ status: 'healthy' }, { status: 200 });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

## Pre-Deployment Checklist

1. **Build locally first**: `npm run build` - catch errors before deploy
2. **Test standalone output**: `node .next/standalone/server.js`
3. **Set `output: 'standalone'`** for Docker
4. **Configure cache handler** for multi-instance ISR
5. **Set `HOSTNAME="0.0.0.0"`** for containers
6. **Copy `public/` and `.next/static/`** - not included in standalone
7. **Add health check endpoint**
8. **Test ISR revalidation** after deployment
9. **Monitor memory usage** - Node.js defaults may need tuning

## Testing Cache Handler

**Critical**: Test your cache handler on every Next.js upgrade:

```bash
# Start multiple instances
PORT=3001 node .next/standalone/server.js &
PORT=3002 node .next/standalone/server.js &

# Trigger ISR revalidation
curl http://localhost:3001/api/revalidate?path=/posts

# Verify both instances see the update
curl http://localhost:3001/posts
curl http://localhost:3002/posts
# Should return identical content
```
