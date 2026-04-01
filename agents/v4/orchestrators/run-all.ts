#!/usr/bin/env ts-node

/**
 * Run all Shadow DCP test orchestrators in sequence
 * 
 * Usage:
 *   npx ts-node orchestrators/run-all.ts
 *   npm run orchestrators:all
 */

import {
  buildGuardsOrchestrator,
  serviceIntegrationOrchestrator,
  roundTripIntegrityOrchestrator,
  contractParityOrchestrator,
  environmentSmokeOrchestrator,
} from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

async function runAll() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Shadow DCP Complete Test Pipeline                       ║');
  console.log('║   5-Layer Test Strategy                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  let layersPassed = 0;
  let layersFailed = 0;
  
  try {
    // Layer 1: Build Guards
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ Layer 1: Build Guards (Fast PR Gates)                  │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    const { orchestrator: buildGuards, registry: buildGuardsReg } = await setupOrchestratorWithMonitoring(buildGuardsOrchestrator());
    await runWorkflow(buildGuards, buildGuardsReg, 'build.pr-gate', {
      base_branch: 'main',
      api_version: 'v2026-01'
    });
    layersPassed++;
    console.log('✓ Layer 1 complete\n');
    
  } catch (error) {
    console.error('✗ Layer 1 failed:', error);
    layersFailed++;
  }
  
  try {
    // Layer 2: Service Integration
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ Layer 2: Service Integration (Business Logic)          │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    const { orchestrator: serviceIntegration, registry: serviceIntegrationReg } = await setupOrchestratorWithMonitoring(serviceIntegrationOrchestrator());
    await runWorkflow(serviceIntegration, serviceIntegrationReg, 'service.draft-lifecycle', {
      description: 'Pipeline test draft',
      entity_type: 'attributes',
      operations: [
        { type: 'create', data: { name: 'pipeline_test_attr', type: 'string' } }
      ],
      commit_notes: 'Pipeline test commit'
    });
    layersPassed++;
    console.log('✓ Layer 2 complete\n');
    
  } catch (error) {
    console.error('✗ Layer 2 failed:', error);
    layersFailed++;
  }
  
  try {
    // Layer 3: Round-Trip Integrity (HIGHEST PRIORITY)
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ Layer 3: Round-Trip Integrity ⭐ HIGHEST ROI            │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    const { orchestrator: integrity, registry: integrityReg } = await setupOrchestratorWithMonitoring(roundTripIntegrityOrchestrator());
    await runWorkflow(integrity, integrityReg, 'integrity.full-sweep', {
      entity_types: ['attributes', 'audiences', 'connectors']
    });
    layersPassed++;
    console.log('✓ Layer 3 complete\n');
    
  } catch (error) {
    console.error('✗ Layer 3 failed:', error);
    layersFailed++;
  }
  
  try {
    // Layer 4: Contract Parity
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ Layer 4: Contract Parity (UTUI ↔ Shadow DCP)           │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    const { orchestrator: contractParity, registry: contractParityReg } = await setupOrchestratorWithMonitoring(contractParityOrchestrator());
    await runWorkflow(contractParity, contractParityReg, 'contract.all-entities', {
      attribute_cases: [],
      audience_cases: [],
      connector_cases: [],
      enrichment_cases: [],
      event_spec_cases: []
    });
    layersPassed++;
    console.log('✓ Layer 4 complete\n');
    
  } catch (error) {
    console.error('✗ Layer 4 failed:', error);
    layersFailed++;
  }
  
  try {
    // Layer 5: Environment Smoke
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ Layer 5: Environment Smoke (Deployment Validation)     │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    const { orchestrator: envSmoke, registry: envSmokeReg } = await setupOrchestratorWithMonitoring(environmentSmokeOrchestrator());
    await runWorkflow(envSmoke, envSmokeReg, 'smoke.local-environment', {});
    layersPassed++;
    console.log('✓ Layer 5 complete\n');
    
  } catch (error) {
    console.error('✗ Layer 5 failed:', error);
    layersFailed++;
  }
  
  // Summary
  const duration = Date.now() - startTime;
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Pipeline Summary                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`  Layers Passed: ${layersPassed}/5`);
  console.log(`  Layers Failed: ${layersFailed}/5`);
  console.log(`  Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log('');
  
  if (layersFailed > 0) {
    console.error('✗ Pipeline failed');
    process.exit(1);
  } else {
    console.log('✓ Pipeline complete - all layers passed!');
    process.exit(0);
  }
}

// Run if executed directly
runAll().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export default runAll;
