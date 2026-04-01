# Shadow DCP Test Orchestrators

Enterprise-grade test orchestration for Shadow DCP using task-driven swarm architecture. Implements a 5-layer testing strategy aligned with project risk profile.

---

## Quick Start

```bash
cd agents/v4

# Install dependencies
npm install

# Validate configurations
npm run orchestrators:test-config

# Run build guards (fastest - PR gate)
npm run orchestrators:build-guards

# Run round-trip integrity (highest ROI)
npm run orchestrators:integrity

# Run complete pipeline
npm run orchestrators:all
```

---

## Implementation Status

**Configuration Complete ✅** | **Execution Stubbed 🚧**

All 12 orchestrators are fully configured with valid YAML definitions, task specifications, and workflow definitions. The execution layer (`TaskOrchestrator.executeWorkflow`, `submitTask`) is stubbed and needs implementation.

**What Works:**
- ✅ All configurations load and validate successfully
- ✅ 100+ tasks defined across 12 orchestrators
- ✅ 40+ workflows with dependencies specified
- ✅ Complete 5-layer test strategy documented

**What Needs Implementation:**
- 🚧 `TaskOrchestrator.executeWorkflow()` - workflow execution engine
- 🚧 `TaskOrchestrator.submitTask()` - task submission and queuing
- 🚧 Real test execution (Jest, Vitest, Playwright, ESLint)
- 🚧 Integration with Shadow DCP services

**Test Configuration:**
```bash
npm run orchestrators:test-config
# ✓ All 12 orchestrators loaded successfully!
```

---

## 5-Layer Test Strategy

Prioritized testing approach aligned with Shadow DCP's risk profile:

### Layer 1: Build Guards (< 30s)
**Purpose:** Fast PR gate checks  
**When:** Every PR before merge  
**Orchestrator:** `build-guards`

```bash
npm run orchestrators:build-guards
```

**Tests:**
- ESLint validation
- Unit tests with coverage
- Version contract validation
- OpenAPI spec validation

---

### Layer 2: Service Integration
**Purpose:** Business logic validation  
**When:** Pre-merge, nightly  
**Orchestrator:** `service-integration`

```bash
npm run orchestrators:service-integration
```

**Tests:**
- RevisionService (draft/commit/publish)
- EntityService (CRUD operations)
- DiffService (change detection)
- ValidationService (schema validation)
- SyncService (DCPM sync)

---

### Layer 3: Round-Trip Integrity ⭐ HIGHEST ROI
**Purpose:** Prevent data corruption  
**When:** Nightly, pre-release  
**Orchestrator:** `round-trip-integrity`

```bash
npm run orchestrators:integrity
```

**Tests:**
- Explode/implode transformations (14 entity types)
- Sanitizer validation (ETA-223 pattern)
- Field loss detection
- Shape drift detection
- DCPM format preservation

**Why Highest Priority:**
- Known corruption bugs in explode/implode path
- Medium likelihood / High impact risk
- Affects all entity types
- Silent failures (no user-visible errors)

---

### Layer 4: Contract Parity
**Purpose:** UTUI ↔ Shadow DCP alignment  
**When:** Pre-release, API changes  
**Orchestrator:** `contract-parity`

```bash
npm run orchestrators:contract-parity
```

**Tests:**
- Entity contract validation (ETA-183 pattern)
- Field aliasing (name ↔ title)
- Null semantics
- API version behavior
- Public vs internal format

---

### Layer 5: Environment Smoke
**Purpose:** Deployment validation  
**When:** Post-deploy, pre-release  
**Orchestrator:** `environment-smoke`

```bash
npm run orchestrators:environment-smoke
```

**Tests:**
- Docker-compose local environment
- Preprod environment validation
- Gravitee 9-domain routing
- Security controls (auth, secrets)
- Database migrations

---

## Available Orchestrators

### Core 5-Layer Orchestrators

