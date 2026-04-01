#!/usr/bin/env ts-node

/**
 * Run Build Guards orchestrator (Layer 1)
 * 
 * Usage:
 *   npx ts-node orchestrators/run-build-guards.ts
 *   npm run orchestrators:build-guards
 */

import { buildGuardsOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

async function runBuildGuards() {
  console.log('=== Layer 1: Build Guards (Fast PR Gates) ===\n');
  
  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(buildGuardsOrchestrator());
  
  try {
    await runWorkflow(orchestrator, registry, 'build.pr-gate', {
      base_branch: process.env.BASE_BRANCH || 'main',
      api_version: process.env.API_VERSION || 'v2026-01'
    });
    
    console.log('\n✓ Build guards passed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Build guards failed:', error);
    process.exit(1);
  }
}

runBuildGuards();

export default runBuildGuards;
