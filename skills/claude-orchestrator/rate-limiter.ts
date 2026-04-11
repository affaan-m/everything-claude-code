import { OrchestratorConfig } from './types';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: number;
  retryAfter?: number;
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  private config: Required<OrchestratorConfig>;

  constructor(config: Required<OrchestratorConfig>) {
    this.config = config;
  }

  /**
   * Check if request can proceed under rate limits
   */
  async checkRateLimit(identifier: string = 'default'): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = this.config.rateLimitRPM;

    const requests = this.requests.get(identifier) || [];

    // Remove requests outside the window
    const recentRequests = requests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = oldestRequest + windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - recentRequests.length - 1
    };
  }

  /**
   * Wait until rate limit allows the request
   */
  async waitForQuota(request: any): Promise<void> {
    const identifier = this.getRequestIdentifier(request);
    const result = await this.checkRateLimit(identifier);

    if (!result.allowed) {
      if (result.retryAfter) {
        await this.delay(result.retryAfter * 1000);
      }
    }

    // Record the request
    this.recordRequest(identifier);
  }

  /**
   * Record a completed request
   */
  recordRequest(identifier: string): void {
    const requests = this.requests.get(identifier) || [];
    requests.push(Date.now());

    // Clean up old requests (keep only last hour)
    const oneHourAgo = Date.now() - 3600000;
    const recentRequests = requests.filter(time => time > oneHourAgo);

    this.requests.set(identifier, recentRequests);
  }

  /**
   * Get current rate limit status
   */
  getStatus(identifier: string = 'default'): any {
    const result = this.checkRateLimit(identifier);
    const requests = this.requests.get(identifier) || [];

    return {
      currentUsage: requests.length,
      limit: this.config.rateLimitRPM,
      windowMs: 60000,
      requestsInWindow: requests.filter(time => Date.now() - time < 60000).length,
      canMakeRequest: result.allowed,
      nextAvailableIn: result.retryAfter || 0
    };
  }

  /**
   * Reset rate limits (for testing)
   */
  reset(): void {
    this.requests.clear();
  }

  private getRequestIdentifier(request: any): string {
    // Use API key hash or IP for identification
    // For now, use a simple identifier
    return 'default';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}