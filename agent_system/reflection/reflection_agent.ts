'use strict';

const { parseJsonWithFallback, safeArray, safeString } = require('../shared/json_utils.ts');
const { loadPrompt } = require('../shared/prompt_loader.ts');
const { toSnakeCase } = require('../shared/file_utils.ts');

class ReflectionAgent {
  constructor(options) {
    const normalizedOptions = options || {};
    this.provider = normalizedOptions.provider;
    this.temperature = typeof normalizedOptions.temperature === 'number'
      ? normalizedOptions.temperature
      : 0.2;
  }

  async reflect(input) {
    const normalizedInput = input || {};
    const fallbackReflection = createFallbackReflection(normalizedInput.goal, normalizedInput.execution, normalizedInput.evaluation);
    const prompt = loadPrompt('reflection_prompt.md', {
      goal: normalizedInput.goal || '',
      execution: JSON.stringify(normalizedInput.execution || {}, null, 2),
      evaluation: JSON.stringify(normalizedInput.evaluation || {}, null, 2)
    });

    const response = await this.provider.complete({
      stage: 'reflection',
      instructions: 'Return JSON only.',
      prompt,
      temperature: this.temperature,
      metadata: normalizedInput
    });

    const parsed = parseJsonWithFallback(response.text, fallbackReflection);

    return {
      summary: safeString(parsed.summary, fallbackReflection.summary),
      lessons: safeArray(parsed.lessons).map(String),
      failureModes: safeArray(parsed.failureModes).map(String),
      semanticInsights: safeArray(parsed.semanticInsights).map(normalizeSemanticInsight),
      skillCandidate: normalizeSkillCandidate(parsed.skillCandidate || fallbackReflection.skillCandidate)
    };
  }
}

function createFallbackReflection(goal, execution, evaluation) {
  const toolNames = Array.isArray(execution && execution.steps)
    ? Array.from(new Set(execution.steps
        .map((step) => step.action && step.action.type)
        .filter(Boolean)))
    : ['write_file', 'read_file', 'terminal_command'];
  const skillSlug = toSnakeCase(goal || 'reusable-skill');

  return {
    summary: `Captured a reusable pattern for "${goal || 'the run'}".`,
    lessons: [
      'Search procedural skills before planning.',
      'Verify each builder action with an explicit observation.',
      'Persist reflections so the next run can reuse them.'
    ],
    failureModes: [
      evaluation && evaluation.status === 'pass'
        ? 'Real model providers may need stronger policy constraints than mock mode.'
        : 'Failed evaluations should trigger another builder loop before closing the task.'
    ],
    semanticInsights: [
      {
        topic: 'continuous-learning',
        fact: 'A useful agent loop saves plan, execution, evaluation, and reflection separately so they can be retrieved later.',
        tags: ['agents', 'memory', 'learning']
      }
    ],
    skillCandidate: {
      slug: skillSlug,
      title: goal || 'Reusable skill',
      tags: buildTags(goal),
      problem: `Need a repeatable operating procedure for: ${goal || 'this task'}.`,
      steps: [
        'Search existing skills.',
        'Plan and architect the work.',
        'Execute with a ReAct loop.',
        'Evaluate and persist the lesson.'
      ],
      toolsUsed: toolNames,
      commonFailures: [
        'Skipping evaluation leaves the run without trustworthy feedback.',
        'Skipping memory updates forces future runs to rediscover the same pattern.'
      ],
      reusablePattern: 'Search → plan → architect → execute → evaluate → reflect → store the reusable procedure.'
    }
  };
}

function normalizeSemanticInsight(insight) {
  return {
    topic: safeString(insight.topic, 'general'),
    fact: safeString(insight.fact, ''),
    tags: safeArray(insight.tags).map(String)
  };
}

function normalizeSkillCandidate(skillCandidate) {
  return {
    slug: toSnakeCase(skillCandidate.slug || skillCandidate.title || 'reusable_skill'),
    title: safeString(skillCandidate.title, 'Reusable skill'),
    tags: safeArray(skillCandidate.tags).map(String),
    problem: safeString(skillCandidate.problem, ''),
    steps: safeArray(skillCandidate.steps).map(String),
    toolsUsed: safeArray(skillCandidate.toolsUsed).map(String),
    commonFailures: safeArray(skillCandidate.commonFailures).map(String),
    reusablePattern: safeString(skillCandidate.reusablePattern, '')
  };
}

function buildTags(goal) {
  return String(goal || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2)
    .slice(0, 6);
}

module.exports = {
  ReflectionAgent
};
