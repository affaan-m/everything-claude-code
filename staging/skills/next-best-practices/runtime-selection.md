# Runtime Selection

## Use Node.js Runtime by Default

Use the default Node.js runtime for new routes and pages. Only use Edge runtime if the project already uses it or there's a specific requirement.

```tsx
// Good: Default - no runtime config needed (uses Node.js)
export default function Page() { ... }

// Caution: Only if already used in project or specifically required
export const runtime = 'edge'
```

## When to Use Each

### Node.js Runtime (Default)

- Full Node.js API support
- File system access (`fs`)
- Full `crypto` support
- Database connections
- Most npm packages work

### Edge Runtime

- Only for specific edge-location latency requirements
- Limited API (no `fs`, limited `crypto`)
- Smaller cold start
- Geographic distribution needs

## Detection

**Before adding `runtime = 'edge'`**, check:
1. Does the project already use Edge runtime?
2. Is there a specific latency requirement?
3. Are all dependencies Edge-compatible?

If unsure, use Node.js runtime.
