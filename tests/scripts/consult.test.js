/**
 * Tests for scripts/consult.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'consult.js');

function run(args = [], options = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
}

function parseJson(stdout) {
  return JSON.parse(stdout.trim());
}

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    return true;
  } catch (error) {
    console.log(`  FAIL ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing consult.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('shows help with an explicit help flag', () => {
    const result = run(['--help']);

    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /Consult ECC install components/);
    assert.match(result.stdout, /node scripts\/consult\.js "security reviews"/);
  })) passed++; else failed++;

  if (test('recommends security components and profile for a natural language query', () => {
    const result = run(['security', 'reviews', '--json']);

    assert.strictEqual(result.status, 0, result.stderr);
    const payload = parseJson(result.stdout);
    assert.strictEqual(payload.schemaVersion, 'ecc.consult.v1');
    assert.strictEqual(payload.query, 'security reviews');
    assert.strictEqual(payload.target, 'claude');
    assert.strictEqual(payload.matches[0].componentId, 'capability:security');
    assert.ok(payload.matches[0].reasons.some(reason => reason.includes('security')));
    assert.strictEqual(
      payload.matches[0].installCommand,
      'npx ecc install --profile minimal --target claude --with capability:security'
    );
    assert.ok(payload.profiles.some(profile => profile.id === 'security'));
    assert.ok(payload.profiles.find(profile => profile.id === 'security').installCommand.includes('--profile security'));
  })) passed++; else failed++;

  if (test('prints text recommendations with install and plan commands', () => {
    const result = run(['I', 'want', 'a', 'skill', 'for', 'security', 'reviews']);

    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /ECC consult/);
    assert.match(result.stdout, /capability:security/);
    assert.match(result.stdout, /npx ecc install --profile minimal --target claude --with capability:security/);
    assert.match(result.stdout, /npx ecc plan --profile minimal --target claude --with capability:security/);
  })) passed++; else failed++;

  if (test('works from outside the ECC repository', () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-consult-project-'));
    try {
      const result = run(['nextjs', 'react', '--json'], { cwd: projectDir });

      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.matches[0].componentId, 'framework:nextjs');
      assert.ok(payload.matches.some(match => match.componentId === 'framework:react'));
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('filters recommendations by target and limit', () => {
    const result = run(['operator', 'workflows', '--target', 'codex', '--limit', '1', '--json']);

    assert.strictEqual(result.status, 0, result.stderr);
    const payload = parseJson(result.stdout);
    assert.strictEqual(payload.target, 'codex');
    assert.strictEqual(payload.matches.length, 1);
    assert.ok(payload.matches[0].targets.includes('codex'));
    assert.ok(payload.matches[0].installCommand.includes('--target codex'));
  })) passed++; else failed++;

  if (test('rejects unknown targets', () => {
    const result = run(['security', '--target', 'not-a-target']);

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Unknown install target/);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
