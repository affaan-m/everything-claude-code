'use strict';

/**
 * Plugin agents validation
 * - Each .md file under plugins/<name>/agents/ is non-empty
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MARKETPLACE_PATH = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_PATH, 'utf8'));
let totalAgents = 0;

for (const plugin of marketplace.plugins) {
  const sourceDir = path.resolve(REPO_ROOT, plugin.source);
  const agentsDir = path.join(sourceDir, 'agents');

  if (!fs.existsSync(agentsDir)) continue;

  const agentFiles = fs.readdirSync(agentsDir, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => e.name);

  for (const agentFile of agentFiles) {
    const agentPath = path.join(agentsDir, agentFile);

    test(`${plugin.name}/agents/${agentFile}: is non-empty`, () => {
      const content = fs.readFileSync(agentPath, 'utf8');
      assert.ok(content.trim().length > 0, 'Agent file is empty');
    });

    totalAgents++;
  }
}

console.log(`\nValidated ${totalAgents} agents across ${marketplace.plugins.length} plugins`);
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
