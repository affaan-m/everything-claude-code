---
name: openrouter-typescript-sdk
description: Complete reference for integrating with 300+ AI models through the OpenRouter TypeScript SDK using the callModel pattern
version: 1.0.0
---

# OpenRouter TypeScript SDK

TypeScript SDK for OpenRouter's unified API -- access 300+ AI models through a single, type-safe interface using the `callModel` pattern.

> Detailed reference (message shapes, event shapes, OAuth, format conversion): [reference/api-reference.md](reference/api-reference.md)

---

## Setup

```bash
npm install @openrouter/sdk
```

```typescript
import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY  // from openrouter.ai/settings/keys
});
```

---

## callModel: Basic Usage

```typescript
const result = client.callModel({
  model: 'openai/gpt-5-nano',
  input: 'Explain quantum computing in one sentence.',
});

const text = await result.getText();
```

### Input Formats

`input` accepts a **string** (becomes user message), **message array** (multi-turn), or **multimodal content**:

```typescript
// Multi-turn conversation
input: [
  { role: 'user', content: 'What is the capital of France?' },
  { role: 'assistant', content: 'The capital of France is Paris.' },
  { role: 'user', content: 'What is its population?' }
]

// Multimodal (images + text)
input: [{ role: 'user', content: [
  { type: 'text', text: 'What is in this image?' },
  { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
]}]
```

**System instructions** via `instructions` parameter:

```typescript
client.callModel({
  model: 'openai/gpt-5-nano',
  instructions: 'You are a helpful coding assistant. Be concise.',
  input: 'How do I reverse a string in Python?'
});
```

---

## Response Methods

| Method | Purpose |
|--------|---------|
| `getText()` | Complete text after all tools finish |
| `getResponse()` | Full response with token usage (`response.text`, `response.usage`) |
| `getTextStream()` | Stream text deltas |
| `getReasoningStream()` | Stream reasoning tokens (o1/reasoning models) |
| `getToolCallsStream()` | Stream tool calls as they complete |

```typescript
const text = await result.getText();
const response = await result.getResponse();  // .text, .usage
for await (const delta of result.getTextStream()) process.stdout.write(delta);
```

---

## Tools

Define tools with Zod schemas for validation and type inference. The SDK auto-executes tools and continues the conversation:

```typescript
import { tool } from '@openrouter/sdk';
import { z } from 'zod';

const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius')
  }),
  outputSchema: z.object({ temperature: z.number(), conditions: z.string() }),
  execute: async ({ location, units }) => ({ temperature: 22, conditions: 'Sunny' })
});

const result = client.callModel({
  model: 'openai/gpt-5-nano',
  input: 'What is the weather in Paris?',
  tools: [weatherTool]
});
const text = await result.getText();
```

### Tool Variants

**Generator tools** yield progress events via `eventSchema` and `async function*`:

```typescript
tool({
  name: 'web_search',
  inputSchema: z.object({ query: z.string() }),
  eventSchema: z.object({ type: z.literal('progress'), message: z.string() }),
  outputSchema: z.object({ results: z.array(z.string()) }),
  execute: async function* ({ query }) {
    yield { type: 'progress', message: 'Searching...' };
    return { results: ['Result 1', 'Result 2'] };
  }
});
```

**Manual tools** -- set `execute: false` to handle tool calls yourself.

---

## Stop Conditions

Control automatic tool execution loops with built-in or custom conditions:

```typescript
import { stepCountIs, maxCost, hasToolCall } from '@openrouter/sdk';

stopWhen: [
  stepCountIs(10),      // Stop after 10 turns
  maxCost(1.00),        // Stop if cost exceeds $1.00
  hasToolCall('finish') // Stop when 'finish' tool is called
]

// Custom: any function (context) => boolean
stopWhen: (ctx) => ctx.messages.length > 20
```

---

## Streaming

```typescript
// Stream text deltas
for await (const delta of result.getTextStream()) {
  process.stdout.write(delta);
}

// Stream tool calls
for await (const toolCall of result.getToolCallsStream()) {
  console.log(`Tool: ${toolCall.name}`, toolCall.arguments, toolCall.result);
}

// Multiple consumers work concurrently on the same result object
const [, response] = await Promise.all([
  (async () => { for await (const d of result.getTextStream()) process.stdout.write(d); })(),
  result.getResponse()
]);
```

---

## Error Handling

Errors expose `error.statusCode`: **401** (bad key), **402** (no credits), **429** (rate limit), **500/503** (server/model down).

```typescript
try {
  await client.callModel({ model: 'openai/gpt-5-nano', input: 'Hello!' }).getText();
} catch (error) {
  if (error.statusCode === 429 || error.statusCode >= 500) {
    // Retry with exponential backoff: sleep(2^attempt * 1000ms)
  }
  throw error;
}
```

---

## Complete Example: Agent Loop

```typescript
import OpenRouter, { tool, stepCountIs, hasToolCall } from '@openrouter/sdk';
import { z } from 'zod';

const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const searchTool = tool({
  name: 'web_search',
  description: 'Search the web',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => ({ results: ['Result 1', 'Result 2'] })
});

const finishTool = tool({
  name: 'finish',
  description: 'Complete with final answer',
  inputSchema: z.object({ answer: z.string() }),
  execute: async ({ answer }) => ({ answer })
});

const result = client.callModel({
  model: 'openai/gpt-5-nano',
  instructions: 'Research assistant. Use web_search, then finish.',
  input: 'Latest quantum computing developments?',
  tools: [searchTool, finishTool],
  stopWhen: [stepCountIs(10), hasToolCall('finish')]
});

for await (const tc of result.getToolCallsStream()) {
  console.log(`[${tc.name}]`, tc.arguments);
}
console.log(await result.getText());
```

---

## Best Practices

1. **Use `callModel` over direct API calls** -- automatic tool execution, type safety, multi-turn handling
2. **Use Zod for tool schemas** -- runtime validation + TypeScript inference
3. **Always set stop conditions** -- prevent runaway costs: `stopWhen: [stepCountIs(20), maxCost(5.00)]`
4. **Use streaming for long responses** -- better UX, enables early termination
5. **Handle errors with retry logic** -- exponential backoff for 429/5xx

---

## Reference

For detailed docs on OAuth, message shapes, event shapes, format conversion, dynamic parameters, and client methods, see [reference/api-reference.md](reference/api-reference.md).

- **API Keys**: [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)
- **Model List**: [openrouter.ai/models](https://openrouter.ai/models)
- **GitHub**: [github.com/OpenRouterTeam/typescript-sdk](https://github.com/OpenRouterTeam/typescript-sdk)
