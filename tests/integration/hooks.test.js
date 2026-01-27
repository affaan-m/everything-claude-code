/**
 * Integration tests for hook scripts
 *
 * Tests hook behavior in realistic scenarios with proper input/output handling.
 *
 * Run with: node tests/integration/hooks.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

// Test helper
function _test(name, fn) {
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

// Async test helper
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

/**
 * Run a hook script with simulated Claude Code input
 * @param {string} scriptPath - Path to the hook script
 * @param {object} input - Hook input object (will be JSON stringified)
 * @param {object} env - Environment variables
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
function runHookWithInput(scriptPath, input = {}, env = {}, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);

    // Ignore EPIPE errors (process may exit before we finish writing)
    proc.stdin.on('error', (err) => {
      if (err.code !== 'EPIPE') {
        reject(err);
      }
    });

    // Send JSON input on stdin (simulating Claude Code hook invocation)
    if (input && Object.keys(input).length > 0) {
      proc.stdin.write(JSON.stringify(input));
    }
    proc.stdin.end();

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error(`Hook timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });

    proc.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Run an inline hook command (like those in hooks.json)
 * @param {string} command - The node -e "..." command
 * @param {object} input - Hook input object
 * @param {object} env - Environment variables
 */
function _runInlineHook(command, input = {}, env = {}, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    // Extract the code from node -e "..."
    const match = command.match(/^node -e "(.+)"$/s);
    if (!match) {
      reject(new Error('Invalid inline hook command format'));
      return;
    }

    const proc = spawn('node', ['-e', match[1]], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timer;

    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);

    // Ignore EPIPE errors (process may exit before we finish writing)
    proc.stdin.on('error', (err) => {
      if (err.code !== 'EPIPE') {
        if (timer) clearTimeout(timer);
        reject(err);
      }
    });

    if (input && Object.keys(input).length > 0) {
      proc.stdin.write(JSON.stringify(input));
    }
    proc.stdin.end();

    timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error(`Inline hook timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });

    proc.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// Create a temporary test directory
function createTestDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hook-integration-test-'));
}

// Clean up test directory
function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Test suite
async function runTests() {
  console.log('\n=== Hook Integration Tests ===\n');

  let passed = 0;
  let failed = 0;

  const scriptsDir = path.join(__dirname, '..', '..', 'scripts', 'hooks');
  const hooksJsonPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
  const hooks = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));

  // ==========================================
  // Input Format Tests
  // ==========================================
  console.log('Hook Input Format Handling:');

  if (await asyncTest('hooks handle empty stdin gracefully', async () => {
    const result = await runHookWithInput(path.join(scriptsDir, 'session-start.js'), {});
    assert.strictEqual(result.code, 0, `Should exit 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('hooks handle malformed JSON input', async () => {
    const proc = spawn('node', [path.join(scriptsDir, 'session-start.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let code = null;
    proc.stdin.write('{ invalid json }');
    proc.stdin.end();

    await new Promise((resolve) => {
      proc.on('close', (c) => {
        code = c;
        resolve();
      });
    });

    // Hook should not crash on malformed input (exit 0)
    assert.strictEqual(code, 0, 'Should handle malformed JSON gracefully');
  })) passed++; else failed++;

  if (await asyncTest('hooks parse valid tool_input correctly', async () => {
    // Test the console.log warning hook with valid input
    const command = 'node -e "const fs=require(\'fs\');let d=\'\';process.stdin.on(\'data\',c=>d+=c);process.stdin.on(\'end\',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path||\'\';console.log(\'Path:\',p)})"';
    const match = command.match(/^node -e "(.+)"$/s);

    const proc = spawn('node', ['-e', match[1]], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    proc.stdout.on('data', data => stdout += data);

    proc.stdin.write(JSON.stringify({
      tool_input: { file_path: '/test/path.js' }
    }));
    proc.stdin.end();

    await new Promise(resolve => proc.on('close', resolve));

    assert.ok(stdout.includes('/test/path.js'), 'Should extract file_path from input');
  })) passed++; else failed++;

  // ==========================================
  // Output Format Tests
  // ==========================================
  console.log('\nHook Output Format:');

  if (await asyncTest('hooks output messages to stderr (not stdout)', async () => {
    const result = await runHookWithInput(path.join(scriptsDir, 'session-start.js'), {});
    // Session-start should write info to stderr
    assert.ok(result.stderr.length > 0, 'Should have stderr output');
    assert.ok(result.stderr.includes('[SessionStart]'), 'Should have [SessionStart] prefix');
  })) passed++; else failed++;

  if (await asyncTest('PreCompact hook logs to stderr', async () => {
    const result = await runHookWithInput(path.join(scriptsDir, 'pre-compact.js'), {});
    assert.ok(result.stderr.includes('[PreCompact]'), 'Should output to stderr with prefix');
  })) passed++; else failed++;

  if (await asyncTest('blocking hooks output BLOCKED message', async () => {
    // Test the dev server blocking hook
    const blockingCommand = hooks.hooks.PreToolUse[0].hooks[0].command;
    const match = blockingCommand.match(/^node -e "(.+)"$/s);

    const proc = spawn('node', ['-e', match[1]], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';
    let code = null;
    proc.stderr.on('data', data => stderr += data);

    proc.stdin.end();

    await new Promise(resolve => {
      proc.on('close', (c) => {
        code = c;
        resolve();
      });
    });

    assert.ok(stderr.includes('BLOCKED'), 'Blocking hook should output BLOCKED');
    assert.strictEqual(code, 1, 'Blocking hook should exit with code 1');
  })) passed++; else failed++;

  // ==========================================
  // Exit Code Tests
  // ==========================================
  console.log('\nHook Exit Codes:');

  if (await asyncTest('non-blocking hooks exit with code 0', async () => {
    const result = await runHookWithInput(path.join(scriptsDir, 'session-end.js'), {});
    assert.strictEqual(result.code, 0, 'Non-blocking hook should exit 0');
  })) passed++; else failed++;

  if (await asyncTest('blocking hooks exit with code 1', async () => {
    // The dev server blocker always blocks
    const blockingCommand = hooks.hooks.PreToolUse[0].hooks[0].command;
    const match = blockingCommand.match(/^node -e "(.+)"$/s);

    const proc = spawn('node', ['-e', match[1]], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let code = null;
    proc.stdin.end();

    await new Promise(resolve => {
      proc.on('close', (c) => {
        code = c;
        resolve();
      });
    });

    assert.strictEqual(code, 1, 'Blocking hook should exit 1');
  })) passed++; else failed++;

  if (await asyncTest('hooks handle missing files gracefully', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'nonexistent.jsonl');

    try {
      const result = await runHookWithInput(
        path.join(scriptsDir, 'evaluate-session.js'),
        {},
        { CLAUDE_TRANSCRIPT_PATH: transcriptPath }
      );

      // Should not crash, just skip processing
      assert.strictEqual(result.code, 0, 'Should exit 0 for missing file');
    } finally {
      cleanupTestDir(testDir);
    }
  })) passed++; else failed++;

  // ==========================================
  // Realistic Scenario Tests
  // ==========================================
  console.log('\nRealistic Scenarios:');

  if (await asyncTest('suggest-compact increments and triggers at threshold', async () => {
    const sessionId = 'integration-test-' + Date.now();
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);

    try {
      // Set counter just below threshold
      fs.writeFileSync(counterFile, '49');

      const result = await runHookWithInput(
        path.join(scriptsDir, 'suggest-compact.js'),
        {},
        { CLAUDE_SESSION_ID: sessionId, COMPACT_THRESHOLD: '50' }
      );

      assert.ok(
        result.stderr.includes('50 tool calls'),
        'Should suggest compact at threshold'
      );
    } finally {
      if (fs.existsSync(counterFile)) fs.unlinkSync(counterFile);
    }
  })) passed++; else failed++;

  if (await asyncTest('evaluate-session processes transcript with sufficient messages', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // Create a transcript with 15 user messages
    const messages = Array(15).fill(null).map((_, i) => ({
      type: 'user',
      content: `Test message ${i + 1}`
    }));

    fs.writeFileSync(
      transcriptPath,
      messages.map(m => JSON.stringify(m)).join('\n')
    );

    try {
      const result = await runHookWithInput(
        path.join(scriptsDir, 'evaluate-session.js'),
        {},
        { CLAUDE_TRANSCRIPT_PATH: transcriptPath }
      );

      assert.ok(result.stderr.includes('15 messages'), 'Should process session');
    } finally {
      cleanupTestDir(testDir);
    }
  })) passed++; else failed++;

  if (await asyncTest('PostToolUse PR hook extracts PR URL', async () => {
    // Find the PR logging hook
    const prHook = hooks.hooks.PostToolUse.find(h =>
      h.description && h.description.includes('PR URL')
    );

    assert.ok(prHook, 'PR hook should exist');

    const match = prHook.hooks[0].command.match(/^node -e "(.+)"$/s);

    const proc = spawn('node', ['-e', match[1]], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';
    proc.stderr.on('data', data => stderr += data);

    // Simulate gh pr create output
    proc.stdin.write(JSON.stringify({
      tool_input: { command: 'gh pr create --title "Test"' },
      tool_output: { output: 'Creating pull request...\nhttps://github.com/owner/repo/pull/123' }
    }));
    proc.stdin.end();

    await new Promise(resolve => proc.on('close', resolve));

    assert.ok(
      stderr.includes('PR created') || stderr.includes('github.com'),
      'Should extract and log PR URL'
    );
  })) passed++; else failed++;

  // ==========================================
  // Error Handling Tests
  // ==========================================
  console.log('\nError Handling:');

  if (await asyncTest('hooks do not crash on unexpected input structure', async () => {
    const result = await runHookWithInput(
      path.join(scriptsDir, 'suggest-compact.js'),
      { unexpected: { nested: { deeply: 'value' } } }
    );

    assert.strictEqual(result.code, 0, 'Should handle unexpected input structure');
  })) passed++; else failed++;

  if (await asyncTest('hooks handle null and missing values in input', async () => {
    const result = await runHookWithInput(
      path.join(scriptsDir, 'session-start.js'),
      { tool_input: null }
    );

    assert.strictEqual(result.code, 0, 'Should handle null/missing values gracefully');
  })) passed++; else failed++;

  if (await asyncTest('hooks handle very large input without hanging', async () => {
    const largeInput = {
      tool_input: { file_path: '/test.js' },
      tool_output: { output: 'x'.repeat(100000) }
    };

    const startTime = Date.now();
    const result = await runHookWithInput(
      path.join(scriptsDir, 'session-start.js'),
      largeInput
    );
    const elapsed = Date.now() - startTime;

    assert.strictEqual(result.code, 0, 'Should complete successfully');
    assert.ok(elapsed < 5000, `Should complete in <5s, took ${elapsed}ms`);
  })) passed++; else failed++;

  // Summary
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
