/**
 * Tests for scripts/lib/session-bridge.js
 *
 * Run with: node tests/lib/session-bridge.test.js
 */

const assert = require('assert');
const fs = require('fs');

const { sanitizeSessionId, getBridgePath, readBridge, writeBridgeAtomic, resolveSessionId, MAX_SESSION_ID_LENGTH } = require('../../scripts/lib/session-bridge');

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

function runTests() {
  console.log('\n=== Testing session-bridge.js ===\n');

  let passed = 0;
  let failed = 0;

  // sanitizeSessionId tests
  console.log('sanitizeSessionId:');

  if (
    test('valid ID passes through', () => {
      assert.strictEqual(sanitizeSessionId('abc-123'), 'abc-123');
    })
  )
    passed++;
  else failed++;

  if (
    test('path traversal returns null', () => {
      assert.strictEqual(sanitizeSessionId('../etc/passwd'), null);
    })
  )
    passed++;
  else failed++;

  if (
    test('forward slash returns null', () => {
      assert.strictEqual(sanitizeSessionId('/tmp/evil'), null);
    })
  )
    passed++;
  else failed++;

  if (
    test('backslash returns null', () => {
      assert.strictEqual(sanitizeSessionId('a\\b'), null);
    })
  )
    passed++;
  else failed++;

  if (
    test('null input returns null', () => {
      assert.strictEqual(sanitizeSessionId(null), null);
    })
  )
    passed++;
  else failed++;

  if (
    test('empty string returns null', () => {
      assert.strictEqual(sanitizeSessionId(''), null);
    })
  )
    passed++;
  else failed++;

  if (
    test('long string is truncated to MAX_SESSION_ID_LENGTH', () => {
      const longId = 'a'.repeat(100);
      const result = sanitizeSessionId(longId);
      assert.ok(result, 'Should not return null for valid chars');
      assert.strictEqual(result.length, MAX_SESSION_ID_LENGTH);
    })
  )
    passed++;
  else failed++;

  // getBridgePath tests
  console.log('\ngetBridgePath:');

  if (
    test('returns path containing ecc-metrics-', () => {
      const p = getBridgePath('test-session');
      assert.ok(p.includes('ecc-metrics-'), `Expected ecc-metrics- in path, got: ${p}`);
    })
  )
    passed++;
  else failed++;

  // writeBridgeAtomic + readBridge roundtrip
  console.log('\nwriteBridgeAtomic / readBridge:');

  if (
    test('roundtrip write then read returns same data', () => {
      const testId = `test-bridge-${Date.now()}`;
      const data = { session_id: testId, tool_count: 42 };
      try {
        writeBridgeAtomic(testId, data);
        const result = readBridge(testId);
        assert.deepStrictEqual(result, data);
      } finally {
        // Clean up
        try {
          fs.unlinkSync(getBridgePath(testId));
        } catch {
          /* ignore */
        }
      }
    })
  )
    passed++;
  else failed++;

  if (
    test('readBridge with nonexistent session returns null', () => {
      const result = readBridge('nonexistent-session-id-999');
      assert.strictEqual(result, null);
    })
  )
    passed++;
  else failed++;

  // resolveSessionId tests
  console.log('\nresolveSessionId:');

  if (
    test('resolveSessionId uses ECC_SESSION_ID env var', () => {
      const original = process.env.ECC_SESSION_ID;
      try {
        process.env.ECC_SESSION_ID = 'env-session-42';
        const result = resolveSessionId();
        assert.strictEqual(result, 'env-session-42');
      } finally {
        if (original === undefined) {
          delete process.env.ECC_SESSION_ID;
        } else {
          process.env.ECC_SESSION_ID = original;
        }
      }
    })
  )
    passed++;
  else failed++;

  if (
    test('MAX_SESSION_ID_LENGTH is 64', () => {
      assert.strictEqual(MAX_SESSION_ID_LENGTH, 64);
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
