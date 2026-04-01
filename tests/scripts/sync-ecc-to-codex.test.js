/**
 * Source-level tests for scripts/sync-ecc-to-codex.sh
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'sync-ecc-to-codex.sh');
const source = fs.readFileSync(scriptPath, 'utf8');
const normalizedSource = source.replace(/\r\n/g, '\n');

function extractFunctionSource(text, functionName) {
  const start = text.indexOf(`${functionName}() {`);
  if (start < 0) {
    return '';
  }

  let depth = 0;
  const bodyStart = text.indexOf('{', start);
  if (bodyStart < 0) {
    return '';
  }

  for (let i = bodyStart; i < text.length; i += 1) {
    const char = text[i];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return '';
}

const runOrEchoSource = extractFunctionSource(normalizedSource, 'run_or_echo');
const extractContext7KeySource = extractFunctionSource(normalizedSource, 'extract_context7_key');

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
    // Skills sync rm/cp calls were removed — Codex reads from ~/.agents/skills/ natively
    assert.ok(!source.includes('run_or_echo rm -rf "$dest"'), 'skill sync rm should be removed');
    assert.ok(!source.includes('run_or_echo cp -R "$skill_dir" "$dest"'), 'skill sync cp should be removed');
  })) passed++; else failed++;

  if (test('extract_context7_key avoids non-portable grep -P', () => {
    assert.ok(extractContext7KeySource, 'Expected to locate extract_context7_key function body');
    assert.ok(
      !/\bgrep\b[^\n]*(?:--perl-regexp|\s-[A-Za-z]*P[A-Za-z]*)/.test(extractContext7KeySource),
      'extract_context7_key should not rely on grep -P',
    );
  })) passed++; else failed++;

  if (test('extract_context7_key extracts the key value', () => {
    assert.ok(extractContext7KeySource, 'Expected to locate extract_context7_key function body');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'context7-key-'));
    const helperPath = path.join(tempDir, 'extract-context7-key.sh');
    const inputPath = path.join(tempDir, 'context7.txt');

    try {
      fs.writeFileSync(
        helperPath,
        `#!/usr/bin/env bash
set -euo pipefail
${extractContext7KeySource}
extract_context7_key "$1"
`,
      );
      fs.writeFileSync(inputPath, 'args = ["--key", "abc-123"]\n');

      const result = spawnSync('bash', [helperPath, inputPath], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      assert.strictEqual(result.status, 0, result.stderr || result.stdout);
      assert.strictEqual(result.stdout.trim(), 'abc-123');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
