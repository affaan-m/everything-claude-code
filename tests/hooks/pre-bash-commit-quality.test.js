/**
 * Tests for scripts/hooks/pre-bash-commit-quality.js
 *
 * Run with: node tests/hooks/pre-bash-commit-quality.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const hook = require('../../scripts/hooks/pre-bash-commit-quality');

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

function inTempRepo(fn) {
  const prevCwd = process.cwd();
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-bash-commit-quality-'));

  try {
    spawnSync('git', ['init'], { cwd: repoDir, stdio: 'pipe', encoding: 'utf8' });
    spawnSync('git', ['config', 'user.name', 'ECC Test'], { cwd: repoDir, stdio: 'pipe', encoding: 'utf8' });
    spawnSync('git', ['config', 'user.email', 'ecc@example.com'], { cwd: repoDir, stdio: 'pipe', encoding: 'utf8' });
    process.chdir(repoDir);
    return fn(repoDir);
  } finally {
    process.chdir(prevCwd);
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
}

let passed = 0;
let failed = 0;

console.log('\nPre-Bash Commit Quality Hook Tests');
console.log('==================================\n');

if (test('evaluate blocks commits when staged snapshot contains debugger', () => {
  inTempRepo(repoDir => {
    const filePath = path.join(repoDir, 'index.js');
    fs.writeFileSync(filePath, 'function main() {\n  debugger;\n}\n', 'utf8');
    spawnSync('git', ['add', 'index.js'], { cwd: repoDir, stdio: 'pipe', encoding: 'utf8' });

    const input = JSON.stringify({ tool_input: { command: 'git commit -m "fix: test debugger hook"' } });
    const result = hook.evaluate(input);

    assert.strictEqual(result.output, input, 'should preserve stdin payload');
    assert.strictEqual(result.exitCode, 2, 'should block commit when staged snapshot has debugger');
  });
})) passed++; else failed++;

if (test('evaluate inspects staged snapshot instead of newer working tree content', () => {
  inTempRepo(repoDir => {
    const filePath = path.join(repoDir, 'index.js');
    fs.writeFileSync(filePath, 'function main() {\n  return 1;\n}\n', 'utf8');
    spawnSync('git', ['add', 'index.js'], { cwd: repoDir, stdio: 'pipe', encoding: 'utf8' });

    // Working tree diverges after staging; hook should still inspect staged content.
    fs.writeFileSync(filePath, 'function main() {\n  debugger;\n  return 1;\n}\n', 'utf8');

    const input = JSON.stringify({ tool_input: { command: 'git commit -m "fix: staged snapshot only"' } });
    const result = hook.evaluate(input);

    assert.strictEqual(result.output, input, 'should preserve stdin payload');
    assert.strictEqual(result.exitCode, 0, 'should ignore unstaged debugger in working tree');
  });
})) passed++; else failed++;

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
