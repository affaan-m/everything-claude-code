/**
 * Task-Driven Swarm Orchestration System
 * 
 * A framework-agnostic orchestration system where:
 * - Tasks define what needs to be done
 * - Swarms execute tasks based on capabilities
 * - No vendor lock-in or framework dependencies
 */

// Orchestration
export { TaskOrchestrator } from './orchestration/task-orchestrator.js';
export { SwarmCoordinator } from './orchestration/swarm-coordinator.js';
export { CapabilityMatcher } from './orchestration/capability-matcher.js';

// Tasks
export { TaskRegistry } from './tasks/task-registry.js';
export { TaskQueue } from './tasks/task-queue.js';
export { TaskExecutor } from './tasks/task-executor.js';

// Tools
export { taskTools } from './tools/task-tools.js';
export { swarmTools } from './tools/swarm-tools.js';

// Types
export type {
  Task,
  TaskStatus,
  TaskResult,
  OrchestratorConfig,
  OrchestratorMetrics,
} from './orchestration/task-orchestrator.js';

export type {
  Agent,
  AgentStatus,
  SwarmConfig,
  SwarmMetrics,
} from './orchestration/swarm-coordinator.js';

export type {
  TaskDefinition,
  WorkflowDefinition,
} from './tasks/task-registry.js';

export type {
  MCPTool,
  ToolContext,
} from './tools/task-tools.js';
