/**
 * Regression tests for OpenCode ECC file probes.
 *
 * Run with: node tests/opencode/ecc-hooks-file-probes.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const repoRoot = path.join(__dirname, '..', '..');
const opencodeRoot = path.join(repoRoot, '.opencode');
const distPluginPath = path.join(opencodeRoot, 'dist', 'plugins', 'ecc-hooks.js');

let passed = 0;
let failed = 0;

function asyncTest(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ ${name}`);
      return true;
    })
    .catch((err) => {
      console.log(`  ✗ ${name}`);
      console.log(`    Error: ${err.message}`);
      return false;
    });
}

function createTestDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-opencode-file-probes-'));
}

function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

function buildOpencodePlugin() {
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npm run build'], {
        cwd: opencodeRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    : spawnSync('npm', ['run', 'build'], {
        cwd: opencodeRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

  if (result.status !== 0) {
    throw new Error(
      `OpenCode plugin build failed: ${(result.stderr || result.stdout || '').trim()}`
    );
  }
}

async function loadPlugin() {
  buildOpencodePlugin();
  const moduleUrl = `${pathToFileURL(distPluginPath).href}?t=${Date.now()}`;
  return import(moduleUrl);
}

function createPluginInput(worktreePath, logs) {
  return {
    client: {
      app: {
        log: ({ body }) => {
          logs.push(body);
          return Promise.resolve();
        },
      },
    },
    $: () => {
      throw new Error('shell execution should not be required for file probes');
    },
    directory: worktreePath,
    worktree: worktreePath,
  };
}

async function runTests() {
  console.log('\n=== Testing OpenCode ECC file probes ===\n');

  const { ECCHooksPlugin } = await loadPlugin();

  if (await asyncTest('session.created ignores CLAUDE.md directories', async () => {
    const testDir = createTestDir();
    try {
      fs.mkdirSync(path.join(testDir, 'CLAUDE.md'));

      const logs = [];
      const hooks = await ECCHooksPlugin(createPluginInput(testDir, logs));
      await hooks['session.created']();

      assert.ok(
        !logs.some((entry) => String(entry?.message || '').includes('Found CLAUDE.md')),
        'directory named CLAUDE.md should not be treated as a project context file'
      );
    } finally {
      cleanupTestDir(testDir);
    }
  })) passed++; else failed++;

  if (await asyncTest('shell.env ignores directories masquerading as lockfiles and markers', async () => {
    const testDir = createTestDir();
    try {
      fs.mkdirSync(path.join(testDir, 'pnpm-lock.yaml'));
      fs.mkdirSync(path.join(testDir, 'tsconfig.json'));

      const logs = [];
      const hooks = await ECCHooksPlugin(createPluginInput(testDir, logs));
      const env = await hooks['shell.env']();

      assert.ok(!('PACKAGE_MANAGER' in env), 'lockfile directory should not set PACKAGE_MANAGER');
      assert.ok(!('DETECTED_LANGUAGES' in env), 'marker directory should not set DETECTED_LANGUAGES');
      assert.ok(!('PRIMARY_LANGUAGE' in env), 'marker directory should not set PRIMARY_LANGUAGE');
    } finally {
      cleanupTestDir(testDir);
    }
  })) passed++; else failed++;

  if (await asyncTest('shell.env still detects regular files', async () => {
    const testDir = createTestDir();
    try {
      fs.writeFileSync(path.join(testDir, 'pnpm-lock.yaml'), 'lockfile');
      fs.writeFileSync(path.join(testDir, 'tsconfig.json'), '{}');

      const logs = [];
      const hooks = await ECCHooksPlugin(createPluginInput(testDir, logs));
      const env = await hooks['shell.env']();

      assert.strictEqual(env.PACKAGE_MANAGER, 'pnpm');
      assert.strictEqual(env.PRIMARY_LANGUAGE, 'typescript');
      assert.strictEqual(env.DETECTED_LANGUAGES, 'typescript');
    } finally {
      cleanupTestDir(testDir);
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.log(`\nFatal: ${err.message}`);
  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed + 1}`);
  process.exit(1);
});