| Orchestrator | Agents | Tasks | Workflows | Purpose |
|--------------|--------|-------|-----------|---------|
| `build-guards` | 6 | 6 | 3 | Fast PR gates |
| `service-integration` | 7 | 11 | 4 | Service layer testing |
| `round-trip-integrity` ⭐ | 6 | 9 | 4 | Data corruption prevention |
| `contract-parity` | 6 | 10 | 4 | UTUI alignment |
| `environment-smoke` | 7 | 11 | 5 | Deployment validation |

### Additional Orchestrators

| Orchestrator | Agents | Tasks | Workflows | Purpose |
|--------------|--------|-------|-----------|---------|
| `playwright-ui` | 7 | 16 | 6 | UI validation with Playwright |
| `unit-test` | 5 | 6 | 2 | Unit test generation/execution |
| `regression-test` | 5 | 6 | 2 | Regression testing |
| `integration-test` | 6 | 7 | 2 | Integration testing |
| `api-test` | 6 | 9 | 3 | REST/GraphQL API testing |
| `performance-test` | 6 | 10 | 3 | Load/stress testing |
| `security-test` | 6 | 10 | 4 | Security scanning |

---

## Usage Examples

### Run Individual Orchestrator

```typescript
import { buildGuardsOrchestrator } from './orchestrators';
import { setupOrchestratorWithMonitoring, runWorkflow } from './orchestrators/helpers';

async function runBuildGuards() {
  const orchestrator = await setupOrchestratorWithMonitoring(
    buildGuardsOrchestrator()
  );
  
  await runWorkflow(orchestrator, 'build.pr-gate', {
    base_branch: 'main',
    api_version: 'v2026-01'
  });
}
```

### Run Complete Pipeline

```typescript
import { runCompleteTestPipeline } from './orchestrators/run-all';

await runCompleteTestPipeline();
```

### Submit Individual Task

```typescript
const taskId = await orchestrator.submitTask({
  type: 'build.lint.check',
  inputs: {
    files: ['src/**/*.ts'],
    fix: false
  }
});
```

### Monitor Events

```typescript
orchestrator.on('task:completed', (event) => {
  console.log(`✓ Task ${event.taskId} completed in ${event.duration}ms`);
});

orchestrator.on('workflow:progress', (event) => {
  console.log(`→ Workflow ${event.workflowId}: step ${event.step} completed`);
});
```

---

## NPM Scripts

```bash
# Layer 1: Build Guards
npm run orchestrators:build-guards

# Layer 2: Service Integration
npm run orchestrators:service-integration

# Layer 3: Round-Trip Integrity (highest ROI)
npm run orchestrators:integrity

# Layer 4: Contract Parity
npm run orchestrators:contract-parity

# Layer 5: Environment Smoke
npm run orchestrators:environment-smoke

# Playwright UI
npm run orchestrators:playwright-ui

# Run all orchestrators
npm run orchestrators:all

# Validate configurations
npm run orchestrators:test-config

# See examples
npm run orchestrators:example
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Shadow DCP Tests

on: [pull_request]

jobs:
  build-guards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd agents/v4 && npm install
      - run: cd agents/v4 && npm run orchestrators:build-guards
  
  integrity:
    runs-on: ubuntu-latest
    needs: build-guards
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd agents/v4 && npm install
      - run: cd agents/v4 && npm run orchestrators:integrity
```

### Jenkins

```groovy
pipeline {
  agent any
  stages {
    stage('Build Guards') {
      steps {
        sh 'cd agents/v4 && npm install'
        sh 'cd agents/v4 && npm run orchestrators:build-guards'
      }
    }
    stage('Round-Trip Integrity') {
      steps {
        sh 'cd agents/v4 && npm run orchestrators:integrity'
      }
    }
  }
}
```

---

## Configuration Structure

Each orchestrator has two YAML files:

### 1. `swarm-config.yaml` - Swarm Topology

```yaml
name: orchestrator-name
version: "4.0.0"
description: Purpose of this orchestrator

topology:
  type: hierarchical | mesh | hierarchical-mesh
  coordinator: coordinator-agent-name
  workers: [list-of-worker-agents]

agents:
  agent-name:
    role: coordinator | worker
    capabilities: [list-of-capabilities]
    max_concurrent_tasks: number

routing:
  strategy: capability-based | round-robin
  load_balancing: round-robin | least-loaded
  retry_policy:
    max_attempts: number
    backoff: exponential | linear

performance:
  target_response_time_ms: number
  max_queue_depth: number
  scale_up_threshold: 0.0-1.0
  scale_down_threshold: 0.0-1.0
```

