'use strict';

/**
 * Plugin hooks validation
 * - If plugins/<name>/hooks/hooks.json exists, it must be valid JSON
 * - hooks.json must have a top-level "hooks" object
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
let checkedCount = 0;

for (const plugin of marketplace.plugins) {
  const sourceDir = path.resolve(REPO_ROOT, plugin.source);
  const hooksPath = path.join(sourceDir, 'hooks', 'hooks.json');

  if (!fs.existsSync(hooksPath)) continue;

  let parsed;
  test(`${plugin.name}/hooks/hooks.json: is valid JSON`, () => {
    const raw = fs.readFileSync(hooksPath, 'utf8');
    parsed = JSON.parse(raw);
  });

  if (!parsed) continue;

  test(`${plugin.name}/hooks/hooks.json: has "hooks" object`, () => {
    assert.ok(
      parsed.hooks && typeof parsed.hooks === 'object' && !Array.isArray(parsed.hooks),
      '"hooks" must be an object'
    );
  });

  test(`${plugin.name}/hooks/hooks.json: hook event names are strings`, () => {
    for (const eventName of Object.keys(parsed.hooks)) {
      assert.ok(typeof eventName === 'string' && eventName.length > 0, `Invalid event name: ${eventName}`);
      assert.ok(Array.isArray(parsed.hooks[eventName]), `hooks["${eventName}"] must be an array`);
    }
  });

  checkedCount++;
}

if (checkedCount === 0) {
  console.log('  (no hooks.json files found — nothing to validate)');
}

console.log(`\nValidated ${checkedCount} hooks.json file(s)`);
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
