'use strict';

/**
 * Smoke test — verifies the repo is structurally intact:
 * 1. marketplace.json parses as valid JSON
 * 2. marketplace.plugins is a non-empty array
 * 3. Every plugin's source directory exists on disk
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const MARKETPLACE_PATH = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

// 1. marketplace.json must exist
assert.ok(
  fs.existsSync(MARKETPLACE_PATH),
  `marketplace.json not found at ${MARKETPLACE_PATH}`
);

// 2. must parse as valid JSON
const raw = fs.readFileSync(MARKETPLACE_PATH, 'utf8');
let marketplace;
try {
  marketplace = JSON.parse(raw);
} catch (err) {
  console.error(`FAIL marketplace.json is not valid JSON: ${err.message}`);
  process.exit(1);
}

// 3. must have a non-empty plugins array
assert.ok(Array.isArray(marketplace.plugins), 'marketplace.plugins must be an array');
assert.ok(marketplace.plugins.length > 0, 'marketplace.plugins must not be empty');

// 4. every plugin source directory must exist
let missing = 0;
for (const plugin of marketplace.plugins) {
  const sourceDir = path.resolve(REPO_ROOT, plugin.source);
  if (!fs.existsSync(sourceDir)) {
    console.error(`FAIL plugin "${plugin.name}" source dir missing: ${sourceDir}`);
    missing++;
  }
}
assert.strictEqual(missing, 0, `${missing} plugin source director(ies) are missing`);

console.log(
  `✓ marketplace.json is valid JSON with ${marketplace.plugins.length} plugins, all source dirs present`
);
