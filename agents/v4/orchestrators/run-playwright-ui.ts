#!/usr/bin/env ts-node

import { playwrightUiOrchestrator } from './index.js';
import { setupOrchestratorWithMonitoring, runWorkflow } from './helpers.js';

async function runPlaywrightUi() {
  console.log('=== Layer 4: Playwright UI (End-to-End UI Validation) ===\n');

  const workflowArg = process.argv.find(arg => arg.startsWith('--workflow='));
  const workflow = workflowArg ? workflowArg.split('=')[1] : 'ui.full-validation';

  const { orchestrator, registry } = await setupOrchestratorWithMonitoring(playwrightUiOrchestrator());

  try {
    await runWorkflow(orchestrator, registry, workflow, {
      utui_url: process.env.UTUI_URL || '',
      shadow_dcp_url: process.env.SHADOW_DCP_URL || '',
      qa_account: process.env.QA_ACCOUNT || '',
      qa_profile: process.env.QA_PROFILE || ''
    });

    console.log('\n✓ Playwright UI validation passed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Playwright UI validation failed:', error);
    process.exit(1);
  }
}

runPlaywrightUi();

export default runPlaywrightUi;
