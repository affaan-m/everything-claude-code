# OpenRouter TypeScript SDK - API Reference

Detailed reference material for the OpenRouter TypeScript SDK. For everyday usage patterns, see [SKILL.md](../SKILL.md).

---

## Authentication: OAuth PKCE Flow

For user-facing applications where users control their own API keys. Users generate API keys through a browser authorization flow without your application handling their credentials.

### createAuthCode

Generate an authorization code and URL to start the OAuth flow:

```typescript
const authResponse = await client.oAuth.createAuthCode({
  callbackUrl: 'https://myapp.com/auth/callback'
});

// authResponse contains:
// - authorizationUrl: URL to redirect the user to
// - code: The authorization code for later exchange

console.log('Redirect user to:', authResponse.authorizationUrl);
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `callbackUrl` | `string` | Yes | Your application's callback URL after user authorization |

**Browser Redirect:**

```typescript
// In a browser environment
window.location.href = authResponse.authorizationUrl;

// Or in a server-rendered app, return a redirect response
res.redirect(authResponse.authorizationUrl);
```

### exchangeAuthCodeForAPIKey

After the user authorizes your application, they are redirected back to your callback URL with an authorization code. Exchange this code for an API key:

```typescript
// In your callback handler
const code = req.query.code;  // From the redirect URL

const apiKeyResponse = await client.oAuth.exchangeAuthCodeForAPIKey({
  code: code
});

// apiKeyResponse contains:
// - key: The user's API key
// - Additional metadata about the key

const userApiKey = apiKeyResponse.key;

// Store securely for this user's future requests
await saveUserApiKey(userId, userApiKey);
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | `string` | Yes | The authorization code from the OAuth redirect |

### Complete OAuth Flow Example

```typescript
import OpenRouter from '@openrouter/sdk';
import express from 'express';

const app = express();
const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY  // Your app's key for OAuth operations
});

// Step 1: Initiate OAuth flow
app.get('/auth/start', async (req, res) => {
  const authResponse = await client.oAuth.createAuthCode({
    callbackUrl: 'https://myapp.com/auth/callback'
  });

  // Store any state needed for the callback
  req.session.oauthState = { /* ... */ };

  // Redirect user to OpenRouter authorization page
  res.redirect(authResponse.authorizationUrl);
});

// Step 2: Handle callback and exchange code
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const apiKeyResponse = await client.oAuth.exchangeAuthCodeForAPIKey({
      code: code as string
    });

    // Store the user's API key securely
    await saveUserApiKey(req.session.userId, apiKeyResponse.key);

    res.redirect('/dashboard?auth=success');
  } catch (error) {
    console.error('OAuth exchange failed:', error);
    res.redirect('/auth/error');
  }
});

// Step 3: Use the user's API key for their requests
app.post('/api/chat', async (req, res) => {
  const userApiKey = await getUserApiKey(req.session.userId);

  // Create a client with the user's key
  const userClient = new OpenRouter({
    apiKey: userApiKey
  });

  const result = userClient.callModel({
    model: 'openai/gpt-5-nano',
    input: req.body.message
  });

  const text = await result.getText();
  res.json({ response: text });
});
```

---

## API Key Management

Programmatically manage API keys:

```typescript
// Get current key metadata
const keyInfo = await client.apiKeys.getCurrentKeyMetadata();
console.log('Key name:', keyInfo.name);
console.log('Created:', keyInfo.createdAt);

// List all keys
const keys = await client.apiKeys.list();

// Create a new key
const newKey = await client.apiKeys.create({
  name: 'Production API Key'
});

// Get a specific key by hash
const key = await client.apiKeys.get({
  hash: 'sk-or-v1-...'
});

// Update a key
await client.apiKeys.update({
  hash: 'sk-or-v1-...',
  requestBody: {
    name: 'Updated Key Name'
  }
});

// Delete a key
await client.apiKeys.delete({
  hash: 'sk-or-v1-...'
});
```

### Security Best Practices

1. **Environment Variables**: Store API keys in environment variables, never in code
2. **Key Rotation**: Rotate keys periodically using the key management API
3. **Environment Separation**: Use different keys for development, staging, and production
4. **OAuth for Users**: Use the OAuth PKCE flow for user-facing apps to avoid handling user credentials
5. **Secure Storage**: Store user API keys encrypted in your database
6. **Minimal Scope**: Create keys with only the permissions needed

---

## Format Conversion

Convert between ecosystem formats for interoperability:

### OpenAI Format

```typescript
import { fromChatMessages, toChatMessage } from '@openrouter/sdk';

// OpenAI messages -> OpenRouter format
const result = client.callModel({
  model: 'openai/gpt-5-nano',
  input: fromChatMessages(openaiMessages)
});

// Response -> OpenAI chat message format
const response = await result.getResponse();
const chatMsg = toChatMessage(response);
```

### Claude Format

