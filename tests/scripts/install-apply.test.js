/**
 * Tests for scripts/install-apply.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'install-apply.js');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const REPO_ROOT = path.join(__dirname, '..', '..');

function run(args = [], options = {}) {
  const env = {
    ...process.env,
    HOME: options.homeDir || process.env.HOME,
    ...(options.env || {}),
  };

  try {
    const stdout = execFileSync('node', [SCRIPT, ...args], {
      cwd: options.cwd,
      env,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    });

    return { code: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      code: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
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
  console.log('\n=== Testing install-apply.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('shows help with --help', () => {
    const result = run(['--help']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('Usage:'));
    assert.ok(result.stdout.includes('--dry-run'));
    assert.ok(result.stdout.includes('--profile <name>'));
    assert.ok(result.stdout.includes('--modules <id,id,...>'));
  })) passed++; else failed++;

  if (test('rejects mixing legacy languages with manifest profile flags', () => {
    const result = run(['--profile', 'core', 'typescript']);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes('cannot be combined'));
  })) passed++; else failed++;

  if (test('installs Claude rules and writes install-state', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['typescript'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      const claudeRoot = path.join(homeDir, '.claude');
      assert.ok(fs.existsSync(path.join(claudeRoot, 'rules', 'common', 'coding-style.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'rules', 'typescript', 'testing.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'commands', 'plan.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'scripts', 'hooks', 'session-end.js')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'scripts', 'lib', 'utils.js')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'skills', 'tdd-workflow', 'SKILL.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'skills', 'coding-standards', 'SKILL.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'plugin.json')));

      const statePath = path.join(homeDir, '.claude', 'ecc', 'install-state.json');
      const state = readJson(statePath);
      assert.strictEqual(state.target.id, 'claude-home');
      assert.deepStrictEqual(state.request.legacyLanguages, ['typescript']);
      assert.strictEqual(state.request.legacyMode, true);
      assert.deepStrictEqual(state.request.modules, []);
      assert.ok(state.resolution.selectedModules.includes('rules-core'));
      assert.ok(state.resolution.selectedModules.includes('framework-language'));
      assert.ok(
        state.operations.some(operation => (
          operation.destinationPath === path.join(claudeRoot, 'rules', 'common', 'coding-style.md')
        )),
        'Should record common rule file operation'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('installs Cursor configs and writes install-state', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--target', 'cursor', 'typescript'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'rules', 'common-coding-style.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'rules', 'typescript-testing.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'agents', 'architect.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'commands', 'plan.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'hooks.json')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'hooks', 'session-start.js')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'scripts', 'lib', 'utils.js')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'skills', 'tdd-workflow', 'SKILL.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'skills', 'coding-standards', 'SKILL.md')));

      const statePath = path.join(projectDir, '.cursor', 'ecc-install-state.json');
      const state = readJson(statePath);
      const normalizedProjectDir = fs.realpathSync(projectDir);
      assert.strictEqual(state.target.id, 'cursor-project');
      assert.strictEqual(state.target.root, path.join(normalizedProjectDir, '.cursor'));
      assert.deepStrictEqual(state.request.legacyLanguages, ['typescript']);
      assert.strictEqual(state.request.legacyMode, true);
      assert.ok(state.resolution.selectedModules.includes('framework-language'));
      assert.ok(
        state.operations.some(operation => (
          operation.destinationPath === path.join(normalizedProjectDir, '.cursor', 'commands', 'plan.md')
        )),
        'Should record manifest command file copy operation'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('installs Antigravity configs and writes install-state', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--target', 'antigravity', 'typescript'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'rules', 'common-coding-style.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'rules', 'typescript-testing.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'workflows', 'plan.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'skills', 'architect.md')));

      const statePath = path.join(projectDir, '.agent', 'ecc-install-state.json');
      const state = readJson(statePath);
      assert.strictEqual(state.target.id, 'antigravity-project');
      assert.deepStrictEqual(state.request.legacyLanguages, ['typescript']);
      assert.strictEqual(state.request.legacyMode, true);
      assert.deepStrictEqual(state.resolution.selectedModules, ['rules-core', 'agents-core', 'commands-core']);
      assert.ok(
        state.operations.some(operation => (
          operation.destinationPath.endsWith(path.join('.agent', 'workflows', 'plan.md'))
        )),
        'Should record manifest command file copy operation'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('supports dry-run without mutating the target project', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--target', 'cursor', '--dry-run', 'typescript'], {
        cwd: projectDir,
        homeDir,
      });
      assert.strictEqual(result.code, 0, result.stderr);
      assert.ok(result.stdout.includes('Dry-run install plan'));
      assert.ok(result.stdout.includes('Mode: legacy-compat'));
      assert.ok(result.stdout.includes('Legacy languages: typescript'));
      assert.ok(!fs.existsSync(path.join(projectDir, '.cursor', 'hooks.json')));
      assert.ok(!fs.existsSync(path.join(projectDir, '.cursor', 'ecc-install-state.json')));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('supports manifest profile dry-runs through the installer', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--profile', 'core', '--dry-run'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);
      assert.ok(result.stdout.includes('Mode: manifest'));
      assert.ok(result.stdout.includes('Profile: core'));
      assert.ok(result.stdout.includes('Included components: (none)'));
      assert.ok(result.stdout.includes('Selected modules: rules-core, agents-core, commands-core, hooks-runtime, platform-configs, workflow-quality'));
      assert.ok(!fs.existsSync(path.join(homeDir, '.claude', 'ecc', 'install-state.json')));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('installs manifest profiles and writes non-legacy install-state', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      const claudeRoot = path.join(homeDir, '.claude');
      assert.ok(fs.existsSync(path.join(claudeRoot, 'rules', 'common', 'coding-style.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'agents', 'architect.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'commands', 'plan.md')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'hooks', 'hooks.json')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'scripts', 'hooks', 'session-end.js')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'scripts', 'lib', 'session-manager.js')));
      assert.ok(fs.existsSync(path.join(claudeRoot, 'plugin.json')));

      const state = readJson(path.join(claudeRoot, 'ecc', 'install-state.json'));
      assert.strictEqual(state.request.profile, 'core');
      assert.strictEqual(state.request.legacyMode, false);
      assert.deepStrictEqual(state.request.legacyLanguages, []);
      assert.ok(state.resolution.selectedModules.includes('platform-configs'));
      assert.ok(
        state.operations.some(operation => (
          operation.destinationPath === path.join(claudeRoot, 'commands', 'plan.md')
        )),
        'Should record manifest-driven command file copy'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('installs antigravity manifest profiles while skipping only unsupported modules', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--target', 'antigravity', '--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'rules', 'common-coding-style.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'skills', 'architect.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'workflows', 'plan.md')));
      assert.ok(fs.existsSync(path.join(projectDir, '.agent', 'skills', 'tdd-workflow', 'SKILL.md')));

      const state = readJson(path.join(projectDir, '.agent', 'ecc-install-state.json'));
      assert.strictEqual(state.request.profile, 'core');
      assert.strictEqual(state.request.legacyMode, false);
      assert.deepStrictEqual(
        state.resolution.selectedModules,
        ['rules-core', 'agents-core', 'commands-core', 'platform-configs', 'workflow-quality']
      );
      assert.ok(state.resolution.skippedModules.includes('hooks-runtime'));
      assert.ok(!state.resolution.skippedModules.includes('workflow-quality'));
      assert.ok(!state.resolution.skippedModules.includes('platform-configs'));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('installs explicit modules for cursor using manifest operations', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--target', 'cursor', '--modules', 'platform-configs'], {
        cwd: projectDir,
        homeDir,
      });
      assert.strictEqual(result.code, 0, result.stderr);
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'hooks.json')));
      assert.ok(fs.existsSync(path.join(projectDir, '.cursor', 'rules', 'common-agents.md')));

      const state = readJson(path.join(projectDir, '.cursor', 'ecc-install-state.json'));
      assert.strictEqual(state.request.profile, null);
      assert.deepStrictEqual(state.request.modules, ['platform-configs']);
      assert.deepStrictEqual(state.request.includeComponents, []);
      assert.deepStrictEqual(state.request.excludeComponents, []);
      assert.strictEqual(state.request.legacyMode, false);
      assert.ok(state.resolution.selectedModules.includes('platform-configs'));
      assert.ok(
        !state.operations.some(operation => operation.destinationPath.endsWith('ecc-install-state.json')),
        'Manifest copy operations should not include generated install-state files'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('rejects unknown explicit manifest modules before resolution', () => {
    const result = run(['--modules', 'ghost-module']);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes('Unknown install module: ghost-module'));
  })) passed++; else failed++;

  if (test('merges hooks into settings.json for claude target install', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const result = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      const claudeRoot = path.join(homeDir, '.claude');
      assert.ok(fs.existsSync(path.join(claudeRoot, 'hooks', 'hooks.json')), 'hooks.json should be copied');

      const settingsPath = path.join(claudeRoot, 'settings.json');
      assert.ok(fs.existsSync(settingsPath), 'settings.json should exist after install');

      const settings = readJson(settingsPath);
      assert.ok(settings.hooks, 'settings.json should contain hooks key');
      assert.ok(settings.hooks.PreToolUse, 'hooks should include PreToolUse');
      assert.ok(Array.isArray(settings.hooks.PreToolUse), 'PreToolUse should be an array');
      assert.ok(settings.hooks.PreToolUse.length > 0, 'PreToolUse should have entries');
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('preserves existing settings fields and hook entries when merging hooks', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const claudeRoot = path.join(homeDir, '.claude');
      fs.mkdirSync(claudeRoot, { recursive: true });
      fs.writeFileSync(
        path.join(claudeRoot, 'settings.json'),
        JSON.stringify({
          effortLevel: 'high',
          env: { MY_VAR: '1' },
          hooks: {
            PreToolUse: [{ matcher: 'Write', hooks: [{ type: 'command', command: 'echo custom-pretool' }] }],
            UserPromptSubmit: [{ matcher: '*', hooks: [{ type: 'command', command: 'echo custom-submit' }] }],
          },
        }, null, 2)
      );

      const result = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      const settings = readJson(path.join(claudeRoot, 'settings.json'));
      assert.strictEqual(settings.effortLevel, 'high', 'existing effortLevel should be preserved');
      assert.deepStrictEqual(settings.env, { MY_VAR: '1' }, 'existing env should be preserved');
      assert.ok(settings.hooks, 'hooks should be merged in');
      assert.ok(settings.hooks.PreToolUse, 'PreToolUse hooks should exist');
      assert.ok(
        settings.hooks.PreToolUse.some(entry => JSON.stringify(entry).includes('echo custom-pretool')),
        'existing PreToolUse entries should be preserved'
      );
      assert.ok(settings.hooks.PreToolUse.length > 1, 'ECC PreToolUse hooks should be appended');
      assert.deepStrictEqual(
        settings.hooks.UserPromptSubmit,
        [{ matcher: '*', hooks: [{ type: 'command', command: 'echo custom-submit' }] }],
        'user-defined hook event types should be preserved'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('reinstall does not duplicate managed hook entries', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const firstInstall = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(firstInstall.code, 0, firstInstall.stderr);

      const settingsPath = path.join(homeDir, '.claude', 'settings.json');
      const afterFirstInstall = readJson(settingsPath);
      const preToolUseLength = afterFirstInstall.hooks.PreToolUse.length;

      const secondInstall = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(secondInstall.code, 0, secondInstall.stderr);

      const afterSecondInstall = readJson(settingsPath);
      assert.strictEqual(
        afterSecondInstall.hooks.PreToolUse.length,
        preToolUseLength,
        'managed hook entries should not duplicate on reinstall'
      );
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('fails when existing settings.json is malformed', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const claudeRoot = path.join(homeDir, '.claude');
      fs.mkdirSync(claudeRoot, { recursive: true });
      const settingsPath = path.join(claudeRoot, 'settings.json');
      fs.writeFileSync(settingsPath, '{ invalid json\n');

      const result = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 1);
      assert.ok(result.stderr.includes('Failed to parse existing settings at'));
      assert.strictEqual(fs.readFileSync(settingsPath, 'utf8'), '{ invalid json\n');
      assert.ok(!fs.existsSync(path.join(claudeRoot, 'hooks', 'hooks.json')), 'hooks.json should not be copied on validation failure');
      assert.ok(!fs.existsSync(path.join(claudeRoot, 'ecc', 'install-state.json')), 'install state should not be written on validation failure');
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('fails when existing settings.json root is not an object', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');

    try {
      const claudeRoot = path.join(homeDir, '.claude');
      fs.mkdirSync(claudeRoot, { recursive: true });
      const settingsPath = path.join(claudeRoot, 'settings.json');
      fs.writeFileSync(settingsPath, '[]\n');

      const result = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 1);
      assert.ok(result.stderr.includes('Invalid existing settings at'));
      assert.ok(result.stderr.includes('expected a JSON object'));
      assert.strictEqual(fs.readFileSync(settingsPath, 'utf8'), '[]\n');
      assert.ok(!fs.existsSync(path.join(claudeRoot, 'hooks', 'hooks.json')), 'hooks.json should not be copied on validation failure');
      assert.ok(!fs.existsSync(path.join(claudeRoot, 'ecc', 'install-state.json')), 'install state should not be written on validation failure');
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('fails when source hooks.json root is not an object before copying files', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');
    const sourceHooksPath = path.join(REPO_ROOT, 'hooks', 'hooks.json');
    const originalHooks = fs.readFileSync(sourceHooksPath, 'utf8');

    try {
      fs.writeFileSync(sourceHooksPath, '[]\n');

      const result = run(['--profile', 'core'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 1);
      assert.ok(result.stderr.includes('Invalid hooks config at'));
      assert.ok(result.stderr.includes('expected a JSON object'));

      const claudeRoot = path.join(homeDir, '.claude');
      assert.ok(!fs.existsSync(path.join(claudeRoot, 'hooks', 'hooks.json')), 'hooks.json should not be copied when source hooks are invalid');
      assert.ok(!fs.existsSync(path.join(claudeRoot, 'ecc', 'install-state.json')), 'install state should not be written when source hooks are invalid');
    } finally {
      fs.writeFileSync(sourceHooksPath, originalHooks);
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('installs from ecc-install.json and persists component selections', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');
    const configPath = path.join(projectDir, 'ecc-install.json');

    try {
      fs.writeFileSync(configPath, JSON.stringify({
        version: 1,
        target: 'claude',
        profile: 'developer',
        include: ['capability:security'],
        exclude: ['capability:orchestration'],
      }, null, 2));

      const result = run(['--config', configPath], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      assert.ok(fs.existsSync(path.join(homeDir, '.claude', 'skills', 'security-review', 'SKILL.md')));
      assert.ok(!fs.existsSync(path.join(homeDir, '.claude', 'skills', 'dmux-workflows', 'SKILL.md')));

      const state = readJson(path.join(homeDir, '.claude', 'ecc', 'install-state.json'));
      assert.strictEqual(state.request.profile, 'developer');
      assert.deepStrictEqual(state.request.includeComponents, ['capability:security']);
      assert.deepStrictEqual(state.request.excludeComponents, ['capability:orchestration']);
      assert.ok(state.resolution.selectedModules.includes('security'));
      assert.ok(!state.resolution.selectedModules.includes('orchestration'));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('auto-detects ecc-install.json from the project root', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');
    const configPath = path.join(projectDir, 'ecc-install.json');

    try {
      fs.writeFileSync(configPath, JSON.stringify({
        version: 1,
        target: 'claude',
        profile: 'developer',
        include: ['capability:security'],
        exclude: ['capability:orchestration'],
      }, null, 2));

      const result = run([], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      assert.ok(fs.existsSync(path.join(homeDir, '.claude', 'skills', 'security-review', 'SKILL.md')));
      assert.ok(!fs.existsSync(path.join(homeDir, '.claude', 'skills', 'dmux-workflows', 'SKILL.md')));

      const state = readJson(path.join(homeDir, '.claude', 'ecc', 'install-state.json'));
      assert.strictEqual(state.request.profile, 'developer');
      assert.deepStrictEqual(state.request.includeComponents, ['capability:security']);
      assert.deepStrictEqual(state.request.excludeComponents, ['capability:orchestration']);
      assert.ok(state.resolution.selectedModules.includes('security'));
      assert.ok(!state.resolution.selectedModules.includes('orchestration'));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  if (test('preserves legacy language installs when a project config is present', () => {
    const homeDir = createTempDir('install-apply-home-');
    const projectDir = createTempDir('install-apply-project-');
    const configPath = path.join(projectDir, 'ecc-install.json');

    try {
      fs.writeFileSync(configPath, JSON.stringify({
        version: 1,
        target: 'claude',
        profile: 'developer',
        include: ['capability:security'],
      }, null, 2));

      const result = run(['typescript'], { cwd: projectDir, homeDir });
      assert.strictEqual(result.code, 0, result.stderr);

      const state = readJson(path.join(homeDir, '.claude', 'ecc', 'install-state.json'));
      assert.strictEqual(state.request.legacyMode, true);
      assert.deepStrictEqual(state.request.legacyLanguages, ['typescript']);
      assert.strictEqual(state.request.profile, null);
      assert.deepStrictEqual(state.request.includeComponents, []);
      assert.ok(state.resolution.selectedModules.includes('framework-language'));
      assert.ok(!state.resolution.selectedModules.includes('security'));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
