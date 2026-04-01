#!/usr/bin/env ts-node

/**
 * Run Round-Trip Integrity orchestrator (Layer 3) - HIGHEST ROI
 * 
 * Usage:
 *   npx ts-node orchestrators/run-integrity.ts
 *   npm run orchestrators:integrity
 */

import { roundTripIntegrityOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

async function runIntegrity() {
  console.log('=== Layer 3: Round-Trip Integrity ⭐ HIGHEST ROI ===\n');
  
  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(roundTripIntegrityOrchestrator());
  
  try {
    // Run full integrity sweep
    await runWorkflow(orchestrator, registry, 'integrity.full-sweep', {
      entity_types: [
        'attributes',
        'audiences',
        'connectors',
        'actions',
        'enrichments',
        'event-feeds',
        'event-specs',
        'functions',
        'labels',
        'rules',
        'data-sources',
        'inbound-connectors',
        'file-definitions',
        'file-sources'
      ]
    });
    
    console.log('\n✓ Round-trip integrity tests passed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Round-trip integrity tests failed:', error);
    process.exit(1);
  }
}

runIntegrity();

export default runIntegrity;
