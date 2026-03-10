'use strict';

const { parseJsonWithFallback, safeArray, safeString } = require('../shared/json_utils.ts');
const { loadPrompt } = require('../shared/prompt_loader.ts');
const { slugify } = require('../shared/file_utils.ts');

class ArchitectureAgent {
  constructor(options) {
    const normalizedOptions = options || {};
    this.provider = normalizedOptions.provider;
    this.temperature = typeof normalizedOptions.temperature === 'number'
      ? normalizedOptions.temperature
      : 0.2;
  }

  async design(input) {
    const normalizedInput = input || {};
    const fallbackArchitecture = createFallbackArchitecture(normalizedInput.goal, normalizedInput.plan);
    const prompt = loadPrompt('architect_prompt.md', {
      goal: normalizedInput.goal || '',
      plan: JSON.stringify(normalizedInput.plan || {}, null, 2),
      taskGraph: JSON.stringify(normalizedInput.taskGraph || {}, null, 2)
    });

    const response = await this.provider.complete({
      stage: 'architect',
      instructions: 'Return JSON only.',
      prompt,
      temperature: this.temperature,
      metadata: normalizedInput
    });

    const parsed = parseJsonWithFallback(response.text, fallbackArchitecture);
    return normalizeArchitecture(parsed, fallbackArchitecture);
  }
}

function createFallbackArchitecture(goal, plan) {
  const artifactPath = `agent-output/${slugify(goal || 'task')}-run.md`;
  const secondTaskId = plan && Array.isArray(plan.tasks) && plan.tasks[1] ? plan.tasks[1].id : 'task-build';
  const thirdTaskId = plan && Array.isArray(plan.tasks) && plan.tasks[2] ? plan.tasks[2].id : 'task-evaluate';

  return {
    strategy: `Create and verify ${artifactPath} as a contained execution artifact.`,
    modules: [
      {
        name: 'builder',
        responsibility: 'Write the execution artifact.'
      },
      {
        name: 'evaluator',
        responsibility: 'Confirm the artifact exists.'
      }
    ],
    executionPlan: [
      {
        id: 'write-artifact',
        taskId: secondTaskId,
        goal: 'Write the execution artifact.',
        suggestedAction: {
          type: 'write_file',
          path: artifactPath,
          content: `# Artifact\n\nGoal: ${goal || 'task'}\n`
        }
      },
      {
        id: 'read-artifact',
        taskId: thirdTaskId,
        goal: 'Read the execution artifact.',
        suggestedAction: {
          type: 'read_file',
          path: artifactPath
        }
      }
    ],
    testCommands: [
      `node -e "const fs=require('fs');process.exit(fs.existsSync('${artifactPath}') ? 0 : 1)"`
    ],
    artifacts: [artifactPath],
    notes: ['Fallback architecture generated.']
  };
}

function normalizeArchitecture(parsedArchitecture, fallbackArchitecture) {
  const executionPlan = safeArray(parsedArchitecture.executionPlan);

  return {
    strategy: safeString(parsedArchitecture.strategy, fallbackArchitecture.strategy),
    modules: safeArray(parsedArchitecture.modules).map((moduleDefinition) => ({
      name: safeString(moduleDefinition.name, 'module'),
      responsibility: safeString(moduleDefinition.responsibility, '')
    })),
    executionPlan: executionPlan.length > 0
      ? executionPlan.map(normalizeExecutionStep)
      : fallbackArchitecture.executionPlan.map(normalizeExecutionStep),
    testCommands: safeArray(parsedArchitecture.testCommands).map(String),
    artifacts: safeArray(parsedArchitecture.artifacts).map(String),
    notes: safeArray(parsedArchitecture.notes).map(String)
  };
}

function normalizeExecutionStep(step, index) {
  const normalizedStep = step || {};
  return {
    id: safeString(normalizedStep.id, `execution-step-${index + 1}`),
    taskId: safeString(normalizedStep.taskId, ''),
    goal: safeString(normalizedStep.goal, ''),
    suggestedAction: normalizedStep.suggestedAction || {}
  };
}

module.exports = {
  ArchitectureAgent
};
