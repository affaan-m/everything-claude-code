import Anthropic from '@anthropic-ai/sdk';
import {
  Message,
  TaskRequest,
  TaskResult,
  StreamingRequest,
  StreamChunk,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ExecutionContext,
  TaskState,
  OrchestratorConfig,
  ClaudeOrchestratorError,
  RateLimitError,
  TokenLimitError,
  ToolExecutionError
} from './types';
import { ContextManager } from './context-manager';
import { ToolCoordinator } from './tool-coordinator';
import { RecoveryManager } from './recovery-manager';
import { RateLimiter } from './rate-limiter';
import { Logger } from './logger';
import { MetricsCollector } from './metrics';

export class ClaudeOrchestrator {
  private client: Anthropic;
  private config: Required<OrchestratorConfig>;
  private contextManager: ContextManager;
  private toolCoordinator: ToolCoordinator;
  private recoveryManager: RecoveryManager;
  private rateLimiter: RateLimiter;
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      defaultModel: config.defaultModel || 'claude-sonnet-4-0',
      maxRetries: config.maxRetries || 3,
      rateLimitRPM: config.rateLimitRPM || 50,
      maxContextTokens: config.maxContextTokens || 100000,
      enableStreaming: config.enableStreaming ?? true,
      enableMetrics: config.enableMetrics ?? true,
      logLevel: config.logLevel || 'info',
      fallbackModels: config.fallbackModels || ['claude-3-5-haiku-latest']
    };

    if (!this.config.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.client = new Anthropic({
      apiKey: this.config.apiKey
    });

    this.contextManager = new ContextManager(this.config);
    this.toolCoordinator = new ToolCoordinator();
    this.recoveryManager = new RecoveryManager(this.config);
    this.rateLimiter = new RateLimiter(this.config);
    this.logger = new Logger(this.config);
    this.metrics = new MetricsCollector(this.config);
  }

  /**
   * Execute a task with full lifecycle management
   */
  async executeTask(request: TaskRequest): Promise<TaskResult> {
    const taskId = this.generateTaskId();
    const startTime = new Date();

    this.logger.logTaskStart(taskId, request);

    try {
      // Initialize execution context
      const context: ExecutionContext = {
        taskId,
        state: TaskState.ANALYZING,
        messages: request.messages,
        toolResults: new Map(),
        tokenUsage: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        startTime,
        retries: 0,
        contextCompactions: 0
      };

      // Analyze and prepare context
      await this.prepareContext(context, request);

      // Execute the task
      const result = await this.executeWithRecovery(context, request);

      // Log completion
      const duration = Date.now() - startTime.getTime();
      this.logger.logTaskComplete(taskId, result, duration);
      this.metrics.recordTaskDuration(taskId, duration);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime.getTime();
      this.logger.logTaskError(taskId, error as Error, duration);
      this.metrics.recordError('task_failure', 1);

      throw error;
    }
  }

  /**
   * Execute task with streaming support
   */
  async executeWithStreaming(request: StreamingRequest): Promise<TaskResult> {
    const taskId = this.generateTaskId();
    const startTime = new Date();

    this.logger.logTaskStart(taskId, request);

    try {
      // Initialize execution context
      const context: ExecutionContext = {
        taskId,
        state: TaskState.STREAMING,
        messages: request.messages,
        toolResults: new Map(),
        tokenUsage: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        startTime,
        retries: 0,
        contextCompactions: 0
      };

      // Prepare context
      await this.prepareContext(context, request);

      // Execute with streaming
      const result = await this.executeStreaming(context, request);

      // Log completion
      const duration = Date.now() - startTime.getTime();
      this.logger.logTaskComplete(taskId, result, duration);
      this.metrics.recordTaskDuration(taskId, duration);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime.getTime();
      this.logger.logTaskError(taskId, error as Error, duration);
      this.metrics.recordError('streaming_failure', 1);

      if (request.onError) {
        request.onError(error as Error);
      }

      throw error;
    }
  }

  /**
   * Register a tool for use in orchestrator
   */
  registerTool(tool: ToolDefinition): void {
    this.toolCoordinator.registerTool(tool);
  }

  /**
   * Get current metrics
   */
  getMetrics(): any {
    return this.metrics.getSummary();
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): any {
    return this.rateLimiter.getStatus();
  }

  private async prepareContext(context: ExecutionContext, request: TaskRequest): Promise<void> {
    // Estimate token usage
    const estimatedTokens = this.contextManager.estimateTokens(context.messages);
    context.tokenUsage.input = estimatedTokens;

    // Check context limits
    if (estimatedTokens > this.config.maxContextTokens) {
      // Try to compact context
      if (this.contextManager.shouldCompact(context)) {
        context.messages = this.contextManager.compactContext(context.messages);
        context.contextCompactions++;
        this.logger.logContextCompaction(context.taskId, estimatedTokens, context.messages.length);
      } else {
        throw new TokenLimitError(
          `Context too large: ${estimatedTokens} tokens exceeds limit of ${this.config.maxContextTokens}`,
          estimatedTokens,
          this.config.maxContextTokens
        );
      }
    }

    // Check rate limits
    await this.rateLimiter.waitForQuota(request);

    context.state = TaskState.EXECUTING;
  }

  private async executeWithRecovery(context: ExecutionContext, request: TaskRequest): Promise<TaskResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        context.retries = attempt;

        // Execute the API call
        const result = await this.executeAPIRequest(context, request);

        // Handle tool calls if present
        if (result.toolCalls && result.toolCalls.length > 0) {
          context.state = TaskState.TOOL_COORDINATING;
          const toolResults = await this.toolCoordinator.executeParallel(result.toolCalls);

          // Update context with tool results
          this.updateContextWithToolResults(context, toolResults);

          // Continue conversation with tool results
          return await this.continueWithToolResults(context, request, toolResults);
        }

        context.state = TaskState.COMPLETING;
        return result;

      } catch (error) {
        lastError = error as Error;
        this.logger.logRetry(context.taskId, attempt, error as Error);

        // Check if we should retry
        if (attempt < this.config.maxRetries && this.shouldRetry(error as Error)) {
          context.state = TaskState.RECOVERING;

          // Execute recovery strategy
          const recoveryResult = await this.recoveryManager.executeRecovery(error as Error, context);
          if (recoveryResult.shouldRetry) {
            await this.delay(recoveryResult.delay || this.calculateBackoffDelay(attempt));
            continue;
          }
        }

        // No more retries or recovery failed
        break;
      }
    }

    // All retries exhausted
    throw lastError || new ClaudeOrchestratorError('Task execution failed after all retries', 'max_retries_exceeded');
  }

  private async executeStreaming(context: ExecutionContext, request: StreamingRequest): Promise<TaskResult> {
    // Check if streaming is enabled
    if (!this.config.enableStreaming) {
      return this.executeWithRecovery(context, request);
    }

    const streamRequest = {
      ...request,
      stream: true
    };

    const stream = await this.client.messages.create({
      model: request.model || this.config.defaultModel,
      max_tokens: request.max_tokens || 4096,
      messages: this.convertMessages(context.messages),
      system: request.system,
      tools: request.tools,
      stream: true
    });

    const chunks: StreamChunk[] = [];
    let currentContent = '';
    let currentToolCalls: ToolCall[] = [];
    let hasError = false;

    try {
      for await (const event of stream) {
        const chunk = this.processStreamEvent(event);
        chunks.push(chunk);

        // Update context with chunk
        if (chunk.type === 'content' && chunk.content) {
          currentContent += chunk.content;
        } else if (chunk.type === 'tool_call' && chunk.tool_call) {
          currentToolCalls.push(chunk.tool_call);
        }

        // Emit chunk to callback
        if (request.onChunk) {
          request.onChunk(chunk);
        }

        // Handle errors
        if (chunk.type === 'error') {
          hasError = true;
          if (request.onError) {
            request.onError(new Error(chunk.error));
          }
          break;
        }
      }

      if (hasError) {
        throw new ClaudeOrchestratorError('Streaming failed', 'streaming_error');
      }

      // Handle tool calls from streaming
      if (currentToolCalls.length > 0) {
        context.state = TaskState.TOOL_COORDINATING;
        const toolResults = await this.toolCoordinator.executeParallel(currentToolCalls);
        this.updateContextWithToolResults(context, toolResults);
      }

      const result: TaskResult = {
        success: true,
        messages: [
          ...context.messages,
          {
            role: 'assistant',
            content: currentContent
          }
        ],
        usage: stream.usage ? {
          input_tokens: stream.usage.input_tokens,
          output_tokens: stream.usage.output_tokens,
          total_tokens: stream.usage.input_tokens + stream.usage.output_tokens,
          cache_read_tokens: stream.usage.cache_read_input_tokens || 0,
          cache_write_tokens: stream.usage.cache_creation_input_tokens || 0
        } : undefined,
        tool_calls: currentToolCalls.length,
        duration_ms: Date.now() - context.startTime.getTime()
      };

      if (request.onComplete) {
        request.onComplete(result);
      }

      return result;

    } catch (error) {
      if (request.onError) {
        request.onError(error as Error);
      }
      throw error;
    }
  }

  private async executeAPIRequest(context: ExecutionContext, request: TaskRequest): Promise<TaskResult> {
    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: request.model || this.config.defaultModel,
      max_tokens: request.max_tokens || 4096,
      temperature: request.temperature || 0.7,
      messages: this.convertMessages(context.messages),
      system: request.system,
      tools: request.tools
    });

    const duration = Date.now() - startTime;

    // Update token usage
    if (response.usage) {
      context.tokenUsage.input = response.usage.input_tokens;
      context.tokenUsage.output = response.usage.output_tokens;
      context.tokenUsage.cache_read = response.usage.cache_read_input_tokens || 0;
      context.tokenUsage.cache_write = response.usage.cache_creation_input_tokens || 0;
    }

    // Log API request
    this.logger.logAPIRequest(request, response, duration);
    this.metrics.recordAPIRequest(
      request.model || this.config.defaultModel,
      response.usage?.input_tokens || 0,
      duration,
      true
    );

    // Extract tool calls
    const toolCalls = this.extractToolCalls(response.content);
    const content = this.extractContent(response.content);

    const result: TaskResult = {
      success: true,
      messages: [
        ...context.messages,
        {
          role: 'assistant',
          content: response.content
        }
      ],
      usage: response.usage ? {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        cache_read_tokens: response.usage.cache_read_input_tokens || 0,
        cache_write_tokens: response.usage.cache_creation_input_tokens || 0
      } : undefined,
      tool_calls: toolCalls.length,
      duration_ms: duration
    };

    return result;
  }

  private async continueWithToolResults(
    context: ExecutionContext,
    originalRequest: TaskRequest,
    toolResults: ToolResult[]
  ): Promise<TaskResult> {
    // Add tool results to messages
    const toolMessages: Message[] = toolResults.map(result => ({
      role: 'user',
      content: [{
        type: 'tool_result',
        tool_use_id: result.tool_call_id,
        content: result.content,
        is_error: result.is_error
      }]
    }));

    context.messages = [...context.messages, ...toolMessages];

    // Continue the conversation
    return this.executeAPIRequest(context, originalRequest);
  }

  private updateContextWithToolResults(context: ExecutionContext, results: ToolResult[]): void {
    results.forEach(result => {
      context.toolResults.set(result.tool_call_id, result);
    });
  }

  private processStreamEvent(event: any): StreamChunk {
    switch (event.type) {
      case 'content_block_delta':
        if (event.delta.type === 'text_delta') {
          return {
            type: 'content',
            content: event.delta.text
          };
        }
        break;

      case 'content_block_start':
        if (event.content_block.type === 'tool_use') {
          return {
            type: 'tool_call',
            tool_call: {
              id: event.content_block.id,
              name: event.content_block.name,
              input: event.content_block.input
            }
          };
        }
        break;

      case 'error':
        return {
          type: 'error',
          error: event.error.message
        };

      case 'message_stop':
        return {
          type: 'done',
          usage: event.usage
        };
    }

    return { type: 'content', content: '' };
  }

  private convertMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }]
    }));
  }

  private extractToolCalls(content: any[]): ToolCall[] {
    return content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        id: block.id,
        name: block.name,
        input: block.input
      }));
  }

  private extractContent(content: any[]): string {
    return content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');
  }

  private shouldRetry(error: Error): boolean {
    if (error instanceof RateLimitError) return true;
    if (error instanceof ClaudeOrchestratorError && error.retryable) return true;
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('network')) return true;
    return false;
  }

  private calculateBackoffDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}