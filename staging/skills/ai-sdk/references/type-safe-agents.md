---
title: Type-Safe useChat with Agents
description: Build end-to-end type-safe agents by inferring UIMessage types from your agent definition.
---

# Type-Safe useChat with Agents

Build end-to-end type-safe agents by inferring `UIMessage` types from your agent definition for type-safe UI rendering with `useChat`.

## Recommended Structure

```
lib/
  agents/
    my-agent.ts       # Agent definition + type export
  tools/
    weather-tool.ts   # Individual tool definitions
    calculator-tool.ts
```

## Define Tools

```ts
// lib/tools/weather-tool.ts
import { tool } from 'ai';
import { z } from 'zod';

export const weatherTool = tool({
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  execute: async ({ location }) => {
    return { temperature: 72, condition: 'sunny', location };
  },
});
```

## Define Agent and Export Type

```ts
// lib/agents/my-agent.ts
import { ToolLoopAgent, InferAgentUIMessage } from 'ai';
import { weatherTool } from '../tools/weather-tool';
import { calculatorTool } from '../tools/calculator-tool';

export const myAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4',
  instructions: 'You are a helpful assistant.',
  tools: {
    weather: weatherTool,
    calculator: calculatorTool,
  },
});

// Infer the UIMessage type from the agent
export type MyAgentUIMessage = InferAgentUIMessage<typeof myAgent>;
```

### With Custom Metadata

```ts
// lib/agents/my-agent.ts
import { z } from 'zod';

const metadataSchema = z.object({
  createdAt: z.number(),
  model: z.string().optional(),
});

type MyMetadata = z.infer<typeof metadataSchema>;

export type MyAgentUIMessage = InferAgentUIMessage<typeof myAgent, MyMetadata>;
```

## Use with `useChat`

```tsx
// app/chat.tsx
import { useChat } from '@ai-sdk/react';
import type { MyAgentUIMessage } from '@/lib/agents/my-agent';

export function Chat() {
  const { messages } = useChat<MyAgentUIMessage>();

  return (
    <div>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
}
```

## Rendering Parts with Type Safety

Tool parts are typed as `tool-{toolName}` based on your agent's tools:

```tsx
function Message({ message }: { message: MyAgentUIMessage }) {
  return (
    <div>
      {message.parts.map((part, i) => {
        switch (part.type) {
          case 'text':
            return <p key={i}>{part.text}</p>;

          case 'tool-weather':
            // part.input and part.output are fully typed
            if (part.state === 'output-available') {
              return (
                <div key={i}>
                  Weather in {part.input.location}: {part.output.temperature}F
                </div>
              );
            }
            return <div key={i}>Loading weather...</div>;

          case 'tool-calculator':
            // TypeScript knows this is the calculator tool
            return <div key={i}>Calculating...</div>;

          default:
            return null;
        }
      })}
    </div>
  );
}
```

The `part.type` discriminant narrows the type, giving you autocomplete and type checking for `input` and `output` based on each tool's schema.

## Splitting Tool Rendering into Components

When rendering many tools, you may want to split each tool into its own component. Use `UIToolInvocation<TOOL>` to derive a typed invocation from your tool and export it alongside the tool definition:

```ts
// lib/tools/weather-tool.ts
import { tool, UIToolInvocation } from 'ai';
import { z } from 'zod';

export const weatherTool = tool({
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  execute: async ({ location }) => {
    return { temperature: 72, condition: 'sunny', location };
  },
});

// Export the invocation type for use in UI components
export type WeatherToolInvocation = UIToolInvocation<typeof weatherTool>;
```

Then import only the type in your component:

```tsx
// components/weather-tool.tsx
import type { WeatherToolInvocation } from '@/lib/tools/weather-tool';

export function WeatherToolComponent({
  invocation,
}: {
  invocation: WeatherToolInvocation;
}) {
  // invocation.input and invocation.output are fully typed
  if (invocation.state === 'output-available') {
    return (
      <div>
        Weather in {invocation.input.location}: {invocation.output.temperature}F
      </div>
    );
  }
  return <div>Loading weather for {invocation.input?.location}...</div>;
}
```

Use the component in your message renderer:

```tsx
function Message({ message }: { message: MyAgentUIMessage }) {
  return (
    <div>
      {message.parts.map((part, i) => {
        switch (part.type) {
          case 'text':
            return <p key={i}>{part.text}</p>;
          case 'tool-weather':
            return <WeatherToolComponent key={i} invocation={part} />;
          case 'tool-calculator':
            return <CalculatorToolComponent key={i} invocation={part} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
```

This approach keeps your tool rendering logic organized while maintaining full type safety, without needing to import the tool implementation into your UI components.
