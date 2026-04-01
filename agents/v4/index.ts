/**
 * Shadow DCP v4 - Task-Driven Swarm Orchestration
 * 
 * Main entry point that exports the task-driven orchestration system.
 */

// Export everything from agents
export * from './agents/index.js';

// Re-export for convenience
export { TaskOrchestrator } from './agents/orchestration/task-orchestrator.js';
export { SwarmCoordinator } from './agents/orchestration/swarm-coordinator.js';
export { CapabilityMatcher } from './agents/orchestration/capability-matcher.js';
export { TaskRegistry } from './agents/tasks/task-registry.js';
export { TaskQueue } from './agents/tasks/task-queue.js';
export { TaskExecutor } from './agents/tasks/task-executor.js';
export { taskTools } from './agents/tools/task-tools.js';
export { swarmTools } from './agents/tools/swarm-tools.js';

// Package metadata
export const metadata = {
  name: 'shadow-dcp-v4',
  version: '4.0.0',
  description: 'Task-driven swarm orchestration system',
  architecture: 'framework-agnostic',
};
