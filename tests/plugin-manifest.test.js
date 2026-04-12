/**
 * Tests for plugin manifests:
 *   - .claude-plugin/plugin.json (Claude Code plugin)
 *   - .codex-plugin/plugin.json (Codex native plugin)
 *   - .mcp.json (MCP server config at plugin root)
 *   - .agents/plugins/marketplace.json (Codex marketplace discovery)
 *
 * Enforces rules from:
 *   - .claude-plugin/PLUGIN_SCHEMA_NOTES.md (Claude Code validator rules)
 *   - https://platform.openai.com/docs/codex/plugins (Codex official docs)
 *
 * Run with: node tests/run-all.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const repoRootWithSep = `${repoRoot}${path.sep}`;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    failed++;
  }
}

function loadJsonObject(filePath, label) {
  assert.ok(fs.existsSync(filePath), `Expected ${label} to exist`);

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    assert.fail(`Expected ${label} to contain valid JSON: ${error.message}`);
  }

  assert.ok(
    parsed && typeof parsed === 'object' && !Array.isArray(parsed),
    `Expected ${label} to contain a JSON object`,
  );

  return parsed;
}

function assertSafeRepoRelativePath(relativePath, label) {
  const normalized = path.posix.normalize(relativePath.replace(/\\/g, '/'));

  assert.ok(!path.isAbsolute(relativePath), `${label} must not be absolute: ${relativePath}`);
  assert.ok(
    !normalized.startsWith('../') && !normalized.includes('/../'),
    `${label} must not traverse directories: ${relativePath}`,
  );
}

// ── Claude plugin manifest ────────────────────────────────────────────────────
console.log('\n=== .claude-plugin/plugin.json ===\n');

const claudePluginPath = path.join(repoRoot, '.claude-plugin', 'plugin.json');
const claudeMarketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');

test('claude plugin.json exists', () => {
  assert.ok(fs.existsSync(claudePluginPath), 'Expected .claude-plugin/plugin.json to exist');
});

const claudePlugin = loadJsonObject(claudePluginPath, '.claude-plugin/plugin.json');

test('claude plugin.json has version field', () => {
  assert.ok(claudePlugin.version, 'Expected version field');
});

test('claude plugin.json uses short plugin slug', () => {
  assert.strictEqual(claudePlugin.name, 'ecc');
});

test('claude plugin.json agents is an array', () => {
  assert.ok(Array.isArray(claudePlugin.agents), 'Expected agents to be an array (not a string/directory)');
});

test('claude plugin.json agents uses explicit file paths (not directories)', () => {
  for (const agentPath of claudePlugin.agents) {
    assertSafeRepoRelativePath(agentPath, 'Agent path');
    assert.ok(
      agentPath.endsWith('.md'),
      `Expected explicit .md file path, got: ${agentPath}`,
    );
    assert.ok(
      !agentPath.endsWith('/'),
      `Expected explicit file path, not directory, got: ${agentPath}`,
    );
  }
});

test('claude plugin.json all agent files exist', () => {
  for (const agentRelPath of claudePlugin.agents) {
    assertSafeRepoRelativePath(agentRelPath, 'Agent path');
    const absolute = path.resolve(repoRoot, agentRelPath);
    assert.ok(
      absolute === repoRoot || absolute.startsWith(repoRootWithSep),
      `Agent path resolves outside repo root: ${agentRelPath}`,
    );
    assert.ok(
      fs.existsSync(absolute),
      `Agent file missing: ${agentRelPath}`,
    );
  }
});

test('claude plugin.json skills is an array', () => {
  assert.ok(Array.isArray(claudePlugin.skills), 'Expected skills to be an array');
});

test('claude plugin.json commands is an array', () => {
  assert.ok(Array.isArray(claudePlugin.commands), 'Expected commands to be an array');
});

test('claude plugin.json does NOT have explicit hooks declaration', () => {
  assert.ok(
    !('hooks' in claudePlugin),
    'hooks field must NOT be declared — Claude Code v2.1+ auto-loads hooks/hooks.json by convention',
  );
});

console.log('\n=== .claude-plugin/marketplace.json ===\n');

test('claude marketplace.json exists', () => {
  assert.ok(fs.existsSync(claudeMarketplacePath), 'Expected .claude-plugin/marketplace.json to exist');
});

const claudeMarketplace = loadJsonObject(claudeMarketplacePath, '.claude-plugin/marketplace.json');

test('claude marketplace.json keeps only Claude-supported top-level keys', () => {
  const unsupportedTopLevelKeys = ['$schema', 'description'];
  for (const key of unsupportedTopLevelKeys) {
    assert.ok(
      !(key in claudeMarketplace),
      `.claude-plugin/marketplace.json must not declare unsupported top-level key "${key}"`,
    );
  }
});

test('claude marketplace.json has plugins array with a short ecc plugin entry', () => {
  assert.ok(Array.isArray(claudeMarketplace.plugins) && claudeMarketplace.plugins.length > 0, 'Expected plugins array');
  assert.strictEqual(claudeMarketplace.name, 'ecc');
  assert.strictEqual(claudeMarketplace.plugins[0].name, 'ecc');
});

// ── .mcp.json at plugin root ──────────────────────────────────────────────────
// Per official docs: keep .mcp.json at plugin root, NOT inside .codex-plugin/
console.log('\n=== .mcp.json (plugin root) ===\n');

const mcpJsonPath = path.join(repoRoot, '.mcp.json');

test('.mcp.json exists at plugin root (not inside .codex-plugin/)', () => {
  assert.ok(fs.existsSync(mcpJsonPath), 'Expected .mcp.json at repo root (plugin root)');
  assert.ok(
    !fs.existsSync(path.join(repoRoot, '.codex-plugin', '.mcp.json')),
    '.mcp.json must NOT be inside .codex-plugin/ — only plugin.json belongs there',
  );
});

const mcpConfig = loadJsonObject(mcpJsonPath, '.mcp.json');

test('.mcp.json has mcpServers object', () => {
  assert.ok(
    mcpConfig.mcpServers && typeof mcpConfig.mcpServers === 'object',
    'Expected mcpServers object',
  );
});

test('.mcp.json includes at least github, context7, and exa servers', () => {
  const servers = Object.keys(mcpConfig.mcpServers);
  assert.ok(servers.includes('github'), 'Expected github MCP server');
  assert.ok(servers.includes('context7'), 'Expected context7 MCP server');
  assert.ok(servers.includes('exa'), 'Expected exa MCP server');
});

test('.mcp.json declares exa as an http MCP server', () => {
  assert.strictEqual(mcpConfig.mcpServers.exa.type, 'http', 'Expected exa MCP server to declare type=http');
  assert.strictEqual(mcpConfig.mcpServers.exa.url, 'https://mcp.exa.ai/mcp', 'Expected exa MCP server URL to remain unchanged');
});


// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
