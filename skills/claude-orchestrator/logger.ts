import { TaskRequest, TaskResult, OrchestratorConfig } from './types';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  event: string;
  taskId?: string;
  data?: any;
  duration?: number;
  error?: string;
}

export class Logger {
  private config: Required<OrchestratorConfig>;

  constructor(config: Required<OrchestratorConfig>) {
    this.config = config;
  }

  /**
   * Log task start
   */
  logTaskStart(taskId: string, request: TaskRequest): void {
    this.log('info', 'task_start', {
      taskId,
      model: request.model,
      messageCount: request.messages.length,
      hasTools: !!request.tools?.length,
      streaming: !!request.stream
    });
  }

  /**
   * Log task completion
   */
  logTaskComplete(taskId: string, result: TaskResult, duration: number): void {
    this.log('info', 'task_complete', {
      taskId,
      success: result.success,
      duration,
      tokenUsage: result.usage,
      toolCalls: result.tool_calls
    });
  }

  /**
   * Log task error
   */
  logTaskError(taskId: string, error: Error, duration: number): void {
    this.log('error', 'task_error', {
      taskId,
      duration,
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * Log API request
   */
  logAPIRequest(request: TaskRequest, response: any, duration: number): void {
    this.log('debug', 'api_request', {
      model: request.model,
      messages: request.messages.length,
      duration,
      tokens: response.usage ? {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cache_read: response.usage.cache_read_input_tokens,
        cache_write: response.usage.cache_creation_input_tokens
      } : undefined
    });
  }

  /**
   * Log tool execution
   */
  logToolExecution(toolName: string, duration: number, success: boolean, error?: string): void {
    this.log('debug', 'tool_execution', {
      toolName,
      duration,
      success,
      error
    });
  }

  /**
   * Log retry attempt
   */
  logRetry(taskId: string, attempt: number, error: Error): void {
    this.log('warn', 'task_retry', {
      taskId,
      attempt,
      error: error.message
    });
  }

  /**
   * Log context compaction
   */
  logContextCompaction(taskId: string, originalTokens: number, newMessageCount: number): void {
    this.log('info', 'context_compaction', {
      taskId,
      originalTokens,
      newMessageCount
    });
  }

  /**
   * Log recovery action
   */
  logRecovery(taskId: string, strategy: string, success: boolean): void {
    this.log('info', 'recovery_attempt', {
      taskId,
      strategy,
      success
    });
  }

  /**
   * Generic log method
   */
  private log(level: LogEntry['level'], event: string, data?: any): void {
    // Check log level
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...data
    };

    // In a real implementation, this would go to a logging service
    // For now, we'll use console.log for JSON structured logging
    console.log(JSON.stringify(entry));
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    // In a real implementation, this would query a log store
    // For now, return empty array
    return [];
  }
}