'use strict';

const assert = require('assert');

const { parseArgs } = require('../../scripts/orchestration-status');

console.log('=== Testing orchestration-status.js ===\n');

let passed = 0;
let failed = 0;

function test(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${desc}: ${error.message}`);
    failed++;
  }
}

test('parseArgs reads a target with an optional write path', () => {
  assert.deepStrictEqual(
    parseArgs([
      'node',
      'scripts/orchestration-status.js',
      'workflow-visual-proof',
      '--write',
      '/tmp/snapshot.json'
    ]),
    {
      target: 'workflow-visual-proof',
      writePath: '/tmp/snapshot.json'
    }
  );
});

test('parseArgs does not treat the write path as the target', () => {
  assert.deepStrictEqual(
    parseArgs([
      'node',
      'scripts/orchestration-status.js',
      '--write',
      '/tmp/snapshot.json',
      'workflow-visual-proof'
    ]),
    {
      target: 'workflow-visual-proof',
      writePath: '/tmp/snapshot.json'
    }
  );
});

test('parseArgs rejects missing write values and unknown flags', () => {
  assert.throws(
    () => parseArgs([
      'node',
      'scripts/orchestration-status.js',
      'workflow-visual-proof',
      '--write'
    ]),
    /--write requires an output path/
  );
  assert.throws(
    () => parseArgs([
      'node',
      'scripts/orchestration-status.js',
      'workflow-visual-proof',
      '--unknown'
    ]),
    /Unknown flag/
  );
});

test('parseArgs rejects multiple positional targets', () => {
  assert.throws(
    () => parseArgs([
      'node',
      'scripts/orchestration-status.js',
      'first',
      'second'
    ]),
    /Expected a single session name or plan path/
  );
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
