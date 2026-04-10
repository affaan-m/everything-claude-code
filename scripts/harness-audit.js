#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');

const CATEGORIES = [
  'Tool Coverage',
  'Context Efficiency',
  'Quality Gates',
  'Memory Persistence',
  'Eval Coverage',
  'Security Guardrails',
  'Cost Efficiency',
];

function normalizeScope(scope) {
  const value = (scope || 'repo').toLowerCase();
  if (!['repo', 'hooks', 'skills', 'commands', 'agents'].includes(value)) {
    throw new Error(`Invalid scope: ${scope}`);
  }
  return value;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    scope: 'repo',
    format: 'text',
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--format') {
      parsed.format = (args[index + 1] || '').toLowerCase();
      index += 1;
      continue;
    }

    if (arg === '--scope') {
      parsed.scope = normalizeScope(args[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith('--format=')) {
      parsed.format = arg.split('=')[1].toLowerCase();
      continue;
    }

    if (arg.startsWith('--scope=')) {
      parsed.scope = normalizeScope(arg.split('=')[1]);
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    parsed.scope = normalizeScope(arg);
  }

  if (!['text', 'json'].includes(parsed.format)) {
    throw new Error(`Invalid format: ${parsed.format}. Use text or json.`);
  }

  return parsed;
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(REPO_ROOT, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
}

function countFiles(relativeDir, extension) {
  const dirPath = path.join(REPO_ROOT, relativeDir);
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const stack = [dirPath];
  let count = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const nextPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(nextPath);
      } else if (!extension || entry.name.endsWith(extension)) {
        count += 1;
      }
    }
  }

  return count;
}

function safeRead(relativePath) {
  try {
    return readText(relativePath);
  } catch (_error) {
    return '';
  }
}

