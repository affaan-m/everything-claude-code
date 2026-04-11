import {
  ExecutionContext,
  OrchestratorConfig,
  ClaudeOrchestratorError,
  RateLimitError,
  TokenLimitError
} from './types';

export interface RecoveryResult {
  shouldRetry: boolean;
  delay?: number;
  newModel?: string;
  compactedContext?: boolean;
}

export class RecoveryManager {
  constructor(private config: Required<OrchestratorConfig>) {}

  /**
   * Classify error and determine recovery strategy
   */
  classifyError(error: Error): 'rate_limit' | 'token_limit' | 'network' | 'api_error' | 'tool_error' | 'unknown' {
    if (error instanceof RateLimitError) return 'rate_limit';
    if (error instanceof TokenLimitError) return 'token_limit';
    if (error instanceof ClaudeOrchestratorError) {
      if (error.code === 'tool_execution_failed') return 'tool_error';
      return 'api_error';
    }
    if (error.message.includes('timeout') || error.message.includes('network')) return 'network';
    return 'unknown';
  }

  /**
   * Execute recovery strategy for an error
   */
  async executeRecovery(error: Error, context: ExecutionContext): Promise<RecoveryResult> {
    const errorType = this.classifyError(error);

    switch (errorType) {
      case 'rate_limit':
        return this.handleRateLimit(error as RateLimitError, context);
      case 'token_limit':
        return this.handleTokenLimit(error as TokenLimitError, context);
      case 'network':
        return this.handleNetworkError(error, context);
      case 'api_error':
        return this.handleAPIError(error, context);
      case 'tool_error':
        return this.handleToolError(error, context);
      default:
        return this.handleUnknownError(error, context);
    }
  }

  private handleRateLimit(error: RateLimitError, context: ExecutionContext): RecoveryResult {
    if (context.retries >= this.config.maxRetries) {
      return { shouldRetry: false };
    }

    // Wait for the specified retry-after time
    return {
      shouldRetry: true,
      delay: error.retryAfter * 1000 // Convert to milliseconds
    };
  }

  private handleTokenLimit(error: TokenLimitError, context: ExecutionContext): RecoveryResult {
    // Try to compact context if we haven't already
    if (context.contextCompactions === 0) {
      return {
        shouldRetry: true,
        compactedContext: true
      };
    }

    // Try switching to a model with larger context window
    if (this.config.fallbackModels.length > 0) {
      return {
        shouldRetry: true,
        newModel: this.config.fallbackModels[0],
        compactedContext: true
      };
    }

    return { shouldRetry: false };
  }

  private handleNetworkError(error: Error, context: ExecutionContext): RecoveryResult {
    if (context.retries >= this.config.maxRetries) {
      return { shouldRetry: false };
    }

    // Exponential backoff for network errors
    const delay = Math.min(1000 * Math.pow(2, context.retries), 30000);

    return {
      shouldRetry: true,
      delay
    };
  }

  private handleAPIError(error: Error, context: ExecutionContext): RecoveryResult {
    // Check if it's a temporary API error that might be retried
    const temporaryErrors = [
      'internal_error',
      'service_unavailable',
      'bad_gateway'
    ];

    const isTemporary = temporaryErrors.some(code =>
      error.message.includes(code) ||
      (error instanceof ClaudeOrchestratorError && temporaryErrors.includes(error.code))
    );

    if (!isTemporary || context.retries >= this.config.maxRetries) {
      return { shouldRetry: false };
    }

    // Try with fallback model for API errors
    const delay = Math.min(1000 * Math.pow(2, context.retries), 30000);

    return {
      shouldRetry: true,
      delay,
      newModel: context.retries > 0 ? this.config.fallbackModels[0] : undefined
    };
  }

  private handleToolError(error: Error, context: ExecutionContext): RecoveryResult {
    // Tool errors are typically not retryable as they indicate
    // a problem with the tool call itself
    return { shouldRetry: false };
  }

  private handleUnknownError(error: Error, context: ExecutionContext): RecoveryResult {
    // For unknown errors, try a conservative retry
    if (context.retries >= Math.min(this.config.maxRetries, 2)) {
      return { shouldRetry: false };
    }

    const delay = 2000 * (context.retries + 1);

    return {
      shouldRetry: true,
      delay
    };
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): any {
    // This would track recovery success rates, etc.
    return {
      totalRecoveries: 0,
      successRate: 0,
      commonStrategies: []
    };
  }
}