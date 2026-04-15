'use strict';

/**
 * Plugin manifest validation
 * - Every plugin listed in marketplace.json has a source directory
 * - Each plugin directory has a .claude-plugin/plugin.json
 * - plugin.json has required fields: name, version
 * - plugin.json name matches the marketplace entry name
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

for (const plugin of marketplace.plugins) {
  const sourceDir = path.resolve(REPO_ROOT, plugin.source);
  const manifestPath = path.join(sourceDir, '.claude-plugin', 'plugin.json');

  test(`${plugin.name}: .claude-plugin/plugin.json exists`, () => {
    assert.ok(fs.existsSync(manifestPath), `Missing: ${manifestPath}`);
  });

  if (!fs.existsSync(manifestPath)) continue;

  let manifest;
  test(`${plugin.name}: plugin.json is valid JSON`, () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(raw);
  });

  if (!manifest) continue;

  test(`${plugin.name}: plugin.json has name field`, () => {
    assert.ok(typeof manifest.name === 'string' && manifest.name.length > 0, 'name must be a non-empty string');
  });

  test(`${plugin.name}: plugin.json name matches marketplace entry`, () => {
    assert.strictEqual(manifest.name, plugin.name, `name mismatch: plugin.json="${manifest.name}" marketplace="${plugin.name}"`);
  });

  test(`${plugin.name}: plugin.json has version field`, () => {
    assert.ok(typeof manifest.version === 'string' && manifest.version.length > 0, 'version must be a non-empty string');
  });

  test(`${plugin.name}: plugin.json version matches marketplace entry`, () => {
    assert.strictEqual(manifest.version, plugin.version, `version mismatch: plugin.json="${manifest.version}" marketplace="${plugin.version}"`);
  });
}

console.log(`\nPassed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
