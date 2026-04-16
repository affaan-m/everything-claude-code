/**
 * Tests for cost-tracker.js hook
 *
 * Run with: node tests/hooks/cost-tracker.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'cost-tracker.js');

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

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cost-tracker-test-'));
}

function withTempHome(homeDir) {
  return {
    HOME: homeDir,
    USERPROFILE: homeDir,
  };
}

function runScript(input, envOverrides = {}) {
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
  const result = spawnSync('node', [script], {
    encoding: 'utf8',
    input: inputStr,
    timeout: 10000,
    env: { ...process.env, ...envOverrides },
  });
  return { code: result.status || 0, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function runTests() {
  console.log('\n=== Testing cost-tracker.js ===\n');

  let passed = 0;
  let failed = 0;

  // 1. Passes through input on stdout
  (test('passes through input on stdout', () => {
    const input = {
      model: 'claude-sonnet-4-20250514',
      usage: { input_tokens: 100, output_tokens: 50 },
    };
    const inputStr = JSON.stringify(input);
    const result = runScript(input);
    assert.strictEqual(result.code, 0, `Expected exit code 0, got ${result.code}`);
    assert.strictEqual(result.stdout, inputStr, 'Expected stdout to match original input');
  }) ? passed++ : failed++);

  // 2. Creates metrics file when given valid usage data
  (test('creates metrics file when given valid usage data', () => {
    const tmpHome = makeTempDir();
    const input = {
      model: 'claude-sonnet-4-20250514',
      usage: { input_tokens: 1000, output_tokens: 500 },
    };
    const result = runScript(input, withTempHome(tmpHome));
    assert.strictEqual(result.code, 0, `Expected exit code 0, got ${result.code}`);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'costs.jsonl');
    assert.ok(fs.existsSync(metricsFile), `Expected metrics file to exist at ${metricsFile}`);

    const content = fs.readFileSync(metricsFile, 'utf8').trim();
    const row = JSON.parse(content);
    assert.strictEqual(row.input_tokens, 1000, 'Expected input_tokens to be 1000');
    assert.strictEqual(row.output_tokens, 500, 'Expected output_tokens to be 500');
    assert.ok(row.timestamp, 'Expected timestamp to be present');
    assert.ok(typeof row.estimated_cost_usd === 'number', 'Expected estimated_cost_usd to be a number');
    assert.ok(row.estimated_cost_usd > 0, 'Expected estimated_cost_usd to be positive');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  // 3. Handles empty input gracefully
  (test('handles empty input gracefully', () => {
    const tmpHome = makeTempDir();
    const result = runScript('', withTempHome(tmpHome));
    assert.strictEqual(result.code, 0, `Expected exit code 0, got ${result.code}`);
    // stdout should be empty since input was empty
    assert.strictEqual(result.stdout, '', 'Expected empty stdout for empty input');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  // 4. Handles invalid JSON gracefully
  (test('handles invalid JSON gracefully', () => {
    const tmpHome = makeTempDir();
    const invalidInput = 'not valid json {{{';
    const result = runScript(invalidInput, withTempHome(tmpHome));
    assert.strictEqual(result.code, 0, `Expected exit code 0, got ${result.code}`);
    // Should still pass through the raw input on stdout
    assert.strictEqual(result.stdout, invalidInput, 'Expected stdout to contain original invalid input');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  // 5. Handles missing usage fields gracefully
  (test('handles missing usage fields gracefully', () => {
    const tmpHome = makeTempDir();
    const input = { model: 'claude-sonnet-4-20250514' };
    const inputStr = JSON.stringify(input);
    const result = runScript(input, withTempHome(tmpHome));
    assert.strictEqual(result.code, 0, `Expected exit code 0, got ${result.code}`);
    assert.strictEqual(result.stdout, inputStr, 'Expected stdout to match original input');

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'costs.jsonl');
    assert.ok(fs.existsSync(metricsFile), 'Expected metrics file to exist even with missing usage');

    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.strictEqual(row.input_tokens, 0, 'Expected input_tokens to be 0 when missing');
    assert.strictEqual(row.output_tokens, 0, 'Expected output_tokens to be 0 when missing');
    assert.strictEqual(row.estimated_cost_usd, 0, 'Expected estimated_cost_usd to be 0 when no tokens');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  // 6. Prefers ECC_SESSION_ID for ECC2 session correlation
  (test('prefers ECC_SESSION_ID over CLAUDE_SESSION_ID when both are present', () => {
    const tmpHome = makeTempDir();
    const input = {
      model: 'claude-sonnet-4-20250514',
      usage: { input_tokens: 120, output_tokens: 30 },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      ECC_SESSION_ID: 'ecc-session-1234',
      CLAUDE_SESSION_ID: 'claude-session-9999',
    });
    assert.strictEqual(result.code, 0, `Expected exit code 0, got ${result.code}`);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'costs.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.strictEqual(row.session_id, 'ecc-session-1234', 'Expected ECC_SESSION_ID to win');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