```typescript
import { fromClaudeMessages, toClaudeMessage } from '@openrouter/sdk';

// Claude messages -> OpenRouter format
const result = client.callModel({
  model: 'anthropic/claude-3-opus',
  input: fromClaudeMessages(claudeMessages)
});

// Response -> Claude message format
const response = await result.getResponse();
const claudeMsg = toClaudeMessage(response);
```

---

## Dynamic Parameters

Compute parameters based on conversation context:

```typescript
const result = client.callModel({
  model: (ctx) => ctx.numberOfTurns > 3 ? 'openai/gpt-4' : 'openai/gpt-4o-mini',
  temperature: (ctx) => ctx.numberOfTurns > 1 ? 0.3 : 0.7,
  input: 'Hello!'
});
```

### Context Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `numberOfTurns` | number | Current turn count |
| `messages` | array | All messages so far |
| `instructions` | string | Current system instructions |
| `totalCost` | number | Accumulated cost |

---

## nextTurnParams: Context Injection

Tools can modify parameters for subsequent turns, enabling skills and context-aware behavior:

```typescript
const skillTool = tool({
  name: 'load_skill',
  description: 'Load a specialized skill',
  inputSchema: z.object({
    skill: z.string().describe('Name of the skill to load')
  }),
  nextTurnParams: {
    instructions: (params, context) => {
      const skillInstructions = loadSkillInstructions(params.skill);
      return `${context.instructions}\n\n${skillInstructions}`;
    }
  },
  execute: async ({ skill }) => {
    return { loaded: skill };
  }
});
```

### Use Cases for nextTurnParams

- **Skill Systems**: Dynamically load specialized capabilities
- **Context Accumulation**: Build up context over multiple turns
- **Mode Switching**: Change model behavior mid-conversation
- **Memory Injection**: Add retrieved context to instructions

---

## Generation Parameters

Full list of parameters for controlling model behavior:

```typescript
const result = client.callModel({
  model: 'openai/gpt-5-nano',
  input: 'Write a creative story',
  temperature: 0.7,        // Creativity (0-2, default varies by model)
  maxOutputTokens: 1000,   // Maximum tokens to generate
  topP: 0.9,               // Nucleus sampling parameter
  frequencyPenalty: 0.5,   // Reduce repetition
  presencePenalty: 0.5,    // Encourage new topics
  stop: ['\n\n']           // Stop sequences
});
```

---

## Responses API Message Shapes

The SDK uses the **OpenResponses** format for messages.

### Message Roles

| Role | Description |
|------|-------------|
| `user` | User-provided input |
| `assistant` | Model-generated responses |
| `system` | System instructions |
| `developer` | Developer-level directives |
| `tool` | Tool execution results |

### Text Message

```typescript
interface TextMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

### Multimodal Message (Array Content)

```typescript
interface MultimodalMessage {
  role: 'user';
  content: Array<
    | { type: 'input_text'; text: string }
    | { type: 'input_image'; imageUrl: string; detail?: 'auto' | 'low' | 'high' }
    | {
        type: 'image';
        source: {
          type: 'url' | 'base64';
          url?: string;
          media_type?: string;
          data?: string
        }
      }
  >;
}
```

### Tool Function Call Message

```typescript
interface ToolCallMessage {
  role: 'assistant';
  content?: null;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;  // JSON-encoded arguments
    };
  }>;
}
```

### Tool Result Message

```typescript
interface ToolResultMessage {
  role: 'tool';
  tool_call_id: string;
  content: string;  // JSON-encoded result
}
```

### Non-Streaming Response Structure

```typescript
interface OpenResponsesNonStreamingResponse {
  output: Array<ResponseMessage>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cachedTokens?: number;
  };
  finishReason?: string;
  warnings?: Array<{
    type: string;
    message: string
  }>;
  experimental_providerMetadata?: Record<string, unknown>;
}
```

### Response Message Types

```typescript
// Text/content message
interface ResponseOutputMessage {
  type: 'message';
  role: 'assistant';
  content: string | Array<ContentPart>;
  reasoning?: string;  // For reasoning models (o1, etc.)
}

// Tool result in output
interface FunctionCallOutputMessage {
  type: 'function_call_output';
  call_id: string;
  output: string;
}
```

### Parsed Tool Call

```typescript
interface ParsedToolCall {
  id: string;
  name: string;
  arguments: unknown;  // Validated against inputSchema
}
```

### Tool Execution Result

```typescript
interface ToolExecutionResult {
  toolCallId: string;
  toolName: string;
  result: unknown;                  // Validated against outputSchema
  preliminaryResults?: unknown[];   // From generator tools
  error?: Error;
}
```

### Step Result (for Stop Conditions)

```typescript
interface StepResult {
  stepType: 'initial' | 'continue';
  text: string;
  toolCalls: ParsedToolCall[];
  toolResults: ToolExecutionResult[];
  response: OpenResponsesNonStreamingResponse;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cachedTokens?: number;
  };
  finishReason?: string;
  warnings?: Array<{ type: string; message: string }>;
  experimental_providerMetadata?: Record<string, unknown>;
}
```

### TurnContext

```typescript
interface TurnContext {
  numberOfTurns: number;                     // Turn count (1-indexed)
  turnRequest?: OpenResponsesRequest;        // Current request being made
  toolCall?: OpenResponsesFunctionToolCall;  // Current tool call (in tool context)
}
```

---

## Event Shapes

The SDK provides multiple streaming methods that yield different event types.

### Response Stream Events

The `getFullResponsesStream()` method yields these event types:

```typescript
type EnhancedResponseStreamEvent =
  | ResponseCreatedEvent
  | ResponseInProgressEvent
  | OutputTextDeltaEvent
  | OutputTextDoneEvent
  | ReasoningDeltaEvent
  | ReasoningDoneEvent
  | FunctionCallArgumentsDeltaEvent
  | FunctionCallArgumentsDoneEvent
  | ResponseCompletedEvent
  | ToolPreliminaryResultEvent;
