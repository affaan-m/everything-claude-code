/**
 * Tests for scripts/agent-cli.js
 *
 * Run with: node tests/scripts/agent-cli.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

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

function test(name, fn) {
  try {
    fn();
    return testResult(name);
  } catch (err) {
    return testResult(name, err);
  }
}

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-cli-test-'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function runCli(args, cwd) {
  return spawnSync('node', [path.join(__dirname, '..', '..', 'scripts', 'agent-cli.js'), ...args], {
    cwd,
    encoding: 'utf8'
  });
}

function parseJson(stdout) {
  return JSON.parse(stdout.trim());
}

function makeConfig(rootDir) {
  const configPath = path.join(rootDir, 'config', 'agent_config.json');
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
  return configPath;
}

function runTests() {
  console.log('\n=== Testing agent CLI ===\n');

  let passed = 0;
  let failed = 0;

  console.log('Planning:');

  if (test('agent-cli plan returns planner and architect output as JSON', () => {
    const tmpDir = makeTmpDir();
    try {
      const configPath = makeConfig(tmpDir);
      const result = runCli(['plan', 'Build a SaaS analytics dashboard', '--config', configPath, '--cwd', tmpDir, '--json'], tmpDir);

      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);

      assert.ok(payload.plan);
      assert.ok(payload.taskGraph);
      assert.ok(payload.architecture);
      assert.ok(Array.isArray(payload.plan.tasks));
      assert.ok(Array.isArray(payload.taskGraph.order));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log('\nExecution and learning:');

  if (test('agent-cli execute creates an episode without reflection, then learn adds it', () => {
    const tmpDir = makeTmpDir();
    try {
      const configPath = makeConfig(tmpDir);
      const executeResult = runCli(['execute', 'Debug a Python dependency error', '--config', configPath, '--cwd', tmpDir, '--json'], tmpDir);
      const learnResult = runCli(['learn', '--episode', 'latest', '--config', configPath, '--cwd', tmpDir, '--json'], tmpDir);

      assert.strictEqual(executeResult.status, 0, executeResult.stderr);
      assert.strictEqual(learnResult.status, 0, learnResult.stderr);

      const executionPayload = parseJson(executeResult.stdout);
      const learningPayload = parseJson(learnResult.stdout);

      assert.ok(executionPayload.runId);
      assert.strictEqual(executionPayload.reflection, null);
      assert.ok(learningPayload.reflection);
      assert.ok(learningPayload.createdSkill);
      assert.ok(fs.existsSync(path.join(tmpDir, 'agent_skills', `${learningPayload.createdSkill.slug}.md`)));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log('\nFull run:');

  if (test('agent-cli run performs the full self-improving loop', () => {
    const tmpDir = makeTmpDir();
    try {
      const configPath = makeConfig(tmpDir);
      const runResult = runCli(['run', 'Build a SaaS analytics dashboard', '--config', configPath, '--cwd', tmpDir, '--json'], tmpDir);

      assert.strictEqual(runResult.status, 0, runResult.stderr);
      const payload = parseJson(runResult.stdout);

      assert.ok(payload.execution);
      assert.ok(payload.evaluation);
      assert.ok(payload.reflection);
      assert.ok(payload.createdSkill);
      assert.ok(fs.existsSync(path.join(tmpDir, 'agent-output', 'build-a-saas-analytics-dashboard-run.md')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