### 2. `tasks.yaml` - Task Definitions

```yaml
tasks:
  task.name:
    description: What this task does
    required_capabilities: [list-of-capabilities]
    priority: critical | high | medium | low
    timeout_ms: number
    inputs:
      - name: input-name
        type: string | number | boolean | array | object
        required: true | false
        default: value
    outputs:
      - output-name-1
      - output-name-2

workflows:
  workflow.name:
    description: What this workflow does
    steps:
      - task: task.name
        inputs:
          input-name: ${input.value}
        depends_on: [previous-tasks]
```

---

## Orchestrator Details

### Build Guards (`build-guards/`)

**Agents:**
- `build-coordinator` - Coordinates build validation
- `lint-checker` - ESLint validation
- `unit-test-runner` - Unit test execution
- `contract-validator` - Version contract validation
- `openapi-validator` - OpenAPI spec validation
- `coverage-analyzer` - Coverage analysis

**Key Workflows:**
- `build.pr-gate` - Complete PR validation (lint + unit + contracts + OpenAPI)
- `build.quick-check` - Fast validation (lint + unit only)
- `build.contract-suite` - Contract validation only

---

### Service Integration (`service-integration/`)

**Agents:**
- `service-coordinator` - Coordinates service testing
- `revision-service-tester` - Tests RevisionService
- `entity-service-tester` - Tests EntityService
- `diff-service-tester` - Tests DiffService
- `validation-service-tester` - Tests ValidationService
- `sync-service-tester` - Tests SyncService
- `conflict-resolver-tester` - Tests conflict resolution

**Key Workflows:**
- `service.draft-lifecycle` - Complete draft → commit → publish flow
- `service.publish-with-sync` - Publish with DCPM sync validation
- `service.conflict-handling` - Optimistic concurrency testing
- `service.sync-failure-recovery` - DCPM sync failure scenarios

---

### Round-Trip Integrity (`round-trip-integrity/`) ⭐

**Agents:**
- `integrity-coordinator` - Coordinates integrity testing
- `explode-implode-tester` - Tests transformations
- `sanitizer-tester` - Tests sanitizers (ETA-223)
- `field-loss-detector` - Detects missing fields
- `shape-drift-detector` - Detects schema drift
- `dcpm-format-validator` - Validates DCPM format

**Key Workflows:**
- `integrity.full-sweep` - All 14 entity types
- `integrity.entity-specific` - Single entity type deep dive
- `integrity.corruption-prevention` - Field loss + shape drift
- `integrity.sanitizer-suite` - All sanitizers (ETA-223 pattern)

**Entity Types Tested:**
- Attributes, Audiences, Connectors, Actions, Enrichments
- Event Feeds, Event Specs, Functions, Labels, Settings
- Rules, Data Sources, Inbound Connectors, File Definitions

---

### Contract Parity (`contract-parity/`)

**Agents:**
- `contract-coordinator` - Coordinates contract testing
- `entity-contract-tester` - Tests entity contracts (ETA-183)
- `field-aliasing-tester` - Tests field aliases (name ↔ title)
- `null-semantics-tester` - Tests null handling
- `version-parity-tester` - Tests API versions
- `format-validator` - Validates public vs internal format

**Key Workflows:**
- `contract.entity-full-suite` - Complete entity contract validation
- `contract.version-parity` - API version behavior
- `contract.all-entities` - All entity types
- `contract.error-handling` - Error format validation

---

### Environment Smoke (`environment-smoke/`)

**Agents:**
- `smoke-coordinator` - Coordinates smoke testing
- `docker-environment-tester` - Tests docker-compose
- `preprod-tester` - Tests preprod environment
- `gravitee-tester` - Tests Gravitee gateway
- `security-tester` - Tests security controls
- `migration-tester` - Tests database migrations
- `health-checker` - Health check validation

