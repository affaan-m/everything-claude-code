---
name: claude-orchestrator
description: Implement Claude orchestrator agent with task lifecycle management, context optimization, tool coordination, and observability. Use Anthropic SDK v1 for reliable Claude model interactions.
origin: ECC
---

# Claude Orchestrator

A comprehensive orchestrator agent for managing complex Claude model interactions with task lifecycle management, context optimization, tool coordination, and observability.

## When to Activate

- Building applications that coordinate multiple Claude API calls
- Implementing agent workflows with complex task routing
- Managing context windows across multiple conversation turns
- Coordinating tool calls and execution across API boundaries
- Building reliable Claude-powered applications with error recovery
- Optimizing token usage and API costs
- Implementing streaming responses with progress tracking

## Core Architecture

### Orchestrator Interface

```typescript
interface ClaudeOrchestrator {
  executeTask(request: TaskRequest): Promise<TaskResult>;
  executeWithStreaming(request: StreamingRequest): Promise<StreamingResult>;
  manageContext(context: ConversationContext): Promise<ContextAction>;
  coordinateTools(calls: ToolCall[]): Promise<ToolResult[]>;
  handleRecovery(error: ClaudeError, context: ExecutionContext): Promise<RecoveryAction>;
}
```

### Task Lifecycle

```typescript
enum TaskState {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  EXECUTING = 'executing',
  STREAMING = 'streaming',
  TOOL_COORDINATING = 'tool_coordinating',
  COMPLETING = 'completing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RECOVERING = 'recovering'
}

interface TaskLifecycle {
  id: string;
  state: TaskState;
  startTime: Date;
  estimatedTokens: number;
  actualTokens: number;
  toolCalls: number;
  retries: number;
  contextCompactions: number;
}
```

## Context Management

### Token Estimation & Limits

```typescript
interface TokenManager {
  estimateTokens(content: string | Message[]): number;
  checkLimits(current: number, model: ClaudeModel): LimitStatus;
  reserveTokens(amount: number): Promise<TokenReservation>;
  releaseTokens(reservation: TokenReservation): void;
}

const MODEL_LIMITS = {
  'claude-opus-4-1': { context: 200000, output: 4096 },
  'claude-sonnet-4-0': { context: 200000, output: 4096 },
  'claude-3-5-haiku-latest': { context: 200000, output: 4096 }
};
```

### Context Compaction

```typescript
interface ContextCompactor {
  shouldCompact(context: ConversationContext): boolean;
  compactMessages(messages: Message[]): Message[];
  preserveImportantContext(messages: Message[]): Message[];
  estimateCompactionSavings(messages: Message[]): number;
}

class IntelligentCompactor implements ContextCompactor {
  shouldCompact(context: ConversationContext): boolean {
    const totalTokens = context.messages.reduce((sum, msg) =>
      sum + this.estimateTokens(msg), 0);
    return totalTokens > context.maxTokens * 0.8;
  }

  compactMessages(messages: Message[]): Message[] {
    // Remove redundant messages
    // Summarize long exchanges
    // Keep recent context
    // Preserve tool call results
  }
}
```

## Tool Coordination

### Tool Registry & Routing

```typescript
interface ToolCoordinator {
  registerTool(tool: ToolDefinition): void;
  routeToolCall(call: ToolCall): Promise<ToolResult>;
  executeParallel(calls: ToolCall[]): Promise<ToolResult[]>;
  handleDependencies(calls: ToolCall[], dependencies: DependencyGraph): Promise<ToolResult[]>;
}

class ToolRouter implements ToolCoordinator {
  private tools = new Map<string, ToolDefinition>();

  async routeToolCall(call: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(call.name);
    if (!tool) {
      throw new ToolNotFoundError(`Tool ${call.name} not registered`);
    }

    // Validate tool call
    this.validateToolCall(call, tool);

    // Execute with timeout and retry logic
    return await this.executeWithRetry(call, tool);
  }
}
```

### Parallel Execution

```typescript
async executeParallel(calls: ToolCall[]): Promise<ToolResult[]> {
  // Group calls by dependency
  const { independent, dependent } = this.groupByDependency(calls);

  // Execute independent calls in parallel
  const independentResults = await Promise.allSettled(
    independent.map(call => this.routeToolCall(call))
  );

  // Execute dependent calls after dependencies complete
  const dependentResults = await this.executeWithDependencies(dependent);

  return [...independentResults, ...dependentResults];
}
```

