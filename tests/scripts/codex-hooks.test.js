/**
 * Tests for Codex shell helpers.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..', '..');
const installScript = path.join(repoRoot, 'scripts', 'codex', 'install-global-git-hooks.sh');
const syncScript = path.join(repoRoot, 'scripts', 'sync-ecc-to-codex.sh');

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

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function runBash(scriptPath, args = [], env = {}, cwd = repoRoot) {
  return spawnSync('bash', [scriptPath, ...args], {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function makeHermeticCodexEnv(homeDir, codexDir, extraEnv = {}) {
  const agentsHome = path.join(homeDir, '.agents');
  const hooksDir = path.join(codexDir, 'git-hooks');
  return {
    HOME: homeDir,
    USERPROFILE: homeDir,
    XDG_CONFIG_HOME: path.join(homeDir, '.config'),
    GIT_CONFIG_GLOBAL: path.join(homeDir, '.gitconfig'),
    CODEX_HOME: codexDir,
    AGENTS_HOME: agentsHome,
    ECC_GLOBAL_HOOKS_DIR: hooksDir,
    CLAUDE_PACKAGE_MANAGER: 'npm',
    CLAUDE_CODE_PACKAGE_MANAGER: 'npm',
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    ...extraEnv,
  };
}

let passed = 0;
let failed = 0;

// Windows NTFS does not allow double-quote characters in file paths,
// so the quoted-path shell-injection test is only meaningful on Unix.
if (os.platform() === 'win32') {
  console.log('  - install-global-git-hooks.sh quoted paths (skipped on Windows)');
} else if (
  test('install-global-git-hooks.sh handles quoted hook paths without shell injection', () => {
    const homeDir = createTempDir('codex-hooks-home-');
    const weirdHooksDir = path.join(homeDir, 'git-hooks "quoted"');

    try {
      const result = runBash(installScript, [], {
        HOME: homeDir,
        ECC_GLOBAL_HOOKS_DIR: weirdHooksDir,
      });

      assert.strictEqual(result.status, 0, result.stderr || result.stdout);
      assert.ok(fs.existsSync(path.join(weirdHooksDir, 'pre-commit')));
      assert.ok(fs.existsSync(path.join(weirdHooksDir, 'pre-push')));
    } finally {
      cleanup(homeDir);
    }
  })
)
  passed++;
else failed++;

if (
  test('sync installs the missing Codex baseline and accepts the legacy context7 MCP section', () => {
    const homeDir = createTempDir('codex-sync-home-');
    const codexDir = path.join(homeDir, '.codex');
    const configPath = path.join(codexDir, 'config.toml');
    const agentsPath = path.join(codexDir, 'AGENTS.md');
    const config = [
      'multi_agent = true',
      'persistent_instructions = ""',
      '',
      '[mcp_servers.context7]',
      'command = "npx"',
      'args = ["-y", "@upstash/context7-mcp"]',
      '',
      '[mcp_servers.github]',
      'command = "npx"',
      'args = ["-y", "@modelcontextprotocol/server-github"]',
      '',
      '[mcp_servers.memory]',
      'command = "npx"',
      'args = ["-y", "@modelcontextprotocol/server-memory"]',
      '',
      '[mcp_servers.sequential-thinking]',
      'command = "npx"',
      'args = ["-y", "@modelcontextprotocol/server-sequential-thinking"]',
      '',
    ].join('\n');

    try {
      fs.mkdirSync(codexDir, { recursive: true });
      fs.writeFileSync(configPath, config);

      const syncResult = runBash(syncScript, ['--update-mcp'], makeHermeticCodexEnv(homeDir, codexDir));
      assert.strictEqual(syncResult.status, 0, `${syncResult.stdout}\n${syncResult.stderr}`);

      const syncedAgents = fs.readFileSync(agentsPath, 'utf8');
      assert.match(syncedAgents, /^# Everything Claude Code \(ECC\) — Agent Instructions/m);
      assert.match(syncedAgents, /^# Codex Supplement \(From ECC \.codex\/AGENTS\.md\)/m);

      const syncedConfig = fs.readFileSync(configPath, 'utf8');
      assert.match(syncedConfig, /^approval_policy\s*=\s*"on-request"$/m);
      assert.match(syncedConfig, /^sandbox_mode\s*=\s*"workspace-write"$/m);
      assert.match(syncedConfig, /^web_search\s*=\s*"live"$/m);
      assert.match(syncedConfig, /^\[features\]$/m);
      assert.match(syncedConfig, /^\s*multi_agent\s*=\s*true$/m);
      assert.match(syncedConfig, /^\[profiles\.strict\]$/m);
      assert.match(syncedConfig, /^\[profiles\.yolo\]$/m);
      assert.match(syncedConfig, /^\[agents\]$/m);
      assert.match(syncedConfig, /^\[agents\.explorer\]$/m);
      assert.match(syncedConfig, /^\[agents\.reviewer\]$/m);
      assert.match(syncedConfig, /^\[agents\.docs_researcher\]$/m);
      assert.match(syncedConfig, /^\[mcp_servers\.exa\]$/m);
      assert.match(syncedConfig, /^\[mcp_servers\.github\]$/m);
      assert.match(syncedConfig, /^\[mcp_servers\.memory\]$/m);
      assert.match(syncedConfig, /^\[mcp_servers\.sequential-thinking\]$/m);
      assert.match(syncedConfig, /^\[mcp_servers\.context7\]$/m);

      for (const roleFile of ['explorer.toml', 'reviewer.toml', 'docs-researcher.toml']) {
        assert.ok(fs.existsSync(path.join(codexDir, 'agents', roleFile)));
      }
    } finally {
      cleanup(homeDir);
    }
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
