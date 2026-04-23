/**
 * Regression coverage for install/uninstall clarity in README.md.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const README = path.join(__dirname, '..', '..', 'README.md');

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing install README clarity ===\n');

  let passed = 0;
  let failed = 0;

  const readme = fs.readFileSync(README, 'utf8');

  if (test('README marks one default path and warns against stacked installs', () => {
    assert.ok(
      readme.includes('### Pick one path only'),
      'README should surface a top-level install decision section'
    );
    assert.ok(
      readme.includes('**Recommended default:** install the Claude Code plugin'),
      'README should name the recommended default install path'
    );
    assert.ok(
      readme.includes('**Do not stack install methods.**'),
      'README should explicitly warn against stacking install methods'
    );
    assert.ok(
      readme.includes('If you choose this path, stop there. Do not also run `/plugin install`.'),
      'README should tell manual-install users not to continue layering installs'
    );
  })) passed++; else failed++;

  if (test('README documents reset and uninstall flow', () => {
    assert.ok(
      readme.includes('### Reset / Uninstall ECC'),
      'README should have a visible reset/uninstall section'
    );
    assert.ok(
      readme.includes('node scripts/uninstall.js --dry-run'),
      'README should document dry-run uninstall'
    );
    assert.ok(
      readme.includes('node scripts/ecc.js list-installed'),
      'README should document install-state inspection before reinstalling'
    );
    assert.ok(
      readme.includes('node scripts/ecc.js doctor'),
      'README should document doctor before reinstalling'
    );
    assert.ok(
      readme.includes('ECC only removes files recorded in its install-state.'),
      'README should explain uninstall safety boundaries'
    );
  })) passed++; else failed++;

  if (test('README explains plugin-path cleanup and rules scoping', () => {
    assert.ok(
      readme.includes('remove the plugin from Claude Code'),
      'README should tell plugin users how to start cleanup'
    );
    assert.ok(
      readme.includes('Start with `rules/common` plus one language or framework pack you actually use.'),
      'README should steer users away from copying every rules directory'
    );
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
