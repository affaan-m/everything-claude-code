#!/usr/bin/env ts-node

/**
 * Run Service Integration orchestrator (Layer 2)
 * 
 * Usage:
 *   npx ts-node orchestrators/run-service-integration.ts
 *   npm run orchestrators:service-integration
 */

import { serviceIntegrationOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

async function runServiceIntegration() {
  console.log('=== Layer 2: Service Integration (Business Logic) ===\n');
  
  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(serviceIntegrationOrchestrator());
  
  try {
    // Test draft lifecycle
    console.log('Running draft lifecycle tests...');
    await runWorkflow(orchestrator, registry, 'service.draft-lifecycle', {
      description: 'Service integration test',
      entity_type: 'attributes',
      operations: [
        { type: 'create', data: { name: 'test_attr', type: 'string' } }
      ],
      commit_notes: 'Service integration test commit'
    });
    
    // Test sync failure recovery
    console.log('Running sync failure recovery tests...');
    await runWorkflow(orchestrator, registry, 'service.sync-failure-recovery', {
      revision_id: 1
    });
    
    console.log('\n✓ Service integration tests passed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Service integration tests failed:', error);
    process.exit(1);
  }
}

runServiceIntegration();

export default runServiceIntegration;