## Streaming & Response Handling

### Streaming Coordinator

```typescript
interface StreamingCoordinator {
  startStream(request: StreamingRequest): Promise<StreamingSession>;
  processChunk(chunk: StreamChunk): Promise<ChunkAction>;
  handleCompletion(session: StreamingSession): Promise<CompletionResult>;
  cancelStream(sessionId: string): Promise<void>;
}

class ClaudeStreamingCoordinator implements StreamingCoordinator {
  async startStream(request: StreamingRequest): Promise<StreamingSession> {
    const session = {
      id: generateSessionId(),
      request,
      chunks: [],
      startTime: Date.now(),
      status: 'active'
    };

    // Start Claude streaming
    const stream = await this.client.messages.create({
      ...request,
      stream: true
    });

    return this.processStream(session, stream);
  }
}
```

### Chunk Processing

```typescript
async processChunk(chunk: StreamChunk): Promise<ChunkAction> {
  switch (chunk.type) {
    case 'content_block_delta':
      return this.handleContentDelta(chunk);
    case 'tool_call':
      return this.handleToolCall(chunk);
    case 'error':
      return this.handleStreamError(chunk);
    case 'done':
      return this.handleStreamComplete(chunk);
  }
}
```

## Error Recovery & Fallback

### Recovery Manager

```typescript
interface RecoveryManager {
  classifyError(error: ClaudeError): ErrorCategory;
  getRecoveryStrategy(category: ErrorCategory): RecoveryStrategy[];
  executeRecovery(strategy: RecoveryStrategy, context: ExecutionContext): Promise<RecoveryResult>;
  shouldEscalate(error: ClaudeError, attempts: number): boolean;
}

enum ErrorCategory {
  RATE_LIMIT = 'rate_limit',
  TOKEN_LIMIT = 'token_limit',
  NETWORK = 'network',
  API_ERROR = 'api_error',
  TOOL_FAILURE = 'tool_failure',
  CONTEXT_CORRUPTION = 'context_corruption'
}

class ExponentialBackoffRecovery implements RecoveryManager {
  async executeRecovery(strategy: RecoveryStrategy, context: ExecutionContext): Promise<RecoveryResult> {
    switch (strategy.type) {
      case 'retry':
        return this.retryWithBackoff(strategy, context);
      case 'fallback_model':
        return this.switchToFallbackModel(strategy, context);
      case 'compact_context':
        return this.compactAndRetry(strategy, context);
      case 'simplify_request':
        return this.simplifyRequest(strategy, context);
    }
  }
}
```

## Rate Limiting & Quota Management

### Rate Limiter

```typescript
interface RateLimiter {
  checkRateLimit(request: APIRequest): Promise<RateLimitResult>;
  waitForQuota(request: APIRequest): Promise<void>;
  updateUsage(request: APIRequest, tokens: number): void;
  getRemainingQuota(): QuotaStatus;
}

class TokenBucketRateLimiter implements RateLimiter {
  private buckets = new Map<string, TokenBucket>();

  async checkRateLimit(request: APIRequest): Promise<RateLimitResult> {
    const bucket = this.getBucket(request.apiKey || 'anonymous');

    if (bucket.tokens <= 0) {
      return {
        allowed: false,
        waitTime: bucket.refillTime - Date.now(),
        limit: bucket.capacity,
        remaining: 0
      };
    }

    bucket.tokens--;
    return { allowed: true, remaining: bucket.tokens };
  }
}
```

## Observability & Logging

### Structured Logger

```typescript
interface Logger {
  logTaskEvent(event: TaskEvent): void;
  logAPIRequest(request: APIRequest, response: APIResponse, duration: number): void;
  logToolExecution(toolCall: ToolCall, result: ToolResult, duration: number): void;
  logError(error: ClaudeError, context: ExecutionContext): void;
  logMetrics(metrics: PerformanceMetrics): void;
}

class StructuredLogger implements Logger {
  async logTaskEvent(event: TaskEvent): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: event.level,
      event: event.type,
      taskId: event.taskId,
      data: event.data,
      context: event.context
    };

    console.log(JSON.stringify(logEntry));
    await this.persistLog(logEntry);
  }
}
```

### Metrics Collector

