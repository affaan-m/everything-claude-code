/**
 * Example: Using Domain-Specific Test Orchestrators
 * 
 * This example demonstrates how to use the specialized test orchestrators
 * for different testing scenarios.
 */

import { SwarmCoordinator } from '../agents/orchestration/swarm-coordinator.js';
import { TaskOrchestrator } from '../agents/orchestration/task-orchestrator.js';
import { TaskRegistry } from '../agents/tasks/task-registry.js';
import {
  unitTestOrchestrator,
  integrationTestOrchestrator,
  playwrightUiOrchestrator,
  apiTestOrchestrator,
  performanceTestOrchestrator,
  securityTestOrchestrator,
  getOrchestrator,
} from './index.js';

// Example 1: Unit Test Generation
async function runUnitTests() {
  console.log('=== Unit Test Orchestrator ===');
  
  const config = unitTestOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Generate unit tests for a module
  const taskId = await orchestrator.submitTask({
    type: 'unit.test.generate',
    inputs: {
      source_file: './src/api/routes.ts',
      test_framework: 'vitest',
      coverage_target: 90,
      include_edge_cases: true,
    },
  });
  
  console.log(`Unit test generation task submitted: ${taskId}`);
  
  // Execute the full unit test workflow
  const workflowId = await orchestrator.executeWorkflow('unit.test.full-suite', {
    source_file: './src/api/routes.ts',
    test_framework: 'vitest',
    dependencies: ['express', 'pg'],
  });
  
  console.log(`Unit test workflow started: ${workflowId}`);
}

// Example 2: Integration Testing
async function runIntegrationTests() {
  console.log('=== Integration Test Orchestrator ===');
  
  const config = integrationTestOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Run full integration test suite
  const workflowId = await orchestrator.executeWorkflow('integration.full-suite', {
    services: ['api-server', 'database', 'cache'],
    databases: ['postgresql://localhost:5432/shadow_dcp'],
    service_a: 'api-server',
    service_b: 'dcpm-sync',
    api_scenarios: [
      { name: 'checkout-draft', method: 'POST', endpoint: '/versions/checkout' },
      { name: 'commit-draft', method: 'POST', endpoint: '/versions/{id}/commit' },
    ],
    test_data: [
      { account: 'test-account', profile: 'main' },
    ],
    validation_queries: [
      'SELECT * FROM versions WHERE status = $1',
    ],
  });
  
  console.log(`Integration test workflow started: ${workflowId}`);
}

// Example 3: UI Testing with Playwright
async function runUiTests() {
  console.log('=== Playwright UI Test Orchestrator ===');
  
  const config = playwrightUiOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Run full UI validation
  const workflowId = await orchestrator.executeWorkflow('ui.full-validation', {
    test_files: ['./tests/ui/checkout-flow.spec.ts'],
    pages: [
      'http://localhost:8080/attributes',
      'http://localhost:8080/audiences',
      'http://localhost:8080/connectors',
    ],
    current_screenshots: [], // Would be populated by test execution
  });
  
  console.log(`UI test workflow started: ${workflowId}`);
}

// Example 4: API Testing
async function runApiTests() {
  console.log('=== API Test Orchestrator ===');
  
  const config = apiTestOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Run full API test suite
  const workflowId = await orchestrator.executeWorkflow('api.full-suite', {
    api_url: 'http://localhost:3001/2026-01/accounts/test/profiles/main',
    schema: {}, // OpenAPI schema would go here
    schema_type: 'openapi',
    endpoint: '/attributes',
    method: 'POST',
    test_cases: [
      { name: 'create-attribute', body: { name: 'test_attr', type: 'string' } },
      { name: 'invalid-type', body: { name: 'bad_attr', type: 'invalid' }, expect_error: true },
    ],
    auth_methods: ['bearer'],
    auth_scenarios: [
      { name: 'valid-token', token: 'valid_token', expect_success: true },
      { name: 'invalid-token', token: 'invalid_token', expect_error: true },
    ],
    error_scenarios: [
      { name: 'missing-draft-id', headers: {}, expect_status: 400 },
    ],
    expected_errors: {
      'missing-draft-id': { status: 400, message: 'X-Draft-Id header required' },
    },
    load_users: 50,
    load_duration: 300,
    load_pattern: { type: 'constant', rate: 10 },
  });
  
  console.log(`API test workflow started: ${workflowId}`);
}

