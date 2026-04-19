'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { INLINE_RESOLVE } = require('../../scripts/lib/resolve-ecc-root');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message || String(error));
    failed += 1;
  }
}

const sessionsDoc = fs.readFileSync(path.join(__dirname, '..', '..', 'commands', 'sessions.md'), 'utf8');
const skillHealthDoc = fs.readFileSync(path.join(__dirname, '..', '..', 'commands', 'skill-health.md'), 'utf8');

test('sessions command uses shared inline resolver in all node scripts', () => {
  assert.strictEqual((sessionsDoc.match(/const _r = /g) || []).length, 6);
  assert.strictEqual((sessionsDoc.match(/\['marketplace','ecc'\]/g) || []).length, 6);
  assert.strictEqual((sessionsDoc.match(/\['marketplace','everything-claude-code'\]/g) || []).length, 6);
  assert.strictEqual((sessionsDoc.match(/\['ecc','everything-claude-code'\]/g) || []).length, 6);
});

test('skill-health command uses shared inline resolver in all shell snippets', () => {
  assert.strictEqual((skillHealthDoc.match(/var r=/g) || []).length, 3);
  assert.strictEqual((skillHealthDoc.match(/\['marketplace','ecc'\]/g) || []).length, 3);
  assert.strictEqual((skillHealthDoc.match(/\['marketplace','everything-claude-code'\]/g) || []).length, 3);
  assert.strictEqual((skillHealthDoc.match(/\['ecc','everything-claude-code'\]/g) || []).length, 3);
});

test('inline resolver covers current and legacy marketplace plugin roots', () => {
  assert.ok(INLINE_RESOLVE.includes('"marketplace","ecc"'));
  assert.ok(INLINE_RESOLVE.includes('"marketplace","everything-claude-code"'));
});

console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

process.exit(failed > 0 ? 1 : 0);
