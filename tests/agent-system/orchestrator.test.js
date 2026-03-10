/**
 * Tests for the self-evolving agent system runtime.
 *
 * Run with: node tests/agent-system/orchestrator.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

function testResult(name, err) {
  if (!err) {
    console.log(`  \u2713 ${name}`);
    return true;
  }

  console.log(`  \u2717 ${name}`);
  console.log(`    Error: ${err.message}`);
  if (err.stack) {
    console.log(`    Stack: ${err.stack}`);
  }
  return false;
}

async function test(name, fn) {
  try {
    await fn();
    return testResult(name);
  } catch (err) {
    return testResult(name, err);
  }
}

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-system-test-'));
}

function loadModule(relativePath) {
  const fullPath = path.join(__dirname, '..', '..', relativePath);
  return require(fullPath);
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

async function runTests() {
  console.log('\n=== Testing self-evolving agent system ===\n');

  require.extensions['.ts'] = require.extensions['.js'];

  let passed = 0;
  let failed = 0;

  console.log('Module loading:');

  let modules = null;
  if (await test('core agent system modules load from .ts entrypoints', async () => {
    modules = {
      taskGraph: loadModule('agent_system/planner/task_graph.ts'),
      skillLibrary: loadModule('agent_system/memory/skill_library.ts'),
      orchestrator: loadModule('agent_system/orchestrator/agent_orchestrator.ts'),
      mockProvider: loadModule('model_providers/mock_provider.ts')
    };

    assert.strictEqual(typeof modules.taskGraph.createTaskGraph, 'function');
    assert.strictEqual(typeof modules.skillLibrary.SkillLibrary, 'function');
    assert.strictEqual(typeof modules.orchestrator.AgentOrchestrator, 'function');
    assert.strictEqual(typeof modules.mockProvider.MockModelProvider, 'function');
  })) passed++; else failed++;

  if (!modules) {
    console.log('\nPassed: 0');
    console.log('Failed: 1');
    process.exit(1);
  }

  console.log('\nTask graph:');

  if (await test('createTaskGraph orders dependent tasks topologically', async () => {
    const graph = modules.taskGraph.createTaskGraph([
      {
        id: 'plan',
        title: 'Plan the task',
        description: 'Gather scope',
        dependencies: []
      },
      {
        id: 'build',
        title: 'Build the slice',
        description: 'Implement the code',
        dependencies: ['plan']
      },
      {
        id: 'eval',
        title: 'Evaluate the slice',
        description: 'Run checks',
        dependencies: ['build']
      }
    ]);

    assert.deepStrictEqual(graph.order, ['plan', 'build', 'eval']);
    assert.deepStrictEqual(graph.missingDependencies, []);
    assert.strictEqual(graph.hasCycle, false);
  })) passed++; else failed++;

  console.log('\nSkill library:');

  if (await test('SkillLibrary stores markdown skills and retrieves relevant matches', async () => {
    const tmpDir = makeTmpDir();
    try {
      const library = new modules.skillLibrary.SkillLibrary({
        cwd: tmpDir,
        directory: 'agent_skills'
      });

      const storedSkill = library.storeSkill({
        slug: 'debug_python_dependency',
        title: 'Debug Python dependency conflicts',
        tags: ['python', 'dependencies', 'pip'],
        problem: 'A Python package install fails because dependency versions conflict.',
        steps: [
          'Capture the failing install output.',
          'Inspect pinned and transitive versions.',
          'Adjust constraints and re-run the install.'
        ],
        toolsUsed: ['terminal_command', 'read_file'],
        commonFailures: ['Multiple libraries pin incompatible versions.'],
        reusablePattern: 'Capture the resolver error, isolate the conflicting packages, then re-resolve with explicit constraints.'
      });

      const storedPath = path.join(tmpDir, 'agent_skills', 'debug_python_dependency.md');
      const storedContent = fs.readFileSync(storedPath, 'utf8');
      const matches = library.search('debug python pip dependency issue', 3);

      assert.strictEqual(storedSkill.slug, 'debug_python_dependency');
      assert.ok(storedContent.includes('## Problem'));
      assert.ok(storedContent.includes('## Reusable Pattern'));
      assert.ok(matches.length >= 1);
      assert.strictEqual(matches[0].slug, 'debug_python_dependency');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log('\nOrchestration:');

  if (await test('AgentOrchestrator runGoal saves memory, reflections, and extracted skills', async () => {
    const tmpDir = makeTmpDir();
    try {
      const configPath = path.join(tmpDir, 'config', 'agent_config.json');
      writeJson(configPath, {
        model: {
          provider: 'mock',
          name: 'mock-agent-team'
        },
        temperature: 0.2,
        memory_paths: {
          working: 'agent_memory/working',
          episodic: 'agent_memory/episodic',
          semantic: 'agent_memory/semantic'
        },
        skill_library_path: 'agent_skills',
        tool_permissions: {
          allow_terminal: true,
          allow_file_system: true,
          allow_api: false,
          blocked_commands: ['rm -rf', 'git reset --hard']
        },
        execution_sandbox: {
          mode: 'workspace-write',
          dry_run: false,
          max_react_steps: 4
        }
      });

      const seededLibrary = new modules.skillLibrary.SkillLibrary({
        cwd: tmpDir,
        directory: 'agent_skills'
      });

      seededLibrary.storeSkill({
        slug: 'build_fastapi_api',
        title: 'Build a FastAPI API',
        tags: ['python', 'fastapi', 'api'],
        problem: 'Need a repeatable pattern for building a FastAPI service with health checks.',
        steps: [
          'Define the API contract and validation boundaries.',
          'Create the app entrypoint and health route.',
          'Run a smoke test against the route.'
        ],
        toolsUsed: ['terminal_command', 'write_file'],
        commonFailures: ['Import paths break when the app package layout shifts.'],
        reusablePattern: 'Start with the contract, add a health route, then smoke-test the service before expanding.'
      });

      const orchestrator = new modules.orchestrator.AgentOrchestrator({
        configPath,
        cwd: tmpDir,
        provider: new modules.mockProvider.MockModelProvider()
      });

      const report = await orchestrator.runGoal('Build a FastAPI API with a health endpoint');
      const episodicDir = path.join(tmpDir, 'agent_memory', 'episodic');
      const semanticPath = path.join(tmpDir, 'agent_memory', 'semantic', 'semantic_memory.json');
      const createdArtifact = path.join(tmpDir, 'agent-output', 'build-a-fastapi-api-with-a-health-endpoint-run.md');

      assert.ok(report.plan.tasks.length >= 3);
      assert.ok(report.taskGraph.order.length >= 3);
      assert.ok(report.retrievedSkills.some((skill) => skill.slug === 'build_fastapi_api'));
      assert.ok(report.execution.steps.length >= 2);
      assert.strictEqual(report.evaluation.status, 'pass');
      assert.ok(report.reflection.summary.length > 0);
      assert.ok(report.createdSkill);
      assert.ok(fs.existsSync(createdArtifact));
      assert.ok(fs.readdirSync(episodicDir).some((fileName) => fileName.endsWith('.json')));
      assert.ok(fs.existsSync(semanticPath));
      assert.ok(fs.existsSync(path.join(tmpDir, 'agent_skills', `${report.createdSkill.slug}.md`)));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log('\nExecute then learn:');

  if (await test('executeGoal persists an episode and learnFromEpisode adds reflection data later', async () => {
    const tmpDir = makeTmpDir();
    try {
      const configPath = path.join(tmpDir, 'config', 'agent_config.json');
      writeJson(configPath, {
        model: {
          provider: 'mock',
          name: 'mock-agent-team'
        },
        temperature: 0.1,
        memory_paths: {
          working: 'agent_memory/working',
          episodic: 'agent_memory/episodic',
          semantic: 'agent_memory/semantic'
        },
        skill_library_path: 'agent_skills',
        tool_permissions: {
          allow_terminal: true,
          allow_file_system: true,
          allow_api: false,
          blocked_commands: ['rm -rf', 'git reset --hard']
        },
        execution_sandbox: {
          mode: 'workspace-write',
          dry_run: false,
          max_react_steps: 4
        }
      });

      const orchestrator = new modules.orchestrator.AgentOrchestrator({
        configPath,
        cwd: tmpDir,
        provider: new modules.mockProvider.MockModelProvider()
      });

      const executionReport = await orchestrator.executeGoal('Debug a Python dependency resolver failure');
      const learnedReport = await orchestrator.learnFromEpisode('latest');

      assert.ok(executionReport.runId);
      assert.strictEqual(executionReport.reflection, null);
      assert.ok(learnedReport.reflection);
      assert.ok(learnedReport.createdSkill);
      assert.ok(fs.existsSync(path.join(tmpDir, 'agent_skills', `${learnedReport.createdSkill.slug}.md`)));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(err);
  console.log('\nPassed: 0');
  console.log('Failed: 1');
  process.exit(1);
});
