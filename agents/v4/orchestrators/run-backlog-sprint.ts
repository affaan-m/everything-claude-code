#!/usr/bin/env tsx

/**
 * Run Backlog Sprint orchestrator
 *
 * Manager-agent sprint. Runs two concurrent loops:
 *
 *   Startup Context Scan (runs once before Loop A):
 *     - Fetches Jira tickets currently assigned to the user with "In Progress" status
 *     - Scans local git branches for any matching {TEAM_PREFIX}-{GIT_USERNAME}_* pattern
 *     - In-progress tickets are prepended to the Todo queue so they are finished first
 *     - If a local branch already exists for a ticket, it is passed to the subprocess
 *       so it can resume from existing work rather than starting from scratch
 *
 *   Loop A — Ticket Processing (serial, no ticket cap):
 *     1. Validate — close invalid tickets with a comment
 *     2. Assign to edward.welsh, transition to In Progress
 *     3. Full ticket-to-PR lifecycle (ADR → TDD → impl → refactor → PR → CI)
 *        — resumes from local branch if one already exists
 *     4. Final validation against Tealium ai-dev-tools best practices
 *     5. Assign Corbin Spicer as GitHub reviewer, move Jira to Ready for Review
 *
 *   Loop B — PR Monitor (parallel, runs every PR_POLL_INTERVAL_MS = 2 min):
 *     - PRs with "AI survey missing" label: compose and post/update AI survey comment
 *     - PRs with "🌶 Tests not yet passed" label: fix code logic/structure to make
 *       tests pass — NEVER remove, skip, or weaken tests
 *
 * Usage:
 *   npx tsx orchestrators/run-backlog-sprint.ts
 *   npm run orchestrators:backlog-sprint
 *   npm run orchestrators:backlog-sprint -- --dry-run
 *   npm run orchestrators:backlog-sprint -- --pr-monitor-only
 *   npm run orchestrators:backlog-sprint -- --max-tickets 10
 *
 * Required environment variables:
 *   GITHUB_REPO              GitHub repo in "owner/repo" format
 *   TEAM_PREFIX              Branch team prefix, e.g. sdcp, cdh, aiml
 *   GIT_USERNAME             Git username for branch naming (not $USERNAME — zsh readonly)
 *   JIRA_ASSIGNEE_ACCOUNT_ID Jira account ID of Edward Welsh
 *   REVIEWER_ACCOUNT_ID      Jira account ID of Corbin Spicer
 *   REVIEWER_GITHUB_LOGIN    GitHub username of Corbin Spicer
 *
 * Optional environment variables:
 *   JIRA_PROJECT_KEY         Jira project key (default: ETA)
 *   JIRA_BOARD_ID            Jira board ID (default: 7169)
 *   AI_DEV_TOOLS_REPO        Best practices repo (default: Tealium/ai-dev-tools)
 *   MAX_REFACTOR_LOOPS       Max refactor iterations per ticket (default: 5)
 *   MAX_TICKETS              Cap on tickets to process this run (default: unlimited)
 *   MAX_CI_FIX_ATTEMPTS      Max times ci-fixer retries a PR (default: 3)
 *   PR_POLL_INTERVAL_MS      Milliseconds between PR monitor polls (default: 120000)
 */

import { spawnSync, execSync } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

// ── Load .env from repo root ──────────────────────────────────────────────
// Do not use `source .env` — GRAVITEE_PASS contains special chars that break shell parsing.
{
  const __dir = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dir, '../../../.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      if (!(key in process.env)) process.env[key] = trimmed.slice(eqIdx + 1);
    }
  }
}

async function loadOrchestrator(name: string) {
  const { getOrchestrator } = await import('./index.js');
  return getOrchestrator(name);
}

// ── Argument parsing ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun        = args.includes('--dry-run');
const prMonitorOnly = args.includes('--pr-monitor-only');
const maxTicketsArg = args.find(a => a.startsWith('--max-tickets='))?.split('=')[1]
  ?? args[args.indexOf('--max-tickets') + 1];

