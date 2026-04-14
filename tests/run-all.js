#!/usr/bin/env node
/**
 * Run all tests
 *
 * Discovers tests/**\/*.test.js files and runs each in a child process.
 * Reports pass/fail per file and exits non-zero if any fail.
 *
 * Usage: node tests/run-all.js
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const testsDir = __dirname;
const repoRoot = path.resolve(testsDir, '..');
const TEST_GLOB = 'tests/**/*.test.js';

function matchesTestGlob(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (typeof path.matchesGlob === 'function') {
    return path.matchesGlob(normalized, TEST_GLOB);
  }
  return /^tests\/(?:.+\/)?[^/]+\.test\.js$/.test(normalized);
}

function walkFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, acc);
    } else if (entry.isFile()) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function discoverTestFiles() {
  return walkFiles(testsDir)
    .map(fullPath => path.relative(repoRoot, fullPath))
    .filter(matchesTestGlob)
    .map(repoRelativePath => path.relative(testsDir, path.join(repoRoot, repoRelativePath)))
    .sort();
}

const testFiles = discoverTestFiles();

const BOX_W = 58;
const boxLine = s => `║${s.padEnd(BOX_W)}║`;

console.log('╔' + '═'.repeat(BOX_W) + '╗');
console.log(boxLine('           Everything Claude Code - Test Suite'));
console.log('╚' + '═'.repeat(BOX_W) + '╝');
console.log();

if (testFiles.length === 0) {
  console.log(`✗ No test files matched ${TEST_GLOB}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;
const failures = [];

for (const testFile of testFiles) {
  const result = spawnSync(process.execPath, [path.join(testsDir, testFile)], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 30000
  });

  const success = result.status === 0 && !result.error;
  if (success) {
    passed++;
    console.log(`  ✓ ${testFile}`);
    if (result.stdout && result.stdout.trim()) {
      result.stdout.trim().split('\n').forEach(line => console.log(`    ${line}`));
    }
  } else {
    failed++;
    failures.push({ testFile, result });
    console.log(`  ✗ ${testFile}`);
  }
}

console.log();

if (failures.length > 0) {
  console.log('─'.repeat(BOX_W + 2));
  console.log('FAILURES:');
  for (const { testFile, result } of failures) {
    console.log(`\n  ✗ ${testFile}`);
    if (result.stdout && result.stdout.trim()) {
      console.log(result.stdout.trim());
    }
    if (result.stderr && result.stderr.trim()) {
      console.log(result.stderr.trim());
    }
    if (result.error) {
      console.log(`  Error: ${result.error.message}`);
    }
  }
  console.log();
}

console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
