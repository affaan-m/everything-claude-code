/**
 * Tests for scripts/harness-audit.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'harness-audit.js');
const { findPluginInstall, compareVersionDesc } = require(SCRIPT);

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

  if (test('compareVersionDesc orders numeric version components correctly', () => {
    // Lexicographic sort would put 1.8.0 before 1.10.0; the semver-aware
    // comparator must put 1.10.0 first.
    assert.ok(compareVersionDesc('1.10.0', '1.8.0') < 0, '1.10.0 should sort before 1.8.0');
    assert.ok(compareVersionDesc('1.8.0', '1.10.0') > 0, '1.8.0 should sort after 1.10.0');
    assert.strictEqual(compareVersionDesc('1.10.0', '1.10.0'), 0);

    const ordered = ['1.8.0', '1.10.0', '1.9.0', '2.0.0'].sort(compareVersionDesc);
    assert.deepStrictEqual(ordered, ['2.0.0', '1.10.0', '1.9.0', '1.8.0']);

    // Non-numeric / missing components collapse to 0 at that position and the
    // comparator must not throw.
    assert.doesNotThrow(() => compareVersionDesc('1.0.0-beta', '1.0.0'));
    assert.doesNotThrow(() => compareVersionDesc('1', '1.0.0'));
  })) passed++; else failed++;

  if (test('findPluginInstall prefers the newest version in the cache layout', () => {
    const homeDir = createTempDir('harness-audit-home-');

    try {
      const pluginRoot = path.join(homeDir, '.claude', 'plugins', 'cache', 'everything-claude-code', 'ecc');
      // Put a valid plugin.json in BOTH versioned directories. This is the
      // only setup that can actually detect a reversed or lexicographic sort
      // order — if iteration picks the wrong directory, the returned path
      // will contain "1.8.0" instead of "1.10.0".
      fs.mkdirSync(path.join(pluginRoot, '1.8.0', '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(pluginRoot, '1.8.0', '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.8.0' }, null, 2)
      );
      fs.mkdirSync(path.join(pluginRoot, '1.10.0', '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(pluginRoot, '1.10.0', '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.10.0' }, null, 2)
      );

      // Call findPluginInstall directly so we can assert which path it
      // returns. We point rootDir at a throwaway project directory that does
      // NOT have its own .claude/plugins, so the lookup is forced to fall
      // through to the user-scope HOME. process.env.HOME is temporarily
      // redirected at the function call to make the lookup hermetic.
      const projectRoot = createTempDir('harness-audit-project-');
      const originalHome = process.env.HOME;
      process.env.HOME = homeDir;
      let found;
      try {
        found = findPluginInstall(projectRoot);
      } finally {
        if (originalHome === undefined) {
          delete process.env.HOME;
        } else {
          process.env.HOME = originalHome;
        }
        cleanup(projectRoot);
      }

      assert.ok(found, 'findPluginInstall should return a path when either version is valid');
      assert.ok(
        found.includes(`${path.sep}1.10.0${path.sep}`),
        `findPluginInstall should prefer 1.10.0 over 1.8.0, got: ${found}`
      );
      assert.ok(
        !found.includes(`${path.sep}1.8.0${path.sep}`),
        `findPluginInstall should not return the older 1.8.0 path, got: ${found}`
      );
    } finally {
      cleanup(homeDir);
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

  // --- Tier 1 (installed_plugins.json) robustness ---
  //
  // These tests protect the manifest-driven lookup against malformed external
  // data and relative-path installPaths, per the defensive-programming
  // coding guideline ("Never trust external data").

  if (test('findPluginInstall does not crash on malformed installPath types', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');
    const installRoot = path.join(homeDir, '.claude', 'plugins', 'cache', 'everything-claude-code', 'ecc', '1.10.0');

    try {
      // A real, valid install alongside a manifest that contains several
      // malformed entries. The lookup should skip the bad entries without
      // throwing and fall back to the cache-layout tier or the valid entry.
      fs.mkdirSync(path.join(installRoot, '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(installRoot, '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.10.0' }, null, 2)
      );

      fs.writeFileSync(
        path.join(homeDir, '.claude', 'plugins', 'installed_plugins.json'),
        JSON.stringify(
          {
            plugins: {
              'ecc@everything-claude-code': [
                // Malformed entries that previously would have thrown out of
                // path.join when the function only checked for truthiness.
                null,
                { installPath: null },
                { installPath: 42 },
                { installPath: { nested: 'object' } },
                { installPath: '   ' },
                { installPath: '' },
                // Finally, one valid absolute entry.
                { installPath: installRoot },
              ],
            },
          },
          null,
          2
        )
      );

      // Direct call so we can assert no throw.
      let found;
      const originalHome = process.env.HOME;
      process.env.HOME = homeDir;
      try {
        assert.doesNotThrow(() => {
          found = findPluginInstall(projectRoot);
        });
      } finally {
        if (originalHome === undefined) {
          delete process.env.HOME;
        } else {
          process.env.HOME = originalHome;
        }
      }

      assert.ok(found, 'lookup should still find the valid entry after skipping malformed ones');
      assert.ok(
        found.includes(`${path.sep}1.10.0${path.sep}`),
        `lookup should return the valid 1.10.0 install, got: ${found}`
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('findPluginInstall resolves relative installPath against the manifest directory', () => {
    const homeDir = createTempDir('harness-audit-home-');
    const projectRoot = createTempDir('harness-audit-project-');

    try {
      // Place the install directory next to installed_plugins.json and
      // reference it with a relative path. Before the fix, `path.join` would
      // interpret "./ecc-local/1.10.0" as CWD-relative rather than
      // manifest-relative, and the lookup would silently miss it.
      const pluginsDir = path.join(homeDir, '.claude', 'plugins');
      fs.mkdirSync(pluginsDir, { recursive: true });

      const relativeInstallRoot = path.join(pluginsDir, 'ecc-local', '1.10.0');
      fs.mkdirSync(path.join(relativeInstallRoot, '.claude-plugin'), { recursive: true });
      fs.writeFileSync(
        path.join(relativeInstallRoot, '.claude-plugin', 'plugin.json'),
        JSON.stringify({ name: 'ecc', version: '1.10.0' }, null, 2)
      );

      fs.writeFileSync(
        path.join(pluginsDir, 'installed_plugins.json'),
        JSON.stringify(
          {
            plugins: {
              'ecc@everything-claude-code': [
                { installPath: path.join('ecc-local', '1.10.0') },
              ],
            },
          },
          null,
          2
        )
      );

      // Intentionally run from a CWD that cannot resolve the relative path
      // correctly on its own — projectRoot has nothing named "ecc-local".
      // If the lookup resolved against CWD, it would fail; resolving against
      // the manifest's directory is the only way to succeed.
      const originalHome = process.env.HOME;
      const originalCwd = process.cwd();
      process.env.HOME = homeDir;
      process.chdir(projectRoot);
      let found;
      try {
        found = findPluginInstall(projectRoot);
      } finally {
        process.chdir(originalCwd);
        if (originalHome === undefined) {
          delete process.env.HOME;
        } else {
          process.env.HOME = originalHome;
        }
      }

      assert.ok(found, 'relative installPath should resolve against the manifest directory');
      assert.ok(
        found.includes(`ecc-local${path.sep}1.10.0`),
        `lookup should land inside the manifest-relative install, got: ${found}`
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
