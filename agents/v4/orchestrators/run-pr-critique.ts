#!/usr/bin/env tsx

/**
 * Run PR Critique orchestrator
 *
 * Given a Jira ticket ID, discovers all linked PRs across Tealium repos,
 * reviews each using the orchestrator's review pipeline, aggregates results
 * into a summary, and optionally posts to the Jira ticket.
 *
 * Usage:
 *   npx tsx orchestrators/run-pr-critique.ts ETA-355
 *   npx tsx orchestrators/run-pr-critique.ts ETA-355 --post-to-jira
 *   npm run orchestrators:pr-critique -- ETA-355
 *
 * Options:
 *   --post-to-jira   Post aggregated summary as a Jira comment
 *   --all            Include closed/merged PRs (default: open only)
 *   --owner OWNER    GitHub org to search (default: Tealium)
 */

import { prCritiqueOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runTask } from './helpers.js';
import { execSync } from 'child_process';

// ── Types ────────────────────────────────────────────────────────────────────

interface PRInfo {
  repo: string;
  number: number;
  url: string;
  title: string;
  state: string;
  author: string;
}

interface PRReviewResult {
  pr_url: string;
  pr_number: number;
  repo: string;
  review_text: string;
  issues_found: Array<{ severity: string; file?: string; line?: number; message: string }>;
}

interface AggregatedReview {
  summary_markdown: string;
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

// ── Argument parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const ticketId = args.find(a => !a.startsWith('--'));
const postToJira = args.includes('--post-to-jira');
const includeAll = args.includes('--all');
const ownerIdx = args.indexOf('--owner');
const owner = ownerIdx >= 0 ? args[ownerIdx + 1] : 'Tealium';

if (!ticketId || !ticketId.match(/^[A-Z]+-\d+$/)) {
  console.error('Usage: run-pr-critique.ts <TICKET-ID> [--post-to-jira] [--all] [--owner ORG]');
  console.error('  e.g. run-pr-critique.ts ETA-355');
  process.exit(1);
}

// ── Step 1: Discover PRs ─────────────────────────────────────────────────────

function discoverPRs(ticket: string, org: string): PRInfo[] {
  try {
    const ghOutput = execSync(
      `gh search prs "${ticket}" --owner ${org} --json repository,number,url,title,state,author --limit 30`,
      { encoding: 'utf-8', timeout: 15000 }
    );
    const rawPrs = JSON.parse(ghOutput);
    return rawPrs.map((pr: any) => ({
      repo: pr.repository?.nameWithOwner || pr.repository?.name || 'unknown',
      number: pr.number,
      url: pr.url,
      title: pr.title,
      state: pr.state?.toUpperCase() || 'UNKNOWN',
      author: pr.author?.login || 'unknown',
    }));
  } catch (err: any) {
    console.error('  ✗ Failed to discover PRs via gh CLI:', err.message);
    return [];
  }
}

// ── Step 2: Review a single PR ───────────────────────────────────────────────

async function reviewPR(
  pr: PRInfo,
  ticket: string,
  orchestrator: any,
  registry: any,
): Promise<PRReviewResult> {
  console.log(`  → PR #${pr.number} (${pr.repo}): ${pr.title}`);

  try {
    const result = await runTask(orchestrator, 'review.critique-pr', {
      pr_url: pr.url,
      pr_number: pr.number,
      repo: pr.repo,
      ticket_id: ticket,
    }, registry);

    return {
      pr_url: pr.url,
      pr_number: pr.number,
      repo: pr.repo,
      review_text: result?.output?.review_text || result?.output?.message || 'Review completed (no detailed output)',
      issues_found: result?.output?.issues_found || [],
    };
  } catch (err: any) {
    console.error(`    ✗ Review failed for PR #${pr.number}: ${err.message}`);
    return {
      pr_url: pr.url,
      pr_number: pr.number,
      repo: pr.repo,
      review_text: `_Review failed: ${err.message}_`,
      issues_found: [],
    };
  }
}

// ── Step 3: Aggregate ────────────────────────────────────────────────────────

function aggregateReviews(reviews: PRReviewResult[], ticket: string): AggregatedReview {
  const allIssues = reviews.flatMap(r => r.issues_found || []);
  const critical = allIssues.filter(i => i.severity === 'critical').length;
  const high = allIssues.filter(i => i.severity === 'high').length;
  const medium = allIssues.filter(i => i.severity === 'medium').length;
  const low = allIssues.filter(i => i.severity === 'low').length;

  let md = `## PR Critique Summary for ${ticket}\n\n`;
  md += `**${reviews.length} PR(s) reviewed** | ${allIssues.length} issues found\n\n`;

  if (allIssues.length > 0) {
    md += `| Severity | Count |\n|----------|-------|\n`;
    md += `| Critical | ${critical} |\n`;
    md += `| High     | ${high} |\n`;
    md += `| Medium   | ${medium} |\n`;
    md += `| Low      | ${low} |\n\n`;
  }

  for (const review of reviews) {
    md += `### PR #${review.pr_number} (${review.repo})\n`;
    md += `${review.pr_url}\n\n`;
    md += review.review_text || '_No detailed review text available._';
    md += '\n\n---\n\n';
  }

  return {
    summary_markdown: md,
    total_issues: allIssues.length,
    critical_count: critical,
    high_count: high,
    medium_count: medium,
    low_count: low,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Shadow PR Critique Agent                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`  Ticket     : ${ticketId}`);
  console.log(`  Owner      : ${owner}`);
  console.log(`  Post Jira  : ${postToJira}`);
  console.log(`  All states : ${includeAll}\n`);

  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(
    prCritiqueOrchestrator(),
    true
  );

  // Step 1: Discover PRs
  console.log('┌─ Step 1: Discovering linked PRs...');
  const allPrs = discoverPRs(ticketId!, owner);
  const prs = includeAll ? allPrs : allPrs.filter(pr => pr.state === 'OPEN');
  console.log(`│  Found ${allPrs.length} total PRs, ${prs.length} ${includeAll ? 'included' : 'open'}`);
  for (const pr of prs) {
    console.log(`│    #${pr.number} [${pr.state}] ${pr.repo}: ${pr.title}`);
  }
  console.log('└─ Discovery complete\n');

  if (prs.length === 0) {
    console.log('No PRs to review. Done.');
    await orchestrator.stop();
    process.exit(0);
  }

  // Step 2: Review each PR (parallel, max 5 concurrent)
  console.log('┌─ Step 2: Reviewing PRs...');
  const CONCURRENCY = 5;
  const reviews: PRReviewResult[] = [];

  for (let i = 0; i < prs.length; i += CONCURRENCY) {
    const batch = prs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(pr => reviewPR(pr, ticketId!, orchestrator, registry))
    );
    reviews.push(...batchResults);
  }
  console.log(`└─ Completed ${reviews.length} reviews\n`);

