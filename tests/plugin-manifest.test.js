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
 * Run with: node tests/plugin-manifest.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

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

// ── Claude plugin manifest ────────────────────────────────────────────────────
console.log('\n=== .claude-plugin/plugin.json ===\n');

const claudePluginPath = path.join(repoRoot, '.claude-plugin', 'plugin.json');

test('claude plugin.json exists', () => {
  assert.ok(fs.existsSync(claudePluginPath), 'Expected .claude-plugin/plugin.json to exist');
});

const claudePlugin = JSON.parse(fs.readFileSync(claudePluginPath, 'utf8'));

test('claude plugin.json has version field', () => {
  assert.ok(claudePlugin.version, 'Expected version field');
});

test('claude plugin.json agents is an array', () => {
  assert.ok(Array.isArray(claudePlugin.agents), 'Expected agents to be an array (not a string/directory)');
});

test('claude plugin.json agents uses explicit file paths (not directories)', () => {
  for (const agentPath of claudePlugin.agents) {
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
    const absolute = path.join(repoRoot, agentRelPath.replace(/^\.\//, ''));
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

// ── Codex plugin manifest ─────────────────────────────────────────────────────
// Per official docs: https://platform.openai.com/docs/codex/plugins
// - .codex-plugin/plugin.json is the required manifest
// - skills, mcpServers, apps are STRING paths relative to plugin root (not arrays)
// - .mcp.json must be at plugin root (NOT inside .codex-plugin/)
console.log('\n=== .codex-plugin/plugin.json ===\n');

const codexPluginPath = path.join(repoRoot, '.codex-plugin', 'plugin.json');

test('codex plugin.json exists', () => {
  assert.ok(fs.existsSync(codexPluginPath), 'Expected .codex-plugin/plugin.json to exist');
});

const codexPlugin = JSON.parse(fs.readFileSync(codexPluginPath, 'utf8'));

test('codex plugin.json has name field', () => {
  assert.ok(codexPlugin.name, 'Expected name field');
});

test('codex plugin.json has version field', () => {
  assert.ok(codexPlugin.version, 'Expected version field');
});

test('codex plugin.json skills is a string (not array) per official spec', () => {
  assert.strictEqual(
    typeof codexPlugin.skills,
    'string',
    'skills must be a string path per Codex official docs, not an array',
  );
});

test('codex plugin.json mcpServers is a string path (not array) per official spec', () => {
  assert.strictEqual(
    typeof codexPlugin.mcpServers,
    'string',
    'mcpServers must be a string path per Codex official docs',
  );
});

test('codex plugin.json mcpServers exactly matches "./.mcp.json"', () => {
  assert.strictEqual(
    codexPlugin.mcpServers,
    './.mcp.json',
    'mcpServers must point exactly to "./.mcp.json" per official docs',
  );
  const mcpPath = path.join(repoRoot, codexPlugin.mcpServers.replace(/^\.\//, ''));
  assert.ok(
    fs.existsSync(mcpPath),
    `mcpServers file missing at plugin root: ${codexPlugin.mcpServers}`,
  );
});

test('codex plugin.json has interface.displayName', () => {
  assert.ok(
    codexPlugin.interface && codexPlugin.interface.displayName,
    'Expected interface.displayName for plugin directory presentation',
  );
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

const mcpConfig = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'));

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

// ── Codex marketplace file ────────────────────────────────────────────────────
// Per official docs: repo marketplace lives at $REPO_ROOT/.agents/plugins/marketplace.json
console.log('\n=== .agents/plugins/marketplace.json ===\n');

const marketplacePath = path.join(repoRoot, '.agents', 'plugins', 'marketplace.json');

test('marketplace.json exists at .agents/plugins/', () => {
  assert.ok(
    fs.existsSync(marketplacePath),
    'Expected .agents/plugins/marketplace.json for Codex repo marketplace discovery',
  );
});

const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));

test('marketplace.json has name field', () => {
  assert.ok(marketplace.name, 'Expected name field');
});

test('marketplace.json has plugins array with at least one entry', () => {
  assert.ok(Array.isArray(marketplace.plugins) && marketplace.plugins.length > 0, 'Expected plugins array');
});

test('marketplace.json plugin entries have required fields', () => {
  for (const plugin of marketplace.plugins) {
    assert.ok(plugin.name, `Plugin entry missing name`);
    assert.ok(plugin.source && plugin.source.source, `Plugin "${plugin.name}" missing source.source`);
    assert.ok(plugin.policy && plugin.policy.installation, `Plugin "${plugin.name}" missing policy.installation`);
    assert.ok(plugin.category, `Plugin "${plugin.name}" missing category`);
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
