---
title: Common Errors
description: Reference for common AI SDK errors and how to resolve them.
---

# Common Errors

## `maxTokens` → `maxOutputTokens`

```typescript
// ❌ Incorrect
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  maxTokens: 512, // deprecated: use `maxOutputTokens` instead
  prompt: 'Write a short story',
});

// ✅ Correct
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  maxOutputTokens: 512,
  prompt: 'Write a short story',
});
```

## `maxSteps` → `stopWhen: stepCountIs(n)`

```typescript
// ❌ Incorrect
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  tools: { weather },
  maxSteps: 5, // deprecated: use `stopWhen: stepCountIs(n)` instead
  prompt: 'What is the weather in NYC?',
});

// ✅ Correct
import { generateText, stepCountIs } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  tools: { weather },
  stopWhen: stepCountIs(5),
  prompt: 'What is the weather in NYC?',
});
```

## `parameters` → `inputSchema` (in tool definition)

```typescript
// ❌ Incorrect
const weatherTool = tool({
  description: 'Get weather for a location',
  parameters: z.object({
    // deprecated: use `inputSchema` instead
    location: z.string(),
  }),
  execute: async ({ location }) => ({ location, temp: 72 }),
});

// ✅ Correct
const weatherTool = tool({
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => ({ location, temp: 72 }),
});
```

## `generateObject` → `generateText` with `output`

`generateObject` is deprecated. Use `generateText` with the `output` option instead.

```typescript
// ❌ Deprecated
import { generateObject } from 'ai'; // deprecated: use `generateText` with `output` instead

const result = await generateObject({
  // deprecated function
  model: 'anthropic/claude-opus-4.5',
  schema: z.object({
    // deprecated: use `Output.object({ schema })` instead
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a recipe for chocolate cake',
});

// ✅ Correct
import { generateText, Output } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  output: Output.object({
    schema: z.object({
      recipe: z.object({
        name: z.string(),
        ingredients: z.array(z.string()),
      }),
    }),
  }),
  prompt: 'Generate a recipe for chocolate cake',
});

console.log(result.output); // typed object
```

## Manual JSON parsing → `generateText` with `output`

```typescript
// ❌ Incorrect
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  prompt: `Extract the user info as JSON: { "name": string, "age": number }

  Input: John is 25 years old`,
});
const parsed = JSON.parse(result.text);

// ✅ Correct
import { generateText, Output } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }),
  prompt: 'Extract the user info: John is 25 years old',
});

console.log(result.output); // { name: 'John', age: 25 }
```

## Other `output` options

```typescript
// Output.array - for generating arrays of items
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  output: Output.array({
    element: z.object({
      city: z.string(),
      country: z.string(),
    }),
  }),
  prompt: 'List 5 capital cities',
});

// Output.choice - for selecting from predefined options
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  output: Output.choice({
    options: ['positive', 'negative', 'neutral'] as const,
  }),
  prompt: 'Classify the sentiment: I love this product!',
});

// Output.json - for untyped JSON output
const result = await generateText({
  model: 'anthropic/claude-opus-4.5',
  output: Output.json(),
  prompt: 'Return some JSON data',
});
```

## `toDataStreamResponse` → `toUIMessageStreamResponse`

When using `useChat` on the frontend, use `toUIMessageStreamResponse()` instead of `toDataStreamResponse()`. The UI message stream format is designed to work with the chat UI components and handles message state correctly.

```typescript
// ❌ Incorrect (when using useChat)
const result = streamText({
  // config
});

return result.toDataStreamResponse(); // deprecated for useChat: use toUIMessageStreamResponse

// ✅ Correct
const result = streamText({
  // config
});

return result.toUIMessageStreamResponse();
```

## Removed managed input state in `useChat`

The `useChat` hook no longer manages input state internally. You must now manage input state manually.

```tsx
// ❌ Deprecated
import { useChat } from '@ai-sdk/react';

export default function Page() {
  const {
    input, // deprecated: manage input state manually with useState
    handleInputChange, // deprecated: use custom onChange handler
    handleSubmit, // deprecated: use sendMessage() instead
  } = useChat({
    api: '/api/chat', // deprecated: use `transport: new DefaultChatTransport({ api })` instead
  });

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit">Send</button>
    </form>
  );
}

// ✅ Correct
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');
  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = e => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
```

## `tool-invocation` → `tool-{toolName}` (typed tool parts)

When rendering messages with `useChat`, use the typed tool part names (`tool-{toolName}`) instead of the generic `tool-invocation` type. This provides better type safety and access to tool-specific input/output types.

> For end-to-end type-safety, see [Type-Safe Agents](type-safe-agents.md).

Typed tool parts also use different property names:

- `part.args` → `part.input`
- `part.result` → `part.output`

