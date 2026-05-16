#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildReport: buildPlatformReport } = require('./platform-audit');

const SCHEMA_VERSION = 'ecc.operator-readiness-dashboard.v1';
const DEFAULT_THRESHOLDS = Object.freeze({
  maxOpenPrs: 20,
  maxOpenIssues: 20,
  maxDirtyFiles: 0,
});

function usage() {
  console.log([
    'Usage: node scripts/operator-readiness-dashboard.js [options]',
    '',
    'Generate the ECC operator readiness dashboard and prompt-to-artifact audit.',
    '',
    'Options:',
    '  --format <text|json|markdown>',
    '                             Output format (default: markdown)',
    '  --json                     Alias for --format json',
    '  --markdown                 Alias for --format markdown',
    '  --write <path>             Write json or markdown output to a file',
    '  --root <dir>               Repository root to inspect (default: cwd)',
    '  --repo <owner/repo>        GitHub repo to inspect; repeatable',
    '  --skip-github              Skip live GitHub queue/discussion checks',
    '  --max-open-prs <n>         PR budget passed through to platform:audit',
    '  --max-open-issues <n>      Issue budget passed through to platform:audit',
    '  --max-dirty-files <n>      Dirty-file budget passed through to platform:audit',
    '  --allow-untracked <path>   Ignore untracked files under path; repeatable',
    '  --use-env-github-token     Keep GITHUB_TOKEN when invoking gh',
    '  --generated-at <iso>       Override generatedAt for deterministic tests',
    '  --exit-code                Return 2 when the objective is not ready',
    '  --help, -h                 Show this help',
  ].join('\n'));
}

function readValue(args, index, flagName) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flagName} requires a value`);
  }
  return value;
}

function parseIntegerFlag(value, flagName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${flagName}: ${value}`);
  }
  return parsed;
}

