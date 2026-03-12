#!/usr/bin/env node
'use strict';

require.extensions['.ts'] = require.extensions['.js'];

const path = require('path');
const { AgentOrchestrator } = require(path.join(__dirname, '..', 'agent_system', 'orchestrator', 'agent_orchestrator.ts'));

function parseArgs(argv) {
  const args = [...argv];
  const command = isCommand(args[0]) ? args.shift() : 'run';
  const parsed = {
    command,
    goal: '',
    configPath: '',
    cwd: process.cwd(),
    outputJson: false,
    episode: 'latest',
    providerId: '',
    dryRunOverride: null
  };

  while (args.length > 0) {
    const current = args.shift();

    if (current === '--config') {
      parsed.configPath = args.shift() || '';
      continue;
    }

    if (current === '--cwd') {
      parsed.cwd = path.resolve(args.shift() || process.cwd());
      continue;
    }

    if (current === '--json') {
      parsed.outputJson = true;
      continue;
    }

    if (current === '--episode') {
      parsed.episode = args.shift() || 'latest';
      continue;
    }

    if (current === '--provider') {
      parsed.providerId = args.shift() || '';
      continue;
    }

    if (current === '--live') {
      parsed.dryRunOverride = false;
      continue;
    }

    if (current === '--dry-run') {
      parsed.dryRunOverride = true;
      continue;
    }

    parsed.goal = [parsed.goal, current].filter(Boolean).join(' ');
  }

  return parsed;
}

function isCommand(value) {
  return ['run', 'plan', 'execute', 'learn', 'help'].includes(String(value || ''));
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === 'help') {
    printHelp();
    return;
  }

  const configOverrides = {};
  if (parsed.providerId) {
    configOverrides.model = {
      provider: parsed.providerId
    };
  }

  if (parsed.dryRunOverride !== null) {
    configOverrides.execution_sandbox = {
      dry_run: parsed.dryRunOverride
    };
  }

  const orchestrator = new AgentOrchestrator({
    cwd: parsed.cwd,
    configPath: parsed.configPath,
    config: configOverrides
  });

  let result = null;
  if (parsed.command === 'plan') {
    ensureGoal(parsed.goal, parsed.command);
    result = await orchestrator.planGoal(parsed.goal);
  } else if (parsed.command === 'execute') {
    ensureGoal(parsed.goal, parsed.command);
    result = await orchestrator.executeGoal(parsed.goal);
  } else if (parsed.command === 'learn') {
    result = await orchestrator.learnFromEpisode(parsed.episode);
  } else {
    ensureGoal(parsed.goal, parsed.command);
    result = await orchestrator.runGoal(parsed.goal);
  }

  if (parsed.outputJson) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  printSummary(result, parsed.command);
}

function ensureGoal(goal, command) {
  if (!String(goal || '').trim()) {
    throw new Error(`Goal is required for "${command}".`);
  }
}

function printSummary(result, command) {
  if (command === 'plan') {
    console.log(`Planned: ${result.goal}`);
    console.log(`Tasks: ${result.plan.tasks.length}`);
    console.log(`Artifacts: ${(result.architecture.artifacts || []).join(', ')}`);
    return;
  }

  if (command === 'learn') {
    console.log(`Learned from: ${result.runId}`);
    console.log(`Skill: ${result.createdSkill ? result.createdSkill.slug : 'none'}`);
    return;
  }

  console.log(`Run: ${result.runId}`);
  console.log(`Goal: ${result.goal}`);
  console.log(`Evaluation: ${result.evaluation.status}`);
  console.log(`Skill: ${result.createdSkill ? result.createdSkill.slug : 'none'}`);
}

function printHelp() {
  console.log('Usage: agent <run|plan|execute|learn> [goal] [--config path] [--cwd path] [--json]');
}

module.exports = {
  main,
  parseArgs
};

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  });
}
