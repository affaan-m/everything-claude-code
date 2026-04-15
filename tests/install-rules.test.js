'use strict';

/**
 * Tests for scripts/install-rules.js
 *
 * Each test spawns the script in a child process with HOME pointed at a
 * temporary directory so no real ~/.claude/rules is touched.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'install-rules.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

/** Run the script with a fresh temp HOME and return { status, stdout, stderr, destRoot } */
function run(args = []) {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-test-'));
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, HOME: tmpHome },
    timeout: 15000,
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    destRoot: path.join(tmpHome, '.claude', 'rules'),
    tmpHome,
  };
}

function listInstalledFiles(destRoot) {
  if (!fs.existsSync(destRoot)) return [];
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(path.relative(destRoot, full));
    }
  }
  walk(destRoot);
  return files.sort();
}

// ── dry-run ───────────────────────────────────────────────────────────────────

test('--dry-run exits 0', () => {
  const { status } = run(['--dry-run']);
  assert.strictEqual(status, 0);
});

test('--dry-run writes no files', () => {
  const { destRoot } = run(['--dry-run']);
  assert.deepStrictEqual(listInstalledFiles(destRoot), []);
});

test('--dry-run output contains "[dry-run]"', () => {
  const { stdout } = run(['--dry-run']);
  assert.ok(stdout.includes('[dry-run]'), 'Expected "[dry-run]" in output');
});

test('--dry-run reports correct file count', () => {
  const { stdout } = run(['--dry-run']);
  const match = stdout.match(/Would install (\d+) rule file/);
  assert.ok(match, 'Expected "Would install N rule file(s)" in output');
  assert.ok(parseInt(match[1], 10) > 0, 'Expected at least one rule file');
});

// ── --plugin filter ───────────────────────────────────────────────────────────

test('--plugin ecc-core --dry-run shows only ecc-core rules', () => {
  const { stdout, status } = run(['--plugin', 'ecc-core', '--dry-run']);
  assert.strictEqual(status, 0);
  assert.ok(stdout.includes('ecc-core'), 'Expected ecc-core in output');
  assert.ok(!stdout.includes('ecc-lang-'), 'Expected no other plugins in output');
});

test('--plugin with unknown name exits 1', () => {
  const { status, stderr } = run(['--plugin', 'nonexistent-plugin-xyz']);
  assert.strictEqual(status, 1);
  assert.ok(stderr.includes('nonexistent-plugin-xyz'), 'Expected plugin name in error message');
});

// ── actual install ────────────────────────────────────────────────────────────

test('install ecc-core copies files to destRoot', () => {
  const { status, destRoot } = run(['--plugin', 'ecc-core']);
  assert.strictEqual(status, 0);
  const files = listInstalledFiles(destRoot);
  assert.ok(files.length > 0, 'Expected files to be copied');
});

test('install ecc-core preserves subdirectory structure', () => {
  const { destRoot } = run(['--plugin', 'ecc-core']);
  const files = listInstalledFiles(destRoot);
  const hasSubdir = files.some(f => f.includes(path.sep));
  assert.ok(hasSubdir, 'Expected files under subdirectories (e.g. common/)');
});

test('install ecc-core does not copy README.md', () => {
  const { destRoot } = run(['--plugin', 'ecc-core']);
  const files = listInstalledFiles(destRoot);
  const readmes = files.filter(f => path.basename(f) === 'README.md');
  assert.strictEqual(readmes.length, 0, `README.md should be skipped, found: ${readmes.join(', ')}`);
});

test('install ecc-core copies only .md files', () => {
  const { destRoot } = run(['--plugin', 'ecc-core']);
  const files = listInstalledFiles(destRoot);
  const nonMd = files.filter(f => !f.endsWith('.md'));
  assert.strictEqual(nonMd.length, 0, `Non-.md files should not be copied: ${nonMd.join(', ')}`);
});

test('install ecc-core output reports copied count', () => {
  const { stdout } = run(['--plugin', 'ecc-core']);
  assert.ok(
    stdout.includes('new file(s) copied') || stdout.includes('overwritten'),
    'Expected copy summary in output'
  );
});

test('second install marks existing files as overwrite (↺)', () => {
  // Run twice against the same tmpHome
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-test-'));
  const opts = {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, HOME: tmpHome },
    timeout: 15000,
  };
  spawnSync(process.execPath, [SCRIPT, '--plugin', 'ecc-core'], opts);
  const second = spawnSync(process.execPath, [SCRIPT, '--plugin', 'ecc-core'], opts);
  assert.ok(second.stdout.includes('↺'), 'Expected overwrite indicator (↺) on second run');
});

// ── summary ───────────────────────────────────────────────────────────────────

console.log(`\nPassed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