```typescript
interface MetricsCollector {
  recordTaskDuration(taskId: string, duration: number): void;
  recordTokenUsage(model: string, tokens: number, cached: boolean): void;
  recordAPIRequest(model: string, tokens: number, duration: number, success: boolean): void;
  recordToolUsage(toolName: string, duration: number, success: boolean): void;
  recordError(category: ErrorCategory, count: number): void;
  getMetricsSummary(timeframe: TimeFrame): MetricsSummary;
}
```

## Implementation Examples

### Basic Task Execution

```typescript
const orchestrator = new ClaudeOrchestrator({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultModel: 'claude-sonnet-4-0',
  maxRetries: 3,
  enableStreaming: true
});

const result = await orchestrator.executeTask({
  messages: [
    { role: 'user', content: 'Analyze this codebase for security issues' }
  ],
  tools: [securityScanTool, codeAnalysisTool],
  contextWindow: 100000
});
```

### Streaming with Tool Coordination

```typescript
const streamingSession = await orchestrator.executeWithStreaming({
  messages: [{ role: 'user', content: 'Help me refactor this function' }],
  tools: [refactorTool, testTool],
  onChunk: (chunk) => {
    if (chunk.type === 'tool_call') {
      console.log(`Executing tool: ${chunk.tool.name}`);
    }
  },
  onComplete: (result) => {
    console.log(`Task completed with ${result.tokens} tokens`);
  }
});
```

### Context Management

```typescript
// Automatic context compaction
const contextManager = orchestrator.getContextManager();
const compactedContext = await contextManager.compactIfNeeded(largeContext);

// Manual context partitioning
const partitions = await contextManager.partitionContext(hugeContext, {
  maxPartitionSize: 50000,
  overlapTokens: 1000
});
```

## Configuration

### Environment Variables

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

### Runtime Configuration

```typescript
const config: OrchestratorConfig = {
  models: {
    primary: 'claude-sonnet-4-0',
    fallback: 'claude-3-5-haiku-latest'
  },
  limits: {
    maxRetries: 3,
    rateLimitRPM: 50,
    maxContextTokens: 100000
  },
  features: {
    streaming: true,
    contextCompaction: true,
    parallelToolExecution: true
  },
  observability: {
    enableMetrics: true,
    logLevel: 'info',
    enableTracing: true
  }
};
```

## Best Practices

### Context Optimization
1. **Estimate tokens accurately** before API calls
2. **Compact proactively** when approaching limits
3. **Preserve tool results** during compaction
4. **Cache expensive computations** across sessions

### Error Handling
1. **Classify errors** to choose appropriate recovery
2. **Implement exponential backoff** for rate limits
3. **Have fallback models** for reliability
4. **Log detailed context** for debugging

### Performance
1. **Use streaming** for better user experience
2. **Execute tools in parallel** when possible
3. **Batch similar operations** to reduce API calls
4. **Monitor token usage** for cost optimization

### Observability
1. **Log all API interactions** with timing
2. **Track error rates** by category
3. **Monitor performance metrics** regularly
4. **Alert on unusual patterns** (high error rates, slow responses)

## Integration Patterns

### Express.js Middleware

```typescript
app.post('/api/claude/orchestrate', async (req, res) => {
  try {
    const result = await orchestrator.executeTask(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### WebSocket Streaming

```typescript
wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const request = JSON.parse(data.toString());

    const session = await orchestrator.executeWithStreaming(request);

    session.on('chunk', (chunk) => {
      ws.send(JSON.stringify({ type: 'chunk', data: chunk }));
    });

    session.on('complete', (result) => {
      ws.send(JSON.stringify({ type: 'complete', data: result }));
    });

    session.on('error', (error) => {
      ws.send(JSON.stringify({ type: 'error', data: error }));
    });
  });
});
```

## Success Metrics

- **Task Completion Rate**: >95% of tasks complete successfully
- **Average Response Time**: <30 seconds for typical tasks
- **Token Efficiency**: <80% of context window used on average
- **Error Recovery Rate**: >90% of errors handled gracefully
- **Tool Success Rate**: >95% of tool calls succeed
- **Cost per Task**: Minimize through caching and optimization

---

**Remember**: The orchestrator is responsible for reliable, efficient Claude interactions. Focus on robustness, observability, and optimal resource usage while maintaining clear coordination with users and tools.