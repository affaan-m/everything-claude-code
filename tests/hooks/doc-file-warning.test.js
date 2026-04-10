#!/usr/bin/env node
'use strict';

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'doc-file-warning.js');

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

function runScript(input) {
  const result = spawnSync('node', [script], {
    encoding: 'utf8',
    input: JSON.stringify(input),
    timeout: 10000,
  });
  return { code: result.status || 0, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function runTests() {
  console.log('\n=== Testing doc-file-warning.js ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Allowed standard doc files - no warning in stderr
  const standardFiles = [
    'README.md',
    'CLAUDE.md',
    'AGENTS.md',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'LICENSE.md',
    'SKILL.md',
    'MEMORY.md',
    'WORKLOG.md',
  ];
  for (const file of standardFiles) {
    (test(`allows standard doc file: ${file}`, () => {
      const { code, stderr } = runScript({ tool_input: { file_path: file } });
      assert.strictEqual(code, 0, `expected exit code 0, got ${code}`);
      assert.strictEqual(stderr, '', `expected no warning for ${file}, got: ${stderr}`);
    }) ? passed++ : failed++);
  }

  // 2. Allowed directory paths - no warning
  const allowedDirPaths = [
    'docs/foo.md',
    'docs/guide/setup.md',
    'skills/bar.md',
    'skills/testing/tdd.md',
    '.history/session.md',
    'memory/patterns.md',
    '.claude/commands/deploy.md',
    '.claude/plans/roadmap.md',
    '.claude/projects/myproject.md',
  ];
  for (const file of allowedDirPaths) {
    (test(`allows directory path: ${file}`, () => {
      const { code, stderr } = runScript({ tool_input: { file_path: file } });
      assert.strictEqual(code, 0, `expected exit code 0, got ${code}`);
      assert.strictEqual(stderr, '', `expected no warning for ${file}, got: ${stderr}`);
    }) ? passed++ : failed++);
  }

  // 3. Allowed .plan.md files - no warning
  (test('allows .plan.md files', () => {
    const { code, stderr } = runScript({ tool_input: { file_path: 'feature.plan.md' } });
    assert.strictEqual(code, 0);
    assert.strictEqual(stderr, '', `expected no warning for .plan.md, got: ${stderr}`);
  }) ? passed++ : failed++);

  (test('allows nested .plan.md files', () => {
    const { code, stderr } = runScript({ tool_input: { file_path: 'src/refactor.plan.md' } });
    assert.strictEqual(code, 0);
    assert.strictEqual(stderr, '', `expected no warning for nested .plan.md, got: ${stderr}`);
  }) ? passed++ : failed++);

  // 4. Non-md/txt files always pass - no warning
  const nonDocFiles = ['foo.js', 'app.py', 'styles.css', 'data.json', 'image.png'];
  for (const file of nonDocFiles) {
    (test(`allows non-doc file: ${file}`, () => {
      const { code, stderr } = runScript({ tool_input: { file_path: file } });
      assert.strictEqual(code, 0);
      assert.strictEqual(stderr, '', `expected no warning for ${file}, got: ${stderr}`);
    }) ? passed++ : failed++);
  }

  // 5. Non-standard doc files - warning in stderr
  const nonStandardFiles = ['random-notes.md', 'TODO.md', 'notes.txt', 'scratch.md', 'ideas.txt'];
  for (const file of nonStandardFiles) {
    (test(`warns on non-standard doc file: ${file}`, () => {
      const { code, stderr } = runScript({ tool_input: { file_path: file } });
      assert.strictEqual(code, 0, 'should still exit 0 (warn only)');
      assert.ok(stderr.includes('WARNING'), `expected warning in stderr for ${file}, got: ${stderr}`);
      assert.ok(stderr.includes(file), `expected file path in stderr for ${file}`);
    }) ? passed++ : failed++);
  }

  // 6. Invalid/empty input - passes through without error
  (test('handles empty object input without error', () => {
    const { code, stderr } = runScript({});
    assert.strictEqual(code, 0);
    assert.strictEqual(stderr, '', `expected no warning for empty input, got: ${stderr}`);
  }) ? passed++ : failed++);

  (test('handles missing file_path without error', () => {
    const { code, stderr } = runScript({ tool_input: {} });
    assert.strictEqual(code, 0);
    assert.strictEqual(stderr, '', `expected no warning for missing file_path, got: ${stderr}`);
  }) ? passed++ : failed++);

  (test('handles empty file_path without error', () => {
    const { code, stderr } = runScript({ tool_input: { file_path: '' } });
    assert.strictEqual(code, 0);
    assert.strictEqual(stderr, '', `expected no warning for empty file_path, got: ${stderr}`);
  }) ? passed++ : failed++);

  // 7. Stdout always contains the original input (pass-through)
  (test('passes through input to stdout for allowed file', () => {
    const input = { tool_input: { file_path: 'README.md' } };
    const { stdout } = runScript(input);
    assert.strictEqual(stdout, JSON.stringify(input));
  }) ? passed++ : failed++);

  (test('passes through input to stdout for warned file', () => {
    const input = { tool_input: { file_path: 'random-notes.md' } };
    const { stdout } = runScript(input);
    assert.strictEqual(stdout, JSON.stringify(input));
  }) ? passed++ : failed++);

  (test('passes through input to stdout for empty input', () => {
    const input = {};
    const { stdout } = runScript(input);
    assert.strictEqual(stdout, JSON.stringify(input));
  }) ? passed++ : failed++);

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
