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
const checkScript = path.join(repoRoot, 'scripts', 'codex', 'check-codex-global-state.sh');

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

let passed = 0;
let failed = 0;

if (
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
  test('sync and global sanity checks accept the legacy context7 MCP section', () => {
    const homeDir = createTempDir('codex-sync-home-');
    const codexDir = path.join(homeDir, '.codex');
    const configPath = path.join(codexDir, 'config.toml');
    const config = [
      'approval_policy = "on-request"',
      'sandbox_mode = "workspace-write"',
      'web_search = "live"',
      'persistent_instructions = ""',
      '',
      '[features]',
      'multi_agent = true',
      '',
      '[profiles.strict]',
      'approval_policy = "on-request"',
      'sandbox_mode = "read-only"',
      'web_search = "cached"',
      '',
      '[profiles.yolo]',
      'approval_policy = "never"',
      'sandbox_mode = "workspace-write"',
      'web_search = "live"',
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

      const syncResult = runBash(syncScript, ['--update-mcp'], { HOME: homeDir, CODEX_HOME: codexDir });
      assert.strictEqual(syncResult.status, 0, `${syncResult.stdout}\n${syncResult.stderr}`);
      const syncedConfig = fs.readFileSync(configPath, 'utf8');
      assert.match(syncedConfig, /^\[mcp_servers\.context7\]$/m);

      const checkResult = runBash(checkScript, [], { HOME: homeDir, CODEX_HOME: codexDir });
      assert.strictEqual(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
      assert.match(checkResult.stdout, /MCP section \[mcp_servers\.context7\] or \[mcp_servers\.context7-mcp\] exists/);
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
