'use strict';

const { slugify, toSnakeCase } = require('../agent_system/shared/file_utils.ts');

class MockModelProvider {
  constructor(options) {
    const normalizedOptions = options || {};
    this.model = normalizedOptions.model || 'mock-agent-team';
    this.scriptedResponses = cloneScriptedResponses(normalizedOptions.scriptedResponses);
  }

  async complete(request) {
    const stage = request && request.stage ? request.stage : 'generic';
    const scriptedQueue = this.scriptedResponses[stage];

    if (Array.isArray(scriptedQueue) && scriptedQueue.length > 0) {
      const scriptedResponse = scriptedQueue.shift();
      return {
        text: String(scriptedResponse),
        model: this.model,
        raw: scriptedResponse
      };
    }

    const generated = this.generateResponse(request || {});
    return {
      text: typeof generated === 'string' ? generated : JSON.stringify(generated, null, 2),
      model: this.model,
      raw: generated
    };
  }

  generateResponse(request) {
    switch (request.stage) {
      case 'planner':
        return this.generatePlan(request.metadata || {});
      case 'architect':
        return this.generateArchitecture(request.metadata || {});
      case 'builder':
        return this.generateBuilderDecision(request.metadata || {});
      case 'evaluator':
        return this.generateEvaluation(request.metadata || {});
      case 'reflection':
        return this.generateReflection(request.metadata || {});
      default:
        return {
          summary: 'Mock provider returned a generic response.'
        };
    }
  }

  generatePlan(metadata) {
    const goal = metadata.goal || 'Complete the requested task';
    const slug = slugify(goal);

    return {
      summary: `Plan a safe execution path for: ${goal}.`,
      tasks: [
        {
          id: `${slug}-plan`,
          title: 'Capture the objective',
          description: 'Clarify what success looks like and gather reusable context.',
          dependencies: [],
          acceptanceCriteria: [
            'Goal is restated clearly.',
            'Relevant procedural skills are attached.'
          ],
          suggestedTools: ['skill_search', 'filesystem']
        },
        {
          id: `${slug}-build`,
          title: 'Execute a contained implementation slice',
          description: 'Create a concrete artifact inside the workspace to prove the loop works.',
          dependencies: [`${slug}-plan`],
          acceptanceCriteria: [
            'A build artifact is written to disk.',
            'The artifact can be read back successfully.'
          ],
          suggestedTools: ['write_file', 'read_file']
        },
        {
          id: `${slug}-evaluate`,
          title: 'Verify and learn from the result',
          description: 'Run a lightweight verification step, then extract reusable lessons.',
          dependencies: [`${slug}-build`],
          acceptanceCriteria: [
            'Verification passes.',
            'Reflection yields at least one reusable pattern.'
          ],
          suggestedTools: ['terminal_command', 'memory']
        }
      ],
      risks: [
        'Mock mode writes a simulation artifact rather than changing production code.',
        'Real implementation quality depends on the configured model provider.'
      ],
      assumptions: [
        'The workspace is writable.',
        'The orchestrator may store run history on disk.'
      ],
      successMetrics: [
        'A run artifact is created.',
        'Evaluation passes.',
        'A procedural skill is available for future retrieval.'
      ]
    };
  }