// Example 5: Performance Testing
async function runPerformanceTests() {
  console.log('=== Performance Test Orchestrator ===');
  
  const config = performanceTestOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Run performance test suite
  const workflowId = await orchestrator.executeWorkflow('performance.full-suite', {
    target_url: 'http://localhost:3001/2026-01/accounts/test/profiles/main/attributes',
    target_system: 'shadow-dcp-api',
    scenarios: [
      { name: 'list-attributes', method: 'GET', endpoint: '/attributes' },
      { name: 'create-attribute', method: 'POST', endpoint: '/attributes' },
    ],
    load_users: 100,
    load_duration: 600,
    load_scenario: { type: 'ramp-up', start: 10, end: 100, duration: 300 },
    max_users: 500,
  });
  
  console.log(`Performance test workflow started: ${workflowId}`);
}

// Example 6: Security Testing
async function runSecurityTests() {
  console.log('=== Security Test Orchestrator ===');
  
  const config = securityTestOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Run security audit
  const workflowId = await orchestrator.executeWorkflow('security.full-audit', {
    source_path: './src',
    languages: ['typescript', 'javascript'],
    manifest_files: ['./package.json'],
    target_url: 'http://localhost:3001',
    target_system: 'shadow-dcp',
    compliance_standards: ['owasp-top-10'],
  });
  
  console.log(`Security audit workflow started: ${workflowId}`);
}

// Example 7: Complete Test Pipeline
async function runCompleteTestPipeline() {
  console.log('=== Complete Test Pipeline ===');
  
  // 1. Unit tests
  console.log('Step 1: Running unit tests...');
  await runUnitTests();
  
  // 2. Integration tests
  console.log('Step 2: Running integration tests...');
  await runIntegrationTests();
  
  // 3. API tests
  console.log('Step 3: Running API tests...');
  await runApiTests();
  
  // 4. UI tests
  console.log('Step 4: Running UI tests...');
  await runUiTests();
  
  // 5. Performance tests
  console.log('Step 5: Running performance tests...');
  await runPerformanceTests();
  
  // 6. Security scan
  console.log('Step 6: Running security scan...');
  await runSecurityTests();
  
  console.log('Complete test pipeline finished!');
}

// Example 8: Dynamic Orchestrator Selection
async function runTestsByType(testType: string) {
  console.log(`=== Running ${testType} tests ===`);
  
  const config = getOrchestrator(testType);
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  await coordinator.initialize();
  
  // Get available workflows for this orchestrator
  const workflows = Object.keys(config.tasks.workflows || {});
  console.log(`Available workflows: ${workflows.join(', ')}`);
  
  return orchestrator;
}

// Example 9: Monitoring Orchestrator Events
async function monitorOrchestrator() {
  const config = unitTestOrchestrator();
  const coordinator = new SwarmCoordinator(config.swarmConfig);
  const registry = new TaskRegistry(config.tasks);
  const orchestrator = new TaskOrchestrator(coordinator, registry);
  
  // Listen to orchestrator events
  orchestrator.on('task:submitted', (event) => {
    console.log(`Task submitted: ${event.taskId} (${event.type})`);
  });
  
  orchestrator.on('task:completed', (event) => {
    console.log(`Task completed: ${event.taskId} in ${event.duration}ms`);
  });
  
  orchestrator.on('task:failed', (event) => {
    console.error(`Task failed: ${event.taskId} - ${event.error}`);
  });
  
  orchestrator.on('workflow:progress', (event) => {
    console.log(`Workflow ${event.workflowId}: step ${event.step} completed`);
  });
  
  await coordinator.initialize();
  
  // Submit a task
  await orchestrator.submitTask({
    type: 'unit.test.generate',
    inputs: { source_file: './src/example.ts' },
  });
}

// Run examples
(async () => {
  try {
    // Run individual examples
    // await runUnitTests();
    // await runIntegrationTests();
    // await runUiTests();
    // await runApiTests();
    // await runPerformanceTests();
    // await runSecurityTests();
    
    // Or run complete pipeline
    await runCompleteTestPipeline();
    
    // Or run by type
    // await runTestsByType('unit-test');
    
    // Or monitor events
    // await monitorOrchestrator();
  } catch (error) {
    console.error('Error running orchestrators:', error);
    process.exit(1);
  }
})();

export {
  runUnitTests,
  runIntegrationTests,
  runUiTests,
  runApiTests,
  runPerformanceTests,
  runSecurityTests,
  runCompleteTestPipeline,
  runTestsByType,
  monitorOrchestrator,
};
