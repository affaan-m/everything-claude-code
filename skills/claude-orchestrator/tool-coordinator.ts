import { ToolDefinition, ToolCall, ToolResult, ToolExecutionError } from './types';

export class ToolCoordinator {
  private tools = new Map<string, ToolDefinition>();

  /**
   * Register a tool for execution
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute a single tool call
   */
  async executeTool(call: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(call.name);
    if (!tool) {
      throw new ToolExecutionError(
        `Tool ${call.name} not registered`,
        call.name,
        call
      );
    }

    try {
      // Validate tool call
      this.validateToolCall(call, tool);

      // Execute tool (this would be implemented by the actual tool)
      const result = await this.callToolImplementation(call, tool);

      return {
        tool_call_id: call.id,
        content: result,
        is_error: false
      };

    } catch (error) {
      return {
        tool_call_id: call.id,
        content: (error as Error).message,
        is_error: true
      };
    }
  }

  /**
   * Execute multiple tool calls in parallel
   */
  async executeParallel(calls: ToolCall[]): Promise<ToolResult[]> {
    const promises = calls.map(call => this.executeTool(call));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          tool_call_id: calls[index].id,
          content: result.reason.message,
          is_error: true
        };
      }
    });
  }

  /**
   * Execute tool calls with dependency management
   */
  async executeWithDependencies(
    calls: ToolCall[],
    dependencies: Map<string, string[]> = new Map()
  ): Promise<ToolResult[]> {
    const results = new Map<string, ToolResult>();
    const executing = new Set<string>();
    const completed = new Set<string>();

    // Execute independent calls first
    const independent = calls.filter(call =>
      !dependencies.has(call.id) ||
      dependencies.get(call.id)!.every(depId => completed.has(depId))
    );

    if (independent.length > 0) {
      const independentResults = await this.executeParallel(independent);
      independentResults.forEach(result => {
        results.set(result.tool_call_id, result);
        completed.add(result.tool_call_id);
      });
    }

    // Execute dependent calls
    const remaining = calls.filter(call => !results.has(call.id));

    for (const call of remaining) {
      const deps = dependencies.get(call.id) || [];
      const depResults = deps.map(depId => results.get(depId)).filter(Boolean);

      if (depResults.length === deps.length) {
        const result = await this.executeTool(call);
        results.set(call.id, result);
        completed.add(call.id);
      }
    }

    return Array.from(results.values());
  }

  /**
   * Get registered tools
   */
  getRegisteredTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if tool is registered
   */
  isToolRegistered(name: string): boolean {
    return this.tools.has(name);
  }

  private validateToolCall(call: ToolCall, tool: ToolDefinition): void {
    // Validate required parameters
    if (tool.input_schema.required) {
      for (const required of tool.input_schema.required) {
        if (!(required in call.input)) {
          throw new ToolExecutionError(
            `Missing required parameter: ${required}`,
            tool.name,
            call
          );
        }
      }
    }

    // Basic type validation could be added here
    // For now, we'll trust the LLM to provide valid inputs
  }

  private async callToolImplementation(call: ToolCall, tool: ToolDefinition): Promise<string> {
    // This is where the actual tool implementation would be called
    // For now, return a mock response
    // In a real implementation, this would route to the actual tool

    console.log(`Executing tool: ${call.name} with input:`, call.input);

    // Mock implementations for common tools
    switch (call.name) {
      case 'read_file':
        return `Contents of ${call.input.path}`;
      case 'write_file':
        return `Wrote ${call.input.content.length} characters to ${call.input.path}`;
      case 'run_command':
        return `Executed: ${call.input.command}`;
      case 'search_code':
        return `Found ${call.input.query} in files: ${call.input.include?.join(', ') || 'all'}`;
      default:
        return `Tool ${call.name} executed successfully with input: ${JSON.stringify(call.input)}`;
    }
  }
}