```tsx
// ❌ Incorrect - using generic tool-invocation
{
  message.parts.map((part, i) => {
    switch (part.type) {
      case 'text':
        return <div key={`${message.id}-${i}`}>{part.text}</div>;
      case 'tool-invocation': // deprecated: use typed tool parts instead
        return (
          <pre key={`${message.id}-${i}`}>
            {JSON.stringify(part.toolInvocation, null, 2)}
          </pre>
        );
    }
  });
}

// ✅ Correct - using typed tool parts (recommended)
{
  message.parts.map(part => {
    switch (part.type) {
      case 'text':
        return part.text;
      case 'tool-askForConfirmation':
        // handle askForConfirmation tool
        break;
      case 'tool-getWeatherInformation':
        // handle getWeatherInformation tool
        break;
    }
  });
}

// ✅ Alternative - using isToolUIPart as a catch-all
import { isToolUIPart } from 'ai';

{
  message.parts.map(part => {
    if (part.type === 'text') {
      return part.text;
    }
    if (isToolUIPart(part)) {
      // handle any tool part generically
      return (
        <div key={part.toolCallId}>
          {part.toolName}: {part.state}
        </div>
      );
    }
  });
}
```

## `useChat` state-dependent property access

Tool part properties are only available in certain states. TypeScript will error if you access them without checking state first.

```tsx
// ❌ Incorrect - input may be undefined during streaming
// TS18048: 'part.input' is possibly 'undefined'
if (part.type === 'tool-getWeather') {
  const location = part.input.location;
}

// ✅ Correct - check for input-available or output-available
if (
  part.type === 'tool-getWeather' &&
  (part.state === 'input-available' || part.state === 'output-available')
) {
  const location = part.input.location;
}

// ❌ Incorrect - output is only available after execution
// TS18048: 'part.output' is possibly 'undefined'
if (part.type === 'tool-getWeather') {
  const weather = part.output;
}

// ✅ Correct - check for output-available
if (part.type === 'tool-getWeather' && part.state === 'output-available') {
  const location = part.input.location;
  const weather = part.output;
}
```

## `part.toolInvocation.args` → `part.input`

```tsx
// ❌ Incorrect
if (part.type === 'tool-invocation') {
  // deprecated: use `part.input` on typed tool parts instead
  const location = part.toolInvocation.args.location;
}

// ✅ Correct
if (
  part.type === 'tool-getWeather' &&
  (part.state === 'input-available' || part.state === 'output-available')
) {
  const location = part.input.location;
}
```

## `part.toolInvocation.result` → `part.output`

```tsx
// ❌ Incorrect
if (part.type === 'tool-invocation') {
  // deprecated: use `part.output` on typed tool parts instead
  const weather = part.toolInvocation.result;
}

// ✅ Correct
if (part.type === 'tool-getWeather' && part.state === 'output-available') {
  const weather = part.output;
}
```

## `part.toolInvocation.toolCallId` → `part.toolCallId`

```tsx
// ❌ Incorrect
if (part.type === 'tool-invocation') {
  // deprecated: use `part.toolCallId` on typed tool parts instead
  const id = part.toolInvocation.toolCallId;
}

// ✅ Correct
if (part.type === 'tool-getWeather') {
  const id = part.toolCallId;
}
```

## Tool invocation states renamed

```tsx
// ❌ Incorrect
switch (part.toolInvocation.state) {
  case 'partial-call': // deprecated: use `input-streaming` instead
    return <div>Loading...</div>;
  case 'call': // deprecated: use `input-available` instead
    return <div>Executing...</div>;
  case 'result': // deprecated: use `output-available` instead
    return <div>Done</div>;
}

// ✅ Correct
switch (part.state) {
  case 'input-streaming':
    return <div>Loading...</div>;
  case 'input-available':
    return <div>Executing...</div>;
  case 'output-available':
    return <div>Done</div>;
}
```

## `addToolResult` → `addToolOutput`

```tsx
// ❌ Incorrect
addToolResult({
  // deprecated: use `addToolOutput` instead
  toolCallId: part.toolInvocation.toolCallId,
  result: 'Yes, confirmed.', // deprecated: use `output` instead
});

// ✅ Correct
addToolOutput({
  tool: 'askForConfirmation',
  toolCallId: part.toolCallId,
  output: 'Yes, confirmed.',
});
```

## `messages` → `uiMessages` in `createAgentUIStreamResponse`

```typescript
// ❌ Incorrect
return createAgentUIStreamResponse({
  agent: myAgent,
  messages, // incorrect: use `uiMessages` instead
});

// ✅ Correct
return createAgentUIStreamResponse({
  agent: myAgent,
  uiMessages: messages,
});
```
