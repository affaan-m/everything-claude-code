'use strict';

const { loadAgentConfig } = require('../shared/config_loader.ts');
const { createModelProvider } = require('../shared/provider_factory.ts');
const { slugify } = require('../shared/file_utils.ts');
const { SkillLibrary } = require('../memory/skill_library.ts');
const { EpisodicMemory } = require('../memory/episodic_memory.ts');
const { SemanticMemory } = require('../memory/semantic_memory.ts');
const { PlannerAgent } = require('../planner/planner_agent.ts');
const { createTaskGraph } = require('../planner/task_graph.ts');
const { ArchitectureAgent } = require('../architect/architecture_agent.ts');
const { TerminalInterface } = require('../environment/terminal_interface.ts');
const { FileSystemTools } = require('../environment/file_system_tools.ts');
const { ApiTools } = require('../environment/api_tools.ts');
const { ToolRunner } = require('../builder/tool_runner.ts');
const { ExecutorAgent } = require('../builder/executor_agent.ts');
const { TestRunner } = require('../evaluator/test_runner.ts');
const { EvaluatorAgent } = require('../evaluator/evaluator_agent.ts');
const { ReflectionAgent } = require('../reflection/reflection_agent.ts');
const { SkillExtractor } = require('../reflection/skill_extractor.ts');

class AgentOrchestrator {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = normalizedOptions.cwd || process.cwd();
    const loadedConfig = loadAgentConfig(this.cwd, normalizedOptions.configPath, normalizedOptions.config);

    this.config = loadedConfig.config;
    this.configPath = loadedConfig.configPath;
    this.provider = normalizedOptions.provider || createModelProvider(this.config, normalizedOptions.providerOptions);

    this.skillLibrary = new SkillLibrary({
      cwd: this.cwd,
      directory: this.config.skill_library_path
    });
    this.episodicMemory = new EpisodicMemory({
      cwd: this.cwd,
      directory: this.config.memory_paths.episodic
    });
    this.semanticMemory = new SemanticMemory({
      cwd: this.cwd,
      directory: this.config.memory_paths.semantic
    });

    const terminal = new TerminalInterface({
      cwd: this.cwd,
      config: this.config
    });
    const fileSystem = new FileSystemTools({
      cwd: this.cwd,
      config: this.config
    });
    const apiTools = new ApiTools({
      config: this.config
    });
    const toolRunner = new ToolRunner({
      terminal,
      fileSystem,
      apiTools
    });
    const testRunner = new TestRunner({
      terminal
    });

    this.planner = new PlannerAgent({
      provider: this.provider,
      temperature: this.config.temperature
    });
    this.architect = new ArchitectureAgent({
      provider: this.provider,
      temperature: this.config.temperature
    });
    this.builder = new ExecutorAgent({
      provider: this.provider,
      toolRunner,
      temperature: this.config.temperature,
      maxSteps: this.config.execution_sandbox.max_react_steps
    });
    this.evaluator = new EvaluatorAgent({
      provider: this.provider,
      testRunner,
      temperature: this.config.temperature
    });
    this.reflectionAgent = new ReflectionAgent({
      provider: this.provider,
      temperature: this.config.temperature
    });
    this.skillExtractor = new SkillExtractor({
      skillLibrary: this.skillLibrary
    });
  }

  async planGoal(goal, options) {
    const normalizedGoal = String(goal || '').trim();
    if (!normalizedGoal) {
      throw new Error('Goal is required.');
    }

    const normalizedOptions = options || {};
    const shortTermMemory = normalizeConversationContext(normalizedOptions.conversationContext);
    const retrievedSkills = this.skillLibrary.search(normalizedGoal, 5);
    const semanticHints = this.semanticMemory.search(normalizedGoal, 5);
    const plan = await this.planner.plan({
      goal: normalizedGoal,
      shortTermMemory,
      retrievedSkills,
      semanticHints
    });
    const taskGraph = createTaskGraph(plan.tasks);
    const architecture = await this.architect.design({
      goal: normalizedGoal,
      plan,
      taskGraph,
      retrievedSkills
    });

    return {
      goal: normalizedGoal,
      shortTermMemory,
      retrievedSkills,
      semanticHints,
      plan,
      taskGraph,
      architecture
    };
  }

  async executeGoal(goal, options) {
    const planning = await this.planGoal(goal, options);
    const runId = createRunId(planning.goal);
    const startedAt = new Date().toISOString();
    const execution = await this.builder.execute({
      goal: planning.goal,
      plan: planning.plan,
      architecture: planning.architecture,
      retrievedSkills: planning.retrievedSkills
    });
    const evaluation = await this.evaluator.evaluate({
      goal: planning.goal,
      execution,
      architecture: planning.architecture
    });
    const finishedAt = new Date().toISOString();
    const report = {
      runId,
      goal: planning.goal,
      startedAt,
      finishedAt,
      shortTermMemory: planning.shortTermMemory,
      retrievedSkills: planning.retrievedSkills,
      semanticHints: planning.semanticHints,
      plan: planning.plan,
      taskGraph: planning.taskGraph,
      architecture: planning.architecture,
      execution,
      evaluation,
      reflection: null,
      createdSkill: null,
      status: evaluation.status
    };

    this.episodicMemory.saveEpisode(report);
    return report;
  }

  async learnFromEpisode(selector) {
    const episode = this.episodicMemory.loadEpisode(selector || 'latest');
    if (!episode) {
      throw new Error('No episode was found to learn from.');
    }

    if (episode.reflection && episode.createdSkill) {
      return episode;
    }

    const reflection = await this.reflectionAgent.reflect(episode);
    const createdSkill = this.skillExtractor.extract(reflection);
    const semanticInsights = this.semanticMemory.appendInsights(episode.runId, reflection.semanticInsights);
    const updatedEpisode = {
      ...episode,
      reflection,
      createdSkill,
      semanticInsights,
      learnedAt: new Date().toISOString(),
      status: episode.evaluation && episode.evaluation.status === 'pass'
        ? 'learned'
        : episode.status
    };

    this.episodicMemory.saveEpisode(updatedEpisode);
    return updatedEpisode;
  }

  async runGoal(goal, options) {
    const executionReport = await this.executeGoal(goal, options);
    return this.learnFromEpisode(executionReport.runId);
  }
}

function createRunId(goal) {
  return `${slugify(goal)}-${Date.now()}`;
}

function normalizeConversationContext(conversationContext) {
  if (Array.isArray(conversationContext)) {
    return conversationContext
      .filter(Boolean)
      .map((entry) => ({
        role: String(entry.role || 'user'),
        content: String(entry.content || '')
      }));
  }

  if (typeof conversationContext === 'string' && conversationContext.trim()) {
    return [
      {
        role: 'user',
        content: conversationContext.trim()
      }
    ];
  }

  return [];
}

module.exports = {
  AgentOrchestrator
};
