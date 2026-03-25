/**
 * Source-level tests for scripts/sync-ecc-to-codex.sh
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'sync-ecc-to-codex.sh');
const source = fs.readFileSync(scriptPath, 'utf8');
const normalizedSource = source.replace(/\r\n/g, '\n');
const runOrEchoSource = (() => {
  const start = normalizedSource.indexOf('run_or_echo() {');
  if (start < 0) {
    return '';
  }

  let depth = 0;
  let bodyStart = normalizedSource.indexOf('{', start);
  if (bodyStart < 0) {
    return '';
  }

  for (let i = bodyStart; i < normalizedSource.length; i++) {
    const char = normalizedSource[i];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return normalizedSource.slice(start, i + 1);
      }
    }
  }

  return '';
})();

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing sync-ecc-to-codex.sh ===\n');

  let passed = 0;
  let failed = 0;

  if (test('run_or_echo does not use eval', () => {
    assert.ok(runOrEchoSource, 'Expected to locate run_or_echo function body');
    assert.ok(!runOrEchoSource.includes('eval "$@"'), 'run_or_echo should not execute through eval');
  })) passed++; else failed++;

  if (test('run_or_echo executes argv directly', () => {
    assert.ok(runOrEchoSource.includes('    "$@"'), 'run_or_echo should execute the argv vector directly');
  })) passed++; else failed++;

  if (test('dry-run output shell-escapes argv', () => {
    assert.ok(runOrEchoSource.includes(`printf ' %q' "$@"`), 'Dry-run mode should print shell-escaped argv');
  })) passed++; else failed++;

  if (test('filesystem-changing calls use argv-form run_or_echo invocations', () => {
    assert.ok(source.includes('run_or_echo mkdir -p "$BACKUP_DIR"'), 'mkdir should use argv form');
    assert.ok(source.includes('run_or_echo rm -rf "$dest"'), 'rm should use argv form');
    assert.ok(source.includes('run_or_echo cp -R "$skill_dir" "$dest"'), 'recursive copy should use argv form');
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
