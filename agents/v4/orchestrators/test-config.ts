#!/usr/bin/env tsx

/**
 * Test orchestrator configuration loading
 * 
 * This validates that all orchestrator YAML configs can be loaded successfully
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  buildGuardsOrchestrator,
  serviceIntegrationOrchestrator,
  roundTripIntegrityOrchestrator,
  contractParityOrchestrator,
  environmentSmokeOrchestrator,
  unitTestOrchestrator,
  regressionTestOrchestrator,
  integrationTestOrchestrator,
  playwrightUiOrchestrator,
  apiTestOrchestrator,
  performanceTestOrchestrator,
  securityTestOrchestrator,
  listOrchestrators,
} from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testOrchestratorLoading() {
  console.log('=== Testing Orchestrator Configuration Loading ===\n');
  
  const orchestrators = [
    { name: 'build-guards', loader: buildGuardsOrchestrator },
    { name: 'service-integration', loader: serviceIntegrationOrchestrator },
    { name: 'round-trip-integrity', loader: roundTripIntegrityOrchestrator },
    { name: 'contract-parity', loader: contractParityOrchestrator },
    { name: 'environment-smoke', loader: environmentSmokeOrchestrator },
    { name: 'unit-test', loader: unitTestOrchestrator },
    { name: 'regression-test', loader: regressionTestOrchestrator },
    { name: 'integration-test', loader: integrationTestOrchestrator },
    { name: 'playwright-ui', loader: playwrightUiOrchestrator },
    { name: 'api-test', loader: apiTestOrchestrator },
    { name: 'performance-test', loader: performanceTestOrchestrator },
    { name: 'security-test', loader: securityTestOrchestrator },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, loader } of orchestrators) {
    try {
      const config = loader();
      
      // Validate config structure
      if (!config.swarmConfig) {
        throw new Error('Missing swarmConfig');
      }
      if (!config.tasks) {
        throw new Error('Missing tasks');
      }
      if (!config.swarmConfig.name) {
        throw new Error('Missing swarmConfig.name');
      }
      if (!config.swarmConfig.agents) {
        throw new Error('Missing swarmConfig.agents');
      }
      
      console.log(`✓ ${name}: Loaded successfully`);
      console.log(`  - Swarm: ${config.swarmConfig.name}`);
      console.log(`  - Agents: ${Object.keys(config.swarmConfig.agents).length}`);
      console.log(`  - Tasks: ${Object.keys(config.tasks.tasks || {}).length}`);
      console.log(`  - Workflows: ${Object.keys(config.tasks.workflows || {}).length}`);
      console.log('');
      
      passed++;
    } catch (error) {
      console.error(`✗ ${name}: Failed to load`);
      console.error(`  Error: ${error.message}`);
      console.error('');
      failed++;
    }
  }
  
  console.log('=== Summary ===');
  console.log(`Total: ${orchestrators.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('');
  
  if (failed > 0) {
    console.error('✗ Some orchestrators failed to load');
    process.exit(1);
  } else {
    console.log('✓ All orchestrators loaded successfully!');
    
    // List all available orchestrators
    console.log('\n=== Available Orchestrators ===');
    const available = listOrchestrators();
    available.forEach(name => console.log(`  - ${name}`));
    
    process.exit(0);
  }
}

testOrchestratorLoading();
