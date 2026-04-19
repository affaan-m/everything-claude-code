'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function load(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

console.log('\n=== Testing release publish workflow ===\n');

for (const workflow of [
  '.github/workflows/release.yml',
  '.github/workflows/reusable-release.yml',
]) {
  const content = load(workflow);

  test(`${workflow} grants id-token for npm provenance`, () => {
    assert.match(content, /permissions:\s*[\s\S]*id-token:\s*write/m);
  });

  test(`${workflow} configures the npm registry`, () => {
    assert.match(content, /registry-url:\s*['"]https:\/\/registry\.npmjs\.org['"]/);
  });

  test(`${workflow} checks whether the tagged npm version already exists`, () => {
    assert.match(content, /Check npm publish state/);
    assert.match(content, /npm view "\$\{PACKAGE_NAME\}@\$\{PACKAGE_VERSION\}" version/);
  });

  test(`${workflow} publishes new tag versions to npm`, () => {
    assert.match(content, /npm publish --access public --provenance/);
    assert.match(content, /NODE_AUTH_TOKEN:\s*\$\{\{\s*secrets\.NPM_TOKEN\s*\}\}/);
  });
}

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