const repo              = process.env.GITHUB_REPO;
const teamPrefix        = process.env.TEAM_PREFIX;
// Use GIT_USERNAME, not USERNAME — zsh treats USERNAME as readonly
const username          = process.env.GIT_USERNAME ?? process.env.USERNAME;
const assigneeAccountId = process.env.JIRA_ASSIGNEE_ACCOUNT_ID;
const reviewerAccountId = process.env.REVIEWER_ACCOUNT_ID;
const reviewerGithub    = process.env.REVIEWER_GITHUB_LOGIN;
const jiraProjectKey    = process.env.JIRA_PROJECT_KEY    ?? 'ETA';
const jiraBoardId       = process.env.JIRA_BOARD_ID       ?? '7169';
const aiDevToolsRepo    = process.env.AI_DEV_TOOLS_REPO   ?? 'Tealium/ai-dev-tools';
const maxRefactorLoops  = parseInt(process.env.MAX_REFACTOR_LOOPS ?? '5', 10);
const maxTickets        = maxTicketsArg ? parseInt(maxTicketsArg, 10) : undefined; // undefined = no cap
const maxCiFixAttempts  = parseInt(process.env.MAX_CI_FIX_ATTEMPTS ?? '3', 10);
const prPollIntervalMs  = parseInt(process.env.PR_POLL_INTERVAL_MS ?? '120000', 10);

const missing: string[] = [];
if (!repo)              missing.push('GITHUB_REPO');
if (!teamPrefix)        missing.push('TEAM_PREFIX');
if (!username)          missing.push('GIT_USERNAME');
if (!assigneeAccountId) missing.push('JIRA_ASSIGNEE_ACCOUNT_ID');
if (!reviewerAccountId) missing.push('REVIEWER_ACCOUNT_ID');
if (!reviewerGithub)    missing.push('REVIEWER_GITHUB_LOGIN');

if (missing.length > 0 && !dryRun) {
  console.error('Missing required environment variables:');
  missing.forEach(v => console.error(`  ${v}`));
  console.error('\nUse --dry-run to preview without executing.');
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────

type TicketOutcome = {
  ticketId: string;
  result: 'completed' | 'invalid' | 'enriched' | 'failed';
  detail: string;
};

type PrFixOutcome = {
  prNumber: number;
  type: 'ai-survey' | 'ci-fix';
  result: 'fixed' | 'failed';
  detail: string;
};

// ── Startup context helpers ────────────────────────────────────────────────

/**
 * Scans local git branches for any matching {teamPrefix}-{username}_* and
 * extracts the Jira ticket ID from each branch name.
 * Returns a Map of ticketId → branchName.
 */
function scanLocalBranches(): Map<string, string> {
  const map = new Map<string, string>();
  if (!teamPrefix || !username) return map;
  try {
    const raw = execSync(`git branch --list '${teamPrefix}-${username}_*'`, { encoding: 'utf8' });
    for (const line of raw.split('\n')) {
      const branch = line.replace(/^\*?\s+/, '').trim();
      if (!branch) continue;
      const match = branch.match(/_([A-Z]+-\d+)$/);
      if (match) map.set(match[1], branch);
    }
  } catch {
    // git not available or no matches — safe to ignore
  }
  return map;
}

/**
 * Fetches Jira tickets currently assigned to the configured user with
 * "In Progress" status using Jira REST API v3.
 * Returns ticket IDs ordered oldest-first, deduped against todoBoardIds.
 */
async function fetchAssignedInProgress(excludeIds: string[]): Promise<string[]> {
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  if (!jiraEmail || !jiraToken || !assigneeAccountId) return [];

  const excludeSet = new Set(excludeIds);
  const jql = `project = ${jiraProjectKey} AND assignee = "${assigneeAccountId}" AND status = "In Progress" ORDER BY updated ASC`;
  const url = 'https://tealium.atlassian.net/rest/api/3/search/jql';
  const creds = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      body: JSON.stringify({ jql, fields: ['summary', 'status'], maxResults: 50 }),
    });
    if (!resp.ok) return [];
    const data: any = await resp.json();
    return (data.issues ?? [])
      .map((i: any) => i.key as string)
      .filter((id: string) => !excludeSet.has(id));
  } catch {
    return [];
  }
}

// ── PR Monitor Loop (Loop B) ──────────────────────────────────────────────

/**
 * Runs a single PR monitor cycle. Fetches flagged PRs and dispatches fixers.
 * Called on an interval from main().
 */
