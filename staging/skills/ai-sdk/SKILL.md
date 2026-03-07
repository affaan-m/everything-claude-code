---
name: ai-sdk
description: Answer questions about the AI SDK and help build AI-powered features. Use when developers ask about AI SDK functions like generateText, streamText, ToolLoopAgent, embed, or tools; want to build AI agents, chatbots, RAG systems, or text generation features; have questions about AI providers, streaming, tool calling, structured output, or embeddings; or use React hooks like useChat or useCompletion.
use-when: Building AI-powered features, agent harnesses, chatbots, or anything using the Vercel AI SDK
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebFetch
---

# AI SDK Reference

Current stable API for building AI agents and features with the Vercel AI SDK.

---

## Model Selection

Use Haiku/Flash for classification, extraction, and simple tool calls. Use Sonnet for general coding and chat. Reserve Opus for complex multi-step reasoning. The AI Gateway model list endpoint can help discover available models.

---

## Core Functions

### generateText — Single LLM call
```typescript
import { generateText } from 'ai';

const { text, toolCalls, toolResults, usage } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Explain quantum computing in one paragraph.',
});
```

### streamText — Streaming LLM call
```typescript
import { streamText } from 'ai';

const result = streamText({
  model: 'anthropic/claude-sonnet-4-5',
  prompt: 'Write a haiku about TypeScript.',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### Structured output with `Output`
```typescript
import { generateText, Output } from 'ai';
import { z } from 'zod';

const { output } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number(),
      interests: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a fictional user profile.',
});
```

---

## Tools

Define tools the model can call:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  execute: async ({ location }) => {
    const data = await fetchWeather(location);
    return { temperature: data.temp, condition: data.condition };
  },
});
```

Use with generateText/streamText:
```typescript
const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4-5',
  tools: { weather: weatherTool },
  stopWhen: stepCountIs(5),
  prompt: 'What is the weather in Tokyo?',
});
```

---

## ToolLoopAgent — Agent with tool loop

The primary agent primitive. Runs a model in a loop, calling tools until done.

```typescript
import { ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';

const agent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4-5',
  instructions: 'You are a helpful research assistant.',
  tools: {
    search: searchTool,
    readFile: readFileTool,
  },
});

// One-shot
const result = await agent.generate({ prompt: 'Summarize the Q4 report.' });
// Use result.text — contains the agent's final response

// Streaming
const stream = await agent.stream({ prompt: 'Summarize the Q4 report.' });
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
```

### Type-safe UI messages
```typescript
import { ToolLoopAgent, InferAgentUIMessage } from 'ai';

export const myAgent = new ToolLoopAgent({ /* config */ });
export type MyAgentMessage = InferAgentUIMessage<typeof myAgent>;
```

---

## Subagents — Delegating work to child agents

**When to use subagents:**
- Tasks consume massive token volumes (research, exploration, code analysis)
- Multiple independent tasks can run in parallel
- Main agent's context would exceed manageable limits
- You need capability-based isolation (different tools per task)

**When NOT to use subagents:**
- Simple, focused tasks where sequential processing works
- Context is already manageable
- You need human approval gates (subagent tools cannot use `needsApproval`)

### Basic pattern: Define subagent, expose as tool

```typescript
import { ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';

// 1. Define subagent with its own model, instructions, tools, and context
const researchSubagent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4-5',
  instructions: `You are a research agent. Complete the task autonomously.

IMPORTANT: When finished, write a clear summary of your findings as your final response.
This summary will be returned to the main agent, so include all relevant information.`,
  tools: {
    read: readFileTool,
    search: searchTool,
  },
});

// 2. Wrap as a tool the parent can call
const researchTool = tool({
  description: 'Research a topic or question in depth.',
  inputSchema: z.object({
    task: z.string().describe('The research task to complete'),
  }),
  execute: async ({ task }, { abortSignal }) => {
    const result = await researchSubagent.generate({
      prompt: task,
      abortSignal,
    });
    return result.text;
  },
});

// 3. Give to the main agent
const mainAgent = new ToolLoopAgent({
  model: 'anthropic/claude-sonnet-4-5',
  instructions: 'You are a helpful assistant that can delegate research tasks.',
  tools: {
    research: researchTool,
  },
});
```

**Key**: Each subagent invocation starts with a fresh context window. No context bleeding between calls.

### Context isolation with toModelOutput

The critical feature: decouple what the **UI sees** (full subagent stream) from what the **parent model sees** (a summary). A 100k-token exploration becomes a concise summary for the parent.

```typescript
const researchTool = tool({
  description: 'Research a topic or question in depth.',
  inputSchema: z.object({
    task: z.string().describe('The research task to complete'),
  }),
  execute: async function* ({ task }, { abortSignal }) {
    const result = await researchSubagent.stream({
      prompt: task,
      abortSignal,
    });

    // Yield streaming updates to the UI
    for await (const message of readUIMessageStream({
      stream: result.toUIMessageStream(),
    })) {
      yield message; // Each yield replaces previous (not append)
    }
  },
  // Control what the parent model sees
  toModelOutput: ({ output: message }) => {
    const lastTextPart = message?.parts.findLast(p => p.type === 'text');
    return {
      type: 'text',
      value: lastTextPart?.text ?? 'Task completed.',
    };
  },
});
```