  generateArchitecture(metadata) {
    const goal = metadata.goal || 'Complete the requested task';
    const artifactPath = `agent-output/${slugify(goal)}-run.md`;

    return {
      strategy: `Use a contained artifact at ${artifactPath} to exercise planning, execution, evaluation, and reflection.`,
      modules: [
        {
          name: 'planner',
          responsibility: 'Convert the goal into ordered work units and success criteria.'
        },
        {
          name: 'builder',
          responsibility: 'Use ReAct steps to create and verify a concrete artifact.'
        },
        {
          name: 'evaluator',
          responsibility: 'Run a lightweight command to confirm the artifact exists.'
        }
      ],
      executionPlan: [
        {
          id: 'react-write-artifact',
          taskId: metadata.plan && metadata.plan.tasks && metadata.plan.tasks[1]
            ? metadata.plan.tasks[1].id
            : 'build',
          goal: 'Write the execution artifact to disk.',
          suggestedAction: {
            type: 'write_file',
            path: artifactPath,
            content: buildArtifactContent(goal, metadata.retrievedSkills || [])
          }
        },
        {
          id: 'react-read-artifact',
          taskId: metadata.plan && metadata.plan.tasks && metadata.plan.tasks[2]
            ? metadata.plan.tasks[2].id
            : 'evaluate',
          goal: 'Read the artifact back to verify it was created.',
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
      notes: [
        'Swap the mock provider for Claude, OpenAI, or a local model to drive real implementation work.',
        'The mock provider intentionally keeps writes scoped to agent-output/.'
      ]
    };
  }

  generateBuilderDecision(metadata) {
    const architecture = metadata.architecture || {};
    const executionPlan = Array.isArray(architecture.executionPlan) ? architecture.executionPlan : [];
    const reactHistory = Array.isArray(metadata.reactHistory) ? metadata.reactHistory : [];
    const artifactPath = Array.isArray(architecture.artifacts) && architecture.artifacts[0]
      ? architecture.artifacts[0]
      : `agent-output/${slugify(metadata.goal || 'task')}-run.md`;

    const hasWrittenArtifact = reactHistory.some((entry) => entry.action && entry.action.type === 'write_file');
    const hasReadArtifact = reactHistory.some((entry) => entry.action && entry.action.type === 'read_file');

    if (!hasWrittenArtifact) {
      const plannedAction = executionPlan[0] && executionPlan[0].suggestedAction
        ? executionPlan[0].suggestedAction
        : {
            type: 'write_file',
            path: artifactPath,
            content: buildArtifactContent(metadata.goal || 'task', metadata.retrievedSkills || [])
          };

      return {
        thought: 'Start by creating a concrete artifact inside the workspace.',
        action: plannedAction,
        isComplete: false
      };
    }

    if (!hasReadArtifact) {
      const plannedAction = executionPlan[1] && executionPlan[1].suggestedAction
        ? executionPlan[1].suggestedAction
        : {
            type: 'read_file',
            path: artifactPath
          };

      return {
        thought: 'Read the artifact back so the loop has an explicit observation.',
        action: plannedAction,
        isComplete: false
      };
    }

    return {
      thought: 'The artifact exists and has been observed, so the builder can finish.',
      action: {
        type: 'finish',
        summary: `Created and verified ${artifactPath}.`
      },
      isComplete: true
    };
  }

  generateEvaluation(metadata) {
    const execution = metadata.execution || {};
    const testResults = metadata.testResults || {};
    const failedActions = (execution.steps || []).filter((step) => step.observation && step.observation.ok === false);
    const failedCount = (testResults.failedCount || 0) + failedActions.length;

    return {
      status: failedCount > 0 ? 'fail' : 'pass',
      score: failedCount > 0 ? 0.45 : 0.96,
      findings: failedCount > 0
        ? ['One or more builder actions or verification commands failed.']
        : ['Execution artifact was created and verification passed.'],
      nextSteps: failedCount > 0
        ? ['Inspect the failed action observations and adjust the plan.']
        : ['Promote the learned pattern into procedural memory.'],
      confidence: failedCount > 0 ? 'medium' : 'high'
    };
  }

  generateReflection(metadata) {
    const goal = metadata.goal || 'Complete the requested task';
    const execution = metadata.execution || {};
    const evaluation = metadata.evaluation || {};
    const toolNames = Array.from(new Set((execution.steps || [])
      .map((step) => step.action && step.action.type)
      .filter(Boolean)));
    const skillSlug = toSnakeCase(goal);

    return {
      summary: `The agent completed a closed-loop run for "${goal}" and captured a reusable operating pattern.`,
      lessons: [
        'Retrieve procedural skills before planning so the planner starts from prior experience.',
        'Read back any written artifact before declaring the execution phase complete.',
        'Persist evaluation and reflection results so future runs can reuse them.'
      ],
      failureModes: evaluation.status === 'pass'
        ? ['Real model providers may propose actions that need tighter policy checks than mock mode.']
        : ['When verification fails, the builder needs another ReAct pass before reflection.'],
      semanticInsights: [
        {
          topic: 'agent-orchestration',
          fact: 'A self-improving run should persist plan, execution, evaluation, and reflection in separate memory layers.',
          tags: ['agents', 'memory', 'orchestration']
        }
      ],
      skillCandidate: {
        slug: skillSlug,
        title: goal,
        tags: buildSkillTags(goal),
        problem: `Need a reusable procedure for: ${goal}.`,
        steps: [
          'Search the procedural skill library before creating a plan.',
          'Produce a task graph and execution strategy.',
          'Run the builder in a Reason → Act → Observe loop.',
          'Evaluate the outcome and persist the reflection.'
        ],
        toolsUsed: toolNames.length > 0 ? toolNames : ['write_file', 'read_file', 'terminal_command'],
        commonFailures: [
          'Artifact writes can succeed while downstream verification still fails.',
          'Without stored reflections, the planner restarts from scratch on similar goals.'
        ],
        reusablePattern: 'Search → plan → architect → execute with ReAct → evaluate → reflect → store the learned procedure.'
      }
    };
  }
}

function buildArtifactContent(goal, retrievedSkills) {
  const skillLines = Array.isArray(retrievedSkills) && retrievedSkills.length > 0
    ? retrievedSkills.map((skill) => `- ${skill.title || skill.slug}`).join('\n')
    : '- No prior skill matched this goal';

  return [
    `# Agent Run Artifact`,
    '',
    `Goal: ${goal}`,
    '',
    'Retrieved skills:',
    skillLines,
    '',
    'The mock provider created this artifact to exercise the planner, builder, evaluator, and reflection loop without requiring an external model provider.'
  ].join('\n');
}

function buildSkillTags(goal) {
  return Array.from(new Set(String(goal || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2)))
    .slice(0, 6);
}

function cloneScriptedResponses(scriptedResponses) {
  const cloned = {};
  const source = scriptedResponses || {};

  for (const [key, value] of Object.entries(source)) {
    cloned[key] = Array.isArray(value) ? [...value] : [];
  }

  return cloned;
}

module.exports = {
  MockModelProvider
};
