import { OrchestratorConfig } from './types';

export interface MetricsSummary {
  tasksCompleted: number;
  tasksFailed: number;
  averageDuration: number;
  totalTokensUsed: number;
  cacheHitRate: number;
  toolSuccessRate: number;
  errorBreakdown: Record<string, number>;
  modelUsage: Record<string, number>;
}

export class MetricsCollector {
  private metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    durations: number[];
    tokensUsed: number;
    cacheReads: number;
    cacheWrites: number;
    toolCalls: number;
    toolSuccesses: number;
    errors: Record<string, number>;
    modelUsage: Record<string, number>;
  };

  constructor(private config: Required<OrchestratorConfig>) {
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      durations: [],
      tokensUsed: 0,
      cacheReads: 0,
      cacheWrites: 0,
      toolCalls: 0,
      toolSuccesses: 0,
      errors: {},
      modelUsage: {}
    };
  }

  /**
   * Record task duration
   */
  recordTaskDuration(taskId: string, duration: number): void {
    this.metrics.durations.push(duration);
  }

  /**
   * Record token usage
   */
  recordTokenUsage(model: string, tokens: number, cached: boolean = false): void {
    this.metrics.tokensUsed += tokens;
    this.metrics.modelUsage[model] = (this.metrics.modelUsage[model] || 0) + tokens;

    if (cached) {
      this.metrics.cacheReads += tokens;
    }
  }

  /**
   * Record API request
   */
  recordAPIRequest(model: string, tokens: number, duration: number, success: boolean): void {
    if (success) {
      this.metrics.tasksCompleted++;
    } else {
      this.metrics.tasksFailed++;
    }

    this.recordTokenUsage(model, tokens);
    this.recordTaskDuration('', duration);
  }

  /**
   * Record tool execution
   */
  recordToolUsage(toolName: string, success: boolean, duration: number): void {
    this.metrics.toolCalls++;

    if (success) {
      this.metrics.toolSuccesses++;
    }
  }

  /**
   * Record error
   */
  recordError(category: string, count: number = 1): void {
    this.metrics.errors[category] = (this.metrics.errors[category] || 0) + count;
  }

  /**
   * Get metrics summary
   */
  getSummary(): MetricsSummary {
    const totalTasks = this.metrics.tasksCompleted + this.metrics.tasksFailed;
    const averageDuration = this.metrics.durations.length > 0
      ? this.metrics.durations.reduce((a, b) => a + b, 0) / this.metrics.durations.length
      : 0;

    const cacheHitRate = this.metrics.cacheReads > 0
      ? (this.metrics.cacheReads / (this.metrics.cacheReads + this.metrics.cacheWrites)) * 100
      : 0;

    const toolSuccessRate = this.metrics.toolCalls > 0
      ? (this.metrics.toolSuccesses / this.metrics.toolCalls) * 100
      : 0;

    return {
      tasksCompleted: this.metrics.tasksCompleted,
      tasksFailed: this.metrics.tasksFailed,
      averageDuration,
      totalTokensUsed: this.metrics.tokensUsed,
      cacheHitRate,
      toolSuccessRate,
      errorBreakdown: { ...this.metrics.errors },
      modelUsage: { ...this.metrics.modelUsage }
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      durations: [],
      tokensUsed: 0,
      cacheReads: 0,
      cacheWrites: 0,
      toolCalls: 0,
      toolSuccesses: 0,
      errors: {},
      modelUsage: {}
    };
  }

  /**
   * Export metrics for external monitoring
   */
  export(): any {
    return {
      ...this.getSummary(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }
}