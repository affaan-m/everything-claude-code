import Anthropic from '@anthropic-ai/sdk';

// Core types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  source?: ImageSource;
  id?: string;
  name?: string;
  input?: any;
  content?: string;
  tool_use_id?: string;
  is_error?: boolean;
}

export interface ImageSource {
  type: 'base64';
  media_type: string;
  data: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: any;
}

export interface ToolResult {
  tool_call_id: string;
  content: string;
  is_error?: boolean;
}

export interface TaskRequest {
  messages: Message[];
  system?: string;
  tools?: ToolDefinition[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  context_id?: string;
}

export interface TaskResult {
  success: boolean;
  messages: Message[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cache_read_tokens?: number;
    cache_write_tokens?: number;
  };
  tool_calls?: number;
  duration_ms: number;
  error?: string;
}

export interface StreamingRequest extends TaskRequest {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result: TaskResult) => void;
  onError?: (error: Error) => void;
}

export interface StreamChunk {
  type: 'content' | 'tool_call' | 'error' | 'done';
  content?: string;
  tool_call?: ToolCall;
  error?: string;
  usage?: TaskResult['usage'];
}

export enum TaskState {
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

export interface ExecutionContext {
  taskId: string;
  state: TaskState;
  messages: Message[];
  toolResults: Map<string, ToolResult>;
  tokenUsage: {
    input: number;
    output: number;
    cache_read: number;
    cache_write: number;
  };
  startTime: Date;
  retries: number;
  contextCompactions: number;
}

// Configuration
export interface OrchestratorConfig {
  apiKey?: string;
  defaultModel?: string;
  maxRetries?: number;
  rateLimitRPM?: number;
  maxContextTokens?: number;
  enableStreaming?: boolean;
  enableMetrics?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  fallbackModels?: string[];
}

// Error types
export class ClaudeOrchestratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public context?: any
  ) {
    super(message);
    this.name = 'ClaudeOrchestratorError';
  }
}

export class RateLimitError extends ClaudeOrchestratorError {
  constructor(message: string, public retryAfter: number) {
    super(message, 'rate_limit_exceeded', true, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class TokenLimitError extends ClaudeOrchestratorError {
  constructor(message: string, public required: number, public available: number) {
    super(message, 'token_limit_exceeded', false, { required, available });
    this.name = 'TokenLimitError';
  }
}

export class ToolExecutionError extends ClaudeOrchestratorError {
  constructor(message: string, public toolName: string, public toolCall: ToolCall) {
    super(message, 'tool_execution_failed', true, { toolName, toolCall });
    this.name = 'ToolExecutionError';
  }
}