```

### Event Type Reference

| Event Type | Description | Payload |
|------------|-------------|---------|
| `response.created` | Response object initialized | `{ response: ResponseObject }` |
| `response.in_progress` | Generation has started | `{}` |
| `response.output_text.delta` | Text chunk received | `{ delta: string }` |
| `response.output_text.done` | Text generation complete | `{ text: string }` |
| `response.reasoning.delta` | Reasoning chunk (o1 models) | `{ delta: string }` |
| `response.reasoning.done` | Reasoning complete | `{ reasoning: string }` |
| `response.function_call_arguments.delta` | Tool argument chunk | `{ delta: string }` |
| `response.function_call_arguments.done` | Tool arguments complete | `{ arguments: string }` |
| `response.completed` | Full response complete | `{ response: ResponseObject }` |
| `tool.preliminary_result` | Generator tool progress | `{ toolCallId: string; result: unknown }` |

### Event Interfaces

```typescript
interface OutputTextDeltaEvent {
  type: 'response.output_text.delta';
  delta: string;
}

interface ReasoningDeltaEvent {
  type: 'response.reasoning.delta';
  delta: string;
}

interface FunctionCallArgumentsDeltaEvent {
  type: 'response.function_call_arguments.delta';
  delta: string;
}

interface ToolPreliminaryResultEvent {
  type: 'tool.preliminary_result';
  toolCallId: string;
  result: unknown;  // Matches the tool's eventSchema
}

interface ResponseCompletedEvent {
  type: 'response.completed';
  response: OpenResponsesNonStreamingResponse;
}
```

### Tool Stream Events

The `getToolStream()` method yields:

```typescript
type ToolStreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'preliminary_result'; toolCallId: string; result: unknown };
```

### Processing Stream Events Example

```typescript
const result = client.callModel({
  model: 'openai/gpt-5-nano',
  input: 'Analyze this data',
  tools: [analysisTool]
});

for await (const event of result.getFullResponsesStream()) {
  switch (event.type) {
    case 'response.output_text.delta':
      process.stdout.write(event.delta);
      break;

    case 'response.reasoning.delta':
      console.log('[Reasoning]', event.delta);
      break;

    case 'response.function_call_arguments.delta':
      console.log('[Tool Args]', event.delta);
      break;

    case 'tool.preliminary_result':
      console.log(`[Progress: ${event.toolCallId}]`, event.result);
      break;

    case 'response.completed':
      console.log('\n[Complete]', event.response.usage);
      break;
  }
}
```

### Message Stream Events

The `getNewMessagesStream()` yields OpenResponses format updates:

```typescript
type MessageStreamUpdate =
  | ResponsesOutputMessage        // Text/content updates
  | OpenResponsesFunctionCallOutput;  // Tool results
```

### Tracking New Messages Example

```typescript
const result = client.callModel({
  model: 'openai/gpt-5-nano',
  input: 'Research this topic',
  tools: [searchTool]
});

const allMessages: MessageStreamUpdate[] = [];

for await (const message of result.getNewMessagesStream()) {
  allMessages.push(message);

  if (message.type === 'message') {
    console.log('Assistant:', message.content);
  } else if (message.type === 'function_call_output') {
    console.log('Tool result:', message.output);
  }
}
```

---

## Client Methods

Beyond `callModel`, the client provides access to other API endpoints:

```typescript
const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

// List available models
const models = await client.models.list();

// Chat completions (alternative to callModel)
const completion = await client.chat.send({
  model: 'openai/gpt-5-nano',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Legacy completions format
const legacyCompletion = await client.completions.generate({
  model: 'openai/gpt-5-nano',
  prompt: 'Once upon a time'
});

// Usage analytics
const activity = await client.analytics.getUserActivity();

// Credit balance
const credits = await client.credits.getCredits();

// API key management
const keys = await client.apiKeys.list();
```

---

## Additional Resources

- **API Keys**: [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)
- **Model List**: [openrouter.ai/models](https://openrouter.ai/models)
- **GitHub Issues**: [github.com/OpenRouterTeam/typescript-sdk/issues](https://github.com/OpenRouterTeam/typescript-sdk/issues)

---

*SDK Status: Beta - Report issues on GitHub*
