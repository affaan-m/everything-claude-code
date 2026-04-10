/**
 * Tests for scripts/lib/install-targets/registry.js
 */

const assert = require('assert');
const path = require('path');

const {
  getInstallTargetAdapter,
  listInstallTargetAdapters,
  planInstallTargetScaffold,
} = require('../../scripts/lib/install-targets/registry');

function normalizedRelativePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing install-target adapters ===\n');

  let passed = 0;
  let failed = 0;

  if (test('lists supported target adapters', () => {
    const adapters = listInstallTargetAdapters();
    const targets = adapters.map(adapter => adapter.target);
    assert.ok(targets.includes('claude'), 'Should include claude target');
    assert.ok(targets.includes('cursor'), 'Should include cursor target');
    assert.ok(targets.includes('antigravity'), 'Should include antigravity target');
    assert.ok(targets.includes('codex'), 'Should include codex target');
    assert.ok(targets.includes('opencode'), 'Should include opencode target');
  })) passed++; else failed++;

  if (test('resolves cursor adapter root and install-state path from project root', () => {
    const adapter = getInstallTargetAdapter('cursor');
    const projectRoot = '/workspace/app';
    const root = adapter.resolveRoot({ projectRoot });
    const statePath = adapter.getInstallStatePath({ projectRoot });

    assert.strictEqual(root, path.join(projectRoot, '.cursor'));
    assert.strictEqual(statePath, path.join(projectRoot, '.cursor', 'ecc-install-state.json'));
  })) passed++; else failed++;

  if (test('resolves claude adapter root and install-state path from home dir', () => {
    const adapter = getInstallTargetAdapter('claude');
    const homeDir = '/Users/example';
    const root = adapter.resolveRoot({ homeDir, repoRoot: '/repo/ecc' });
    const statePath = adapter.getInstallStatePath({ homeDir, repoRoot: '/repo/ecc' });

    assert.strictEqual(root, path.join(homeDir, '.claude'));
    assert.strictEqual(statePath, path.join(homeDir, '.claude', 'ecc', 'install-state.json'));
  })) passed++; else failed++;

  if (test('plans scaffold operations and flattens native target roots', () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const projectRoot = '/workspace/app';
    const modules = [
      {
        id: 'platform-configs',
        paths: ['.cursor', 'mcp-configs'],
      },
      {
        id: 'rules-core',
        paths: ['rules'],
      },
    ];

    const plan = planInstallTargetScaffold({
      target: 'cursor',
      repoRoot,
      projectRoot,
      modules,
    });

    assert.strictEqual(plan.adapter.id, 'cursor-project');
    assert.strictEqual(plan.targetRoot, path.join(projectRoot, '.cursor'));
    assert.strictEqual(plan.installStatePath, path.join(projectRoot, '.cursor', 'ecc-install-state.json'));

    const flattened = plan.operations.find(operation => operation.sourceRelativePath === '.cursor');
    const preserved = plan.operations.find(operation => (
      normalizedRelativePath(operation.sourceRelativePath) === 'rules/common/coding-style.md'
    ));

    assert.ok(flattened, 'Should include .cursor scaffold operation');
    assert.strictEqual(flattened.strategy, 'sync-root-children');
    assert.strictEqual(flattened.destinationPath, path.join(projectRoot, '.cursor'));

    assert.ok(preserved, 'Should include flattened rules scaffold operations');
    assert.strictEqual(preserved.strategy, 'flatten-copy');
    assert.strictEqual(
      preserved.destinationPath,
      path.join(projectRoot, '.cursor', 'rules', 'common-coding-style.md')
    );
  })) passed++; else failed++;

  if (test('plans cursor rules with flat namespaced filenames to avoid rule collisions', () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const projectRoot = '/workspace/app';

    const plan = planInstallTargetScaffold({
      target: 'cursor',
      repoRoot,
      projectRoot,
      modules: [
        {
          id: 'rules-core',
          paths: ['rules'],
        },
      ],
    });

    assert.ok(
      plan.operations.some(operation => (
        normalizedRelativePath(operation.sourceRelativePath) === 'rules/common/coding-style.md'
        && operation.destinationPath === path.join(projectRoot, '.cursor', 'rules', 'common-coding-style.md')
      )),
      'Should flatten common rules into namespaced files'
    );
    assert.ok(
      plan.operations.some(operation => (
        normalizedRelativePath(operation.sourceRelativePath) === 'rules/typescript/testing.md'
        && operation.destinationPath === path.join(projectRoot, '.cursor', 'rules', 'typescript-testing.md')
      )),
      'Should flatten language rules into namespaced files'
    );
    assert.ok(
      !plan.operations.some(operation => (
        operation.destinationPath === path.join(projectRoot, '.cursor', 'rules', 'common', 'coding-style.md')
      )),
      'Should not preserve nested rule directories for cursor installs'
    );
  })) passed++; else failed++;

  if (test('plans antigravity remaps for workflows, skills, and flat rules', () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const projectRoot = '/workspace/app';

    const plan = planInstallTargetScaffold({
      target: 'antigravity',
      repoRoot,
      projectRoot,
      modules: [
        {
          id: 'commands-core',
          paths: ['commands'],
        },
        {
          id: 'agents-core',
          paths: ['agents'],
        },
        {
          id: 'rules-core',
          paths: ['rules'],
        },
      ],
    });

    assert.ok(
      plan.operations.some(operation => (
        operation.sourceRelativePath === 'commands'
        && operation.destinationPath === path.join(projectRoot, '.agent', 'workflows')
      )),
      'Should remap commands into workflows'
    );
    assert.ok(
      plan.operations.some(operation => (
        operation.sourceRelativePath === 'agents'
        && operation.destinationPath === path.join(projectRoot, '.agent', 'skills')
      )),
      'Should remap agents into skills'
    );
    assert.ok(
      plan.operations.some(operation => (
        normalizedRelativePath(operation.sourceRelativePath) === 'rules/common/coding-style.md'
        && operation.destinationPath === path.join(projectRoot, '.agent', 'rules', 'common-coding-style.md')
      )),
      'Should flatten common rules for antigravity'
    );
  })) passed++; else failed++;

  if (test('exposes validate and planOperations on adapters', () => {
    const claudeAdapter = getInstallTargetAdapter('claude');
    const cursorAdapter = getInstallTargetAdapter('cursor');

    assert.strictEqual(typeof claudeAdapter.planOperations, 'function');
    assert.strictEqual(typeof claudeAdapter.validate, 'function');
    assert.deepStrictEqual(
      claudeAdapter.validate({ homeDir: '/Users/example', repoRoot: '/repo/ecc' }),
      []
    );

    assert.strictEqual(typeof cursorAdapter.planOperations, 'function');
    assert.strictEqual(typeof cursorAdapter.validate, 'function');
    assert.deepStrictEqual(
      cursorAdapter.validate({ projectRoot: '/workspace/app', repoRoot: '/repo/ecc' }),
      []
    );
  })) passed++; else failed++;

  if (test('throws on unknown target adapter', () => {
    assert.throws(
      () => getInstallTargetAdapter('ghost-target'),
      /Unknown install target adapter/
    );
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
