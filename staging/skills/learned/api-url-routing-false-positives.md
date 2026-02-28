---
name: api-url-routing-false-positives
description: "URL substring matching for API routing needs negative patterns to prevent false positives from related endpoints"
user-invocable: false
origin: auto-extracted
---

# API URL Routing: Prevent False Positives with Negative Patterns

**Extracted:** 2026-02-27
**Context:** Intercepting/categorizing HTTP API traffic by URL patterns (Chrome extensions, proxies, middleware)

## Problem
When routing or caching API responses based on URL substrings, related endpoints that share common substrings cause false positives. A generic match like `url.includes('messengerConversations')` will match both a conversation LIST endpoint and a batch LOOKUP endpoint that happen to share the substring.

This is especially dangerous when caching responses — the wrong endpoint's response overwrites the correct one, and the consumer silently gets malformed data.

## Solution
Always pair inclusion patterns with exclusion patterns:

```typescript
// BAD: matches multiple unrelated endpoints
if (url.includes('messengerConversations')) {
  cache.set('conversations', response);
}

// GOOD: include + exclude to match only the target endpoint
if (url.includes('messengerConversations')
    && !url.includes('DashMessengerConversations')  // batch lookup
    && !url.includes('ids=List')                     // batch query param
    && !url.includes('Cursor')) {                    // pagination
  cache.set('conversations', response);
}
```

For maximum safety, use positive identification of the specific endpoint path:
```typescript
// BEST: match the specific path structure
if (url.includes('/graphql') && url.includes('queryId=messengerConversations')) {
  cache.set('conversations', response);
}
```

## When to Use
- Categorizing intercepted API traffic (fetch interception, webRequest listeners)
- Caching API responses by endpoint type in sessionStorage/localStorage
- URL-based routing in API proxies or middleware
- Any URL pattern matching for classification

## Checklist
1. For each inclusion pattern, ask: "What OTHER URLs contain this substring?"
2. Add exclusion patterns for known false positives
3. Prefer matching the specific path structure over generic substrings
4. Log matched URLs during development to catch unexpected matches early
5. If the same URL pattern appears in multiple files, fix ALL of them
