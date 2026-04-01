#!/usr/bin/env tsx

/**
 * Run Jira Ticket Workflow orchestrator
 *
 * Fetches all Jira tickets assigned to the current user in the given project,
 * routes each ticket to either the development or code-review pipeline, then:
 *   Development:  implement → branch → push → draft PR → validate PR body →
 *                 update AI survey comment → promote to open → assign reviewer
 *   Code Review:  AI-assisted review → post feedback → Slack notification
 *
 * Usage:
 *   npx tsx orchestrators/run-jira-ticket-workflow.ts
 *   npm run orchestrators:jira-ticket-workflow
 *
 * Required environment variables:
 *   JIRA_PROJECT_KEY     Jira project key, e.g. AIDT
 *   JIRA_CURRENT_USER    Jira username / account ID of the running user
 *   GITHUB_REPO          GitHub repo in "owner/repo" format
 *   TEAM_PREFIX          Branch team prefix, e.g. cdh, ss, aiml
 *
 * Optional environment variables:
 *   SLACK_CHANNEL        Slack channel for notifications (default: #dev-tools)
 */

import { jiraTicketWorkflowOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

const jiraProjectKey = process.env.JIRA_PROJECT_KEY;
const currentUser = process.env.JIRA_CURRENT_USER;
const repo = process.env.GITHUB_REPO;
const teamPrefix = process.env.TEAM_PREFIX;
const slackChannel = process.env.SLACK_CHANNEL ?? '#dev-tools';

if (!jiraProjectKey || !currentUser || !repo || !teamPrefix) {
  console.error('Missing required environment variables:');
  if (!jiraProjectKey) console.error('  JIRA_PROJECT_KEY');
  if (!currentUser)    console.error('  JIRA_CURRENT_USER');
  if (!repo)           console.error('  GITHUB_REPO');
  if (!teamPrefix)     console.error('  TEAM_PREFIX');
  process.exit(1);
}

async function runJiraTicketWorkflow() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Jira Ticket Workflow Orchestrator                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`  Project : ${jiraProjectKey}`);
  console.log(`  User    : ${currentUser}`);
  console.log(`  Repo    : ${repo}`);
  console.log(`  Team    : ${teamPrefix}`);
  console.log(`  Slack   : ${slackChannel}\n`);

  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(
    jiraTicketWorkflowOrchestrator(),
    true
  );

  const results: Record<string, 'passed' | 'failed'> = {};

  async function run(label: string, workflow: string, inputs: Record<string, unknown>) {
    console.log(`\n┌─ ${label}`);
    try {
      await runWorkflow(orchestrator, registry, workflow, inputs);
      results[label] = 'passed';
      console.log(`└─ ✓ ${label}`);
    } catch (err) {
      results[label] = 'failed';
      console.error(`└─ ✗ ${label}:`, err);
    }
  }

  await run('Jira Ticket Workflow', 'jira-ticket-workflow.run', {
    jira_project_key: jiraProjectKey,
    current_user: currentUser,
    repo,
    team_prefix: teamPrefix,
    slack_channel: slackChannel,
  });

  const passed = Object.values(results).filter(v => v === 'passed').length;
  const failed = Object.values(results).filter(v => v === 'failed').length;
  const total  = Object.keys(results).length;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Jira Ticket Workflow Summary                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  for (const [label, status] of Object.entries(results)) {
    console.log(`  ${status === 'passed' ? '✓' : '✗'} ${label}`);
  }
  console.log(`\n  Passed: ${passed}/${total}  Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.error('\n✗ Jira ticket workflow failed');
    process.exit(1);
  } else {
    console.log('\n✓ Jira ticket workflow completed');
    process.exit(0);
  }
}

runJiraTicketWorkflow().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default runJiraTicketWorkflow;