function normalizeRelativePrefix(value) {
  const normalized = String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/\/+$/, '');
  return normalized ? `${normalized}/` : '';
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    allowUntracked: [],
    exitCode: false,
    format: 'markdown',
    generatedAt: null,
    help: false,
    repos: [],
    root: path.resolve(process.cwd()),
    skipGithub: false,
    thresholds: { ...DEFAULT_THRESHOLDS },
    useEnvGithubToken: false,
    writePath: null,
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

    if (arg === '--json') {
      parsed.format = 'json';
      continue;
    }

    if (arg === '--markdown') {
      parsed.format = 'markdown';
      continue;
    }

    if (arg === '--write') {
      parsed.writePath = path.resolve(readValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith('--write=')) {
      parsed.writePath = path.resolve(arg.slice('--write='.length));
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

    if (arg === '--repo') {
      parsed.repos.push(readValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith('--repo=')) {
      parsed.repos.push(arg.slice('--repo='.length));
      continue;
    }

    if (arg === '--skip-github') {
      parsed.skipGithub = true;
      continue;
    }

    if (arg === '--allow-untracked') {
      parsed.allowUntracked.push(readValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith('--allow-untracked=')) {
      parsed.allowUntracked.push(arg.slice('--allow-untracked='.length));
      continue;
    }

    if (arg === '--max-open-prs') {
      parsed.thresholds.maxOpenPrs = parseIntegerFlag(readValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--max-open-prs=')) {
      parsed.thresholds.maxOpenPrs = parseIntegerFlag(arg.slice('--max-open-prs='.length), '--max-open-prs');
      continue;
    }

    if (arg === '--max-open-issues') {
      parsed.thresholds.maxOpenIssues = parseIntegerFlag(readValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--max-open-issues=')) {
      parsed.thresholds.maxOpenIssues = parseIntegerFlag(arg.slice('--max-open-issues='.length), '--max-open-issues');
      continue;
    }

    if (arg === '--max-dirty-files') {
      parsed.thresholds.maxDirtyFiles = parseIntegerFlag(readValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--max-dirty-files=')) {
      parsed.thresholds.maxDirtyFiles = parseIntegerFlag(arg.slice('--max-dirty-files='.length), '--max-dirty-files');
      continue;
    }

    if (arg === '--use-env-github-token') {
      parsed.useEnvGithubToken = true;
      continue;
    }

    if (arg === '--generated-at') {
      parsed.generatedAt = readValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--generated-at=')) {
      parsed.generatedAt = arg.slice('--generated-at='.length);
      continue;
    }

    if (arg === '--exit-code') {
      parsed.exitCode = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!['text', 'json', 'markdown'].includes(parsed.format)) {
    throw new Error(`Invalid format: ${parsed.format}. Use text, json, or markdown.`);
  }

  if (parsed.writePath && parsed.format === 'text') {
    throw new Error('--write requires --json, --markdown, or --format json|markdown');
  }

  parsed.allowUntracked = parsed.allowUntracked.map(normalizeRelativePrefix).filter(Boolean);

  return parsed;
}

function readText(rootDir, relativePath) {
  try {
    return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  } catch (_error) {
    return '';
  }
}

function fileExists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function includesAll(text, needles) {
  return needles.every(needle => text.includes(needle));
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error || result.status !== 0) {
    return null;
  }

  return (result.stdout || '').trim();
}

function readPackage(rootDir) {
  const text = readText(rootDir, 'package.json');
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return {};
  }
}

function buildRequirement(id, requirement, artifact, status, evidence, gap) {
  return { id, requirement, artifact, status, evidence, gap };
}

function isCurrentOrComplete(status) {
  return status === 'current' || status === 'complete';
}

function buildRequirements(rootDir, platformReport) {
  const roadmap = readText(rootDir, 'docs/ECC-2.0-GA-ROADMAP.md');
  const publicationReadiness = readText(rootDir, 'docs/releases/2.0.0-rc.1/publication-readiness.md');
  const namingMatrix = readText(rootDir, 'docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md');
  const previewManifest = readText(rootDir, 'docs/releases/2.0.0-rc.1/preview-pack-manifest.md');
  const progressSync = readText(rootDir, 'docs/architecture/progress-sync-contract.md');
  const observabilityReadiness = readText(rootDir, 'docs/architecture/observability-readiness.md');
  const stalePrSalvage = readText(rootDir, 'docs/stale-pr-salvage-ledger.md');
  const supplyChainRunbook = readText(rootDir, 'docs/security/supply-chain-incident-response.md');
  const supplyChainWorkflow = readText(rootDir, '.github/workflows/supply-chain-watch.yml');
  const packageJson = readPackage(rootDir);
  const scripts = packageJson.scripts || {};

  const githubLive = !platformReport.github.skipped && platformReport.github.totals.errors === 0;
  const queuesCurrent = githubLive
    && platformReport.github.totals.openPrs <= platformReport.thresholds.maxOpenPrs
    && platformReport.github.totals.openIssues <= platformReport.thresholds.maxOpenIssues;
  const discussionsCurrent = githubLive
    && platformReport.github.totals.discussionsNeedingMaintainerTouch === 0
    && platformReport.github.totals.discussionsMissingAcceptedAnswer === 0;

  return [
    buildRequirement(
      'public-pr-budget',
      'Keep public PRs below 20',
      'scripts/platform-audit.js live GitHub sweep',
      queuesCurrent ? 'current' : 'in_progress',
      githubLive
        ? `${platformReport.github.totals.openPrs} open PRs across ${platformReport.github.repos.length} tracked repos`
        : 'live GitHub queue readback was skipped or failed',
      queuesCurrent ? 'repeat before release' : 'run live platform:audit and drain PR queue'
    ),
    buildRequirement(
      'public-issue-budget',
      'Keep public issues below 20',
      'scripts/platform-audit.js live GitHub sweep',
      queuesCurrent ? 'current' : 'in_progress',
      githubLive
        ? `${platformReport.github.totals.openIssues} open issues across ${platformReport.github.repos.length} tracked repos`
        : 'live GitHub queue readback was skipped or failed',
      queuesCurrent ? 'repeat before release' : 'run live platform:audit and drain issue queue'
    ),
    buildRequirement(
      'repository-discussions',
      'Respond and manage repository discussions',
      'scripts/platform-audit.js discussion summary',
      discussionsCurrent ? 'current' : 'in_progress',
      githubLive
        ? `${platformReport.github.totals.discussionsNeedingMaintainerTouch} need maintainer touch; ${platformReport.github.totals.discussionsMissingAcceptedAnswer} answerable discussions missing accepted answer`
        : 'live discussion readback was skipped or failed',
      discussionsCurrent ? 'repeat before release' : 'respond, answer, or route remaining discussions'
    ),
    buildRequirement(
      'completion-dashboard',
      'Build ITO-44 completion dashboard into a repeatable command',
      'npm run operator:dashboard',
      scripts['operator:dashboard'] === 'node scripts/operator-readiness-dashboard.js'
        && fileExists(rootDir, 'scripts/operator-readiness-dashboard.js')
        ? 'complete'
        : 'in_progress',
      scripts['operator:dashboard'] === 'node scripts/operator-readiness-dashboard.js'
        ? 'operator:dashboard package script exists'
        : 'operator:dashboard package script missing',
      'keep generated dashboard attached to publication evidence'
    ),
    buildRequirement(
      'ecc-preview-pack',
      'ECC 2.0 preview pack ready',
      'docs/releases/2.0.0-rc.1/preview-pack-manifest.md',
      includesAll(previewManifest, ['publication-readiness.md', 'release-notes.md', 'quickstart.md']) ? 'in_progress' : 'not_complete',
      includesAll(previewManifest, ['publication-readiness.md', 'release-notes.md', 'quickstart.md'])
        ? 'preview pack manifest is in-tree'
        : 'preview pack manifest is incomplete',
      'final clean-checkout release approval and publish evidence still pending'
    ),
    buildRequirement(
      'hermes-specialized-skills',
      'Include Hermes specialized skills safely',
      'docs/HERMES-SETUP.md and skills/hermes-imports/SKILL.md',
      fileExists(rootDir, 'docs/HERMES-SETUP.md') && fileExists(rootDir, 'skills/hermes-imports/SKILL.md')
        ? 'in_progress'
        : 'not_complete',
      fileExists(rootDir, 'docs/HERMES-SETUP.md') && fileExists(rootDir, 'skills/hermes-imports/SKILL.md')
        ? 'Hermes setup and import skill are present'
        : 'Hermes setup/import artifacts missing',
      'final preview-pack smoke and release review pending'
    ),
    buildRequirement(
      'naming-and-plugin-publication',
      'Prepare name-change, Claude plugin, and Codex plugin paths',
      'naming-and-publication-matrix plus publication-readiness',
      includesAll(namingMatrix, ['Claude plugin', 'Codex plugin', 'npm package', 'Publication Paths'])
        && includesAll(publicationReadiness, ['Claude plugin', 'Codex plugin'])
        ? 'in_progress'
        : 'not_complete',
      'naming matrix and plugin readiness gates exist',
      'real tag/push, marketplace submission, and final channel choice remain approval-gated'
    ),
    buildRequirement(
      'release-notes-and-notifications',
      'Prepare release notes, articles, tweets, and push notifications',
      'docs/releases/2.0.0-rc.1 social and release-copy files',
      fileExists(rootDir, 'docs/releases/2.0.0-rc.1/release-notes.md')
        && fileExists(rootDir, 'docs/releases/2.0.0-rc.1/x-thread.md')
        && fileExists(rootDir, 'docs/releases/2.0.0-rc.1/linkedin-post.md')
        ? 'in_progress'
        : 'not_complete',
      'release notes, X thread, and LinkedIn draft are present',
      'URL-backed refresh and publish approval still pending'
    ),
    buildRequirement(
      'agentshield-enterprise-iteration',
      'Advance AgentShield enterprise iteration',
      'AgentShield PR evidence plus enterprise roadmap',
      roadmap.includes('AgentShield Enterprise Iteration') && roadmap.includes('#78-#86')
        ? 'in_progress'
        : 'not_complete',
      'AgentShield enterprise PR evidence is mirrored in the GA roadmap',
      'live IOC update loop and cross-harness depth remain pending'
    ),
    buildRequirement(
      'ecc-tools-next-level',
      'Advance ECC Tools native payments and AI-native harness-agnostic app',
      'ECC Tools PR evidence, billing gate, hosted analysis lanes',
      includesAll(roadmap, ['ECC-Tools PR #73', 'hosted promotion', 'announcementGate'])
        ? 'in_progress'
        : 'not_complete',
      'billing announcement gate and hosted analysis lanes are mirrored in the GA roadmap',
      'live Marketplace test-account readback, hosted promotion telemetry, and operator review UX pending'
    ),
    buildRequirement(
      'legacy-salvage',
      'Audit, prune, or attach legacy work',
      'docs/stale-pr-salvage-ledger.md and legacy inventory',
      stalePrSalvage.includes('Manual review tail') || roadmap.includes('ITO-55')
        ? 'in_progress'
        : 'not_complete',
      'legacy salvage ledger and ITO-55 tracking are present',
      'final translation/manual-review tail remains'
    ),
    buildRequirement(
      'linear-roadmap-and-progress',
      'Keep Linear roadmap detailed and progress tracking synchronized',
      'Linear project mirror plus progress-sync contract',
      includesAll(roadmap, ['ITO-44', 'ITO-59', 'Linear']) && includesAll(progressSync, ['GitHub', 'Linear', 'handoff', 'repo roadmap'])
        ? 'in_progress'
        : 'not_complete',
      'repo mirror and progress-sync contract are present',
      'recurring Linear status sync and productized realtime sync remain pending'
    ),
    buildRequirement(
      'observability-for-self-use',
      'Provide ECC 2.0 observability for self-use',
      'observability readiness gate',
      scripts['observability:ready'] === 'node scripts/observability-readiness.js'
        && includesAll(observabilityReadiness, ['observability-readiness.js'])
        ? 'complete'
        : 'in_progress',
      scripts['observability:ready'] === 'node scripts/observability-readiness.js'
        ? 'observability:ready command and readiness doc exist'
        : 'observability readiness command missing',
      'runtime/dashboard implementation can continue after release gates'
    ),
    buildRequirement(
      'supply-chain-local-protection',
      'Keep Mini Shai-Hulud/TanStack protection loop current',
      'supply-chain watch plus runbook',
      includesAll(supplyChainRunbook, ['TanStack', 'Mini Shai-Hulud', 'scan-supply-chain-iocs.js', 'supply-chain-advisory-sources.js'])
        && includesAll(supplyChainWorkflow, ['supply-chain-advisory-sources.js', 'supply-chain-advisory-sources.json'])
        && scripts['security:advisory-sources'] === 'node scripts/ci/supply-chain-advisory-sources.js'
        && fileExists(rootDir, '.github/workflows/supply-chain-watch.yml')
        ? 'current'
        : 'in_progress',
      scripts['security:advisory-sources'] === 'node scripts/ci/supply-chain-advisory-sources.js'
        ? 'scheduled supply-chain watch now emits IOC and advisory-source refresh artifacts'
        : 'scheduled supply-chain watch or advisory-source command is missing',
      'Linear status synchronization remains ITO-57 follow-up after each significant merge batch'
    ),
  ];
}

function buildReport(options) {
  const rootDir = path.resolve(options.root);
  const generatedAt = options.generatedAt || new Date().toISOString();
  const platformReport = buildPlatformReport({
    allowUntracked: options.allowUntracked,
    exitCode: false,
    format: 'json',
    help: false,
    repos: options.repos,
    root: rootDir,
    skipGithub: options.skipGithub,
    thresholds: options.thresholds,
    useEnvGithubToken: options.useEnvGithubToken,
    writePath: null,
  });
  const requirements = buildRequirements(rootDir, platformReport);
  const incompleteRequirements = requirements.filter(item => !isCurrentOrComplete(item.status));
  const topActions = incompleteRequirements.map(item => ({
    id: item.id,
    summary: item.requirement,
    fix: item.gap,
  }));
  const head = runCommand('git', ['rev-parse', 'HEAD'], { cwd: rootDir });

  return {
    schema_version: SCHEMA_VERSION,
    generatedAt,
    root: rootDir,
    head,
    ready: incompleteRequirements.length === 0,
    dashboardReady: platformReport.ready,
    publicationReady: false,
    platform: {
      ready: platformReport.ready,
      branch: platformReport.git.branch,
      blockingDirtyCount: platformReport.git.blockingDirtyCount,
      ignoredDirtyCount: platformReport.git.ignoredDirty.length,
      openPrs: platformReport.github.totals.openPrs,
      openIssues: platformReport.github.totals.openIssues,
      discussionsNeedingMaintainerTouch: platformReport.github.totals.discussionsNeedingMaintainerTouch,
      discussionsMissingAcceptedAnswer: platformReport.github.totals.discussionsMissingAcceptedAnswer,
      githubErrors: platformReport.github.totals.errors,
      githubSkipped: platformReport.github.skipped,
    },
    requirements,
    top_actions: topActions,
    next_work_order: [
      'Regenerate this dashboard from the final release commit before publication evidence is recorded.',
      'Continue ITO-57 with Linear status synchronization for the scheduled supply-chain watch advisory-source report.',
      'Advance ECC Tools live Marketplace test-account readback before publishing native-payments announcement copy.',
      'Resume ITO-45, ITO-46, and ITO-56 only after the generated dashboard and final release gates are refreshed.',
    ],
  };
}

function markdownEscape(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function renderText(report) {
  const lines = [
    `ECC Operator Readiness Dashboard: ${report.ready ? 'objective ready' : 'work remaining'}`,
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.head || 'unknown'}`,
    `Dashboard ready: ${report.dashboardReady}`,
    `Publication ready: ${report.publicationReady}`,
    '',
    'Platform:',
    `  PRs: ${report.platform.openPrs}`,
    `  Issues: ${report.platform.openIssues}`,
    `  Discussions needing touch: ${report.platform.discussionsNeedingMaintainerTouch}`,
    `  Missing accepted answers: ${report.platform.discussionsMissingAcceptedAnswer}`,
    `  Blocking dirty files: ${report.platform.blockingDirtyCount}`,
    '',
    'Requirements:',
  ];

  for (const item of report.requirements) {
    lines.push(`  ${item.status.toUpperCase()} ${item.id}: ${item.requirement}`);
  }

  lines.push('', 'Top actions:');
  if (report.top_actions.length === 0) {
    lines.push('  none');
  } else {
    for (const action of report.top_actions) {
      lines.push(`  - ${action.id}: ${action.fix}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function renderMarkdown(report) {
  const lines = [
    '# ECC Operator Readiness Dashboard',
    '',
    'This dashboard is generated by `npm run operator:dashboard`. It is an operator snapshot, not release approval.',
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.head || 'unknown'}`,
    `Status: ${report.ready ? 'objective ready' : 'work remaining'}`,
    '',
    '## Current Status',
    '',
    '| Area | Status | Evidence |',
    '| --- | --- | --- |',
    `| PR queue | ${report.platform.openPrs < 20 && !report.platform.githubSkipped ? 'Current' : 'Needs work'} | ${report.platform.openPrs} open PRs across tracked repos |`,
    `| Issue queue | ${report.platform.openIssues < 20 && !report.platform.githubSkipped ? 'Current' : 'Needs work'} | ${report.platform.openIssues} open issues across tracked repos |`,
    `| Discussions | ${report.platform.discussionsNeedingMaintainerTouch === 0 && report.platform.discussionsMissingAcceptedAnswer === 0 && !report.platform.githubSkipped ? 'Current' : 'Needs work'} | ${report.platform.discussionsNeedingMaintainerTouch} need maintainer touch; ${report.platform.discussionsMissingAcceptedAnswer} missing accepted answer |`,
    `| Local worktree | ${report.platform.blockingDirtyCount === 0 ? 'Current' : 'Needs work'} | ${report.platform.blockingDirtyCount} blocking dirty files; ${report.platform.ignoredDirtyCount} ignored dirty entries |`,
    `| Dashboard generation | ${report.dashboardReady ? 'Current' : 'Needs work'} | platform audit ready: ${report.platform.ready}; GitHub skipped: ${report.platform.githubSkipped} |`,
    `| Publication | ${report.publicationReady ? 'Ready' : 'Not complete'} | release, npm, plugin, billing, and announcement gates are tracked below |`,
    '',
    '## Prompt-To-Artifact Checklist',
    '',
    '| Objective requirement | Artifact or gate | Status | Evidence | Gap |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const item of report.requirements) {
    lines.push(`| ${markdownEscape(item.requirement)} | ${markdownEscape(item.artifact)} | ${markdownEscape(item.status)} | ${markdownEscape(item.evidence)} | ${markdownEscape(item.gap)} |`);
  }

  lines.push('', '## Top Actions', '');
  if (report.top_actions.length === 0) {
    lines.push('- none');
  } else {
    for (const action of report.top_actions) {
      lines.push(`- \`${markdownEscape(action.id)}\`: ${markdownEscape(action.fix)}`);
    }
  }

  lines.push('', '## Next Work Order', '');
  report.next_work_order.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });

  return `${lines.join('\n')}\n`;
}

function renderReport(report, format) {
  if (format === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }

  if (format === 'text') {
    return renderText(report);
  }

  return renderMarkdown(report);
}

function writeOutput(writePath, output) {
  fs.mkdirSync(path.dirname(writePath), { recursive: true });
  fs.writeFileSync(writePath, output, 'utf8');
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  if (options.help) {
    usage();
    return;
  }

  const report = buildReport(options);
  const output = renderReport(report, options.format);

  if (options.writePath) {
    writeOutput(options.writePath, output);
  }

  process.stdout.write(output);

  if (options.exitCode && !report.ready) {
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildReport,
  parseArgs,
  renderMarkdown,
  renderReport,
  renderText,
};
