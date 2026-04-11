# Claude Orchestrator

A comprehensive orchestrator agent for managing complex Claude model interactions with task lifecycle management, context optimization, tool coordination, and observability.

## Features

- **Task Lifecycle Management**: Complete orchestration from task analysis to completion
- **Context Window Management**: Automatic token estimation, compaction, and optimization
- **Tool Coordination**: Parallel tool execution with dependency management
- **Response Streaming**: Real-time streaming with progress callbacks
- **Error Recovery**: Intelligent retry logic with exponential backoff and fallback models
- **Rate Limiting**: Configurable rate limiting and quota management
- **Observability**: Comprehensive logging and metrics collection

## Installation

```bash
npm install @anthropic-ai/sdk
```

## Quick Start

```typescript
import { ClaudeOrchestrator, ToolDefinition } from './claude-orchestrator';

const orchestrator = new ClaudeOrchestrator({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultModel: 'claude-sonnet-4-0',
  maxRetries: 3,
  enableStreaming: true
});

// Register tools
const tools: ToolDefinition[] = [
  {
    name: 'read_file',
    description: 'Read file contents',
    input_schema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path']
    }
  }
];

tools.forEach(tool => orchestrator.registerTool(tool));

// Execute a task
const result = await orchestrator.executeTask({
  messages: [{ role: 'user', content: 'Analyze this codebase' }],
  tools
});

console.log('Task completed:', result.success);
```

## Configuration

```typescript
interface OrchestratorConfig {
  apiKey?: string;                    // ANTHROPIC_API_KEY env var
  defaultModel?: string;              // Default Claude model
  maxRetries?: number;                // Max retry attempts (default: 3)
  rateLimitRPM?: number;              // Rate limit per minute (default: 50)
  maxContextTokens?: number;          // Max context tokens (default: 100k)
  enableStreaming?: boolean;          // Enable streaming (default: true)
  enableMetrics?: boolean;           // Enable metrics collection
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  fallbackModels?: string[];          // Fallback models for recovery
}
```

## Task Execution

### Basic Execution

```typescript
const result = await orchestrator.executeTask({
  messages: [
    { role: 'user', content: 'Help me refactor this function' }
  ],
  model: 'claude-sonnet-4-0',
  max_tokens: 4096,
  tools: [/* tool definitions */]
});
```

### Streaming Execution

```typescript
const result = await orchestrator.executeWithStreaming({
  messages: [{ role: 'user', content: 'Analyze this code' }],
  onChunk: (chunk) => {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.content);
    }
  },
  onComplete: (result) => {
    console.log('Completed with', result.usage?.total_tokens, 'tokens');
  }
});
```

## Tool Management

### Registering Tools

```typescript
orchestrator.registerTool({
  name: 'run_command',
  description: 'Execute shell commands',
  input_schema: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'Command to execute' }
    },
    required: ['command']
  }
});
```

### Tool Coordination

The orchestrator automatically:
- Validates tool calls against schemas
- Executes tools in parallel when possible
- Handles tool execution errors gracefully
- Continues conversation with tool results

## Context Management

### Automatic Optimization

- **Token Estimation**: Accurate token counting for messages and tools
- **Context Compaction**: Removes redundant messages when approaching limits
- **Partitioning**: Splits large contexts into manageable chunks

### Manual Control

```typescript
const contextManager = orchestrator.getContextManager();
const shouldCompact = contextManager.shouldCompact(currentContext);
if (shouldCompact) {
  const compacted = contextManager.compactContext(messages);
}
```

## Error Handling

### Automatic Recovery

The orchestrator handles:
- **Rate Limits**: Waits and retries with exponential backoff
- **Token Limits**: Compacts context or switches to fallback models
- **Network Errors**: Retries with backoff
- **API Errors**: Switches models or retries

### Custom Recovery

```typescript
const recoveryManager = orchestrator.getRecoveryManager();
const strategy = recoveryManager.getRecoveryStrategy('rate_limit');
```

## Observability

### Metrics

```typescript
const metrics = orchestrator.getMetrics();
// {
//   tasksCompleted: 10,
//   averageDuration: 2500,
//   totalTokensUsed: 50000,
//   toolSuccessRate: 95,
//   errorBreakdown: { rate_limit: 2, network: 1 }
// }
```

### Logging

Structured JSON logging with configurable levels:
- `debug`: Detailed execution information
- `info`: Task lifecycle events
- `warn`: Retries and warnings
- `error`: Failures and exceptions

### Rate Limiting Status

```typescript
const status = orchestrator.getRateLimitStatus();
// {
//   currentUsage: 45,
//   limit: 50,
//   canMakeRequest: true,
//   nextAvailableIn: 0
// }
```

## Advanced Usage

### Custom Tool Implementation

```typescript
class CustomToolCoordinator extends ToolCoordinator {
  async callToolImplementation(call: ToolCall, tool: ToolDefinition): Promise<string> {
    switch (call.name) {
      case 'my_custom_tool':
        return await myCustomLogic(call.input);
      default:
        return super.callToolImplementation(call, tool);
    }
  }
}
```

### Middleware Pattern

```typescript
class LoggingOrchestrator extends ClaudeOrchestrator {
  async executeTask(request: TaskRequest): Promise<TaskResult> {
    console.log('Starting task:', request.messages[0]?.content);
    const result = await super.executeTask(request);
    console.log('Task completed:', result.success);
    return result;
  }
}
```

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your-api-key-here

# Optional
CLAUDE_ORCHESTRATOR_DEFAULT_MODEL=claude-sonnet-4-0
CLAUDE_ORCHESTRATOR_MAX_RETRIES=3
CLAUDE_ORCHESTRATOR_RATE_LIMIT_RPM=50
CLAUDE_ORCHESTRATOR_MAX_CONTEXT_TOKENS=100000
CLAUDE_ORCHESTRATOR_ENABLE_STREAMING=true
CLAUDE_ORCHESTRATOR_LOG_LEVEL=info
```

## Best Practices

1. **Configure Environment**: Set appropriate rate limits and model fallbacks
2. **Register Tools Early**: Add all tools before task execution
3. **Handle Streaming**: Use streaming for better user experience
4. **Monitor Metrics**: Check metrics regularly for optimization opportunities
5. **Error Boundaries**: Wrap orchestrator calls in try-catch blocks
6. **Resource Cleanup**: Close streams and cleanup resources when done

## API Compatibility

- **Anthropic SDK**: v0.39.0+
- **Node.js**: 18.0.0+
- **TypeScript**: 5.0.0+

## License

MIT