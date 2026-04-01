/**
 * Shadow DCP 5-Layer Test Strategy Orchestrators
 * 
 * Implements the recommended testing strategy:
 * 1. Build Guards - Fast PR gates (lint, unit, contracts, OpenAPI)
 * 2. Service Integration - Business logic under mocks
 * 3. Round-Trip Integrity - Highest ROI: explode/implode, sanitizers
 * 4. Contract Parity - UTUI ↔ Shadow DCP alignment
 * 5. Environment Smoke - Docker, preprod, Gravitee, security
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface OrchestratorConfig {
  swarmConfig: any;
  tasks: any;
}

function loadOrchestrator(name: string): OrchestratorConfig {
  const basePath = join(__dirname, name);
  const swarmConfig = parseYaml(readFileSync(join(basePath, 'swarm-config.yaml'), 'utf-8'));
  const tasks = parseYaml(readFileSync(join(basePath, 'tasks.yaml'), 'utf-8'));
  return { swarmConfig, tasks };
}

// === 5-Layer Strategy Orchestrators ===

/**
 * Layer 1: Build Guards
 * Fast PR gates - lint, unit tests, version contracts, OpenAPI validation
 */
export const buildGuardsOrchestrator = () => loadOrchestrator('build-guards');

/**
 * Layer 2: Service Integration
 * Business logic testing - RevisionService, EntityService, DiffService, ValidationService, SyncService
 */
export const serviceIntegrationOrchestrator = () => loadOrchestrator('service-integration');

/**
 * Layer 3: Round-Trip Integrity (HIGHEST ROI)
 * Explode/implode golden fixtures, sanitizer coverage, no silent field loss
 */
export const roundTripIntegrityOrchestrator = () => loadOrchestrator('round-trip-integrity');

/**
 * Layer 4: Contract Parity
 * UTUI ↔ Shadow DCP: ETA-183 pattern, field aliasing, null semantics, version behavior
 */
export const contractParityOrchestrator = () => loadOrchestrator('contract-parity');

/**
 * Layer 5: Environment Smoke
 * Docker-compose, preprod, Gravitee 9-domain, health, security, migrations
 */
export const environmentSmokeOrchestrator = () => loadOrchestrator('environment-smoke');

/**
 * DCPM Integration
 * Shadow DCP ↔ DCPM integration coverage: publish path, entity domains,
 * auth/JWT, sanitizer regression, Gravitee gateway smoke
 */
export const dcpmIntegrationOrchestrator = () => loadOrchestrator('dcpm-integration');

/**
 * Jira Ticket Workflow
 * Fetches assigned tickets, routes to development or code-review pipeline,
 * implements changes via MCP/Claude Code, creates branch, pushes, drafts PR,
 * validates PR body against Tealium standards, updates AI survey comment,
 * promotes PR to open, and assigns Jira ticket to a reviewer.
 */
export const jiraTicketWorkflowOrchestrator = () => loadOrchestrator('jira-ticket-workflow');

/**
 * PR Critique
 * Shadow critique agent — discovers all PRs linked to a Jira ticket,
 * reviews each using Glean expert_pr_code_reviewer, aggregates results,
 * and optionally posts a summary comment to Jira.
 */
export const prCritiqueOrchestrator = () => loadOrchestrator('pr-critique');

/**
 * Ticket-to-PR Full Lifecycle
 * Complete development lifecycle: Jira ticket → best practices lookup →
 * ADR → TDD tests → implementation → refactor loop → branch → PR →
 * AI survey → CI green → Jira to review.
 */
export const ticketToPrOrchestrator = () => loadOrchestrator('ticket-to-pr');

/**
 * CI Fix Loop
 * Automated CI remediation: inspect GitHub CI failures → document errors
 * in docs/CI/errors/ → diagnose root causes → apply fixes → push →
 * poll CI → loop until green or max iterations reached.
 */
export const ciFixLoopOrchestrator = () => loadOrchestrator('ci-fix-loop');

/**
 * Backlog Sprint
 * Loops through the ETA project board (board 7169) Todo column, processes
 * tickets oldest-first: validate → assign → ticket-to-PR lifecycle →
 * final Tealium standards validation → reviewer handoff.
 */
export const backlogSprintOrchestrator = () => loadOrchestrator('backlog-sprint');

// === Legacy/General Purpose Orchestrators ===

