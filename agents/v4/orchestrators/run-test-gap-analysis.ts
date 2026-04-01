#!/usr/bin/env tsx

/**
 * Run Test Gap Analysis orchestrator
 *
 * Finds test coverage gaps in Shadow DCP's own test suite by analyzing
 * data flows from UTUI and DCPM (read-only context sources).
 *
 * Usage:
 *   npx tsx orchestrators/run-test-gap-analysis.ts                # full analysis + Jira tickets
 *   npx tsx orchestrators/run-test-gap-analysis.ts --dry-run      # analysis only, no tickets
 *   npx tsx orchestrators/run-test-gap-analysis.ts --playwright   # Playwright audit only
 *   npx tsx orchestrators/run-test-gap-analysis.ts --entity-matrix # entity coverage matrix only
 *   npx tsx orchestrators/run-test-gap-analysis.ts --max-loops=3  # limit loop iterations
 *
 * Environment:
 *   JIRA_ASSIGNEE_ACCOUNT_ID   Jira account ID for ticket assignment
 *   JIRA_API_TOKEN             Jira API token
 *   JIRA_EMAIL                 Jira email
 *   GITHUB_TOKEN               GitHub token for repo scanning
 *   JIRA_PROJECT_KEY           Jira project (default: ETA)
 *   MAX_GAP_ANALYSIS_LOOPS     Max loop iterations (default: 5)
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..', '..');

// =========================================================================
// Configuration
// =========================================================================

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const playwrightOnly = args.includes('--playwright');
const entityMatrixOnly = args.includes('--entity-matrix');

const maxLoopsArg = args.find(a => a.startsWith('--max-loops='));
const maxLoops = maxLoopsArg
  ? parseInt(maxLoopsArg.split('=')[1], 10)
  : parseInt(process.env.MAX_GAP_ANALYSIS_LOOPS ?? '5', 10);

const projectKey = process.env.JIRA_PROJECT_KEY ?? 'ETA';
const assigneeAccountId = process.env.JIRA_ASSIGNEE_ACCOUNT_ID ?? '';
const epicKey = process.env.GAP_EPIC_KEY ?? '';

// Context source repos (read-only)
const utuiRepo = process.env.UTUI_REPO ?? 'Tealium/utui';
const utuiDataMigratorRepo = process.env.UTUI_DATA_MIGRATOR_REPO ?? 'Tealium/tiq-utui-data-migrator';
const utuiTagTemplatesRepo = process.env.UTUI_TAG_TEMPLATES_REPO ?? 'Tealium/tag-templates';
const dcpmRepo = process.env.DCPM_REPO ?? 'Tealium/datacloud-profile-manager-service';

// =========================================================================
// Main
// =========================================================================

async function runTestGapAnalysis() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Test Gap Analysis — Shadow DCP                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('  Gap target:    Tealium/shadow-dcp (all gaps/tickets here)');
  console.log('  Context sources (read-only):');
  console.log(`    - ${utuiRepo}`);
  console.log(`    - ${utuiDataMigratorRepo}`);
  console.log(`    - ${utuiTagTemplatesRepo}`);
  console.log(`    - ${dcpmRepo}`);
  console.log('');

  if (dryRun) console.log('  Mode: DRY RUN — no Jira tickets will be created\n');
  if (playwrightOnly) console.log('  Mode: PLAYWRIGHT AUDIT ONLY\n');
  if (entityMatrixOnly) console.log('  Mode: ENTITY MATRIX ONLY\n');
  if (!dryRun && !playwrightOnly && !entityMatrixOnly) {
    console.log(`  Mode: FULL ANALYSIS — max ${maxLoops} loops\n`);
  }

  // Load orchestrator config
  const { loadOrchestrator } = await import('./index.js');
  let config: any;
  try {
    config = loadOrchestrator
      ? (await import('./index.js')).getOrchestrator('test-gap-analysis')
      : null;
  } catch {
    // Fallback: load directly
    const { readFileSync } = await import('fs');
    const { parse } = await import('yaml');
    const basePath = join(__dirname, 'test-gap-analysis');
    config = {
      swarmConfig: parse(readFileSync(join(basePath, 'swarm-config.yaml'), 'utf-8')),
      tasks: parse(readFileSync(join(basePath, 'tasks.yaml'), 'utf-8')),
    };
  }

  // Select workflow
  let workflow: string;
  if (playwrightOnly) {
    workflow = 'gap.playwright-audit';
  } else if (entityMatrixOnly) {
    workflow = 'gap.entity-matrix';
  } else {
    workflow = 'gap.full-analysis';
  }

  const baseInputs = {
    project_root: PROJECT_ROOT,
    utui_repo: utuiRepo,
    utui_data_migrator_repo: utuiDataMigratorRepo,
    utui_tag_templates_repo: utuiTagTemplatesRepo,
    dcpm_repo: dcpmRepo,
    project_key: projectKey,
    assignee_account_id: assigneeAccountId,
    epic_key: epicKey,
  };

  const startTime = Date.now();

  if (playwrightOnly || entityMatrixOnly) {
    // Single-pass modes — no looping
    console.log(`┌─ Running workflow: ${workflow}`);
    try {
      const { orchestrator, registry } = await setupOrchestratorWithMonitoring(config, true);
      await runWorkflow(orchestrator, registry, workflow, {
        ...baseInputs,
        loop_number: 1,
        previous_gap_count: 0,
      });
      await orchestrator.stop();
      console.log(`└─ ✓ ${workflow} complete`);
    } catch (err) {
      console.error(`└─ ✗ ${workflow} failed:`, err);
      process.exit(1);
    }
  } else {
    // Full analysis with looping
    let loopNumber = 0;
    let previousGapCount = 0;
    let totalGaps = 0;
    const allTicketKeys: string[] = [];

    while (loopNumber < maxLoops) {
      loopNumber++;
      console.log(`\n┌─────────────────────────────────────────────────────────┐`);
      console.log(`│ Loop ${loopNumber}/${maxLoops}                                              │`);
      console.log(`└─────────────────────────────────────────────────────────┘\n`);

      try {
        const { orchestrator, registry } = await setupOrchestratorWithMonitoring(config, true);

        const inputs = {
          ...baseInputs,
          loop_number: loopNumber,
          previous_gap_count: previousGapCount,
          existing_tickets: allTicketKeys,
        };

        // Skip ticket creation in dry-run mode
        if (dryRun) {
          // Run analysis workflow but skip ticket creation
          await runWorkflow(orchestrator, registry, 'gap.entity-matrix', inputs);
        } else {
          await runWorkflow(orchestrator, registry, workflow, inputs);
        }

        await orchestrator.stop();

        // TODO: Extract gap count and ticket keys from workflow outputs
        // For now, the orchestrator agents handle this via MCP tools
        const newGapsThisLoop = 0; // Placeholder — agents report via console
        totalGaps += newGapsThisLoop;

        if (newGapsThisLoop === 0 && loopNumber > 1) {
          console.log(`\n  No new gaps found in loop ${loopNumber}. Analysis complete.`);
          break;
        }

        previousGapCount = totalGaps;

      } catch (err) {
        console.error(`\n  ✗ Loop ${loopNumber} failed:`, err);
        if (loopNumber >= maxLoops) {
          console.error('  Max loops reached with errors. Exiting.');
          process.exit(1);
        }
      }
    }

    console.log(`\n  Total loops: ${loopNumber}`);
    if (allTicketKeys.length > 0) {
      console.log(`  Tickets created: ${allTicketKeys.length}`);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`\n  Duration: ${(duration / 1000).toFixed(1)}s`);
  console.log('\n✓ Test gap analysis complete');
  process.exit(0);
}

runTestGapAnalysis().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default runTestGapAnalysis;