function getChecks() {
  const packageJson = JSON.parse(readText('package.json'));
  const commandPrimary = safeRead('commands/harness-audit.md').trim();
  const commandParity = safeRead('.opencode/commands/harness-audit.md').trim();
  const hooksJson = safeRead('hooks/hooks.json');

  return [
    {
      id: 'tool-hooks-config',
      category: 'Tool Coverage',
      points: 2,
      scopes: ['repo', 'hooks'],
      path: 'hooks/hooks.json',
      description: 'Hook configuration file exists',
      pass: fileExists('hooks/hooks.json'),
      fix: 'Create hooks/hooks.json and define baseline hook events.',
    },
    {
      id: 'tool-hooks-impl-count',
      category: 'Tool Coverage',
      points: 2,
      scopes: ['repo', 'hooks'],
      path: 'scripts/hooks/',
      description: 'At least 8 hook implementation scripts exist',
      pass: countFiles('scripts/hooks', '.js') >= 8,
      fix: 'Add missing hook implementations in scripts/hooks/.',
    },
    {
      id: 'tool-agent-count',
      category: 'Tool Coverage',
      points: 2,
      scopes: ['repo', 'agents'],
      path: 'agents/',
      description: 'At least 10 agent definitions exist',
      pass: countFiles('agents', '.md') >= 10,
      fix: 'Add or restore agent definitions under agents/.',
    },
    {
      id: 'tool-skill-count',
      category: 'Tool Coverage',
      points: 2,
      scopes: ['repo', 'skills'],
      path: 'skills/',
      description: 'At least 20 skill definitions exist',
      pass: countFiles('skills', 'SKILL.md') >= 20,
      fix: 'Add missing skill directories with SKILL.md definitions.',
    },
    {
      id: 'tool-command-parity',
      category: 'Tool Coverage',
      points: 2,
      scopes: ['repo', 'commands'],
      path: '.opencode/commands/harness-audit.md',
      description: 'Harness-audit command parity exists between primary and OpenCode command docs',
      pass: commandPrimary.length > 0 && commandPrimary === commandParity,
      fix: 'Sync commands/harness-audit.md and .opencode/commands/harness-audit.md.',
    },
    {
      id: 'context-strategic-compact',
      category: 'Context Efficiency',
      points: 3,
      scopes: ['repo', 'skills'],
      path: 'skills/strategic-compact/SKILL.md',
      description: 'Strategic compaction guidance is present',
      pass: fileExists('skills/strategic-compact/SKILL.md'),
      fix: 'Add strategic context compaction guidance at skills/strategic-compact/SKILL.md.',
    },
    {
      id: 'context-suggest-compact-hook',
      category: 'Context Efficiency',
      points: 3,
      scopes: ['repo', 'hooks'],
      path: 'scripts/hooks/suggest-compact.js',
      description: 'Suggest-compact automation hook exists',
      pass: fileExists('scripts/hooks/suggest-compact.js'),
      fix: 'Implement scripts/hooks/suggest-compact.js for context pressure hints.',
    },
    {
      id: 'context-model-route',
      category: 'Context Efficiency',
      points: 2,
      scopes: ['repo', 'commands'],
      path: 'commands/model-route.md',
      description: 'Model routing command exists',
      pass: fileExists('commands/model-route.md'),
      fix: 'Add model-route command guidance in commands/model-route.md.',
    },
    {
      id: 'context-token-doc',
      category: 'Context Efficiency',
      points: 2,
      scopes: ['repo'],
      path: 'docs/token-optimization.md',
      description: 'Token optimization documentation exists',
      pass: fileExists('docs/token-optimization.md'),
      fix: 'Add docs/token-optimization.md with concrete context-cost controls.',
    },
    {
      id: 'quality-test-runner',
      category: 'Quality Gates',
      points: 3,
      scopes: ['repo'],
      path: 'tests/run-all.js',
      description: 'Central test runner exists',
      pass: fileExists('tests/run-all.js'),
      fix: 'Add tests/run-all.js to enforce complete suite execution.',
    },
    {
      id: 'quality-ci-validations',
      category: 'Quality Gates',
      points: 3,
      scopes: ['repo'],
      path: 'package.json',
      description: 'Test script runs validator chain before tests',
      pass: typeof packageJson.scripts?.test === 'string' && packageJson.scripts.test.includes('validate-commands.js') && packageJson.scripts.test.includes('tests/run-all.js'),
      fix: 'Update package.json test script to run validators plus tests/run-all.js.',
    },
    {
      id: 'quality-hook-tests',
      category: 'Quality Gates',
      points: 2,
      scopes: ['repo', 'hooks'],
      path: 'tests/hooks/hooks.test.js',
      description: 'Hook coverage test file exists',
      pass: fileExists('tests/hooks/hooks.test.js'),
      fix: 'Add tests/hooks/hooks.test.js for hook behavior validation.',
    },
    {
      id: 'quality-doctor-script',
      category: 'Quality Gates',
      points: 2,
      scopes: ['repo'],
      path: 'scripts/doctor.js',
      description: 'Installation drift doctor script exists',
      pass: fileExists('scripts/doctor.js'),
      fix: 'Add scripts/doctor.js for install-state integrity checks.',
    },
    {
      id: 'memory-hooks-dir',
      category: 'Memory Persistence',
      points: 4,
      scopes: ['repo', 'hooks'],
      path: 'hooks/memory-persistence/',
      description: 'Memory persistence hooks directory exists',
      pass: fileExists('hooks/memory-persistence'),
      fix: 'Add hooks/memory-persistence with lifecycle hook definitions.',
    },
    {
      id: 'memory-session-hooks',
      category: 'Memory Persistence',
      points: 4,
      scopes: ['repo', 'hooks'],
      path: 'scripts/hooks/session-start.js',
      description: 'Session start/end persistence scripts exist',
      pass: fileExists('scripts/hooks/session-start.js') && fileExists('scripts/hooks/session-end.js'),
      fix: 'Implement scripts/hooks/session-start.js and scripts/hooks/session-end.js.',
    },
    {
      id: 'memory-learning-skill',
      category: 'Memory Persistence',
      points: 2,
      scopes: ['repo', 'skills'],
      path: 'skills/continuous-learning-v2/SKILL.md',
      description: 'Continuous learning v2 skill exists',
      pass: fileExists('skills/continuous-learning-v2/SKILL.md'),
      fix: 'Add skills/continuous-learning-v2/SKILL.md for memory evolution flow.',
    },
    {
      id: 'eval-skill',
      category: 'Eval Coverage',
      points: 4,
      scopes: ['repo', 'skills'],
      path: 'skills/eval-harness/SKILL.md',
      description: 'Eval harness skill exists',
      pass: fileExists('skills/eval-harness/SKILL.md'),
      fix: 'Add skills/eval-harness/SKILL.md for pass/fail regression evaluation.',
    },
    {
      id: 'eval-commands',
      category: 'Eval Coverage',
      points: 4,
      scopes: ['repo', 'commands'],
      path: 'commands/eval.md',
      description: 'Eval and verification commands exist',
      pass: fileExists('commands/eval.md') && fileExists('commands/verify.md') && fileExists('commands/checkpoint.md'),
      fix: 'Add eval/checkpoint/verify commands to standardize verification loops.',
    },
    {
      id: 'eval-tests-presence',
      category: 'Eval Coverage',
      points: 2,
      scopes: ['repo'],
      path: 'tests/',
      description: 'At least 10 test files exist',
      pass: countFiles('tests', '.test.js') >= 10,
      fix: 'Increase automated test coverage across scripts/hooks/lib.',
    },
    {
      id: 'security-review-skill',
      category: 'Security Guardrails',
      points: 3,
      scopes: ['repo', 'skills'],
      path: 'skills/security-review/SKILL.md',
      description: 'Security review skill exists',
      pass: fileExists('skills/security-review/SKILL.md'),
      fix: 'Add skills/security-review/SKILL.md for security checklist coverage.',
    },
    {
      id: 'security-agent',
      category: 'Security Guardrails',
      points: 3,
      scopes: ['repo', 'agents'],
      path: 'agents/security-reviewer.md',
      description: 'Security reviewer agent exists',
      pass: fileExists('agents/security-reviewer.md'),
      fix: 'Add agents/security-reviewer.md for delegated security audits.',
    },
    {
      id: 'security-prompt-hook',
      category: 'Security Guardrails',
      points: 2,
      scopes: ['repo', 'hooks'],
      path: 'hooks/hooks.json',
      description: 'Hooks include prompt submission guardrail event references',
      pass: hooksJson.includes('beforeSubmitPrompt') || hooksJson.includes('PreToolUse'),
      fix: 'Add prompt/tool preflight security guards in hooks/hooks.json.',
    },
    {
      id: 'security-scan-command',
      category: 'Security Guardrails',
      points: 2,
      scopes: ['repo', 'commands'],
      path: 'commands/security-scan.md',
      description: 'Security scan command exists',
      pass: fileExists('commands/security-scan.md'),
      fix: 'Add commands/security-scan.md with scan and remediation workflow.',
    },
    {
      id: 'cost-skill',
      category: 'Cost Efficiency',
      points: 4,
      scopes: ['repo', 'skills'],
      path: 'skills/cost-aware-llm-pipeline/SKILL.md',
      description: 'Cost-aware LLM skill exists',
      pass: fileExists('skills/cost-aware-llm-pipeline/SKILL.md'),
      fix: 'Add skills/cost-aware-llm-pipeline/SKILL.md for budget-aware routing.',
    },
    {
      id: 'cost-doc',
      category: 'Cost Efficiency',
      points: 3,
      scopes: ['repo'],
      path: 'docs/token-optimization.md',
      description: 'Cost optimization documentation exists',
      pass: fileExists('docs/token-optimization.md'),
      fix: 'Create docs/token-optimization.md with target settings and tradeoffs.',
    },
    {
      id: 'cost-model-route-command',
      category: 'Cost Efficiency',
      points: 3,
      scopes: ['repo', 'commands'],
      path: 'commands/model-route.md',
      description: 'Model route command exists for complexity-aware routing',
      pass: fileExists('commands/model-route.md'),
      fix: 'Add commands/model-route.md and route policies for cheap-default execution.',
    },
  ];
}

