'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

console.log('\n=== Testing harness adapter compliance docs ===\n');

test('adapter compliance matrix covers the required harness surfaces', () => {
  const source = read('docs/architecture/harness-adapter-compliance.md');
  for (const harness of [
    'Claude Code',
    'Codex',
    'OpenCode',
    'Cursor',
    'Gemini',
    'Zed-adjacent',
    'dmux',
    'Orca',
    'Superset',
    'Ghast',
    'Terminal-only'
  ]) {
    assert.ok(source.includes(harness), `Expected matrix to include ${harness}`);
  }
});

test('adapter compliance matrix includes the required evidence columns', () => {
  const source = read('docs/architecture/harness-adapter-compliance.md');
  for (const heading of [
    'Supported assets',
    'Unsupported or different surfaces',
    'Install or onramp',
    'Verification command',
    'Risk notes'
  ]) {
    assert.ok(source.includes(heading), `Expected matrix to include ${heading}`);
  }
});

test('scorecard onramp names the local verification commands', () => {
  const source = read('docs/architecture/harness-adapter-compliance.md');
  for (const command of [
    'npm run harness:audit -- --format json',
    'npm run observability:ready',
    'node scripts/session-inspect.js --list-adapters',
    'node scripts/loop-status.js --json --write-dir .ecc/loop-status'
  ]) {
    assert.ok(source.includes(command), `Expected onramp to include ${command}`);
  }
});

test('cross-harness architecture links to the adapter compliance matrix', () => {
  const source = read('docs/architecture/cross-harness.md');
  assert.ok(source.includes('harness-adapter-compliance.md'));
});

test('GA roadmap records the matrix as current evidence and points to data-backed validation next', () => {
  const source = read('docs/ECC-2.0-GA-ROADMAP.md');
  assert.ok(source.includes('docs/architecture/harness-adapter-compliance.md'));
  assert.ok(source.includes('data-backed'));
});

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
