/**
 * Example: Task-Driven Swarm Orchestration
 * 
 * Demonstrates how to use the orchestration system
 */

import { TaskOrchestrator } from './index.js';

async function main() {
  console.log('🚀 Starting Task-Driven Swarm Orchestration\n');

  // Create orchestrator
  const orchestrator = new TaskOrchestrator({
    maxConcurrentTasks: 5,
    enableAutoScale: true,
    enableMetrics: true,
  });

  // Setup event listeners
  orchestrator.on('task:submitted', (task) => {
    console.log(`📝 Task submitted: ${task.id} (${task.type})`);
  });

  orchestrator.on('task:assigned', ({ task, agent }) => {
    console.log(`👤 Task ${task.id} assigned to agent ${agent.id} (${agent.type})`);
  });

  orchestrator.on('task:started', (task) => {
    console.log(`▶️  Task ${task.id} started`);
  });

  orchestrator.on('task:completed', ({ task, result }) => {
    console.log(`✅ Task ${task.id} completed in ${result.executionTime}ms`);
  });

  orchestrator.on('task:failed', ({ task, error }) => {
    console.log(`❌ Task ${task.id} failed: ${error}`);
  });

  orchestrator.on('agent:spawned', (agent) => {
    console.log(`🤖 Agent spawned: ${agent.id} (${agent.type})`);
  });

  // Start orchestrator
  await orchestrator.start();
  console.log('✨ Orchestrator started\n');

  // Example 1: Submit individual tasks
  console.log('--- Example 1: Individual Tasks ---\n');

  const task1 = await orchestrator.submitTask({
    type: 'code.generate',
    description: 'Generate user authentication module',
    priority: 3,
    input: {
      language: 'typescript',
      framework: 'express',
    },
  });

  const task2 = await orchestrator.submitTask({
    type: 'review.code',
    description: 'Review authentication module',
    priority: 4,
    dependencies: [task1.id], // Depends on task1
  });

  const task3 = await orchestrator.submitTask({
    type: 'test.unit',
    description: 'Create unit tests for authentication',
    priority: 5,
    dependencies: [task1.id],
  });

  // Wait for tasks to complete
  await sleep(5000);

  // Example 2: Check task status
  console.log('\n--- Example 2: Task Status ---\n');

  const status1 = await orchestrator.getTaskStatus(task1.id);
  console.log(`Task ${task1.id} status:`, status1?.status);

  const result1 = await orchestrator.getTaskResult(task1.id);
  if (result1) {
    console.log(`Task ${task1.id} result:`, result1.output);
  }

  // Example 3: List tasks
  console.log('\n--- Example 3: List Tasks ---\n');

  const { tasks, total } = await orchestrator.listTasks({
    status: 'completed',
    limit: 10,
  });

  console.log(`Found ${total} completed tasks:`);
  tasks.forEach(task => {
    console.log(`  - ${task.id}: ${task.type} (priority: ${task.priority})`);
  });

  // Example 4: Get metrics
  console.log('\n--- Example 4: Metrics ---\n');

  const metrics = orchestrator.getMetrics();
  console.log('Orchestrator metrics:');
  console.log(`  Total tasks: ${metrics.totalTasks}`);
  console.log(`  Completed: ${metrics.completedTasks}`);
  console.log(`  Failed: ${metrics.failedTasks}`);
  console.log(`  Active: ${metrics.activeTasks}`);
  console.log(`  Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
  console.log(`  Avg duration: ${metrics.averageTaskDuration.toFixed(0)}ms`);

  // Wait a bit more
  await sleep(3000);

  // Stop orchestrator
  console.log('\n🛑 Stopping orchestrator...');
  await orchestrator.stop();
  console.log('✨ Orchestrator stopped\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run example
main().catch(console.error);
