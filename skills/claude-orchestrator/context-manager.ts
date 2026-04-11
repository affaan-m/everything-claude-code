import { Message, ExecutionContext, OrchestratorConfig } from './types';

export class ContextManager {
  constructor(private config: Required<OrchestratorConfig>) {}

  /**
   * Estimate token count for messages
   */
  estimateTokens(messages: Message[]): number {
    let totalTokens = 0;

    for (const message of messages) {
      if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (block.type === 'text' && block.text) {
            totalTokens += this.estimateTextTokens(block.text);
          } else if (block.type === 'image') {
            totalTokens += this.estimateImageTokens(block);
          } else if (block.type === 'tool_use') {
            totalTokens += this.estimateToolTokens(block);
          }
        }
      } else {
        totalTokens += this.estimateTextTokens(message.content);
      }

      // Add tokens for message structure
      totalTokens += 4; // Base tokens per message
    }

    return totalTokens;
  }

  /**
   * Check if context should be compacted
   */
  shouldCompact(context: ExecutionContext): boolean {
    const totalTokens = this.estimateTokens(context.messages);
    return totalTokens > this.config.maxContextTokens * 0.8;
  }

  /**
   * Compact context by removing redundant or old messages
   */
  compactContext(messages: Message[]): Message[] {
    if (messages.length <= 2) return messages;

    const compacted: Message[] = [];

    // Always keep the last user message and system message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const systemMessage = messages.find(m => m.role === 'system');

    if (systemMessage) {
      compacted.push(systemMessage);
    }

    // Add recent conversation history (last 4 messages)
    const recentMessages = messages.slice(-4);
    compacted.push(...recentMessages);

    // Ensure we have the last user message
    if (lastUserMessage && !compacted.some(m => m === lastUserMessage)) {
      compacted.push(lastUserMessage);
    }

    return compacted;
  }

  /**
   * Partition large context into smaller chunks
   */
  partitionContext(messages: Message[], options: {
    maxPartitionSize: number;
    overlapTokens: number;
  }): Message[][] {
    const partitions: Message[][] = [];
    let currentPartition: Message[] = [];
    let currentTokens = 0;

    for (const message of messages) {
      const messageTokens = this.estimateTokens([message]);

      if (currentTokens + messageTokens > options.maxPartitionSize && currentPartition.length > 0) {
        partitions.push(currentPartition);
        // Start new partition with overlap
        const overlapStart = Math.max(0, currentPartition.length - Math.floor(options.overlapTokens / 100));
        currentPartition = currentPartition.slice(overlapStart);
        currentTokens = this.estimateTokens(currentPartition);
      }

      currentPartition.push(message);
      currentTokens += messageTokens;
    }

    if (currentPartition.length > 0) {
      partitions.push(currentPartition);
    }

    return partitions;
  }

  private estimateTextTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private estimateImageTokens(block: any): number {
    // Claude charges tokens based on image size
    // This is a rough estimation
    return 170; // Base tokens for low-res images
  }

  private estimateToolTokens(block: any): number {
    // Tool calls have token overhead
    const inputTokens = block.input ? this.estimateTextTokens(JSON.stringify(block.input)) : 0;
    return 100 + inputTokens; // Base overhead + input
  }
}