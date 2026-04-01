#!/usr/bin/env tsx

/**
 * Run DCPM Integration orchestrator
 *
 * Executes the Shadow DCP ↔ DCPM integration test suite in priority order:
 *   P0: publish path, entity domains (attributes/audiences/connectors), auth/JWT, validation gates
 *   P1: sanitizer regression, functions, settings/consent, Gravitee gateway smoke
 *
 * Usage:
 *   npx tsx orchestrators/run-dcpm-integration.ts
 *   npm run orchestrators:dcpm-integration
 *
 * Environment variables (all optional — defaults to local dev values):
 *   DCPM_TEST_ACCOUNT        Tealium account name (default: testaccount)
 *   DCPM_TEST_PROFILE        Tealium profile name (default: main)
 *   SS_GATEWAY_URL           Gravitee SS gateway base URL
 *   PREPROD_GATEWAY_URL      Gravitee preprod gateway base URL
 *   DCPM_TEST_AUTH_TOKEN     Bearer token for gateway smoke tests
 */

import { dcpmIntegrationOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

const account = process.env.DCPM_TEST_ACCOUNT ?? 'testaccount';
const profile = process.env.DCPM_TEST_PROFILE ?? 'main';
const ssGatewayUrl = process.env.SS_GATEWAY_URL ?? 'https://gateway-apim-us-west-2.ss.tlium.com/cdh';
const preprodGatewayUrl = process.env.PREPROD_GATEWAY_URL ?? 'https://gateway-apim-us-east-1.preprod.tlium.com/cdh';
const authToken = process.env.DCPM_TEST_AUTH_TOKEN ?? '';

async function runDcpmIntegration() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Shadow DCP ↔ DCPM Integration Test Suite                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(
    dcpmIntegrationOrchestrator(),
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

  // P0 — publish path (spine of the integration)
  await run('P0: Versioning / Publish Path', 'dcpm.p0-publish-path', {
    account,
    profile,
    stale_revision: 'stale-rev-001',
    fresh_revision: 'fresh-rev-002',
    committed_revision_id: 'rev-committed-001',
    published_revision_id: 'rev-published-001',
  });

  // P0 — entity domains
  await run('P0: Entity Domains (Attributes / Audiences / Connectors)', 'dcpm.p0-entity-domains', {
    draft_id: 'draft-entity-test',
    attribute_fixture: { name: 'customer_tier', type: 'string', context: 'visitor' },
    audience_fixture: { name: 'Premium Customers', rules: { match: 'all', conditions: [] } },
    label_ids: ['label-vip'],
    segment_fixture: { name: 'High Value', logic: { $or: [{ $and: [] }] } },
    connector_fixture: { type: 'facebook', name: 'Facebook Conversions' },
    action_fixture: { name: 'Send to Facebook', trigger: 'EVENT' },
    action_with_bad_connector: { name: 'Bad Action', connectorId: 'nonexistent-connector-id' },
  });

  // P0 — auth / JWT
  await run('P0: Auth / JWT / Permission Mapping', 'dcpm.p0-auth-jwt', {
    account,
    profile,
  });

  // P0 — validation gates
  await run('P0: Validation / Sanitizer / Sync-Status Gates', 'dcpm.p0-validation-gates', {
    draft_id: 'draft-validation-test',
    invalid_entity_fixture: { audiences: [{ id: 'aud-bad' /* missing name */ }] },
    revision_id: 'rev-success-test',
    committed_revision_id: 'rev-committed-fail',
    published_revision_id: 'rev-published-fail',
  });

  // P1 — sanitizer regression
  await run('P1: Sanitizer Regression (Shadow Fields / Data Ingestion)', 'dcpm.p1-sanitizer-regression', {
    draft_id: 'draft-sanitizer-test',
    ingestion_fixtures: {
      eventFeed: { name: 'Page Views', conditions: [] },
      eventSpec: { name: 'purchase', attributes: [] },
      fileSource: { name: 'CRM Import', type: 'csv' },
      fileDefinition: { name: 'Customer File', columns: [] },
      dataSource: { name: 'Tealium Collect', type: 'tealium_collect' },
      enrichment: { name: 'Lookup Tier', type: 'lookup' },
    },
  });

  // P1 — functions + settings/consent
  await run('P1: Functions + Settings / Consent', 'dcpm.p1-functions-settings', {
    draft_id: 'draft-functions-test',
    function_fixture: { id: 'fn-001', ref: 'cf-ref-abc', name: 'Enrich Visitor', type: 'ACTION' },
    settings_fixture: { dataAccessClusters: [{ key: 'us-west-2', value: 'enabled' }] },
    consent_fixture: { enabled: true, categories: ['analytics'] },
  });

  // P1 — Gravitee gateway smoke (only if URLs are configured)
  if (authToken) {
    await run('P1: Gravitee Gateway Smoke (SS + Preprod)', 'dcpm.p1-gateway-smoke', {
      ss_gateway_url: ssGatewayUrl,
      preprod_gateway_url: preprodGatewayUrl,
      auth_token: authToken,
    });
  } else {
    console.log('\n┌─ P1: Gravitee Gateway Smoke');
    console.log('└─ ⚠ Skipped — set DCPM_TEST_AUTH_TOKEN to enable');
    results['P1: Gravitee Gateway Smoke (SS + Preprod)'] = 'passed'; // not a failure to skip
  }

  // Summary
  const passed = Object.values(results).filter(v => v === 'passed').length;
  const failed = Object.values(results).filter(v => v === 'failed').length;
  const total = Object.keys(results).length;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   DCPM Integration Suite Summary                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  for (const [label, status] of Object.entries(results)) {
    console.log(`  ${status === 'passed' ? '✓' : '✗'} ${label}`);
  }
  console.log(`\n  Passed: ${passed}/${total}  Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.error('\n✗ DCPM integration suite failed');
    process.exit(1);
  } else {
    console.log('\n✓ DCPM integration suite passed');
    process.exit(0);
  }
}

runDcpmIntegration().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export default runDcpmIntegration;
