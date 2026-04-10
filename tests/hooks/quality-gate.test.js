/**
 * Tests for scripts/hooks/quality-gate.js
 *
 * Run with: node tests/hooks/quality-gate.test.js
 */

const assert = require('assert');
const path = require('path');
const os = require('os');
const fs = require('fs');

const qualityGate = require('../../scripts/hooks/quality-gate');

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

let passed = 0;
let failed = 0;

console.log('\nQuality Gate Hook Tests');
console.log('========================\n');

// --- run() returns original input for valid JSON ---

console.log('run() pass-through behavior:');

if (test('returns original input for valid JSON with file_path', () => {
  const input = JSON.stringify({ tool_input: { file_path: '/tmp/nonexistent-file.js' } });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('returns original input for valid JSON without file_path', () => {
  const input = JSON.stringify({ tool_input: { command: 'ls' } });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('returns original input for valid JSON with nested structure', () => {
  const input = JSON.stringify({ tool_input: { file_path: '/some/path.ts', content: 'hello' }, other: [1, 2, 3] });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

// --- run() returns original input for invalid JSON ---

console.log('\nInvalid JSON handling:');

if (test('returns original input for invalid JSON (no crash)', () => {
  const input = 'this is not json at all {{{';
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('returns original input for partial JSON', () => {
  const input = '{"tool_input": {';
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('returns original input for JSON with trailing garbage', () => {
  const input = '{"tool_input": {}}extra';
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

// --- run() returns original input when file does not exist ---

console.log('\nNon-existent file handling:');

if (test('returns original input when file_path points to non-existent file', () => {
  const input = JSON.stringify({ tool_input: { file_path: '/tmp/does-not-exist-12345.js' } });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('returns original input when file_path is a non-existent .py file', () => {
  const input = JSON.stringify({ tool_input: { file_path: '/tmp/does-not-exist-12345.py' } });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('returns original input when file_path is a non-existent .go file', () => {
  const input = JSON.stringify({ tool_input: { file_path: '/tmp/does-not-exist-12345.go' } });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

// --- run() returns original input for empty input ---

console.log('\nEmpty input handling:');

if (test('returns original input for empty string', () => {
  const input = '';
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return empty string unchanged');
})) passed++; else failed++;

if (test('returns original input for whitespace-only string', () => {
  const input = '   ';
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return whitespace string unchanged');
})) passed++; else failed++;

// --- run() handles missing tool_input gracefully ---

console.log('\nMissing tool_input handling:');

if (test('handles missing tool_input gracefully', () => {
  const input = JSON.stringify({ something_else: 'value' });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('handles null tool_input gracefully', () => {
  const input = JSON.stringify({ tool_input: null });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('handles tool_input with empty file_path', () => {
  const input = JSON.stringify({ tool_input: { file_path: '' } });
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

if (test('handles empty JSON object', () => {
  const input = JSON.stringify({});
  const result = qualityGate.run(input);
  assert.strictEqual(result, input, 'Should return original input unchanged');
})) passed++; else failed++;

// --- run() with a real file (but no formatter installed) ---

console.log('\nReal file without formatter:');

if (test('returns original input for existing file with no formatter configured', () => {
  const tmpFile = path.join(os.tmpdir(), `quality-gate-test-${Date.now()}.js`);
  fs.writeFileSync(tmpFile, 'const x = 1;\n');
  try {
    const input = JSON.stringify({ tool_input: { file_path: tmpFile } });
    const result = qualityGate.run(input);
    assert.strictEqual(result, input, 'Should return original input unchanged');
  } finally {
    fs.unlinkSync(tmpFile);
  }
})) passed++; else failed++;

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
