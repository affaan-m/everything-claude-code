/**
 * Source-level tests for scripts/release.sh
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'release.sh');
const source = fs.readFileSync(scriptPath, 'utf8');

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

function runTests() {
  console.log('\n=== Testing release.sh ===\n');

  let passed = 0;
  let failed = 0;

  if (test('release script rejects untracked files when checking cleanliness', () => {
    assert.ok(
      source.includes('git status --porcelain --untracked-files=all'),
      'release.sh should use git status --porcelain --untracked-files=all for cleanliness checks'
    );
  })) passed++; else failed++;

  if (test('release script reruns release metadata sync validation before commit/tag', () => {
    const syncCheckIndex = source.indexOf('node tests/plugin-manifest.test.js');
    const commitIndex = source.indexOf('git commit -m "chore: bump plugin version to $VERSION"');

    assert.ok(syncCheckIndex >= 0, 'release.sh should run plugin-manifest.test.js');
    assert.ok(commitIndex >= 0, 'release.sh should create the release commit');
    assert.ok(
      syncCheckIndex < commitIndex,
      'plugin-manifest.test.js should run before the release commit is created'
    );
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
