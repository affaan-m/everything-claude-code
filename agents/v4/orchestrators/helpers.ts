import { TaskOrchestrator } from '../agents/orchestration/task-orchestrator.js';
import { TaskRegistry } from '../agents/tasks/task-registry.js';
import { OrchestratorConfig } from './index.js';

const s = (val: unknown): string => String(val).replace(/[\r\n]/g, ' ');

/**
 * Set up and initialize an orchestrator from configuration
 */
export async function setupOrchestrator(config: OrchestratorConfig): Promise<{ orchestrator: TaskOrchestrator; registry: TaskRegistry }> {
  const registry = new TaskRegistry();
  
  // Register tasks from config
  if (config.tasks?.tasks) {
    for (const [type, taskDef] of Object.entries(config.tasks.tasks)) {
      const def = taskDef as any;
      registry.registerTaskDefinition({
        type,
        description: def.description,
        requiredCapabilities: def.required_capabilities || [],
        priority: def.priority === 'critical' ? 10 : def.priority === 'high' ? 7 : 5,
        estimatedDuration: def.timeout_ms || 300000,
        timeout: def.timeout_ms || 600000,
        retryable: true,
      });
    }
  }
  
  // Register workflows from config
  if (config.tasks?.workflows) {
    for (const [name, workflowDef] of Object.entries(config.tasks.workflows)) {
      const def = workflowDef as any;
      registry.registerWorkflow({
        name,
        description: def.description,
        tasks: def.steps?.map((step: any) => ({
          type: step.task,
          parallel: false,
        })) || [],
      });
    }
  }
  
  const orchestrator = new TaskOrchestrator({}, registry);
  await orchestrator.start();
  return { orchestrator, registry };
}

/**
 * Set up orchestrator with event monitoring
 */
export async function setupOrchestratorWithMonitoring(
  config: OrchestratorConfig,
  verbose: boolean = false
): Promise<{ orchestrator: TaskOrchestrator; registry: TaskRegistry }> {
  const { orchestrator, registry } = await setupOrchestrator(config);
  
  // Add event listeners
  orchestrator.on('task:submitted', (task) => {
    console.log(`✓ Task submitted: ${s(task.description)}`);
  });
  
  if (verbose) {
    orchestrator.on('task:assigned', (event) => {
      console.log(`→ Task assigned: ${s(event.task.description)} to ${s(event.agent.type)}`);
    });
    
    orchestrator.on('task:started', (task) => {
      console.log(`▶ Task started: ${s(task.description)}`);
    });
  }
  
  orchestrator.on('task:completed', (event) => {
    const duration = event.result?.executionTime || 0;
    console.log(`✓ Task completed: ${s(event.task.description)} (${s(duration)}ms)`);
  });
  
  orchestrator.on('task:failed', (event) => {
    console.error(`✗ Task failed: ${s(event.task.description)} - ${s(event.error)}`);
  });
  
  orchestrator.on('workflow:started', (event) => {
    console.log(`⚡ Workflow started: ${s(event.description || event.workflowId)}`);
  });
  
  orchestrator.on('workflow:progress', (event) => {
    console.log(`→ Workflow progress: step ${s(event.step)} completed`);
  });
  
  orchestrator.on('workflow:completed', (event) => {
    console.log(`✓ Workflow completed: ${s(event.description || event.workflowId)}`);
  });
  
  if (verbose) {
    orchestrator.on('agent:spawned', (event) => {
      console.log(`+ Agent spawned: ${s(event.type)} (${s(event.id)})`);
    });
    
    orchestrator.on('agent:terminated', (event) => {
      console.log(`- Agent terminated: ${s(event.type)} (${s(event.id)})`);
    });
  }
  
  return { orchestrator, registry };
}

/**
 * Run a workflow and wait for completion
 */
export async function runWorkflow(
  orchestrator: TaskOrchestrator,
  registry: TaskRegistry,
  workflowName: string,
  inputs: any
): Promise<any> {
  // Expand workflow into tasks
  const workflow = registry.getWorkflow(workflowName);
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowName}`);
  }
  
  const tasks = registry.expandWorkflow(workflowName);
  const results: any[] = [];
  
  // Execute tasks sequentially
  for (const taskInfo of tasks) {
    const task = await orchestrator.submitTask({
      type: taskInfo.type,
      description: taskInfo.definition.description,
      input: inputs
    });
    
    const result = await new Promise((resolve, reject) => {
      const timeoutMs = taskInfo.definition.timeout ?? 60000;
      const timeout = setTimeout(() => {
        orchestrator.off('task:completed', onCompleted);
        orchestrator.off('task:failed', onFailed);
        reject(new Error(`Task ${task.id} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      function onCompleted(event: any) {
        if (event.task.id !== task.id) return;
        clearTimeout(timeout);
        orchestrator.off('task:completed', onCompleted);
        orchestrator.off('task:failed', onFailed);
        resolve(event.result);
      }

      function onFailed(event: any) {
        if (event.task.id !== task.id) return;
        clearTimeout(timeout);
        orchestrator.off('task:completed', onCompleted);
        orchestrator.off('task:failed', onFailed);
        reject(event.error);
      }

      orchestrator.on('task:completed', onCompleted);
      orchestrator.on('task:failed', onFailed);
    });
    
    results.push(result);
  }
  
  return results;
}

/**
 * Run a task and wait for completion
 */
export async function runTask(
  orchestrator: TaskOrchestrator,
  taskType: string,
  inputs: any,
  registry?: TaskRegistry
): Promise<any> {
  const task = await orchestrator.submitTask({ 
    type: taskType, 
    description: `Task: ${taskType}`,
    input: inputs 
  });
  
  const taskDef = registry?.getTaskDefinition(taskType);
  const timeoutMs = taskDef?.timeout ?? 60000;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      orchestrator.off('task:completed', onCompleted);
      orchestrator.off('task:failed', onFailed);
      reject(new Error(`Task ${task.id} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    function onCompleted(event: any) {
      if (event.task.id !== task.id) return;
      clearTimeout(timeout);
      orchestrator.off('task:completed', onCompleted);
      orchestrator.off('task:failed', onFailed);
      resolve(event.result);
    }

    function onFailed(event: any) {
      if (event.task.id !== task.id) return;
      clearTimeout(timeout);
      orchestrator.off('task:completed', onCompleted);
      orchestrator.off('task:failed', onFailed);
      reject(event.error);
    }

    orchestrator.on('task:completed', onCompleted);
    orchestrator.on('task:failed', onFailed);
  });
}

export default {
  setupOrchestrator,
  setupOrchestratorWithMonitoring,
  runWorkflow,
  runTask,
};
