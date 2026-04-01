#!/usr/bin/env tsx

/**
 * Run CI Fix Loop orchestrator
 *
 * Inspects GitHub CI failures, documents errors in docs/CI/errors/,
 * diagnoses root causes, applies fixes, pushes, and loops until CI is green.
 *
 * Usage:
 *   npx tsx orchestrators/run-ci-fix-loop.ts --pr 255
 *   npx tsx orchestrators/run-ci-fix-loop.ts --branch cdh-ewelsh_ETA-377
 *   npx tsx orchestrators/run-ci-fix-loop.ts --pr 255 --inspect-only
 *   npx tsx orchestrators/run-ci-fix-loop.ts --pr 255 --max-iterations 3
 *   npm run orchestrators:ci-fix-loop -- --pr 255
 *
 * Required environment variables:
 *   GITHUB_REPO          GitHub repo in "owner/repo" format
 *
 * Optional environment variables:
 *   TICKET_ID            Jira ticket ID for error report naming (derived from branch if not set)
 *   MAX_CI_FIX_ITERATIONS  Max fix loop iterations (default: 10)
 *   CI_POLL_INTERVAL_MS    Polling interval for CI status (default: 30000)
 */

import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

async function loadOrchestrator() {
  const { getOrchestrator } = await import('./index.js');
  return getOrchestrator('ci-fix-loop');
}

// ── Argument parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArgValue(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
}

const prNumber = getArgValue('--pr') ? parseInt(getArgValue('--pr')!, 10) : undefined;
const branch = getArgValue('--branch');
const inspectOnly = args.includes('--inspect-only');
const maxIterationsArg = getArgValue('--max-iterations');

const repo = process.env.GITHUB_REPO;
const ticketId = process.env.TICKET_ID;
const maxIterations = maxIterationsArg
  ? parseInt(maxIterationsArg, 10)
  : parseInt(process.env.MAX_CI_FIX_ITERATIONS ?? '10', 10);
const pollIntervalMs = parseInt(process.env.CI_POLL_INTERVAL_MS ?? '30000', 10);

if (!prNumber && !branch) {
  console.error('Usage: run-ci-fix-loop.ts --pr <NUMBER> | --branch <NAME> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --pr <number>           PR number to inspect');
  console.error('  --branch <name>         Branch name (looks up PR automatically)');
  console.error('  --inspect-only          Only inspect and document errors, do not fix');
  console.error('  --max-iterations <n>    Max fix iterations (default: 10)');
  console.error('');
  console.error('Environment:');
  console.error('  GITHUB_REPO             GitHub repo (owner/repo) [required]');
  console.error('  TICKET_ID               Jira ticket ID (derived from branch if not set)');
  console.error('  MAX_CI_FIX_ITERATIONS   Max iterations (default: 10)');
  console.error('  CI_POLL_INTERVAL_MS     CI poll interval in ms (default: 30000)');
  process.exit(1);
}

if (!repo) {
  console.error('Missing required environment variable: GITHUB_REPO');
  process.exit(1);
}

// Derive ticket ID from branch name if not explicitly set
const resolvedTicketId = ticketId
  ?? branch?.match(/([A-Z]+-\d+)/)?.[1]
  ?? `PR-${prNumber}`;

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   CI Fix Loop Orchestrator                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const mode = inspectOnly ? 'Inspect Only' : 'Full Fix Loop';
  console.log(`  PR              : ${prNumber || '(from branch)'}`);
  console.log(`  Branch          : ${branch || '(from PR)'}`);
  console.log(`  Ticket          : ${resolvedTicketId}`);
  console.log(`  Repo            : ${repo}`);
  console.log(`  Mode            : ${mode}`);
  console.log(`  Max Iterations  : ${maxIterations}`);
  console.log(`  Poll Interval   : ${pollIntervalMs}ms`);
  console.log('');

  const config = await loadOrchestrator();
  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(config, true);

  const startTime = Date.now();

  try {
    const workflowName = inspectOnly ? 'ci-fix-loop.inspect-only' : 'ci-fix-loop.full';
    const workflowInputs = {
      repo,
      pr_number: prNumber,
      branch,
      ticket_id: resolvedTicketId,
      max_iterations: maxIterations,
      poll_interval_ms: pollIntervalMs,
    };

    console.log(`┌─ Running ${mode} workflow...`);
    await runWorkflow(orchestrator, registry, workflowName, workflowInputs);
    console.log(`└─ ${mode} complete`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✓ CI Fix Loop completed in ${elapsed}s`);
    await orchestrator.stop();
    process.exit(0);

  } catch (err: any) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n✗ CI Fix Loop failed after ${elapsed}s:`, err.message || err);
    await orchestrator.stop();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default main;