async function runPrMonitorCycle(
  bsOrch: any,
  bsRegistry: any,
  inProgressPrNumbers: Set<number>,
  prOutcomes: PrFixOutcome[],
): Promise<void> {
  try {
    console.log('\n  [PR Monitor] Checking open PRs for issues...');

    const [fetchResult] = await runWorkflow(
      bsOrch, bsRegistry, 'backlog-sprint.monitor-prs', {
        repo,
        in_progress_pr_numbers: [...inProgressPrNumbers],
        max_ci_fix_attempts: maxCiFixAttempts,
      }
    );

    const totalFlagged: number = fetchResult?.total_flagged ?? 0;
    if (totalFlagged === 0) {
      console.log('  [PR Monitor] No flagged PRs found.');
      return;
    }

    const missingSurvey: any[] = fetchResult?.prs_missing_survey ?? [];
    const failingCi: any[]     = fetchResult?.prs_failing_ci ?? [];

    if (missingSurvey.length > 0) {
      console.log(`  [PR Monitor] ${missingSurvey.length} PR(s) missing AI survey: ${missingSurvey.map((p: any) => `#${p.prNumber}`).join(', ')}`);
    }
    if (failingCi.length > 0) {
      console.log(`  [PR Monitor] ${failingCi.length} PR(s) with failing CI: ${failingCi.map((p: any) => `#${p.prNumber}`).join(', ')}`);
    }

    // Fix AI survey PRs
    for (const pr of missingSurvey) {
      if (inProgressPrNumbers.has(pr.prNumber)) continue;
      inProgressPrNumbers.add(pr.prNumber);
      try {
        console.log(`  [PR Monitor] Fixing AI survey on PR #${pr.prNumber}...`);
        const [surveyResult] = await runWorkflow(
          bsOrch, bsRegistry, 'backlog-sprint.monitor-prs', {
            repo,
            in_progress_pr_numbers: [...inProgressPrNumbers],
            max_ci_fix_attempts: maxCiFixAttempts,
          }
        );
        prOutcomes.push({ prNumber: pr.prNumber, type: 'ai-survey', result: 'fixed', detail: surveyResult?.action_taken ?? 'done' });
        console.log(`  [PR Monitor] AI survey fixed on PR #${pr.prNumber}`);
      } catch (err: any) {
        prOutcomes.push({ prNumber: pr.prNumber, type: 'ai-survey', result: 'failed', detail: err?.message ?? String(err) });
        console.error(`  [PR Monitor] Failed to fix AI survey on PR #${pr.prNumber}: ${err?.message}`);
      } finally {
        inProgressPrNumbers.delete(pr.prNumber);
      }
    }

    // Fix CI-failing PRs
    for (const pr of failingCi) {
      if (inProgressPrNumbers.has(pr.prNumber)) continue;
      inProgressPrNumbers.add(pr.prNumber);
      try {
        console.log(`  [PR Monitor] Fixing CI on PR #${pr.prNumber} (branch: ${pr.branch})...`);
        const [ciResult] = await runWorkflow(
          bsOrch, bsRegistry, 'backlog-sprint.monitor-prs', {
            repo,
            in_progress_pr_numbers: [...inProgressPrNumbers],
            max_ci_fix_attempts: maxCiFixAttempts,
          }
        );
        const ciGreen: boolean = ciResult?.ci_green ?? false;
        if (ciGreen) {
          prOutcomes.push({ prNumber: pr.prNumber, type: 'ci-fix', result: 'fixed', detail: ciResult?.fix_summary ?? 'CI green' });
          console.log(`  [PR Monitor] CI fixed on PR #${pr.prNumber}`);
        } else {
          prOutcomes.push({ prNumber: pr.prNumber, type: 'ci-fix', result: 'failed', detail: ciResult?.unresolved_errors ?? 'CI still failing after max attempts' });
          console.warn(`  [PR Monitor] PR #${pr.prNumber} CI still failing after ${maxCiFixAttempts} attempts`);
        }
      } catch (err: any) {
        prOutcomes.push({ prNumber: pr.prNumber, type: 'ci-fix', result: 'failed', detail: err?.message ?? String(err) });
        console.error(`  [PR Monitor] Failed to fix CI on PR #${pr.prNumber}: ${err?.message}`);
      } finally {
        inProgressPrNumbers.delete(pr.prNumber);
      }
    }
  } catch (err: any) {
    console.error(`  [PR Monitor] Cycle error: ${err?.message ?? err}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Backlog Sprint — Manager Agent                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`  Board           : ${jiraBoardId} (${jiraProjectKey})`);
  console.log(`  Assignee        : ${assigneeAccountId || '(not set)'}`);
  console.log(`  Reviewer        : ${reviewerGithub || '(not set)'} / ${reviewerAccountId || '(not set)'}`);
  console.log(`  Repo            : ${repo || '(not set)'}`);
  console.log(`  Team            : ${teamPrefix || '(not set)'}`);
  console.log(`  Username        : ${username || '(not set)'}`);
  console.log(`  Best Practices  : ${aiDevToolsRepo}`);
  console.log(`  Max Tickets     : ${maxTickets ?? 'unlimited'}`);
  console.log(`  PR Poll         : ${prPollIntervalMs / 1000}s`);
  console.log(`  Max CI Fixes    : ${maxCiFixAttempts}`);
  console.log(`  Dry Run         : ${dryRun}`);
  console.log(`  PR Monitor Only : ${prMonitorOnly}`);
  console.log('');

  const bsConfig = await loadOrchestrator('backlog-sprint');
  const { orchestrator: bsOrch, registry: bsRegistry } =
    await setupOrchestratorWithMonitoring(bsConfig, true);

  const startTime = Date.now();
  const ticketOutcomes: TicketOutcome[] = [];
  const prOutcomes: PrFixOutcome[]      = [];
  const inProgressPrNumbers             = new Set<number>();

  // ── PR Monitor interval ────────────────────────────────────────────────

  let prMonitorInterval: ReturnType<typeof setInterval> | undefined;

  function startPrMonitor() {
    // Run immediately, then on interval
    runPrMonitorCycle(bsOrch, bsRegistry, inProgressPrNumbers, prOutcomes);
    prMonitorInterval = setInterval(
      () => runPrMonitorCycle(bsOrch, bsRegistry, inProgressPrNumbers, prOutcomes),
      prPollIntervalMs,
    );
  }

  function stopPrMonitor() {
    if (prMonitorInterval) clearInterval(prMonitorInterval);
  }

  if (prMonitorOnly) {
    console.log('[pr-monitor-only] Running PR monitor — skipping ticket processing.\n');
    startPrMonitor();

    // Run for one full poll cycle then exit
    await new Promise<void>(resolve => setTimeout(resolve, prPollIntervalMs + 5000));
    stopPrMonitor();
    await bsOrch.stop();
    printSummary([], prOutcomes, 0, startTime);
    process.exit(prOutcomes.some(o => o.result === 'failed') ? 1 : 0);
  }

  // ── Fetch board backlog ────────────────────────────────────────────────

  console.log('\n┌─ Fetching board backlog...');
  const [fetchResult] = await runWorkflow(bsOrch, bsRegistry, 'backlog-sprint.fetch-backlog', {
    board_id: jiraBoardId,
    project_key: jiraProjectKey,
  });

  let ticketIds: string[] = fetchResult?.ticket_ids ?? [];
  const totalFound: number = fetchResult?.total_count ?? ticketIds.length;
  console.log(`└─ Found ${totalFound} "To Do" tickets\n`);

  // ── Startup context scan ───────────────────────────────────────────────
  // Run before the main loop so we can surface existing work and prepend
  // any already-in-progress tickets.

  console.log('┌─ Startup context scan...');
  const [localBranches, inProgressIds] = await Promise.all([
    Promise.resolve(scanLocalBranches()),
    fetchAssignedInProgress(ticketIds),
  ]);

  if (inProgressIds.length > 0) {
    console.log(`│  In Progress (assigned to me): ${inProgressIds.join(', ')}`);
    // Prepend — finish in-flight work before picking up new tickets
    ticketIds = [...inProgressIds, ...ticketIds.filter(id => !inProgressIds.includes(id))];
  } else {
    console.log('│  In Progress: none');
  }

  if (localBranches.size > 0) {
    console.log(`│  Local branches with existing work:`);
    for (const [ticketId, branch] of localBranches) {
      console.log(`│    ${ticketId} → ${branch}`);
    }
  } else {
    console.log('│  Local branches: none');
  }
  console.log('└─ Context scan complete\n');

  if (maxTickets !== undefined) {
    ticketIds = ticketIds.slice(0, maxTickets);
  }

  console.log(`Processing ${ticketIds.length} ticket(s) total\n`);

  if (ticketIds.length === 0) {
    console.log('No tickets to process. Board backlog is empty.\n');
    // Still run PR monitor before exiting
    startPrMonitor();
    await new Promise<void>(resolve => setTimeout(resolve, prPollIntervalMs + 5000));
    stopPrMonitor();
    await bsOrch.stop();
    printSummary([], prOutcomes, 0, startTime);
    process.exit(0);
  }

  if (dryRun) {
    console.log('[dry-run] Would process tickets in this order:');
    ticketIds.forEach((id, i) => {
      const branch = localBranches.get(id);
      const inProgress = inProgressIds.includes(id);
      const tags = [inProgress ? 'in-progress' : '', branch ? `branch: ${branch}` : ''].filter(Boolean).join(', ');
      console.log(`  ${i + 1}. ${id}${tags ? `  (${tags})` : ''}`);
    });
    await bsOrch.stop();
    process.exit(0);
  }

  // ── Start PR monitor in background ────────────────────────────────────

  startPrMonitor();

  // ── Per-ticket loop (Loop A) ───────────────────────────────────────────

  for (let i = 0; i < ticketIds.length; i++) {
    const ticketId = ticketIds[i];
    const ticketLabel = `[${i + 1}/${ticketIds.length}] ${ticketId}`;

    console.log(`\n${'═'.repeat(62)}`);
    console.log(`  ${ticketLabel}`);
    console.log(`${'═'.repeat(62)}`);

    try {

      // Phase 2: Validate ──────────────────────────────────────────────

      console.log(`\n┌─ Validating ${ticketId}...`);
      const [validateResult] = await runWorkflow(
        bsOrch, bsRegistry, 'backlog-sprint.validate-ticket', { ticket_id: ticketId }
      );

      if (validateResult?.verdict === 'invalid') {
        console.log(`└─ Invalid: ${validateResult.reason} — closed, skipping.`);
        ticketOutcomes.push({ ticketId, result: 'invalid', detail: validateResult.reason ?? 'failed validation' });
        continue;
      }

      if (validateResult?.verdict === 'incomplete') {
        // Phase 2b: Enrich — harvest Jira comments + analyze codebase,
        // write description + BDD acceptance criteria back to Jira.
        console.log(`└─ Incomplete: missing description/AC — running enrichment flow...`);
        const [enrichResult] = await runWorkflow(
          bsOrch, bsRegistry, 'backlog-sprint.enrich-ticket', { ticket_id: ticketId }
        );
        const acCount: number = enrichResult?.acceptance_criteria?.length ?? 0;
        console.log(`   Enriched: ${acCount} AC item(s) written. Reporter tagged for review.`);
        ticketOutcomes.push({ ticketId, result: 'enriched', detail: `${acCount} AC items inferred from comments + codebase` });
        // Fall through — continue to assignment and implementation
      } else {
        console.log(`└─ Valid — proceeding`);
      }

      // Phase 3: Assign + In Progress ──────────────────────────────────

      console.log(`\n┌─ Assigning ${ticketId} to ${assigneeAccountId}...`);
      await runWorkflow(bsOrch, bsRegistry, 'backlog-sprint.setup-ticket', {
        ticket_id:           ticketId,
        assignee_account_id: assigneeAccountId,
      });
      console.log(`└─ Assigned and moved to In Progress`);

      // Phase 4: Full ticket-to-PR lifecycle ───────────────────────────
      // Spawned as a subprocess so each ticket gets a fresh context window.

      const resumeBranch = localBranches.get(ticketId);
      const resumeNote   = resumeBranch ? ` (resuming from ${resumeBranch})` : '';
      console.log(`\n┌─ Running ticket-to-PR lifecycle for ${ticketId}${resumeNote}...`);
      const outputJsonPath = join(tmpdir(), `t2p-result-${ticketId}-${Date.now()}.json`);
      const t2pScript = new URL('./run-ticket-to-pr.ts', import.meta.url).pathname;
      const t2pArgs   = [t2pScript, ticketId, '--output-json', outputJsonPath];
      if (resumeBranch) t2pArgs.push('--resume-branch', resumeBranch);

      const spawnResult = spawnSync(
        'tsx',
        t2pArgs,
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            GIT_USERNAME:             username,
            GITHUB_REPO:              repo,
            TEAM_PREFIX:              teamPrefix,
            JIRA_PROJECT_KEY:         jiraProjectKey,
            AI_DEV_TOOLS_REPO:        aiDevToolsRepo,
            MAX_REFACTOR_LOOPS:       String(maxRefactorLoops),
            JIRA_ASSIGNEE_ACCOUNT_ID: assigneeAccountId,
            REVIEWER_ACCOUNT_ID:      reviewerAccountId,
            REVIEWER_GITHUB_LOGIN:    reviewerGithub,
            ...(resumeBranch ? { RESUME_BRANCH: resumeBranch } : {}),
          },
        },
      );

      if (spawnResult.status !== 0) {
        throw new Error(`ticket-to-PR subprocess exited with code ${spawnResult.status}`);
      }

      let t2pResult: any = {};
      if (existsSync(outputJsonPath)) {
        try {
          t2pResult = JSON.parse(readFileSync(outputJsonPath, 'utf8'));
        } finally {
          unlinkSync(outputJsonPath);
        }
      }

      const prNumber: number = t2pResult?.pr_number;
      const prUrl: string    = t2pResult?.pr_url;
      console.log(`└─ ticket-to-PR complete: PR #${prNumber} — ${prUrl}`);

      // Phase 5: Final standards validation + reviewer handoff ─────────

      console.log(`\n┌─ Final validation + review handoff for ${ticketId}...`);
      await runWorkflow(bsOrch, bsRegistry, 'backlog-sprint.post-pr-handoff', {
        ticket_id:             ticketId,
        pr_number:             prNumber,
        pr_url:                prUrl,
        repo,
        ai_dev_tools_repo:     aiDevToolsRepo,
        reviewer_account_id:   reviewerAccountId,
        reviewer_github_login: reviewerGithub,
      });
      console.log(`└─ ${ticketId} handed off to ${reviewerGithub}`);

      ticketOutcomes.push({ ticketId, result: 'completed', detail: `PR #${prNumber} — ${prUrl}` });

    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error(`\n✗ ${ticketId} failed: ${msg}`);
      ticketOutcomes.push({ ticketId, result: 'failed', detail: msg });
      // Continue to next ticket — do not abort the sprint
    }
  }

  // ── Wait for final PR monitor cycle then exit ──────────────────────────

  console.log('\n┌─ Tickets processed. Waiting for final PR monitor cycle...');
  await new Promise<void>(resolve => setTimeout(resolve, prPollIntervalMs + 5000));
  stopPrMonitor();
  console.log('└─ PR monitor stopped.');

  await bsOrch.stop();

  printSummary(ticketOutcomes, prOutcomes, ticketIds.length, startTime);

  const anyFailed = ticketOutcomes.some(o => o.result === 'failed')
    || prOutcomes.some(o => o.result === 'failed');
  process.exit(anyFailed ? 1 : 0);
}

// ── Summary ───────────────────────────────────────────────────────────────

function printSummary(
  ticketOutcomes: TicketOutcome[],
  prOutcomes: PrFixOutcome[],
  totalTickets: number,
  startTime: number,
): void {
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Backlog Sprint Summary                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (ticketOutcomes.length > 0) {
    console.log('\n  Tickets:');
    for (const { ticketId, result, detail } of ticketOutcomes) {
      const icon = result === 'completed' || result === 'enriched' ? '✓' : result === 'invalid' ? '⊘' : '✗';
      console.log(`  ${icon} ${ticketId.padEnd(12)} ${result.padEnd(10)}  ${detail}`);
    }
    const completed = ticketOutcomes.filter(o => o.result === 'completed' || o.result === 'enriched').length;
    const invalid   = ticketOutcomes.filter(o => o.result === 'invalid').length;
    const failed    = ticketOutcomes.filter(o => o.result === 'failed').length;
    console.log(`\n  Completed : ${completed}/${totalTickets}`);
    console.log(`  Invalid   : ${invalid}/${totalTickets}  (closed)`);
    console.log(`  Failed    : ${failed}/${totalTickets}`);
  }

  if (prOutcomes.length > 0) {
    console.log('\n  PR Fixes:');
    for (const { prNumber, type, result, detail } of prOutcomes) {
      const icon = result === 'fixed' ? '✓' : '✗';
      console.log(`  ${icon} PR #${String(prNumber).padEnd(6)} ${type.padEnd(12)} ${result.padEnd(8)}  ${detail}`);
    }
    const fixed  = prOutcomes.filter(o => o.result === 'fixed').length;
    const pfailed = prOutcomes.filter(o => o.result === 'failed').length;
    console.log(`\n  PR fixes  : ${fixed} fixed, ${pfailed} unresolved`);
  }

  console.log(`\n  Duration  : ${elapsed} min`);
}

// ── Entry point ───────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default main;
