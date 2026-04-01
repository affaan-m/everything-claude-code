#!/usr/bin/env tsx

/**
 * Run Ticket-to-PR lifecycle orchestrator
 *
 * Full-lifecycle development swarm: Jira ticket → ADR → TDD → implementation →
 * refactor loop → branch → PR → AI survey → CI green → Jira to review.
 *
 * Usage:
 *   npx tsx orchestrators/run-ticket-to-pr.ts ETA-377
 *   npx tsx orchestrators/run-ticket-to-pr.ts ETA-377 --adr-only
 *   npx tsx orchestrators/run-ticket-to-pr.ts --tdd-cycle --adr-path docs/ADRs/ADR-0042.md
 *   npm run orchestrators:ticket-to-pr -- ETA-377
 *
 * Required environment variables:
 *   JIRA_PROJECT_KEY     Jira project key (derived from ticket ID if not set)
 *   GITHUB_REPO          GitHub repo in "owner/repo" format
 *   TEAM_PREFIX          Branch team prefix, e.g. cdh, ss, aiml
 *   USERNAME             Git username for branch naming
 *
 * Optional environment variables:
 *   AI_DEV_TOOLS_REPO    Best practices repo (default: Tealium/ai-dev-tools)
 *   MAX_REFACTOR_LOOPS   Max refactor iterations (default: 5)
 */

import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

// Lazy-load the orchestrator to avoid circular import issues at parse time
async function loadOrchestrator() {
  const { getOrchestrator } = await import('./index.js');
  return getOrchestrator('ticket-to-pr');
}

// ── Argument parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const ticketId = args.find(a => !a.startsWith('--'));
const adrOnly = args.includes('--adr-only');
const tddCycleOnly = args.includes('--tdd-cycle');
const adrPathIdx = args.indexOf('--adr-path');
const adrPath = adrPathIdx >= 0 ? args[adrPathIdx + 1] : undefined;

const repo = process.env.GITHUB_REPO;
const teamPrefix = process.env.TEAM_PREFIX;
const username = process.env.USERNAME;
const aiDevToolsRepo = process.env.AI_DEV_TOOLS_REPO ?? 'Tealium/ai-dev-tools';
const maxRefactorLoops = parseInt(process.env.MAX_REFACTOR_LOOPS ?? '5', 10);

if (!ticketId || !ticketId.match(/^[A-Z]+-\d+$/)) {
  console.error('Usage: run-ticket-to-pr.ts <TICKET-ID> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --adr-only              Only fetch ticket and create ADR');
  console.error('  --tdd-cycle             Run TDD loop only (requires --adr-path)');
  console.error('  --adr-path <path>       Path to existing ADR file');
  console.error('');
  console.error('Environment:');
  console.error('  GITHUB_REPO             GitHub repo (owner/repo)');
  console.error('  TEAM_PREFIX             Branch prefix (cdh, ss, aiml)');
  console.error('  USERNAME                Git username');
  console.error('  AI_DEV_TOOLS_REPO       Best practices repo (default: Tealium/ai-dev-tools)');
  process.exit(1);
}

const jiraProjectKey = process.env.JIRA_PROJECT_KEY ?? ticketId.split('-')[0];

// ── Validate required env vars for full lifecycle ────────────────────────

if (!adrOnly && !tddCycleOnly) {
  const missing: string[] = [];
  if (!repo) missing.push('GITHUB_REPO');
  if (!teamPrefix) missing.push('TEAM_PREFIX');
  if (!username) missing.push('USERNAME');
  if (missing.length > 0) {
    console.error('Missing required environment variables for full lifecycle:');
    missing.forEach(v => console.error(`  ${v}`));
    console.error('\nUse --adr-only to skip branch/PR steps.');
    process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Ticket-to-PR Lifecycle Swarm                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const mode = adrOnly ? 'ADR Only' : tddCycleOnly ? 'TDD Cycle' : 'Full Lifecycle';
  console.log(`  Ticket          : ${ticketId}`);
  console.log(`  Project         : ${jiraProjectKey}`);
  console.log(`  Mode            : ${mode}`);
  console.log(`  Repo            : ${repo || '(not set)'}`);
  console.log(`  Team            : ${teamPrefix || '(not set)'}`);
  console.log(`  Username        : ${username || '(not set)'}`);
  console.log(`  Best Practices  : ${aiDevToolsRepo}`);
  console.log(`  Max Refactor    : ${maxRefactorLoops}`);
  console.log('');

  const config = await loadOrchestrator();
  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(config, true);

  const startTime = Date.now();

  try {
    if (adrOnly) {
      // ── ADR-only mode ──────────────────────────────────────────────
      console.log('┌─ Running ADR-only workflow...');
      await runWorkflow(orchestrator, registry, 'ticket-to-pr.adr-only', {
        ticket_id: ticketId,
        ai_dev_tools_repo: aiDevToolsRepo,
      });
      console.log('└─ ADR created successfully');

    } else if (tddCycleOnly) {
      // ── TDD cycle mode ─────────────────────────────────────────────
      if (!adrPath) {
        console.error('--tdd-cycle requires --adr-path <path>');
        process.exit(1);
      }
      console.log('┌─ Running TDD cycle workflow...');
      await runWorkflow(orchestrator, registry, 'ticket-to-pr.tdd-cycle', {
        ticket_id: ticketId,
        adr_file_path: adrPath,
        // These would normally come from a previous ADR step
        adr_decision_summary: '',
        acceptance_criteria: [],
        affected_files: [],
        test_strategy: 'unit',
        ticket: { id: ticketId },
      });
      console.log('└─ TDD cycle complete');

    } else {
      // ── Full lifecycle ─────────────────────────────────────────────
      console.log('┌─ Running full ticket-to-PR lifecycle...');
      await runWorkflow(orchestrator, registry, 'ticket-to-pr.full-lifecycle', {
        ticket_id: ticketId,
        jira_project_key: jiraProjectKey,
        repo,
        team_prefix: teamPrefix,
        username,
        ai_dev_tools_repo: aiDevToolsRepo,
        max_refactor_loops: maxRefactorLoops,
      });
      console.log('└─ Full lifecycle complete');
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✓ Ticket-to-PR completed in ${elapsed}s`);
    await orchestrator.stop();
    process.exit(0);

  } catch (err: any) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n✗ Ticket-to-PR failed after ${elapsed}s:`, err.message || err);
    await orchestrator.stop();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default main;
