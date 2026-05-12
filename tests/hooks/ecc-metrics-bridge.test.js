/**
 * Tests for scripts/hooks/ecc-metrics-bridge.js
 *
 * Run with: node tests/hooks/ecc-metrics-bridge.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { run, hashToolCall, extractFilePaths, readSessionCost } = require('../../scripts/hooks/ecc-metrics-bridge');

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-metrics-bridge-test-'));
}

function runTests() {
  console.log('\n=== Testing ecc-metrics-bridge.js ===\n');

  let passed = 0;
  let failed = 0;

  // hashToolCall tests
  console.log('hashToolCall:');

  if (
    test('returns 8-char hex string', () => {
      const hash = hashToolCall('Bash', { command: 'ls' });
      assert.strictEqual(hash.length, 8);
      assert.ok(/^[0-9a-f]{8}$/.test(hash), `Expected hex, got: ${hash}`);
    })
  )
    passed++;
  else failed++;

  if (
    test('different Bash commands produce different hashes', () => {
      const h1 = hashToolCall('Bash', { command: 'ls' });
      const h2 = hashToolCall('Bash', { command: 'pwd' });
      assert.notStrictEqual(h1, h2);
    })
  )
    passed++;
  else failed++;

  if (
    test('different Edit file_paths produce different hashes', () => {
      const h1 = hashToolCall('Edit', { file_path: 'a.js' });
      const h2 = hashToolCall('Edit', { file_path: 'b.js' });
      assert.notStrictEqual(h1, h2);
    })
  )
    passed++;
  else failed++;

  if (
    test('same inputs produce same hash (deterministic)', () => {
      const h1 = hashToolCall('Write', { file_path: 'x.txt' });
      const h2 = hashToolCall('Write', { file_path: 'x.txt' });
      assert.strictEqual(h1, h2);
    })
  )
    passed++;
  else failed++;

  if (
    test('non-file tools hash by stable input to avoid false loop collisions', () => {
      const h1 = hashToolCall('Glob', { pattern: '**/*.js', path: '/repo/a' });
      const h2 = hashToolCall('Glob', { pattern: '**/*.md', path: '/repo/a' });
      const h3 = hashToolCall('Glob', { path: '/repo/a', pattern: '**/*.js' });
      assert.notStrictEqual(h1, h2);
      assert.strictEqual(h1, h3);
    })
  )
    passed++;
  else failed++;

  // extractFilePaths tests
  console.log('\nextractFilePaths:');

  if (
    test('Edit with file_path returns [file_path]', () => {
      const paths = extractFilePaths('Edit', { file_path: 'a.js' });
      assert.deepStrictEqual(paths, ['a.js']);
    })
  )
    passed++;
  else failed++;

  if (
    test('MultiEdit with edits array returns all file_paths', () => {
      const paths = extractFilePaths('MultiEdit', {
        edits: [{ file_path: 'a.js' }, { file_path: 'b.js' }]
      });
      assert.deepStrictEqual(paths, ['a.js', 'b.js']);
    })
  )
    passed++;
  else failed++;

  if (
    test('Bash with command returns empty array', () => {
      const paths = extractFilePaths('Bash', { command: 'ls' });
      assert.deepStrictEqual(paths, []);
    })
  )
    passed++;
  else failed++;

  if (
    test('null toolInput returns empty array', () => {
      const paths = extractFilePaths('Edit', null);
      assert.deepStrictEqual(paths, []);
    })
  )
    passed++;
  else failed++;

  // readSessionCost tests
  console.log('\nreadSessionCost:');

  if (
    test('nonexistent session returns object with numeric fields', () => {
      const result = readSessionCost('nonexistent-session-cost-test-xyz-999');
      assert.strictEqual(typeof result.totalCost, 'number');
      assert.strictEqual(typeof result.totalIn, 'number');
      assert.strictEqual(typeof result.totalOut, 'number');
      assert.ok(result.totalCost >= 0, 'totalCost should be non-negative');
    })
  )
    passed++;
  else failed++;

  if (
    test('readSessionCost does not include unrelated default-session rows', () => {
      const tmpHome = makeTempHome();
      const originalHome = process.env.HOME;
      const originalUserProfile = process.env.USERPROFILE;
      try {
        process.env.HOME = tmpHome;
        process.env.USERPROFILE = tmpHome;
        const metricsDir = path.join(tmpHome, '.claude', 'metrics');
        fs.mkdirSync(metricsDir, { recursive: true });
        fs.writeFileSync(
          path.join(metricsDir, 'costs.jsonl'),
          [
            JSON.stringify({ session_id: 'default', estimated_cost_usd: 50, input_tokens: 1000, output_tokens: 2000 }),
            JSON.stringify({ session_id: 'target-session', estimated_cost_usd: 1.25, input_tokens: 10, output_tokens: 20 })
          ].join('\n') + '\n',
          'utf8'
        );
        const result = readSessionCost('target-session');
        assert.strictEqual(result.totalCost, 1.25);
        assert.strictEqual(result.totalIn, 10);
        assert.strictEqual(result.totalOut, 20);
      } finally {
        if (originalHome === undefined) delete process.env.HOME;
        else process.env.HOME = originalHome;
        if (originalUserProfile === undefined) delete process.env.USERPROFILE;
        else process.env.USERPROFILE = originalUserProfile;
        fs.rmSync(tmpHome, { recursive: true, force: true });
      }
    })
  )
    passed++;
  else failed++;

  // run tests
  console.log('\nrun:');

  if (
    test('empty input returns empty input without crashing', () => {
      const result = run('');
      assert.strictEqual(result, '');
    })
  )
    passed++;
  else failed++;

  if (
    test('whitespace-only input returns input unchanged', () => {
      const result = run('   ');
      assert.strictEqual(result, '   ');
    })
  )
    passed++;
  else failed++;

  if (
    test('input without session_id returns input unchanged', () => {
      const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } });
      const result = run(input);
      assert.strictEqual(result, input);
    })
  )
    passed++;
  else failed++;

  // Summary
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

const { failed } = runTests();
process.exit(failed > 0 ? 1 : 0);