**Key Workflows:**
- `smoke.local-environment` - Docker-compose validation
- `smoke.preprod-full` - Complete preprod validation
- `smoke.gravitee-full` - Gravitee 9-domain routing
- `smoke.security-suite` - Security controls
- `smoke.migration-suite` - Database migrations

---

### Playwright UI (`playwright-ui/`)

**Agents:**
- `ui-coordinator` - Coordinates UI testing
- `playwright-runner` - Executes Playwright tests
- `utui-validator` - Validates UTUI behavior
- `dcpm-validator` - Validates DCPM integration
- `qa-matrix-validator` - Validates QA Matrix parity
- `draft-mode-tester` - Tests draft mode flows
- `visual-regression-tester` - Visual regression testing

**Key Workflows:**
- `ui.smoke-suite` - Quick UI smoke test
- `ui.workflow-e2e` - Complete workflow validation
- `ui.parity-validation` - QA Matrix parity (P1 entities)
- `ui.draft-collaboration` - Multi-user draft testing
- `ui.pr-smoke` - Fast PR validation
- `ui.nightly-regression` - Comprehensive nightly tests

---

## Monitoring & Events

All orchestrators emit structured events:

| Event | Description |
|-------|-------------|
| `task:submitted` | Task submitted to queue |
| `task:assigned` | Task assigned to agent |
| `task:started` | Task execution started |
| `task:completed` | Task completed successfully |
| `task:failed` | Task failed with error |
| `workflow:started` | Workflow execution started |
| `workflow:progress` | Workflow step completed |
| `workflow:completed` | Workflow completed |
| `agent:spawned` | Agent spawned |
| `agent:terminated` | Agent terminated |
| `swarm:scaled` | Swarm scaled up/down |

---

## Best Practices

1. **Start with Build Guards** - Run on every PR for fast feedback
2. **Prioritize Round-Trip Integrity** - Highest ROI for preventing corruption
3. **Run Nightly** - Full pipeline including integrity and contract tests
4. **Pre-Release** - Complete 5-layer validation before deployment
5. **Monitor Events** - Use event listeners for observability
6. **Customize Workflows** - Edit `tasks.yaml` to add test cases
7. **Scale Gradually** - Start with Layer 1-3, add Layer 4-5 as needed

---

## Troubleshooting

### Module not found
```bash
npm install yaml zod tsx
```

### TypeScript errors
```bash
npm install -D tsx @types/node
```

### Configuration validation fails
```bash
# Validate YAML syntax
npx js-yaml orchestrators/build-guards/swarm-config.yaml
npx js-yaml orchestrators/build-guards/tasks.yaml
```

### Orchestrator not found
```typescript
import { listOrchestrators } from './orchestrators';
console.log(listOrchestrators());
```

---

## Next Steps for Implementation

To make orchestrators executable:

1. **Implement `TaskOrchestrator.executeWorkflow()`**
   - Parse workflow steps
   - Handle dependencies
   - Execute tasks in order
   - Emit progress events

2. **Implement `TaskOrchestrator.submitTask()`**
   - Queue task
   - Find matching agent via CapabilityMatcher
   - Assign to agent
   - Track execution

3. **Connect to real test runners**
   - Jest/Vitest for unit tests
   - Playwright for UI tests
   - ESLint for linting
   - Custom validators for contracts

4. **Integrate with Shadow DCP services**
   - RevisionService, EntityService, etc.
   - Real API calls
   - DCPM validation
   - Database operations

---

## Related Documentation

- [Shadow DCP README](../../README.md) - Main project documentation
- [Agent Architecture](../agents/README.md) - Task-driven orchestration
- [Example Usage](./example.ts) - Working code examples
- [Test Configuration](./test-config.ts) - Configuration validation

---

## Summary

✅ **Configuration Complete** - All 12 orchestrators with 100+ tasks, 40+ workflows  
🚧 **Execution Stubbed** - Need to implement TaskOrchestrator execution layer  
📚 **Documentation Complete** - 5-layer strategy, run guides, examples  
🎯 **Ready for Implementation** - Clear blueprint for building execution layer  
⭐ **Highest Priority** - Round-trip integrity testing (Layer 3)
