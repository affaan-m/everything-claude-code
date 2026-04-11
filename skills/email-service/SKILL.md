---
name: email-service
description: Complete email service implementation with base interfaces, types, configuration, and abstract implementations for provider-agnostic email sending.
origin: ECC
---

# Email Service Implementation

Complete email service with base interfaces, types, configuration, and abstract implementations for provider-agnostic email sending.

## When to Activate

- Implementing email functionality in applications
- Setting up email service providers (Resend, SMTP, etc.)
- Creating email templates and workflows
- Building transactional email systems
- Adding email notifications and alerts

## Core Interfaces and Types

### EmailMessage Interface

```typescript
export interface EmailMessage {
  // Required fields
  to: string | string[]
  from: string

  // Optional fields
  cc?: string | string[]
  bcc?: string | string[]
  subject: string

  // Body content - either text or HTML
  text?: string
  html?: string

  // Attachments
  attachments?: EmailAttachment[]

  // Metadata
  replyTo?: string
  headers?: Record<string, string>
  tags?: Record<string, string>

  // Provider-specific options
  providerOptions?: Record<string, any>
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  encoding?: 'base64' | 'binary'
  path?: string  // Alternative to content - file path
}
```

### EmailService Interface

```typescript
export interface EmailService {
  /**
   * Send a single email message
   */
  send(message: EmailMessage): Promise<EmailSendResult>

  /**
   * Send multiple email messages in batch
   */
  sendBatch(messages: EmailMessage[]): Promise<EmailBatchResult>

  /**
   * Get the status of a previously sent email
   */
  getStatus(messageId: string): Promise<EmailStatus>

  /**
   * Validate email configuration and connectivity
   */
  validateConfig(): Promise<boolean>
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: EmailError
}

export interface EmailBatchResult {
  results: EmailSendResult[]
  successCount: number
  failureCount: number
}

export interface EmailStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'unknown'
  deliveredAt?: Date
  error?: EmailError
}

export class EmailError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'EmailError'
  }
}
```

## Configuration Types

### Base Configuration

```typescript
export interface EmailConfig {
  provider: EmailProvider

  // Common settings
  timeout?: number
  retries?: number
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }

  // Logging
  enableLogging?: boolean

  // Provider-specific config
  [key: string]: any
}

export type EmailProvider = 'resend' | 'smtp' | 'sendgrid' | 'ses' | 'mailgun'

export interface EmailProviderConfig extends EmailConfig {
  // Provider credentials
  apiKey?: string
  apiSecret?: string

  // SMTP settings (for SMTP provider)
  host?: string
  port?: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }

  // AWS SES settings
  region?: string
  accessKeyId?: string
  secretAccessKey?: string

  // Default sender
  defaultFrom?: string

  // Webhook settings for delivery tracking
  webhookUrl?: string
  webhookSecret?: string
}
```

### Retry Configuration

```typescript
export interface RetryConfig {
  maxRetries: number
  baseDelay: number  // Base delay in milliseconds
  maxDelay: number   // Maximum delay between retries
  backoffFactor: number  // Exponential backoff multiplier
  retryableErrors: string[]  // Error codes that should be retried
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,     // 1 second
  maxDelay: 30000,     // 30 seconds
  backoffFactor: 2,
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED']
}
```

### Logging Configuration

```typescript
export interface EmailLoggingConfig {
  enabled: boolean
  level: 'debug' | 'info' | 'warn' | 'error'
  includeSensitiveData: boolean  // WARNING: Set to false in production
  logToFile?: string
  logToConsole: boolean
}

export const DEFAULT_LOGGING_CONFIG: EmailLoggingConfig = {
  enabled: true,
  level: 'info',
  includeSensitiveData: false,
  logToConsole: true
}
```

## Base Abstract Implementation

### BaseEmailService

