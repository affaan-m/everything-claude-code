'use strict';

/**
 * Plugin commands validation
 * - Each .md file under plugins/<name>/commands/ is non-empty
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
let totalCommands = 0;

for (const plugin of marketplace.plugins) {
  const sourceDir = path.resolve(REPO_ROOT, plugin.source);
  const commandsDir = path.join(sourceDir, 'commands');

  if (!fs.existsSync(commandsDir)) continue;

  const commandFiles = fs.readdirSync(commandsDir, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => e.name);

  for (const commandFile of commandFiles) {
    const commandPath = path.join(commandsDir, commandFile);

    test(`${plugin.name}/commands/${commandFile}: is non-empty`, () => {
      const content = fs.readFileSync(commandPath, 'utf8');
      assert.ok(content.trim().length > 0, 'Command file is empty');
    });

    totalCommands++;
  }
}

console.log(`\nValidated ${totalCommands} commands across ${marketplace.plugins.length} plugins`);
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
