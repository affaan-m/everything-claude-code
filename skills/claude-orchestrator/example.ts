import { ClaudeOrchestrator, ToolDefinition } from './index';

// Example usage of Claude Orchestrator

async function main() {
  // Initialize orchestrator
  const orchestrator = new ClaudeOrchestrator({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: 'claude-sonnet-4-0',
    maxRetries: 3,
    enableStreaming: true,
    enableMetrics: true
  });

  // Register some example tools
  const tools: ToolDefinition[] = [
    {
      name: 'read_file',
      description: 'Read the contents of a file',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' }
        },
        required: ['path']
      }
    },
    {
      name: 'search_code',
      description: 'Search for code patterns in the codebase',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          include: { type: 'array', items: { type: 'string' }, description: 'File patterns to include' }
        },
        required: ['query']
      }
    }
  ];

  tools.forEach(tool => orchestrator.registerTool(tool));

  try {
    // Example 1: Basic task execution
    console.log('=== Basic Task Execution ===');
    const result1 = await orchestrator.executeTask({
      messages: [
        {
          role: 'user',
          content: 'Analyze this TypeScript file for potential improvements'
        }
      ],
      tools: tools
    });

    console.log('Task completed:', {
      success: result1.success,
      tokens: result1.usage?.total_tokens,
      toolCalls: result1.tool_calls,
      duration: `${result1.duration_ms}ms`
    });

    // Example 2: Streaming execution
    console.log('\n=== Streaming Execution ===');
    const result2 = await orchestrator.executeWithStreaming({
      messages: [
        {
          role: 'user',
          content: 'Help me refactor this function to be more readable'
        }
      ],
      tools: tools,
      onChunk: (chunk) => {
        if (chunk.type === 'content') {
          process.stdout.write(chunk.content);
        } else if (chunk.type === 'tool_call') {
          console.log(`\n[Tool Call: ${chunk.tool_call?.name}]`);
        }
      }
    });

    console.log('\nStreaming completed:', {
      success: result2.success,
      tokens: result2.usage?.total_tokens
    });

    // Example 3: Check metrics
    console.log('\n=== Metrics Summary ===');
    const metrics = orchestrator.getMetrics();
    console.log('Tasks completed:', metrics.tasksCompleted);
    console.log('Average duration:', `${Math.round(metrics.averageDuration)}ms`);
    console.log('Total tokens used:', metrics.totalTokensUsed);
    console.log('Tool success rate:', `${Math.round(metrics.toolSuccessRate)}%`);

    // Example 4: Check rate limits
    console.log('\n=== Rate Limit Status ===');
    const rateLimitStatus = orchestrator.getRateLimitStatus();
    console.log('Current usage:', rateLimitStatus.requestsInWindow);
    console.log('Limit:', rateLimitStatus.limit);
    console.log('Can make request:', rateLimitStatus.canMakeRequest);

  } catch (error) {
    console.error('Orchestrator error:', error);
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}