export const unitTestOrchestrator = () => loadOrchestrator('unit-test');
export const regressionTestOrchestrator = () => loadOrchestrator('regression-test');
export const integrationTestOrchestrator = () => loadOrchestrator('integration-test');
export const playwrightUiOrchestrator = () => loadOrchestrator('playwright-ui');
export const apiTestOrchestrator = () => loadOrchestrator('api-test');
export const performanceTestOrchestrator = () => loadOrchestrator('performance-test');
export const securityTestOrchestrator = () => loadOrchestrator('security-test');

export function loadAllOrchestrators(): Record<string, OrchestratorConfig> {
  return {
    'build-guards': buildGuardsOrchestrator(),
    'service-integration': serviceIntegrationOrchestrator(),
    'round-trip-integrity': roundTripIntegrityOrchestrator(),
    'contract-parity': contractParityOrchestrator(),
    'environment-smoke': environmentSmokeOrchestrator(),
    'dcpm-integration': dcpmIntegrationOrchestrator(),
    'jira-ticket-workflow': jiraTicketWorkflowOrchestrator(),
    'pr-critique': prCritiqueOrchestrator(),
    'ticket-to-pr': ticketToPrOrchestrator(),
    'ci-fix-loop': ciFixLoopOrchestrator(),
    'backlog-sprint': backlogSprintOrchestrator(),
    'unit-test': unitTestOrchestrator(),
    'regression-test': regressionTestOrchestrator(),
    'integration-test': integrationTestOrchestrator(),
    'playwright-ui': playwrightUiOrchestrator(),
    'api-test': apiTestOrchestrator(),
    'performance-test': performanceTestOrchestrator(),
    'security-test': securityTestOrchestrator(),
  };
}

export function getOrchestrator(name: string): OrchestratorConfig {
  const orchestrators: Record<string, () => OrchestratorConfig> = {
    'build-guards': buildGuardsOrchestrator,
    'service-integration': serviceIntegrationOrchestrator,
    'round-trip-integrity': roundTripIntegrityOrchestrator,
    'contract-parity': contractParityOrchestrator,
    'environment-smoke': environmentSmokeOrchestrator,
    'dcpm-integration': dcpmIntegrationOrchestrator,
    'jira-ticket-workflow': jiraTicketWorkflowOrchestrator,
    'pr-critique': prCritiqueOrchestrator,
    'ticket-to-pr': ticketToPrOrchestrator,
    'ci-fix-loop': ciFixLoopOrchestrator,
    'backlog-sprint': backlogSprintOrchestrator,
    'unit-test': unitTestOrchestrator,
    'regression-test': regressionTestOrchestrator,
    'integration-test': integrationTestOrchestrator,
    'playwright-ui': playwrightUiOrchestrator,
    'api-test': apiTestOrchestrator,
    'performance-test': performanceTestOrchestrator,
    'security-test': securityTestOrchestrator,
  };
  
  const loader = orchestrators[name];
  if (!loader) {
    throw new Error(`Unknown orchestrator: ${name}`);
  }
  
  return loader();
}

export function listOrchestrators(): string[] {
  return [
    'build-guards',
    'service-integration',
    'round-trip-integrity',
    'contract-parity',
    'environment-smoke',
    'dcpm-integration',
    'jira-ticket-workflow',
    'pr-critique',
    'ticket-to-pr',
    'ci-fix-loop',
    'backlog-sprint',
    'unit-test',
    'regression-test',
    'integration-test',
    'playwright-ui',
    'api-test',
    'performance-test',
    'security-test',
  ];
}

export default {
  buildGuardsOrchestrator,
  serviceIntegrationOrchestrator,
  roundTripIntegrityOrchestrator,
  contractParityOrchestrator,
  environmentSmokeOrchestrator,
  dcpmIntegrationOrchestrator,
  jiraTicketWorkflowOrchestrator,
  prCritiqueOrchestrator,
  ticketToPrOrchestrator,
  ciFixLoopOrchestrator,
  backlogSprintOrchestrator,
  unitTestOrchestrator,
  regressionTestOrchestrator,
  integrationTestOrchestrator,
  playwrightUiOrchestrator,
  apiTestOrchestrator,
  performanceTestOrchestrator,
  securityTestOrchestrator,
  loadAllOrchestrators,
  getOrchestrator,
  listOrchestrators,
};