**Result**: Users see the full subagent execution stream. The parent model sees only the final summary text. Context stays clean.

### Sharing parent context with subagent (use sparingly)

```typescript
execute: async ({ task }, { abortSignal, messages }) => {
  const result = await researchSubagent.generate({
    messages: [
      ...messages, // Main agent's conversation history
      { role: 'user', content: task },
    ],
    abortSignal,
  });
  return result.text;
},
```

Passing full history defeats context isolation. Only use when the subagent truly needs conversation context.

### Cancellation

Always propagate `abortSignal` to subagents:

```typescript
execute: async ({ task }, { abortSignal }) => {
  const result = await researchSubagent.generate({
    prompt: task,
    abortSignal, // Propagates cancellation
  });
  return result.text;
},
```

For incomplete tool calls after abort:
```typescript
import { convertToModelMessages } from 'ai';

const modelMessages = await convertToModelMessages(messages, {
  ignoreIncompleteToolCalls: true,
});
```

### Subagent limitations
- **No needsApproval**: Subagent tools execute automatically. Put approval gates on the parent agent's tools instead.
- **Streaming adds complexity**: Start with the basic pattern (no streaming). Only add streaming when UI progress justifies it.
- **Cost**: Each subagent invocation is a separate LLM call loop. More capable = more API spend. Tradeoff is coherence vs cost.

---

## React Hooks — useChat

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}:{' '}
          {m.parts.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.text}</span>;
            return null;
          })}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>
    </div>
  );
}
```

### Rendering subagent tool parts

Detect streaming vs completion state for subagent tools:

```typescript
message.parts.map((part, i) => {
  if (part.type === 'tool-research') {
    const hasOutput = part.state === 'output-available';
    const isStreaming = hasOutput && part.preliminary === true;
    const isComplete = hasOutput && !part.preliminary;

    return (
      <div key={i}>
        {part.state !== 'input-streaming' && (
          <div>Researching: {part.input.task}</div>
        )}
        {hasOutput && (
          <div>
            {part.output.parts
              .filter(p => p.type === 'text')
              .map((p, j) => <p key={j}>{p.text}</p>)}
          </div>
        )}
        {isStreaming && <span>Working...</span>}
      </div>
    );
  }
});
```

**Tool part states:**
| State | Meaning |
|-------|---------|
| `input-streaming` | Tool input being generated by model |
| `input-available` | Tool ready to execute |
| `output-available` | Tool produced output |
| `output-error` | Tool execution failed |

---

## Providers

```typescript
// Anthropic
import { anthropic } from '@ai-sdk/anthropic';
const model = anthropic('claude-sonnet-4-5');

// OpenAI
import { openai } from '@ai-sdk/openai';
const model = openai('gpt-4o');

// Google
import { google } from '@ai-sdk/google';
const model = google('gemini-2.0-flash');

// OpenRouter (multi-provider)
import { openrouter } from '@openrouter/ai-sdk-provider';
const model = openrouter('anthropic/claude-sonnet-4-5');
```

---

## Agent Architecture Patterns

### Single agent (most tasks)
```
User -> ToolLoopAgent (model + tools) -> Response
```

### Subagent delegation (context-heavy tasks)
```
User -> MainAgent
          ├── researchTool -> ResearchSubagent (own context)
          ├── codeTool -> CodeSubagent (own context)
          └── direct response

Each subagent: burns its own tokens, returns summary via toModelOutput
Parent agent: sees only summaries, context stays clean
```

### Parallel subagents (independent research)
```
User -> MainAgent
          ├── research("topic A") -> SubagentA (parallel)
          ├── research("topic B") -> SubagentB (parallel)
          └── synthesize summaries from both
```

The model decides when to call tools in parallel. Give it instructions like:
```
When researching multiple topics, delegate each to a separate research call
so they can run simultaneously.
```

---

## Quick Reference

| Task | Function | Key Options |
|------|----------|-------------|
| Single LLM call | `generateText()` | `model`, `prompt`, `tools` |
| Streaming call | `streamText()` | `model`, `prompt`, `tools` |
| Structured output | `generateText()` + `Output` | `model`, `output`, `prompt` |
| Agent loop | `new ToolLoopAgent()` | `model`, `instructions`, `tools` |
| Define tool | `tool()` | `description`, `inputSchema`, `execute` |
| Subagent | `ToolLoopAgent` as `tool()` | `toModelOutput` for context isolation |
| React chat | `useChat()` | `api`, `messages`, `input` |
| Embeddings | `embed()` / `embedMany()` | `model`, `value(s)` |