  // Step 3: Aggregate
  console.log('┌─ Step 3: Aggregating results...');
  const aggregated = aggregateReviews(reviews, ticketId!);
  console.log(`│  Total issues : ${aggregated.total_issues}`);
  console.log(`│  Critical: ${aggregated.critical_count} | High: ${aggregated.high_count} | Medium: ${aggregated.medium_count} | Low: ${aggregated.low_count}`);
  console.log('└─ Summary generated\n');

  // Print summary
  console.log('═'.repeat(60));
  console.log(aggregated.summary_markdown);
  console.log('═'.repeat(60));

  // Step 4: Post to Jira (optional)
  if (postToJira) {
    console.log('\n┌─ Step 4: Posting summary to Jira...');
    try {
      await runTask(orchestrator, 'jira.post-critique-summary', {
        ticket_id: ticketId,
        summary_markdown: aggregated.summary_markdown,
      }, registry);
      console.log('└─ ✓ Posted to Jira');
    } catch (err: any) {
      console.error(`└─ ✗ Failed to post to Jira: ${err.message}`);
    }
  }

  await orchestrator.stop();

  const exitCode = aggregated.critical_count > 0 ? 1 : 0;
  console.log(`\n${exitCode === 0 ? '✓' : '✗'} PR critique complete`);
  process.exit(exitCode);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default main;
