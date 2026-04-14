#!/usr/bin/env node
/**
 * Validate workflow security guardrails for privileged GitHub Actions events.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'ci', 'validate-workflow-security.js');

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

function runValidator(files) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-workflow-security-'));
  try {
    for (const [name, contents] of Object.entries(files)) {
      fs.writeFileSync(path.join(tempDir, name), contents);
    }

    return spawnSync('node', [SCRIPT_PATH], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ECC_WORKFLOWS_DIR: tempDir,
      },
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function run() {
  console.log('\n=== Testing workflow security validation ===\n');

  let passed = 0;
  let failed = 0;

  if (test('allows safe workflow_run workflow that only checks out the base repository', () => {
    const result = runValidator({
      'safe.yml': `name: Safe\non:\n  workflow_run:\n    workflows: ["CI"]\n    types: [completed]\njobs:\n  repair:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo safe\n`,
    });
    assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  })) passed++; else failed++;

  if (test('rejects workflow_run checkout using github.event.workflow_run.head_branch', () => {
    const result = runValidator({
      'unsafe-workflow-run.yml': `name: Unsafe\non:\n  workflow_run:\n    workflows: ["CI"]\n    types: [completed]\njobs:\n  repair:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: \${{ github.event.workflow_run.head_branch }}\n`,
    });
    assert.notStrictEqual(result.status, 0, 'Expected validator to fail');
    assert.match(result.stderr, /workflow_run must not checkout an untrusted workflow_run head ref\/repository/);
    assert.match(result.stderr, /head_branch/);
  })) passed++; else failed++;

  if (test('rejects workflow_run checkout using github.event.workflow_run.head_repository.full_name', () => {
    const result = runValidator({
      'unsafe-repository.yml': `name: Unsafe\non:\n  workflow_run:\n    workflows: ["CI"]\n    types: [completed]\njobs:\n  repair:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          repository: \${{ github.event.workflow_run.head_repository.full_name }}\n`,
    });
    assert.notStrictEqual(result.status, 0, 'Expected validator to fail');
    assert.match(result.stderr, /head_repository\.full_name/);
  })) passed++; else failed++;

  if (test('rejects pull_request_target checkout using github.event.pull_request.head.sha', () => {
    const result = runValidator({
      'unsafe-pr-target.yml': `name: Unsafe\non:\n  pull_request_target:\n    branches: [main]\njobs:\n  inspect:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: \${{ github.event.pull_request.head.sha }}\n`,
    });
    assert.notStrictEqual(result.status, 0, 'Expected validator to fail');
    assert.match(result.stderr, /pull_request_target must not checkout an untrusted pull_request head ref\/repository/);
    assert.match(result.stderr, /pull_request\.head\.sha/);
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