function summarizeCategoryScores(checks) {
  const scores = {};
  for (const category of CATEGORIES) {
    const inCategory = checks.filter(check => check.category === category);
    const max = inCategory.reduce((sum, check) => sum + check.points, 0);
    const earned = inCategory
      .filter(check => check.pass)
      .reduce((sum, check) => sum + check.points, 0);

    const normalized = max === 0 ? 0 : Math.round((earned / max) * 10);
    scores[category] = {
      score: normalized,
      earned,
      max,
    };
  }

  return scores;
}

function buildReport(scope) {
  const checks = getChecks().filter(check => check.scopes.includes(scope));
  const categoryScores = summarizeCategoryScores(checks);
  const maxScore = checks.reduce((sum, check) => sum + check.points, 0);
  const overallScore = checks
    .filter(check => check.pass)
    .reduce((sum, check) => sum + check.points, 0);

  const failedChecks = checks.filter(check => !check.pass);
  const topActions = failedChecks
    .sort((left, right) => right.points - left.points)
    .slice(0, 3)
    .map(check => ({
      action: check.fix,
      path: check.path,
      category: check.category,
      points: check.points,
    }));

  return {
    scope,
    deterministic: true,
    rubric_version: '2026-03-16',
    overall_score: overallScore,
    max_score: maxScore,
    categories: categoryScores,
    checks: checks.map(check => ({
      id: check.id,
      category: check.category,
      points: check.points,
      path: check.path,
      description: check.description,
      pass: check.pass,
    })),
    top_actions: topActions,
  };
}

function printText(report) {
  console.log(`Harness Audit (${report.scope}): ${report.overall_score}/${report.max_score}`);
  console.log('');

  for (const category of CATEGORIES) {
    const data = report.categories[category];
    if (!data || data.max === 0) {
      continue;
    }

    console.log(`- ${category}: ${data.score}/10 (${data.earned}/${data.max} pts)`);
  }

  const failed = report.checks.filter(check => !check.pass);
  console.log('');
  console.log(`Checks: ${report.checks.length} total, ${failed.length} failing`);

  if (failed.length > 0) {
    console.log('');
    console.log('Top 3 Actions:');
    report.top_actions.forEach((action, index) => {
      console.log(`${index + 1}) [${action.category}] ${action.action} (${action.path})`);
    });
  }
}

function showHelp(exitCode = 0) {
  console.log(`
Usage: node scripts/harness-audit.js [scope] [--scope <repo|hooks|skills|commands|agents>] [--format <text|json>]

Deterministic harness audit based on explicit file/rule checks.
`);
  process.exit(exitCode);
}

function main() {
  try {
    const args = parseArgs(process.argv);

    if (args.help) {
      showHelp(0);
      return;
    }

    const report = buildReport(args.scope);

    if (args.format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printText(report);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildReport,
  parseArgs,
};
