/**
 * Tests for scripts/harness-audit.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'harness-audit.js');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function run(args = [], options = {}) {
  const stdout = execFileSync('node', [SCRIPT, ...args], {
    cwd: options.cwd || path.join(__dirname, '..', '..'),
    env: {
      ...process.env,
      HOME: options.homeDir || process.env.HOME,
    },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 10000,
  });

  return stdout;
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
  console.log('\n=== Testing harness-audit.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('json output is deterministic between runs', () => {
    const first = run(['repo', '--format', 'json']);
    const second = run(['repo', '--format', 'json']);

    assert.strictEqual(first, second);
  })) passed++; else failed++;

  if (test('report includes bounded scores and fixed categories', () => {
    const parsed = JSON.parse(run(['repo', '--format', 'json']));

    assert.strictEqual(parsed.deterministic, true);
    assert.strictEqual(parsed.rubric_version, '2026-03-30');
    assert.strictEqual(parsed.target_mode, 'repo');
    assert.ok(parsed.overall_score >= 0);
    assert.ok(parsed.max_score > 0);
    assert.ok(parsed.overall_score <= parsed.max_score);

    const categoryNames = Object.keys(parsed.categories);
    assert.ok(categoryNames.includes('Tool Coverage'));
    assert.ok(categoryNames.includes('Context Efficiency'));
    assert.ok(categoryNames.includes('Quality Gates'));
    assert.ok(categoryNames.includes('Memory Persistence'));
    assert.ok(categoryNames.includes('Eval Coverage'));
    assert.ok(categoryNames.includes('Security Guardrails'));
    assert.ok(categoryNames.includes('Cost Efficiency'));
  })) passed++; else failed++;

  if (test('scope filtering changes max score and check list', () => {
    const full = JSON.parse(run(['repo', '--format', 'json']));
    const scoped = JSON.parse(run(['hooks', '--format', 'json']));

    assert.strictEqual(scoped.scope, 'hooks');
    assert.ok(scoped.max_score < full.max_score);
    assert.ok(scoped.checks.length < full.checks.length);
    assert.ok(scoped.checks.every(check => check.path.includes('hooks') || check.path.includes('scripts/hooks')));
  })) passed++; else failed++;

  if (test('text format includes summary header', () => {
    const output = run(['repo']);
    assert.ok(output.includes('Harness Audit (repo, repo):'));
    assert.ok(output.includes('Top 3 Actions:') || output.includes('Checks:'));
  })) passed++; else failed++;

  if (test('audits consumer projects from cwd instead of the ECC repo root', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');

    try {
      fs.mkdirSync(path.join(homeDir, '.claude', 'plugins', 'ecc', '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(homeDir, '.claude', 'plugins', 'ecc', '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc' }, null, 2)
      );

      fs.mkdirSync(path.join(projectRoot, '.github', 'workflows'), { recursive: true });
      fs.mkdirSync(path.join(projectRoot, 'tests'), { recursive: true });
      fs.mkdirSync(path.join(projectRoot, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(projectRoot, 'AGENTS.md'), '# Project instructions\n');
      fs.writeFileSync(path.join(projectRoot, '.mcp.json'), JSON.stringify({ mcpServers: {} }, null, 2));
      fs.writeFileSync(path.join(projectRoot, '.gitignore'), 'node_modules\n.env\n');
      fs.writeFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'name: ci\n');
      fs.writeFileSync(path.join(projectRoot, 'tests', 'app.test.js'), 'test placeholder\n');
      fs.writeFileSync(path.join(projectRoot, '.claude', 'settings.json'), JSON.stringify({ hooks: ['PreToolUse'] }, null, 2));
      fs.writeFileSync(
        path.join(projectRoot, 'package.json'),
        JSON.stringify({ name: 'consumer-project', scripts: { test: 'node tests/app.test.js' } }, null, 2)
      );

      const parsed = JSON.parse(run(['repo', '--format', 'json'], { cwd: projectRoot, homeDir }));

      assert.strictEqual(parsed.target_mode, 'consumer');
      assert.strictEqual(parsed.root_dir, fs.realpathSync(projectRoot));
      assert.ok(parsed.overall_score > 0, 'Consumer project should receive non-zero score when harness signals exist');
      assert.ok(parsed.checks.some(check => check.id === 'consumer-plugin-install' && check.pass));
      assert.ok(parsed.checks.every(check => !check.path.startsWith('agents/') && !check.path.startsWith('skills/')));
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  // --- findPluginInstall lookup paths ---
  //
  // These tests fix a gap where consumer-plugin-install only passed when the
  // plugin lived at the legacy flat path ~/.claude/plugins/<pluginDir>/. The
  // lookup now also supports the authoritative installed_plugins.json manifest
  // and the marketplace cache layout (cache/<marketplace>/<plugin>/<version>/)
  // produced by `claude plugin install ecc@everything-claude-code` on v1.9.0+.

  // Minimal consumer-project scaffold reused by the plugin-install tests. We
  // only need it to satisfy enough consumer checks for the audit to run and
  // surface the consumer-plugin-install check result.
  function writeConsumerProject(projectRoot) {
    fs.mkdirSync(path.join(projectRoot, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'AGENTS.md'), '# Project instructions\n');
    fs.writeFileSync(path.join(projectRoot, '.gitignore'), '.env\n');
    fs.writeFileSync(
      path.join(projectRoot, '.claude', 'settings.json'),
      JSON.stringify({ hooks: ['PreToolUse'] }, null, 2)
    );
    fs.writeFileSync(
      path.join(projectRoot, 'package.json'),
      JSON.stringify({ name: 'consumer-project' }, null, 2)
    );
  }

  function findCheck(parsed, id) {
    return parsed.checks.find((check) => check.id === id);
  }

  if (test('findPluginInstall passes when installed_plugins.json points to the install', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');
    const installRoot = path.join(homeDir, '.claude', 'plugins', 'cache', 'everything-claude-code', 'ecc', '1.10.0');

    try {
      // Real plugin install on disk, with a non-flat layout.
      fs.mkdirSync(path.join(installRoot, '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(installRoot, '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.10.0' }, null, 2)
      );

      // installed_plugins.json manifest that points at the install.
      fs.writeFileSync(
        path.join(homeDir, '.claude', 'plugins', 'installed_plugins.json'),
        JSON.stringify(
          {
            plugins: {
              'ecc@everything-claude-code': [
                { version: '1.10.0', installPath: installRoot },
              ],
            },
          },
          null,
          2
        )
      );

      writeConsumerProject(projectRoot);
      const parsed = JSON.parse(run(['repo', '--format', 'json'], { cwd: projectRoot, homeDir }));

      const check = findCheck(parsed, 'consumer-plugin-install');
      assert.ok(check, 'consumer-plugin-install check should exist');
      assert.strictEqual(check.pass, true, 'consumer-plugin-install should pass when installed_plugins.json references the install');
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('findPluginInstall passes via the marketplace cache layout', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');

    try {
      // Marketplace install path without an installed_plugins.json manifest.
      const installRoot = path.join(homeDir, '.claude', 'plugins', 'cache', 'everything-claude-code', 'ecc', '1.10.0');
      fs.mkdirSync(path.join(installRoot, '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(installRoot, '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.10.0' }, null, 2)
      );

      writeConsumerProject(projectRoot);
      const parsed = JSON.parse(run(['repo', '--format', 'json'], { cwd: projectRoot, homeDir }));

      const check = findCheck(parsed, 'consumer-plugin-install');
      assert.ok(check, 'consumer-plugin-install check should exist');
      assert.strictEqual(check.pass, true, 'consumer-plugin-install should pass with cache/<marketplace>/<plugin>/<version>/ layout');
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('findPluginInstall prefers the newest version in the cache layout', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');

    try {
      const pluginRoot = path.join(homeDir, '.claude', 'plugins', 'cache', 'everything-claude-code', 'ecc');
      // Only the newer version has a plugin.json — the older dir is empty and
      // must not shadow it. This guards the version sort order in the lookup.
      fs.mkdirSync(path.join(pluginRoot, '1.8.0'), { recursive: true });
      fs.mkdirSync(path.join(pluginRoot, '1.10.0', '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(pluginRoot, '1.10.0', '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.10.0' }, null, 2)
      );

      writeConsumerProject(projectRoot);
      const parsed = JSON.parse(run(['repo', '--format', 'json'], { cwd: projectRoot, homeDir }));

      const check = findCheck(parsed, 'consumer-plugin-install');
      assert.strictEqual(check.pass, true, 'consumer-plugin-install should still pass when an older sibling version has no plugin.json');
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('findPluginInstall fails cleanly when no install is present', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');

    try {
      // HOME has .claude/plugins but no plugin install anywhere.
      fs.mkdirSync(path.join(homeDir, '.claude', 'plugins'), { recursive: true });

      writeConsumerProject(projectRoot);
      const parsed = JSON.parse(run(['repo', '--format', 'json'], { cwd: projectRoot, homeDir }));

      const check = findCheck(parsed, 'consumer-plugin-install');
      assert.ok(check, 'consumer-plugin-install check should exist');
      assert.strictEqual(check.pass, false, 'consumer-plugin-install should fail when no install is reachable');
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
