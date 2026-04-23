---
name: xquik
description: X/Twitter data access via Xquik's remote MCP server - search tweets, look up users, extract data, post, monitor accounts, run giveaway draws, and query trends. 2 tools covering 122 endpoints. Use when the user needs X/Twitter data or automation and has an Xquik API key.
origin: ECC
---

# Xquik

X/Twitter data and automation via Xquik's remote MCP server. Two tools cover 122 API endpoints: search, lookup, extraction, writing, monitoring, giveaway draws, webhooks, and trends.

## When to Activate

- User wants to search tweets, look up profiles, or extract X/Twitter data
- User wants to post, delete, like, retweet, or follow programmatically
- User is building a social media monitoring or analytics workflow
- User mentions "Xquik", "xquik MCP", or "X MCP"
- User needs giveaway draw logic, winner selection, or engagement extraction from X
- User wants to set up webhooks or monitors for X account activity
- User asks about trending topics on X

## MCP Requirement

Add to `~/.claude.json` mcpServers:

```json
"xquik": {
  "type": "http",
  "url": "https://xquik.com/mcp",
  "headers": {
    "Authorization": "Bearer YOUR_XQUIK_API_KEY_HERE"
  }
}
```

Get an API key at xquik.com. The MCP server is remote - no local process to run.

## MCP Tools

Xquik exposes two tools:

### `explore`

Searches the Xquik API spec. Use it to discover what endpoints exist before calling `xquik`. Free - does not consume credits.

**Parameters:**
- `query` (string, required): Natural-language or keyword query (e.g. "search tweets", "get followers", "post tweet")

**Returns:** Matching endpoint names, paths, descriptions, and parameter summaries.

### `xquik`

Executes any Xquik API endpoint. Consumes credits for data-fetching operations.

**Parameters:**
- `endpoint` (string, required): Endpoint path (e.g. `/tweets/search`, `/users/lookup`)
- `params` (object, optional): Query or body parameters for the endpoint

**Returns:** Structured JSON response from the Xquik API.

---

## How It Works

### Step 1 - Discover

Use `explore` to find the right endpoint before calling `xquik`. This avoids guessing at paths and surfaces the correct parameter names.

```
explore({ query: "search tweets by keyword" })
```

### Step 2 - Execute

Call `xquik` with the endpoint and parameters returned by `explore`.

```
xquik({
  endpoint: "/tweets/search",
  params: { query: "open source AI", max_results: 20 }
})
```

### Step 3 - Iterate

If pagination is available (the response includes a `next_cursor` or similar field), pass it back to `xquik` in the next call. Check the `explore` output for pagination parameters.

---

## Examples

### Search Recent Tweets

```
explore({ query: "search tweets" })
// → /tweets/search  params: query, max_results, since_id, until_id

xquik({
  endpoint: "/tweets/search",
  params: { query: "claude code -is:retweet", max_results: 50 }
})
```

### Look Up a User Profile

```
explore({ query: "user profile by username" })
// → /users/lookup  params: username

xquik({
  endpoint: "/users/lookup",
  params: { username: "affaanmustafa" }
})
```

### Get a User's Followers

```
explore({ query: "get followers list" })
// → /users/followers  params: user_id, max_results, cursor

xquik({
  endpoint: "/users/followers",
  params: { user_id: "12345", max_results: 100 }
})
```

### Extract Engagement From a Tweet (for Giveaway)

```
explore({ query: "tweet retweets likers engagers" })
// → /tweets/engagers  params: tweet_id

xquik({
  endpoint: "/tweets/engagers",
  params: { tweet_id: "1234567890" }
})
```

### Post a Tweet

```
explore({ query: "post create tweet" })
// → /tweets/create  params: text, media_ids

xquik({
  endpoint: "/tweets/create",
  params: { text: "Hello from Claude Code via Xquik MCP" }
})
```

### Query Trending Topics

```
explore({ query: "trending topics trends" })
// → /trends  params: country_code

xquik({
  endpoint: "/trends",
  params: { country_code: "US" }
})
```

---

## Anti-Patterns

**Do not hardcode API keys.**

```json
// Wrong - exposes key in committed config
"headers": { "Authorization": "Bearer xq_abc123live" }
```

Use an environment variable reference or a secrets manager. Never commit API keys to version control. The `~/.claude.json` config is user-local and gitignored - store keys there, but treat them with the same care as any credential.

**Do not poll when webhooks are available.**

Use `explore({ query: "webhooks" })` to find the webhook registration endpoint. Set up a webhook for account events rather than calling a timeline endpoint on an interval.

**Do not call `xquik` without exploring first.**

Guessing endpoint paths wastes credits on 404 responses. Always run `explore` when the correct path is unknown.

**Do not concatenate user input directly into the `query` parameter without review.**

The `query` field on search endpoints passes through to X's search syntax. Validate that the resulting query matches the user's intent before executing.

---

## Endpoint Categories

These are the major functional areas. Use `explore` to enumerate endpoints within each:

| Category | Example queries |
|----------|----------------|
| Tweets | search, lookup by ID, create, delete, like, retweet |
| Users | profile lookup, followers, following, blocks, mutes |
| Extraction | engagers, retweeters, likers, reply authors |
| Monitoring | account monitors, alert configuration |
| Draws | giveaway draw logic, winner selection, result archiving |
| Webhooks | register, list, delete, test delivery |
| Trends | trending topics by region |

---

## Related Skills

- `x-api` - Direct X API integration (OAuth, raw HTTP, no MCP)
- `mcp-server-patterns` - How to build or configure MCP servers
- `content-engine` - Generate platform-native content for X posts