```typescript
export abstract class BaseEmailService implements EmailService {
  protected config: EmailProviderConfig
  protected retryConfig: RetryConfig
  protected loggingConfig: EmailLoggingConfig
  protected logger: EmailLogger

  constructor(config: EmailProviderConfig) {
    this.config = config
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retries }
    this.loggingConfig = { ...DEFAULT_LOGGING_CONFIG, ...config.enableLogging }
    this.logger = new EmailLogger(this.loggingConfig)
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const startTime = Date.now()

    try {
      this.logger.info('Sending email', {
        to: this.sanitizeEmails(message.to),
        subject: message.subject
      })

      // Validate message
      this.validateMessage(message)

      // Send with retry logic
      const result = await this.sendWithRetry(message)

      const duration = Date.now() - startTime
      this.logger.info('Email sent successfully', {
        messageId: result.messageId,
        duration: `${duration}ms`
      })

      return result

    } catch (error) {
      const duration = Date.now() - startTime
      this.logger.error('Failed to send email', error as Error, {
        to: this.sanitizeEmails(message.to),
        subject: message.subject,
        duration: `${duration}ms`
      })

      return {
        success: false,
        error: this.normalizeError(error)
      }
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailBatchResult> {
    const results: EmailSendResult[] = []

    // Send emails concurrently with rate limiting
    const batches = this.chunkArray(messages, 10) // 10 concurrent sends max

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(message => this.send(message))
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            error: this.normalizeError(result.reason)
          })
        }
      }

      // Rate limiting delay
      if (this.config.rateLimit) {
        const delay = (this.config.rateLimit.windowMs / this.config.rateLimit.maxRequests) * batches.length
        await this.delay(delay)
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    this.logger.info('Batch send completed', {
      total: results.length,
      success: successCount,
      failure: failureCount
    })

    return {
      results,
      successCount,
      failureCount
    }
  }

  abstract getStatus(messageId: string): Promise<EmailStatus>
  abstract validateConfig(): Promise<boolean>

  // Protected helper methods
  protected abstract sendMessage(message: EmailMessage): Promise<EmailSendResult>

  protected async sendWithRetry(message: EmailMessage): Promise<EmailSendResult> {
    let lastError: Error

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await this.sendMessage(message)
      } catch (error) {
        lastError = error as Error

        const emailError = this.normalizeError(error)
        const shouldRetry = this.shouldRetry(emailError, attempt)

        if (!shouldRetry) {
          throw lastError
        }

        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
          this.retryConfig.maxDelay
        )

        this.logger.warn(`Email send failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          error: emailError.message
        })

        await this.delay(delay)
      }
    }

    throw lastError!
  }

  protected shouldRetry(error: EmailError, attempt: number): boolean {
    if (attempt >= this.retryConfig.maxRetries) return false
    return error.retryable || this.retryConfig.retryableErrors.includes(error.code)
  }

  protected validateMessage(message: EmailMessage): void {
    if (!message.to || (!Array.isArray(message.to) && !message.to)) {
      throw new EmailError('VALIDATION_ERROR', 'Recipient (to) is required')
    }

    if (!message.from) {
      throw new EmailError('VALIDATION_ERROR', 'Sender (from) is required')
    }

    if (!message.subject) {
      throw new EmailError('VALIDATION_ERROR', 'Subject is required')
    }

    if (!message.text && !message.html) {
      throw new EmailError('VALIDATION_ERROR', 'Either text or html body is required')
    }

    // Validate email format
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    const emailsToValidate = [
      ...(Array.isArray(message.to) ? message.to : [message.to]),
      message.from,
      ...(message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : []),
      ...(message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : [])
    ]

    for (const email of emailsToValidate) {
      if (!validateEmail(email)) {
        throw new EmailError('VALIDATION_ERROR', `Invalid email format: ${email}`)
      }
    }
  }

  protected normalizeError(error: unknown): EmailError {
    if (error instanceof EmailError) {
      return error
    }

    if (error instanceof Error) {
      // Map common error types to email errors
      if (error.message.includes('timeout')) {
        return new EmailError('TIMEOUT_ERROR', error.message, 408, true)
      }
      if (error.message.includes('rate limit')) {
        return new EmailError('RATE_LIMIT_ERROR', error.message, 429, true)
      }
      if (error.message.includes('unauthorized') || error.message.includes('401')) {
        return new EmailError('AUTH_ERROR', error.message, 401, false)
      }
      if (error.message.includes('network') || error.message.includes('ECONN')) {
        return new EmailError('NETWORK_ERROR', error.message, 502, true)
      }

      return new EmailError('UNKNOWN_ERROR', error.message, 500, false)
    }

    return new EmailError('UNKNOWN_ERROR', 'Unknown error occurred', 500, false)
  }

  protected sanitizeEmails(emails: string | string[]): string | string[] {
    if (!this.loggingConfig.includeSensitiveData) {
      if (Array.isArray(emails)) {
        return emails.map(email => this.maskEmail(email))
      }
      return this.maskEmail(emails)
    }
    return emails
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return `${local}***@${domain}`
    return `${local.slice(0, 2)}***@${domain}`
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### EmailLogger Implementation

```typescript
export class EmailLogger {
  constructor(private config: EmailLoggingConfig) {}

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, context)
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, context)
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, context)
    }
  }

  error(message: string, error: Error, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.log('ERROR', message, { ...context, error: error.message, stack: error.stack })
    }
  }

  private shouldLog(level: string): boolean {
    if (!this.config.enabled) return false

    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private log(level: string, message: string, context?: Record<string, any>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    }

    const logMessage = JSON.stringify(entry, null, this.config.level === 'debug' ? 2 : 0)

    if (this.config.logToConsole) {
      console.log(logMessage)
    }

    if (this.config.logToFile) {
      // In a real implementation, you'd append to a file
      // For now, we'll just log to console
    }
  }
}
```

## Usage Examples

### Basic Email Sending

```typescript
import { ResendEmailService } from './providers/resend'
import { EmailMessage } from './types'

// Configure the service
const emailService = new ResendEmailService({
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY,
  defaultFrom: 'noreply@example.com'
})

// Send a simple email
const message: EmailMessage = {
  to: 'user@example.com',
  from: 'noreply@example.com',
  subject: 'Welcome!',
  text: 'Welcome to our platform!',
  html: '<h1>Welcome!</h1><p>Welcome to our platform!</p>'
}

const result = await emailService.send(message)
if (result.success) {
  console.log('Email sent with ID:', result.messageId)
} else {
  console.error('Failed to send email:', result.error?.message)
}
```

### Batch Email Sending

```typescript
const messages: EmailMessage[] = [
  {
    to: 'user1@example.com',
    from: 'noreply@example.com',
    subject: 'Newsletter',
    text: 'Check out our latest updates...'
  },
  {
    to: 'user2@example.com',
    from: 'noreply@example.com',
    subject: 'Newsletter',
    text: 'Check out our latest updates...'
  }
]

const batchResult = await emailService.sendBatch(messages)
console.log(`Sent ${batchResult.successCount} emails successfully`)
```

### Email with Attachments

```typescript
const messageWithAttachment: EmailMessage = {
  to: 'user@example.com',
  from: 'noreply@example.com',
  subject: 'Invoice',
  text: 'Please find your invoice attached.',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: invoiceBuffer,  // Buffer from PDF generation
      contentType: 'application/pdf'
    }
  ]
}

await emailService.send(messageWithAttachment)
```

## Error Handling Patterns

### Provider-Specific Errors

```typescript
try {
  await emailService.send(message)
} catch (error) {
  if (error instanceof EmailError) {
    switch (error.code) {
      case 'RATE_LIMIT_ERROR':
        // Implement backoff and retry
        await delay(60000) // Wait 1 minute
        break
      case 'AUTH_ERROR':
        // Check API key configuration
        console.error('Invalid API key')
        break
      case 'VALIDATION_ERROR':
        // Fix message format
        console.error('Invalid email format')
        break
      default:
        // Log and alert
        console.error('Unexpected email error:', error.message)
    }
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreakerEmailService extends BaseEmailService {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  // Override sendMessage to add circuit breaker logic
  protected async sendMessage(message: EmailMessage): Promise<EmailSendResult> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > 60000) { // 1 minute timeout
        this.state = 'half-open'
      } else {
        throw new EmailError('CIRCUIT_BREAKER_OPEN', 'Circuit breaker is open', 503, true)
      }
    }

    try {
      const result = await super.sendMessage(message)
      if (this.state === 'half-open') {
        this.state = 'closed'
        this.failures = 0
      }
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      if (this.failures >= 5) { // Open circuit after 5 failures
        this.state = 'open'
      }

      throw error
    }
  }
}
```

## Testing Patterns

### Unit Testing Email Service

```typescript
import { jest } from '@jest/globals'
import { BaseEmailService } from '../base-email-service'

class MockEmailService extends BaseEmailService {
  async sendMessage(message: EmailMessage): Promise<EmailSendResult> {
    // Mock implementation
    return { success: true, messageId: 'mock-id' }
  }

  async getStatus(messageId: string): Promise<EmailStatus> {
    return { messageId, status: 'delivered' }
  }

  async validateConfig(): Promise<boolean> {
    return true
  }
}

describe('BaseEmailService', () => {
  let service: MockEmailService

  beforeEach(() => {
    service = new MockEmailService({
      provider: 'mock',
      apiKey: 'test-key'
    })
  })

  test('validates message correctly', async () => {
    const validMessage = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      text: 'Hello world'
    }

    const result = await service.send(validMessage)
    expect(result.success).toBe(true)
  })

  test('rejects invalid message', async () => {
    const invalidMessage = {
      to: 'invalid-email',
      from: 'sender@example.com',
      subject: 'Test',
      text: 'Hello world'
    }

    await expect(service.send(invalidMessage)).rejects.toThrow('Invalid email format')
  })

  test('retries on retryable errors', async () => {
    const mockSendMessage = jest.spyOn(service, 'sendMessage')
      .mockRejectedValueOnce(new EmailError('TIMEOUT_ERROR', 'Timeout', 408, true))
      .mockResolvedValueOnce({ success: true, messageId: 'retry-success' })

    const result = await service.send({
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test',
      text: 'Hello'
    })

    expect(mockSendMessage).toHaveBeenCalledTimes(2)
    expect(result.success).toBe(true)
  })
})
```

## Best Practices

1. **Validate Early**: Always validate email messages before sending
2. **Handle Attachments Carefully**: Validate file sizes and types
3. **Implement Rate Limiting**: Respect provider limits and implement backoff
4. **Use Proper Error Codes**: Return specific error codes for different failure types
5. **Log Appropriately**: Don't log sensitive data in production
6. **Test Thoroughly**: Test both success and failure scenarios
7. **Monitor Delivery**: Implement webhooks to track email delivery status
8. **Handle Bounces**: Implement bounce handling and unsubscribe management
9. **Secure API Keys**: Store credentials securely, rotate regularly
10. **Fallback Providers**: Implement multiple providers for redundancy

---

**Remember**: A robust email service requires careful error handling, rate limiting, and monitoring. This base implementation provides the foundation for building reliable email functionality.