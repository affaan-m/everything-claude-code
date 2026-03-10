'use strict';

const { parseJsonWithFallback, safeArray, safeString } = require('../shared/json_utils.ts');
const { loadPrompt } = require('../shared/prompt_loader.ts');

class ExecutorAgent {
  constructor(options) {
    const normalizedOptions = options || {};
    this.provider = normalizedOptions.provider;
    this.toolRunner = normalizedOptions.toolRunner;
    this.maxSteps = Number.isInteger(normalizedOptions.maxSteps) ? normalizedOptions.maxSteps : 6;
    this.temperature = typeof normalizedOptions.temperature === 'number'
      ? normalizedOptions.temperature
      : 0.2;
  }

  async execute(input) {
    const normalizedInput = input || {};
    const reactHistory = [];
    const artifactPaths = [];
    let completionSummary = '';

    for (let stepIndex = 0; stepIndex < this.maxSteps; stepIndex += 1) {
      const prompt = loadPrompt('builder_prompt.md', {
        goal: normalizedInput.goal || '',
        architecture: JSON.stringify(normalizedInput.architecture || {}, null, 2),
        reactHistory: JSON.stringify(reactHistory, null, 2)
      });

      const fallbackDecision = createFallbackDecision(normalizedInput.architecture, reactHistory);
      const response = await this.provider.complete({
        stage: 'builder',
        instructions: 'Return JSON only.',
        prompt,
        temperature: this.temperature,
        metadata: {
          ...normalizedInput,
          reactHistory
        }
      });

      const parsedDecision = parseJsonWithFallback(response.text, fallbackDecision);
      const normalizedDecision = normalizeDecision(parsedDecision, fallbackDecision);

      if (normalizedDecision.action.type === 'finish' || normalizedDecision.isComplete) {
        completionSummary = normalizedDecision.action.summary || normalizedDecision.thought;
        break;
      }

      const observation = await this.toolRunner.run(normalizedDecision.action);
      const nextHistoryEntry = {
        step: stepIndex + 1,
        thought: normalizedDecision.thought,
        action: normalizedDecision.action,
        observation
      };

      reactHistory.push(nextHistoryEntry);
      if (observation && observation.path) {
        artifactPaths.push(observation.path);
      }
    }

    return {
      status: completionSummary ? 'completed' : 'incomplete',
      steps: reactHistory,
      summary: completionSummary || 'Builder reached the ReAct step limit before issuing a finish action.',
      artifacts: Array.from(new Set(artifactPaths))
    };
  }
}

function createFallbackDecision(architecture, reactHistory) {
  const executionPlan = Array.isArray(architecture && architecture.executionPlan)
    ? architecture.executionPlan
    : [];
  const nextStep = executionPlan[reactHistory.length];

  if (nextStep && nextStep.suggestedAction) {
    return {
      thought: nextStep.goal || 'Execute the next planned action.',
      action: nextStep.suggestedAction,
      isComplete: false
    };
  }

  return {
    thought: 'No further planned actions remain.',
    action: {
      type: 'finish',
      summary: 'Execution plan is complete.'
    },
    isComplete: true
  };
}

function normalizeDecision(parsedDecision, fallbackDecision) {
  const action = parsedDecision && parsedDecision.action ? parsedDecision.action : fallbackDecision.action;

  return {
    thought: safeString(parsedDecision && parsedDecision.thought, fallbackDecision.thought),
    action: {
      ...action
    },
    isComplete: Boolean(parsedDecision && parsedDecision.isComplete)
  };
}

module.exports = {
  ExecutorAgent
};
