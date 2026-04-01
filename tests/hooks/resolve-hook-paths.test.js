/**
 * Tests for ${CLAUDE_PLUGIN_ROOT} resolution at install time and repair.
 *
 * Verifies:
 *  1. resolvePluginRootInHooks() replaces ${CLAUDE_PLUGIN_ROOT} with the resolved path
 *  2. repair-hooks.js correctly repairs an existing installation
 *  3. hooks.json template contains placeholders (installer resolves them at install time)
 *
 * Run with: node tests/hooks/resolve-hook-paths.test.js
 *
 * Fixes: https://github.com/affaan-m/everything-claude-code/issues/547
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const APPLY_JS = path.join(REPO_ROOT, 'scripts', 'lib', 'install', 'apply.js');
const REPAIR_JS = path.join(REPO_ROOT, 'scripts', 'repair-hooks.js');
const HOOKS_JSON = path.join(REPO_ROOT, 'hooks', 'hooks.json');
const PLACEHOLDER = '${CLAUDE_PLUGIN_ROOT}';

const { resolvePluginRootInHooks } = require(APPLY_JS);

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-hook-path-test-'));
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
}

// ─── Helper: build a hooks object with a placeholder command ────────────────

function hooksWithPlaceholder(extra) {
  const base = {
    PreToolUse: [
      {
        matcher: 'Bash',
        hooks: [
          {
            type: 'command',
            command: `node "${PLACEHOLDER}/scripts/hooks/run-with-flags.js" "test:hook" "scripts/hooks/test.js" "standard"`,
          },
        ],
        id: 'test:hook',
      },
    ],
    Stop: [
      {
        matcher: '*',
        hooks: [
          {
            type: 'command',
            // Already-resolved inline bootstrap (no placeholder) — should be unchanged
            command: 'node -e "require(\'./scripts/hooks/run-with-flags.js\')"',
          },
        ],
        id: 'test:stop',
      },
    ],
  };
  if (extra) {
    base.PreToolUse.push(extra);
  }
  return base;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

function runTests() {
  console.log('\n=== Testing ${CLAUDE_PLUGIN_ROOT} resolution at install time ===\n');

  let passed = 0;
  let failed = 0;

  // ── 1. Placeholder replaced in hook commands ──────────────────────────────

  if (test('resolvePluginRootInHooks replaces ${CLAUDE_PLUGIN_ROOT} in PreToolUse hooks', () => {
    const root = '/resolved/ecc/root';
    const resolved = resolvePluginRootInHooks(hooksWithPlaceholder(), root);
    const raw = JSON.stringify(resolved);
    assert.ok(!raw.includes(PLACEHOLDER),
      `Result must not contain "${PLACEHOLDER}"`);
  })) passed++; else failed++;

  // ── 2. Placeholder replaced with the supplied root ────────────────────────

  if (test('resolvePluginRootInHooks inserts the actual root path', () => {
    const root = '/my/custom/root';
    const resolved = resolvePluginRootInHooks(hooksWithPlaceholder(), root);
    const cmd = resolved.PreToolUse[0].hooks[0].command;
    assert.ok(cmd.includes(root),
      `command "${cmd}" should contain "${root}"`);
  })) passed++; else failed++;

  // ── 3. Stop hooks with no placeholder are left untouched ─────────────────

  if (test('resolvePluginRootInHooks leaves commands without placeholder unchanged', () => {
    const root = '/some/root';
    const original = hooksWithPlaceholder();
    const originalStopCmd = original.Stop[0].hooks[0].command;
    const resolved = resolvePluginRootInHooks(original, root);
    assert.strictEqual(
      resolved.Stop[0].hooks[0].command,
      originalStopCmd,
      'Stop hook command with no placeholder must not be modified'
    );
  })) passed++; else failed++;

  // ── 4. Commands without placeholder are not modified ─────────────────────

  if (test('resolvePluginRootInHooks does not modify plain commands (no placeholder)', () => {
    const plainCommand = 'npx block-no-verify@1.1.2';
    const hooks = hooksWithPlaceholder({
      matcher: 'Write',
      hooks: [{ type: 'command', command: plainCommand }],
      id: 'test:extra',
    });
    const resolved = resolvePluginRootInHooks(hooks, '/some/root');
    const extra = resolved.PreToolUse.find(e => e.id === 'test:extra');
    assert.ok(extra, 'extra entry should exist');
    assert.strictEqual(extra.hooks[0].command, plainCommand);
  })) passed++; else failed++;

  // ── 5. Handles null/undefined/non-object input gracefully ─────────────────

  if (test('resolvePluginRootInHooks returns input unchanged for null hooks', () => {
    assert.strictEqual(resolvePluginRootInHooks(null, '/root'), null);
    assert.strictEqual(resolvePluginRootInHooks(undefined, '/root'), undefined);
  })) passed++; else failed++;

  // ── 6. Handles event entries that are not arrays ──────────────────────────

  if (test('resolvePluginRootInHooks handles non-array event entries gracefully', () => {
    const hooks = { SomeEvent: 'not-an-array' };
    const resolved = resolvePluginRootInHooks(hooks, '/root');
    assert.strictEqual(resolved.SomeEvent, 'not-an-array');
  })) passed++; else failed++;

  // ── 7. Resolves multiple placeholders in one command string ───────────────

  if (test('resolvePluginRootInHooks replaces all placeholder occurrences in a command', () => {
    const root = '/ecc';
    const hooks = {
      PreToolUse: [
        {
          matcher: '*',
          hooks: [
            {
              type: 'command',
              command: `node "${PLACEHOLDER}/a.js" "${PLACEHOLDER}/b.js"`,
            },
          ],
          id: 'test:multi',
        },
      ],
    };
    const resolved = resolvePluginRootInHooks(hooks, root);
    const cmd = resolved.PreToolUse[0].hooks[0].command;
    assert.ok(!cmd.includes(PLACEHOLDER));
    assert.strictEqual(cmd, `node "${root}/a.js" "${root}/b.js"`);
  })) passed++; else failed++;

  // ── 8. hooks.json template keeps placeholders (installer resolves them) ───

  if (test('hooks/hooks.json template contains ${CLAUDE_PLUGIN_ROOT} placeholders', () => {
    assert.ok(fs.existsSync(HOOKS_JSON), `hooks.json not found at ${HOOKS_JSON}`);
    const raw = fs.readFileSync(HOOKS_JSON, 'utf8');
    assert.ok(
      raw.includes(PLACEHOLDER),
      'Template hooks.json should keep placeholders so the installer can resolve them at install time'
    );
  })) passed++; else failed++;

  // ── 9. repair-hooks.js replaces placeholder in existing settings.json ─────

  if (test('repair-hooks.js replaces ${CLAUDE_PLUGIN_ROOT} in existing settings.json', () => {
    const dir = createTempDir();
    try {
      const settingsPath = path.join(dir, 'settings.json');
      const fakeRoot = '/fake/ecc/root';
      const settings = {
        hooks: {
          PreToolUse: [
            {
              matcher: 'Bash',
              hooks: [
                {
                  type: 'command',
                  command: `node "${PLACEHOLDER}/scripts/hooks/run-with-flags.js" "test" "test.js" "standard"`,
                },
              ],
              id: 'test:repair',
            },
          ],
        },
      };
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

      execFileSync(process.execPath, [REPAIR_JS, '--settings', settingsPath], {
        encoding: 'utf8',
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: fakeRoot },
      });

      const repaired = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const raw = JSON.stringify(repaired);
      assert.ok(!raw.includes(PLACEHOLDER), 'After repair, placeholder should be gone');
      assert.ok(raw.includes(fakeRoot), 'After repair, fakeRoot should appear in commands');
    } finally {
      cleanup(dir);
    }
  })) passed++; else failed++;

  // ── 10. repair-hooks.js --dry-run does not write changes ──────────────────

  if (test('repair-hooks.js --dry-run does not write changes', () => {
    const dir = createTempDir();
    try {
      const settingsPath = path.join(dir, 'settings.json');
      const original = JSON.stringify({
        hooks: {
          PreToolUse: [
            {
              matcher: 'Bash',
              hooks: [
                {
                  type: 'command',
                  command: `node "${PLACEHOLDER}/scripts/hooks/run-with-flags.js" "test" "test.js"`,
                },
              ],
              id: 'test:dryrun',
            },
          ],
        },
      }, null, 2);

      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(settingsPath, original, 'utf8');

      execFileSync(process.execPath, [REPAIR_JS, '--dry-run', '--settings', settingsPath], {
        encoding: 'utf8',
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: '/some/root' },
      });

      const after = fs.readFileSync(settingsPath, 'utf8');
      assert.strictEqual(after, original, 'settings.json must not change in dry-run mode');
    } finally {
      cleanup(dir);
    }
  })) passed++; else failed++;

  // ── 11. repair-hooks.js exits cleanly when no placeholders exist ──────────

  if (test('repair-hooks.js exits cleanly when no placeholders found', () => {
    const dir = createTempDir();
    try {
      const settingsPath = path.join(dir, 'settings.json');
      const alreadyFixed = {
        hooks: {
          PreToolUse: [
            {
              matcher: 'Bash',
              hooks: [{ type: 'command', command: 'node /resolved/path/run-with-flags.js' }],
              id: 'test:noop',
            },
          ],
        },
      };
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(settingsPath, JSON.stringify(alreadyFixed, null, 2), 'utf8');

      // Should exit 0 without error
      execFileSync(process.execPath, [REPAIR_JS, '--settings', settingsPath], {
        encoding: 'utf8',
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: '/some/root' },
      });
    } finally {
      cleanup(dir);
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
