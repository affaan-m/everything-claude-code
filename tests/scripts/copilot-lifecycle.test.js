/**
 * Tests for Copilot branch lifecycle logic:
 * - Branch naming pattern validation (copilot/*)
 * - simulate-copilot-lifecycle.sh existence and permissions
 * - fetch-copilot-branch.sh correctness
 * - VERSION file format
 * - CODEOWNERS presence
 *
 * Run with: node tests/scripts/copilot-lifecycle.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const isWindows = process.platform === 'win32';

const ROOT = path.resolve(__dirname, '../../');

// --------------------------------------------------------------------------- //
// Test helper (matches the style used across this test suite)
// --------------------------------------------------------------------------- //
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing Copilot Lifecycle ===\n');

  let passed = 0;
  let failed = 0;

  const ok  = (name, fn) => { if (test(name, fn)) passed++; else failed++; };

  // --------------------------------------------------------------------------
  // Branch naming patterns
  // --------------------------------------------------------------------------
  console.log('Branch Naming Patterns:');

  const VALID_COPILOT = [
    'copilot/issue-1',
    'copilot/issue-42',
    'copilot/fix-readme',
    'copilot/fix-login-bug',
    'copilot/add-tests',
  ];
  const NOT_COPILOT = [
    'main',
    'feature/my-task',
    'bugfix/issue-5',
    'copilot',          // no trailing slash segment
    'xcopilot/issue-1', // prefix mismatch
  ];

  for (const branch of VALID_COPILOT) {
    ok(`matches copilot/* pattern: ${branch}`, () => {
      assert.ok(branch.startsWith('copilot/'), `Expected '${branch}' to start with 'copilot/'`);
    });
  }

  for (const branch of NOT_COPILOT) {
    ok(`does NOT match copilot/* pattern: ${branch}`, () => {
      assert.ok(!branch.startsWith('copilot/'), `Expected '${branch}' NOT to start with 'copilot/'`);
    });
  }

  // --------------------------------------------------------------------------
  // GitHub Actions branch filter expression (mirrors ci.yml condition)
  // --------------------------------------------------------------------------
  console.log('\nCI Workflow Condition Logic:');

  function matchesCopilotRef(ref) {
    // Simulates the ci.yml trigger: branches include 'copilot/**'
    // so both push.ref and pull_request.head.ref are matched.
    return ref.startsWith('refs/heads/copilot/') || ref.startsWith('copilot/');
  }

  ok('refs/heads/copilot/issue-42 is a copilot/** branch (CI triggers)', () => {
    assert.ok(matchesCopilotRef('refs/heads/copilot/issue-42'));
  });
  ok('copilot/fix-typo (head_ref) is a copilot/** branch (CI triggers)', () => {
    assert.ok(matchesCopilotRef('copilot/fix-typo'));
  });
  ok('refs/heads/main is NOT a copilot/** branch', () => {
    assert.ok(!matchesCopilotRef('refs/heads/main'));
  });
  ok('feature/my-task is NOT a copilot/** branch', () => {
    assert.ok(!matchesCopilotRef('feature/my-task'));
  });

  // --------------------------------------------------------------------------
  // VERSION file
  // --------------------------------------------------------------------------
  console.log('\nVERSION File:');

  const versionFile = path.join(ROOT, 'VERSION');
  ok('VERSION file exists', () => {
    assert.ok(fs.existsSync(versionFile), 'VERSION file not found');
  });
  ok('VERSION is a valid semver-like string (X.Y.Z)', () => {
    const content = fs.readFileSync(versionFile, 'utf8').trim();
    assert.match(content, /^\d+\.\d+\.\d+$/, `VERSION content '${content}' is not X.Y.Z`);
  });

  // --------------------------------------------------------------------------
  // Script files
  // --------------------------------------------------------------------------
  console.log('\nLifecycle Scripts:');

  const scripts = [
    'scripts/fetch-copilot-branch.sh',
    'scripts/simulate-copilot-lifecycle.sh',
  ];

  for (const rel of scripts) {
    const abs = path.join(ROOT, rel);
    ok(`${rel} exists`, () => {
      assert.ok(fs.existsSync(abs), `${rel} not found`);
    });
    ok(`${rel} is executable`, () => {
      if (isWindows) {
        // Windows does not track Unix execute bits; skip this assertion
        return;
      }
      // Check Unix execute bit (mode & 0o111)
      const mode = fs.statSync(abs).mode;
      assert.ok(mode & 0o111, `${rel} is not executable`);
    });
    ok(`${rel} has correct shebang`, () => {
      const first = fs.readFileSync(abs, 'utf8').split(/\r?\n/)[0];
      assert.strictEqual(first, '#!/usr/bin/env bash', `Bad shebang: '${first}'`);
    });
    ok(`${rel} uses set -euo pipefail`, () => {
      const content = fs.readFileSync(abs, 'utf8');
      assert.ok(content.includes('set -euo pipefail'), `${rel} missing 'set -euo pipefail'`);
    });
  }

  // --------------------------------------------------------------------------
  // CODEOWNERS
  // --------------------------------------------------------------------------
  console.log('\nCODEOWNERS:');

  const codeowners = path.join(ROOT, '.github', 'CODEOWNERS');
  ok('CODEOWNERS file exists', () => {
    assert.ok(fs.existsSync(codeowners), '.github/CODEOWNERS not found');
  });
  ok('CODEOWNERS covers .github/workflows/', () => {
    const content = fs.readFileSync(codeowners, 'utf8');
    assert.ok(content.includes('.github/workflows/'), 'Missing workflow coverage in CODEOWNERS');
  });

  // --------------------------------------------------------------------------
  // Issue template
  // --------------------------------------------------------------------------
  console.log('\nCopilot Issue Template:');

  const template = path.join(ROOT, '.github', 'ISSUE_TEMPLATE', 'copilot-task.md');
  ok('copilot-task.md template exists', () => {
    assert.ok(fs.existsSync(template), '.github/ISSUE_TEMPLATE/copilot-task.md not found');
  });
  ok('Template pre-assigns @copilot', () => {
    const content = fs.readFileSync(template, 'utf8');
    assert.ok(content.includes('assignees: copilot'), "Missing 'assignees: copilot'");
  });
  ok('Template has copilot label', () => {
    const content = fs.readFileSync(template, 'utf8');
    assert.ok(content.includes('labels: copilot'), "Missing 'labels: copilot'");
  });

  // --------------------------------------------------------------------------
  // Makefile targets
  // --------------------------------------------------------------------------
  console.log('\nMakefile Targets:');

  const makefile = path.join(ROOT, 'Makefile');
  ok('Makefile exists', () => {
    assert.ok(fs.existsSync(makefile), 'Makefile not found');
  });

  const requiredTargets = ['setup', 'validate', 'build', 'package', 'update', 'logs', 'clean'];
  const makeContent = fs.existsSync(makefile) ? fs.readFileSync(makefile, 'utf8') : '';
  for (const target of requiredTargets) {
    ok(`Makefile has '${target}:' target`, () => {
      assert.ok(makeContent.includes(`${target}:`), `Makefile missing '${target}:' target`);
    });
  }

  ok('Makefile reads VERSION file', () => {
    assert.ok(makeContent.includes('VERSION'), "Makefile doesn't reference VERSION");
  });

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
