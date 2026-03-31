/**
 * Tests for scripts/hooks/mcp-health-check.js
 *
 * Run with: node tests/hooks/mcp-health-check.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'mcp-health-check.js');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-mcp-health-'));
}

function cleanupTempDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function writeConfig(configPath, body) {
  fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
}

function readState(statePath) {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function createCommandConfig(scriptPath) {
  return {
    command: process.execPath,
    args: [scriptPath]
  };
}

function runHook(input, env = {}) {
  const result = spawnSync('node', [script], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: {
      ...process.env,
      ECC_HOOK_PROFILE: 'standard',
      ...env
    },
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    code: result.status || 0,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function runRawHook(rawInput, env = {}) {
  const result = spawnSync('node', [script], {
    input: rawInput,
    encoding: 'utf8',
    env: {
      ...process.env,
      ECC_HOOK_PROFILE: 'standard',
      ...env
    },
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    code: result.status || 0,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}
async function runTests() {
  console.log('\n=== Testing mcp-health-check.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('passes through non-MCP tools untouched', () => {
    const result = runHook(
      { tool_name: 'Read', tool_input: { file_path: 'README.md' } },
      { CLAUDE_HOOK_EVENT_NAME: 'PreToolUse' }
    );

    assert.strictEqual(result.code, 0, 'Expected non-MCP tool to pass through');
    assert.strictEqual(result.stderr, '', 'Expected no stderr for non-MCP tool');
  })) passed++; else failed++;

  if (test('blocks truncated MCP hook input by default', () => {
    const rawInput = JSON.stringify({ tool_name: 'mcp__flaky__search', tool_input: {} });
    const result = runRawHook(rawInput, {
      CLAUDE_HOOK_EVENT_NAME: 'PreToolUse',
      ECC_HOOK_INPUT_TRUNCATED: '1',
      ECC_HOOK_INPUT_MAX_BYTES: '512'
    });

    assert.strictEqual(result.code, 2, 'Expected truncated MCP input to block by default');
    assert.strictEqual(result.stdout, rawInput, 'Expected raw input passthrough on stdout');
    assert.ok(result.stderr.includes('Hook input exceeded 512 bytes'), `Expected size warning, got: ${result.stderr}`);
    assert.ok(/blocking search/i.test(result.stderr), `Expected blocking message, got: ${result.stderr}`);
  })) passed++; else failed++;
  if (await asyncTest('marks healthy command MCP servers and allows the tool call', async () => {
    const tempDir = createTempDir();
    const configPath = path.join(tempDir, 'claude.json');
    const statePath = path.join(tempDir, 'mcp-health.json');
    const serverScript = path.join(tempDir, 'healthy-server.js');

    try {
      fs.writeFileSync(serverScript, "setInterval(() => {}, 1000);\n");
      writeConfig(configPath, {
        mcpServers: {
          mock: createCommandConfig(serverScript)
        }
      });

      const input = { tool_name: 'mcp__mock__list_items', tool_input: {} };
      const result = runHook(input, {
        CLAUDE_HOOK_EVENT_NAME: 'PreToolUse',
        ECC_MCP_CONFIG_PATH: configPath,
        ECC_MCP_HEALTH_STATE_PATH: statePath,
        ECC_MCP_HEALTH_TIMEOUT_MS: '100'
      });

      assert.strictEqual(result.code, 0, `Expected healthy server to pass, got ${result.code}`);
      assert.strictEqual(result.stdout.trim(), JSON.stringify(input), 'Expected original JSON on stdout');

      const state = readState(statePath);
      assert.strictEqual(state.servers.mock.status, 'healthy', 'Expected mock server to be marked healthy');
    } finally {
      cleanupTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (await asyncTest('blocks unhealthy command MCP servers and records backoff state', async () => {
    const tempDir = createTempDir();
    const configPath = path.join(tempDir, 'claude.json');
    const statePath = path.join(tempDir, 'mcp-health.json');
    const serverScript = path.join(tempDir, 'unhealthy-server.js');

    try {
      fs.writeFileSync(serverScript, "process.exit(1);\n");
      writeConfig(configPath, {
        mcpServers: {
          flaky: createCommandConfig(serverScript)
        }
      });

      const result = runHook(
        { tool_name: 'mcp__flaky__search', tool_input: {} },
        {
          CLAUDE_HOOK_EVENT_NAME: 'PreToolUse',
          ECC_MCP_CONFIG_PATH: configPath,
          ECC_MCP_HEALTH_STATE_PATH: statePath,
          ECC_MCP_HEALTH_TIMEOUT_MS: '100'
        }
      );

      assert.strictEqual(result.code, 2, 'Expected unhealthy server to block the MCP tool');
      assert.ok(result.stderr.includes('Blocking search'), `Expected blocking message, got: ${result.stderr}`);

      const state = readState(statePath);
      assert.strictEqual(state.servers.flaky.status, 'unhealthy', 'Expected flaky server to be marked unhealthy');
      assert.ok(state.servers.flaky.nextRetryAt > state.servers.flaky.checkedAt, 'Expected retry backoff to be recorded');
    } finally {
      cleanupTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (await asyncTest('fail-open mode warns but does not block unhealthy MCP servers', async () => {
    const tempDir = createTempDir();
    const configPath = path.join(tempDir, 'claude.json');
    const statePath = path.join(tempDir, 'mcp-health.json');
    const serverScript = path.join(tempDir, 'relaxed-server.js');

    try {
      fs.writeFileSync(serverScript, "process.exit(1);\n");
      writeConfig(configPath, {
        mcpServers: {
          relaxed: createCommandConfig(serverScript)
        }
      });

      const result = runHook(
        { tool_name: 'mcp__relaxed__list', tool_input: {} },
        {
          CLAUDE_HOOK_EVENT_NAME: 'PreToolUse',
          ECC_MCP_CONFIG_PATH: configPath,
          ECC_MCP_HEALTH_STATE_PATH: statePath,
          ECC_MCP_HEALTH_FAIL_OPEN: '1',
          ECC_MCP_HEALTH_TIMEOUT_MS: '100'
        }
      );

      assert.strictEqual(result.code, 0, 'Expected fail-open mode to allow execution');
      assert.ok(result.stderr.includes('Blocking list') || result.stderr.includes('fall back'), 'Expected warning output in fail-open mode');
    } finally {
      cleanupTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (await asyncTest('post-failure reconnect command restores server health when a reprobe succeeds', async () => {
    const tempDir = createTempDir();
    const configPath = path.join(tempDir, 'claude.json');
    const statePath = path.join(tempDir, 'mcp-health.json');
    const switchFile = path.join(tempDir, 'server-mode.txt');
    const reconnectFile = path.join(tempDir, 'reconnected.txt');
    const probeScript = path.join(tempDir, 'probe-server.js');

    fs.writeFileSync(switchFile, 'down');
    fs.writeFileSync(
      probeScript,
      [
        "const fs = require('fs');",
        `const mode = fs.readFileSync(${JSON.stringify(switchFile)}, 'utf8').trim();`,
        "if (mode === 'up') { setInterval(() => {}, 1000); } else { console.error('401 Unauthorized'); process.exit(1); }"
      ].join('\n')
    );

    const reconnectScript = path.join(tempDir, 'reconnect.js');
    fs.writeFileSync(
      reconnectScript,
      [
        "const fs = require('fs');",
        `fs.writeFileSync(${JSON.stringify(switchFile)}, 'up');`,
        `fs.writeFileSync(${JSON.stringify(reconnectFile)}, 'done');`
      ].join('\n')
    );

    try {
      writeConfig(configPath, {
        mcpServers: {
          authy: createCommandConfig(probeScript)
        }
      });

      const result = runHook(
        {
          tool_name: 'mcp__authy__messages',
          tool_input: {},
          error: '401 Unauthorized'
        },
        {
          CLAUDE_HOOK_EVENT_NAME: 'PostToolUseFailure',
          ECC_MCP_CONFIG_PATH: configPath,
          ECC_MCP_HEALTH_STATE_PATH: statePath,
          ECC_MCP_RECONNECT_COMMAND: `node ${JSON.stringify(reconnectScript)}`,
          ECC_MCP_HEALTH_TIMEOUT_MS: '100'
        }
      );

      assert.strictEqual(result.code, 0, 'Expected failure hook to remain non-blocking');
      assert.ok(result.stderr.includes('reported 401'), `Expected reconnect log, got: ${result.stderr}`);
      assert.ok(result.stderr.includes('connection restored'), `Expected restored log, got: ${result.stderr}`);
      assert.ok(fs.existsSync(reconnectFile), 'Expected reconnect command to run');

      const state = readState(statePath);
      assert.strictEqual(state.servers.authy.status, 'healthy', 'Expected authy server to be restored after reconnect');
    } finally {
      cleanupTempDir(tempDir);
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error(error);
  process.exit(1);
});
