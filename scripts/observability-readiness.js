#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const RUBRIC_VERSION = '2026-05-11';

function usage() {
  console.log([
    'Usage: node scripts/observability-readiness.js [--format <text|json>] [--root <dir>]',
    '',
    'Deterministic ECC 2.0 observability readiness gate.',
    '',
    'Options:',
    '  --format <text|json>  Output format (default: text)',
    '  --root <dir>          Repository root to inspect (default: cwd)',
    '  --help, -h            Show this help'
  ].join('\n'));
}

function readValue(args, index, flagName) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flagName} requires a value`);
  }
  return value;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    format: 'text',
    help: false,
    root: path.resolve(process.cwd())
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--format') {
      parsed.format = readValue(args, index, arg).toLowerCase();
      index += 1;
      continue;
    }

    if (arg.startsWith('--format=')) {
      parsed.format = arg.slice('--format='.length).toLowerCase();
      continue;
    }

    if (arg === '--root') {
      parsed.root = path.resolve(readValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith('--root=')) {
      parsed.root = path.resolve(arg.slice('--root='.length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!['text', 'json'].includes(parsed.format)) {
    throw new Error(`Invalid format: ${parsed.format}. Use text or json.`);
  }

  return parsed;
}

function fileExists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function readText(rootDir, relativePath) {
  try {
    return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  } catch (_error) {
    return '';
  }
}

function safeParseJson(text) {
  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
}

function includesAll(text, needles) {
  return needles.every(needle => text.includes(needle));
}

function buildChecks(rootDir) {
  const packageJsonText = readText(rootDir, 'package.json');
  const packageJson = safeParseJson(packageJsonText) || {};
  const packageFiles = Array.isArray(packageJson.files) ? packageJson.files : [];
  const packageScripts = packageJson.scripts || {};
  const loopStatus = readText(rootDir, 'scripts/loop-status.js');
  const sessionInspect = readText(rootDir, 'scripts/session-inspect.js');
  const harnessAudit = readText(rootDir, 'scripts/harness-audit.js');
  const activityTracker = readText(rootDir, 'scripts/hooks/session-activity-tracker.js');
  const observabilityRust = readText(rootDir, 'ecc2/src/observability/mod.rs');
  const sessionStoreRust = readText(rootDir, 'ecc2/src/session/store.rs');
  const sessionManagerRust = readText(rootDir, 'ecc2/src/session/manager.rs');
  const readinessDoc = readText(rootDir, 'docs/architecture/observability-readiness.md');
  const quickstart = readText(rootDir, 'docs/releases/2.0.0-rc.1/quickstart.md');
  const releaseNotes = readText(rootDir, 'docs/releases/2.0.0-rc.1/release-notes.md');

  return [
    {
      id: 'loop-status-live-signal',
      category: 'Live Status',
      points: 2,
      path: 'scripts/loop-status.js',
      description: 'Loop status supports JSON output, watch mode, and snapshot writes',
      pass: fileExists(rootDir, 'scripts/loop-status.js')
        && includesAll(loopStatus, ['--json', '--watch', '--write-dir']),
      fix: 'Restore loop-status JSON/watch/write-dir support.'
    },
    {
      id: 'session-inspect-adapter-registry',
      category: 'Session Trace',
      points: 2,
      path: 'scripts/session-inspect.js',
      description: 'Session inspection exposes registered adapters and writable snapshots',
      pass: fileExists(rootDir, 'scripts/session-inspect.js')
        && fileExists(rootDir, 'scripts/lib/session-adapters/registry.js')
        && includesAll(sessionInspect, ['--list-adapters', '--write', 'inspectSessionTarget']),
      fix: 'Restore session-inspect adapter registry, list-adapters, and write support.'
    },
    {
      id: 'harness-audit-scorecard',
      category: 'Harness Baseline',
      points: 2,
      path: 'scripts/harness-audit.js',
      description: 'Harness audit emits deterministic text/JSON scorecards',
      pass: fileExists(rootDir, 'scripts/harness-audit.js')
        && packageScripts['harness:audit'] === 'node scripts/harness-audit.js'
        && includesAll(harnessAudit, ['Deterministic harness audit', '--format', 'overall_score']),
      fix: 'Restore the harness:audit package script and deterministic scorecard output.'
    },
    {
      id: 'hook-activity-jsonl',
      category: 'Tool Activity',
      points: 2,
      path: 'scripts/hooks/session-activity-tracker.js',
      description: 'Hook activity tracker writes tool usage JSONL for later sync',
      pass: fileExists(rootDir, 'scripts/hooks/session-activity-tracker.js')
        && includesAll(activityTracker, ['tool-usage.jsonl', 'session_id', 'tool_name']),
      fix: 'Restore hook-side tool activity recording to metrics/tool-usage.jsonl.'
    },
    {
      id: 'ecc2-tool-risk-ledger',
      category: 'Tool Activity',
      points: 3,
      path: 'ecc2/src/observability/mod.rs',
      description: 'ECC2 records tool calls with risk scoring and paginated queries',
      pass: fileExists(rootDir, 'ecc2/src/observability/mod.rs')
        && includesAll(observabilityRust, ['ToolCallEvent', 'RiskAssessment', 'ToolLogger'])
        && includesAll(sessionStoreRust, ['insert_tool_log', 'query_tool_logs'])
        && includesAll(sessionManagerRust, ['sync_tool_activity_metrics', 'tool-usage.jsonl']),
      fix: 'Restore ECC2 tool logging, risk scoring, store queries, and metrics sync.'
    },
    {
      id: 'release-observability-onramp',
      category: 'Operator Onramp',
      points: 2,
      path: 'docs/architecture/observability-readiness.md',
      description: 'Release docs explain the local observability readiness workflow',
      pass: readinessDoc.includes('node scripts/observability-readiness.js --format json')
        && quickstart.includes('observability-readiness.md')
        && releaseNotes.includes('observability-readiness.md'),
      fix: 'Add the observability readiness doc and link it from rc.1 release docs.'
    },
    {
      id: 'package-exposes-readiness-gate',
      category: 'Packaging',
      points: 1,
      path: 'package.json',
      description: 'Package exposes the observability readiness gate',
      pass: packageScripts['observability:ready'] === 'node scripts/observability-readiness.js'
        && packageFiles.includes('scripts/observability-readiness.js'),
      fix: 'Add scripts/observability-readiness.js to package files and observability:ready.'
    }
  ];
}

function buildReport(rootDir) {
  const checks = buildChecks(rootDir);
  const categories = {};

  for (const check of checks) {
    if (!categories[check.category]) {
      categories[check.category] = {
        score: 0,
        max_score: 0,
        passed: 0,
        total: 0
      };
    }

    categories[check.category].max_score += check.points;
    categories[check.category].total += 1;

    if (check.pass) {
      categories[check.category].score += check.points;
      categories[check.category].passed += 1;
    }
  }

  const overallScore = checks
    .filter(check => check.pass)
    .reduce((sum, check) => sum + check.points, 0);
  const maxScore = checks.reduce((sum, check) => sum + check.points, 0);
  const failingChecks = checks.filter(check => !check.pass);

  return {
    schema_version: 'ecc.observability-readiness.v1',
    rubric_version: RUBRIC_VERSION,
    deterministic: true,
    root_dir: fs.realpathSync(rootDir),
    overall_score: overallScore,
    max_score: maxScore,
    ready: overallScore === maxScore,
    categories,
    checks,
    top_actions: failingChecks
      .sort((left, right) => right.points - left.points || left.id.localeCompare(right.id))
      .slice(0, 3)
      .map(check => ({
        id: check.id,
        path: check.path,
        fix: check.fix
      }))
  };
}

function renderText(report) {
  const lines = [
    `Observability Readiness: ${report.overall_score}/${report.max_score}`,
    `Ready: ${report.ready ? 'yes' : 'no'}`,
    '',
    'Categories:'
  ];

  for (const [name, category] of Object.entries(report.categories)) {
    lines.push(`- ${name}: ${category.score}/${category.max_score} (${category.passed}/${category.total})`);
  }

  lines.push('', 'Checks:');
  for (const check of report.checks) {
    lines.push(`- ${check.pass ? 'PASS' : 'FAIL'} ${check.id}: ${check.description}`);
  }

  if (report.top_actions.length > 0) {
    lines.push('', 'Top Actions:');
    for (const action of report.top_actions) {
      lines.push(`- ${action.path}: ${action.fix}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    usage();
    return;
  }

  const report = buildReport(args.root);

  if (args.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    process.stdout.write(renderText(report));
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  buildChecks,
  buildReport,
  parseArgs,
  renderText
};
