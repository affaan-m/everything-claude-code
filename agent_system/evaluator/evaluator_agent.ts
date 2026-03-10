'use strict';

const { parseJsonWithFallback, safeArray, safeString } = require('../shared/json_utils.ts');
const { loadPrompt } = require('../shared/prompt_loader.ts');

class EvaluatorAgent {
  constructor(options) {
    const normalizedOptions = options || {};
    this.provider = normalizedOptions.provider;
    this.testRunner = normalizedOptions.testRunner;
    this.temperature = typeof normalizedOptions.temperature === 'number'
      ? normalizedOptions.temperature
      : 0.2;
  }

  async evaluate(input) {
    const normalizedInput = input || {};
    const testResults = await this.testRunner.run(
      normalizedInput.architecture && normalizedInput.architecture.testCommands
    );
    const fallbackEvaluation = createFallbackEvaluation(normalizedInput.execution, testResults);
    const prompt = loadPrompt('evaluator_prompt.md', {
      goal: normalizedInput.goal || '',
      execution: JSON.stringify(normalizedInput.execution || {}, null, 2),
      testResults: JSON.stringify(testResults, null, 2)
    });

    const response = await this.provider.complete({
      stage: 'evaluator',
      instructions: 'Return JSON only.',
      prompt,
      temperature: this.temperature,
      metadata: {
        ...normalizedInput,
        testResults
      }
    });

    const parsed = parseJsonWithFallback(response.text, fallbackEvaluation);

    return {
      status: safeString(parsed.status, fallbackEvaluation.status),
      score: typeof parsed.score === 'number' ? parsed.score : fallbackEvaluation.score,
      findings: safeArray(parsed.findings).map(String),
      nextSteps: safeArray(parsed.nextSteps).map(String),
      confidence: safeString(parsed.confidence, fallbackEvaluation.confidence),
      testResults
    };
  }
}

function createFallbackEvaluation(execution, testResults) {
  const failedExecutionSteps = Array.isArray(execution && execution.steps)
    ? execution.steps.filter((step) => step.observation && step.observation.ok === false)
    : [];
  const failedCount = failedExecutionSteps.length + (testResults.failedCount || 0);

  return {
    status: failedCount > 0 ? 'fail' : 'pass',
    score: failedCount > 0 ? 0.5 : 0.95,
    findings: failedCount > 0
      ? ['At least one action or test command failed.']
      : ['All recorded actions and test commands passed.'],
    nextSteps: failedCount > 0
      ? ['Inspect the failing observations and retry the builder loop.']
      : ['Reflect on the successful pattern and save it to the skill library.'],
    confidence: failedCount > 0 ? 'medium' : 'high'
  };
}

module.exports = {
  EvaluatorAgent
};
