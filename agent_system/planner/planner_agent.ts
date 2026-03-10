'use strict';

const { parseJsonWithFallback, safeArray, safeString } = require('../shared/json_utils.ts');
const { loadPrompt } = require('../shared/prompt_loader.ts');

class PlannerAgent {
  constructor(options) {
    const normalizedOptions = options || {};
    this.provider = normalizedOptions.provider;
    this.temperature = typeof normalizedOptions.temperature === 'number'
      ? normalizedOptions.temperature
      : 0.2;
  }

  async plan(input) {
    const normalizedInput = input || {};
    const fallbackPlan = createFallbackPlan(normalizedInput.goal);
    const prompt = loadPrompt('planner_prompt.md', {
      goal: normalizedInput.goal || '',
      shortTermMemory: summarizeShortTermMemory(normalizedInput.shortTermMemory),
      retrievedSkills: summarizeSkills(normalizedInput.retrievedSkills),
      semanticHints: summarizeSemanticHints(normalizedInput.semanticHints)
    });

    const response = await this.provider.complete({
      stage: 'planner',
      instructions: 'Return JSON only.',
      prompt,
      temperature: this.temperature,
      metadata: normalizedInput
    });

    const parsed = parseJsonWithFallback(response.text, fallbackPlan);
    return normalizePlan(parsed, fallbackPlan);
  }
}

function createFallbackPlan(goal) {
  const normalizedGoal = goal || 'Complete the requested task';
  return {
    summary: `Plan the work needed to accomplish: ${normalizedGoal}.`,
    tasks: [
      {
        id: 'task-plan',
        title: 'Clarify the goal',
        description: 'Restate the goal and gather relevant context.',
        dependencies: [],
        acceptanceCriteria: ['Goal is clearly restated.'],
        suggestedTools: ['skill_search']
      },
      {
        id: 'task-build',
        title: 'Execute a contained slice',
        description: 'Perform a concrete action that advances the task.',
        dependencies: ['task-plan'],
        acceptanceCriteria: ['A concrete artifact exists.'],
        suggestedTools: ['write_file', 'read_file']
      },
      {
        id: 'task-evaluate',
        title: 'Verify and learn',
        description: 'Evaluate the outcome and capture the lesson.',
        dependencies: ['task-build'],
        acceptanceCriteria: ['Evaluation passes.', 'Reflection is captured.'],
        suggestedTools: ['terminal_command', 'memory']
      }
    ],
    risks: ['No fallback-specific risks recorded.'],
    assumptions: ['The workspace is writable.'],
    successMetrics: ['The task finishes with a reusable skill.']
  };
}

function normalizePlan(parsedPlan, fallbackPlan) {
  const tasks = safeArray(parsedPlan.tasks);

  return {
    summary: safeString(parsedPlan.summary, fallbackPlan.summary),
    tasks: tasks.length > 0 ? tasks.map(normalizeTask) : fallbackPlan.tasks.map(normalizeTask),
    risks: safeArray(parsedPlan.risks).map(String),
    assumptions: safeArray(parsedPlan.assumptions).map(String),
    successMetrics: safeArray(parsedPlan.successMetrics).map(String)
  };
}

function normalizeTask(task, index) {
  const normalizedTask = task || {};
  return {
    id: safeString(normalizedTask.id, `task-${index + 1}`),
    title: safeString(normalizedTask.title, `Task ${index + 1}`),
    description: safeString(normalizedTask.description, ''),
    dependencies: safeArray(normalizedTask.dependencies).map(String),
    acceptanceCriteria: safeArray(normalizedTask.acceptanceCriteria).map(String),
    suggestedTools: safeArray(normalizedTask.suggestedTools).map(String)
  };
}

function summarizeShortTermMemory(shortTermMemory) {
  if (!Array.isArray(shortTermMemory) || shortTermMemory.length === 0) {
    return 'No short-term memory provided.';
  }

  return shortTermMemory
    .map((entry) => `${entry.role || 'user'}: ${entry.content || ''}`)
    .join('\n');
}

function summarizeSkills(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return 'No relevant procedural skills were found.';
  }

  return skills.map((skill) => `- ${skill.title || skill.slug}: ${skill.reusablePattern || skill.problem || ''}`).join('\n');
}

function summarizeSemanticHints(insights) {
  if (!Array.isArray(insights) || insights.length === 0) {
    return 'No semantic hints available.';
  }

  return insights.map((insight) => `- ${insight.topic}: ${insight.fact}`).join('\n');
}

module.exports = {
  PlannerAgent
};
