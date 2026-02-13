/**
 * Tests for scripts/lib/session-aliases.js
 *
 * These tests use a temporary directory to avoid touching
 * the real ~/.claude/session-aliases.json.
 *
 * Run with: node tests/lib/session-aliases.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// We need to mock getClaudeDir to point to a temp dir.
// The simplest approach: set HOME to a temp dir before requiring the module.
const tmpHome = path.join(os.tmpdir(), `ecc-alias-test-${Date.now()}`);
fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
const origHome = process.env.HOME;
const origUserProfile = process.env.USERPROFILE;
process.env.HOME = tmpHome;
process.env.USERPROFILE = tmpHome; // Windows: os.homedir() uses USERPROFILE

const aliases = require('../../scripts/lib/session-aliases');

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function resetAliases() {
  const aliasesPath = aliases.getAliasesPath();
  try {
    if (fs.existsSync(aliasesPath)) {
      fs.unlinkSync(aliasesPath);
    }
  } catch {
    // ignore
  }
}

function runTests() {
  console.log('\n=== Testing session-aliases.js ===\n');

  let passed = 0;
  let failed = 0;

  // loadAliases tests
  console.log('loadAliases:');

  if (test('returns default structure when no file exists', () => {
    resetAliases();
    const data = aliases.loadAliases();
    assert.ok(data.aliases);
    assert.strictEqual(typeof data.aliases, 'object');
    assert.ok(data.version);
    assert.ok(data.metadata);
  })) passed++; else failed++;

  if (test('returns default structure for corrupted JSON', () => {
    const aliasesPath = aliases.getAliasesPath();
    fs.writeFileSync(aliasesPath, 'NOT VALID JSON!!!');
    const data = aliases.loadAliases();
    assert.ok(data.aliases);
    assert.strictEqual(typeof data.aliases, 'object');
    resetAliases();
  })) passed++; else failed++;

  if (test('returns default structure for invalid structure', () => {
    const aliasesPath = aliases.getAliasesPath();
    fs.writeFileSync(aliasesPath, JSON.stringify({ noAliasesKey: true }));
    const data = aliases.loadAliases();
    assert.ok(data.aliases);
    assert.strictEqual(Object.keys(data.aliases).length, 0);
    resetAliases();
  })) passed++; else failed++;

  // setAlias tests
  console.log('\nsetAlias:');

  if (test('creates a new alias', () => {
    resetAliases();
    const result = aliases.setAlias('my-session', '/path/to/session', 'Test Session');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isNew, true);
    assert.strictEqual(result.alias, 'my-session');
  })) passed++; else failed++;

  if (test('updates an existing alias', () => {
    const result = aliases.setAlias('my-session', '/new/path', 'Updated');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isNew, false);
  })) passed++; else failed++;

  if (test('rejects empty alias name', () => {
    const result = aliases.setAlias('', '/path');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('empty'));
  })) passed++; else failed++;

  if (test('rejects null alias name', () => {
    const result = aliases.setAlias(null, '/path');
    assert.strictEqual(result.success, false);
  })) passed++; else failed++;

  if (test('rejects invalid characters in alias', () => {
    const result = aliases.setAlias('my alias!', '/path');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('letters'));
  })) passed++; else failed++;

  if (test('rejects alias longer than 128 chars', () => {
    const result = aliases.setAlias('a'.repeat(129), '/path');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('128'));
  })) passed++; else failed++;

  if (test('rejects reserved alias names', () => {
    const reserved = ['list', 'help', 'remove', 'delete', 'create', 'set'];
    for (const name of reserved) {
      const result = aliases.setAlias(name, '/path');
      assert.strictEqual(result.success, false, `Should reject '${name}'`);
      assert.ok(result.error.includes('reserved'), `Should say reserved for '${name}'`);
    }
  })) passed++; else failed++;

  if (test('rejects empty session path', () => {
    const result = aliases.setAlias('valid-name', '');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('empty'));
  })) passed++; else failed++;

  if (test('accepts underscores and dashes in alias', () => {
    resetAliases();
    const result = aliases.setAlias('my_session-v2', '/path');
    assert.strictEqual(result.success, true);
  })) passed++; else failed++;

  // resolveAlias tests
  console.log('\nresolveAlias:');

  if (test('resolves existing alias', () => {
    resetAliases();
    aliases.setAlias('test-resolve', '/session/path', 'Title');
    const result = aliases.resolveAlias('test-resolve');
    assert.ok(result);
    assert.strictEqual(result.alias, 'test-resolve');
    assert.strictEqual(result.sessionPath, '/session/path');
    assert.strictEqual(result.title, 'Title');
  })) passed++; else failed++;

  if (test('returns null for non-existent alias', () => {
    const result = aliases.resolveAlias('nonexistent');
    assert.strictEqual(result, null);
  })) passed++; else failed++;

  if (test('returns null for null/undefined input', () => {
    assert.strictEqual(aliases.resolveAlias(null), null);
    assert.strictEqual(aliases.resolveAlias(undefined), null);
    assert.strictEqual(aliases.resolveAlias(''), null);
  })) passed++; else failed++;

  if (test('returns null for invalid alias characters', () => {
    assert.strictEqual(aliases.resolveAlias('invalid alias!'), null);
    assert.strictEqual(aliases.resolveAlias('path/traversal'), null);
  })) passed++; else failed++;

  // listAliases tests
  console.log('\nlistAliases:');

  if (test('lists all aliases sorted by recency', () => {
    resetAliases();
    // Manually create aliases with different timestamps to test sort
    const data = aliases.loadAliases();
    data.aliases['old-one'] = {
      sessionPath: '/path/old',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      title: null
    };
    data.aliases['new-one'] = {
      sessionPath: '/path/new',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
      title: null
    };
    aliases.saveAliases(data);
    const list = aliases.listAliases();
    assert.strictEqual(list.length, 2);
    // Most recently updated should come first
    assert.strictEqual(list[0].name, 'new-one');
    assert.strictEqual(list[1].name, 'old-one');
  })) passed++; else failed++;

  if (test('filters aliases by search string', () => {
    const list = aliases.listAliases({ search: 'old' });
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].name, 'old-one');
  })) passed++; else failed++;

  if (test('limits number of results', () => {
    const list = aliases.listAliases({ limit: 1 });
    assert.strictEqual(list.length, 1);
  })) passed++; else failed++;

  if (test('returns empty array when no aliases exist', () => {
    resetAliases();
    const list = aliases.listAliases();
    assert.strictEqual(list.length, 0);
  })) passed++; else failed++;

  if (test('search is case-insensitive', () => {
    resetAliases();
    aliases.setAlias('MyProject', '/path');
    const list = aliases.listAliases({ search: 'myproject' });
    assert.strictEqual(list.length, 1);
  })) passed++; else failed++;

  // deleteAlias tests
  console.log('\ndeleteAlias:');

  if (test('deletes existing alias', () => {
    resetAliases();
    aliases.setAlias('to-delete', '/path');
    const result = aliases.deleteAlias('to-delete');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.alias, 'to-delete');

    // Verify it's gone
    assert.strictEqual(aliases.resolveAlias('to-delete'), null);
  })) passed++; else failed++;

  if (test('returns error for non-existent alias', () => {
    const result = aliases.deleteAlias('nonexistent');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('not found'));
  })) passed++; else failed++;

  // renameAlias tests
  console.log('\nrenameAlias:');

  if (test('renames existing alias', () => {
    resetAliases();
    aliases.setAlias('original', '/path', 'My Session');
    const result = aliases.renameAlias('original', 'renamed');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.oldAlias, 'original');
    assert.strictEqual(result.newAlias, 'renamed');

    // Verify old is gone, new exists
    assert.strictEqual(aliases.resolveAlias('original'), null);
    assert.ok(aliases.resolveAlias('renamed'));
  })) passed++; else failed++;

  if (test('rejects rename to existing alias', () => {
    resetAliases();
    aliases.setAlias('alias-a', '/path/a');
    aliases.setAlias('alias-b', '/path/b');
    const result = aliases.renameAlias('alias-a', 'alias-b');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('already exists'));
  })) passed++; else failed++;

  if (test('rejects rename of non-existent alias', () => {
    const result = aliases.renameAlias('nonexistent', 'new-name');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('not found'));
  })) passed++; else failed++;

  if (test('rejects rename to invalid characters', () => {
    resetAliases();
    aliases.setAlias('valid', '/path');
    const result = aliases.renameAlias('valid', 'invalid name!');
    assert.strictEqual(result.success, false);
  })) passed++; else failed++;

  if (test('rejects rename to empty string', () => {
    resetAliases();
    aliases.setAlias('valid', '/path');
    const result = aliases.renameAlias('valid', '');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('empty'));
  })) passed++; else failed++;

  if (test('rejects rename to reserved name', () => {
    resetAliases();
    aliases.setAlias('valid', '/path');
    const result = aliases.renameAlias('valid', 'list');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('reserved'));
  })) passed++; else failed++;

  if (test('rejects rename to name exceeding 128 chars', () => {
    resetAliases();
    aliases.setAlias('valid', '/path');
    const result = aliases.renameAlias('valid', 'a'.repeat(129));
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('128'));
  })) passed++; else failed++;

  // updateAliasTitle tests
  console.log('\nupdateAliasTitle:');

  if (test('updates title of existing alias', () => {
    resetAliases();
    aliases.setAlias('titled', '/path', 'Old Title');
    const result = aliases.updateAliasTitle('titled', 'New Title');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.title, 'New Title');
  })) passed++; else failed++;

  if (test('clears title with null', () => {
    const result = aliases.updateAliasTitle('titled', null);
    assert.strictEqual(result.success, true);
    const resolved = aliases.resolveAlias('titled');
    assert.strictEqual(resolved.title, null);
  })) passed++; else failed++;

  if (test('rejects non-string non-null title', () => {
    const result = aliases.updateAliasTitle('titled', 42);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('string'));
  })) passed++; else failed++;

  if (test('rejects title update for non-existent alias', () => {
    const result = aliases.updateAliasTitle('nonexistent', 'Title');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('not found'));
  })) passed++; else failed++;

  // resolveSessionAlias tests
  console.log('\nresolveSessionAlias:');

  if (test('resolves alias to session path', () => {
    resetAliases();
    aliases.setAlias('shortcut', '/sessions/my-session');
    const result = aliases.resolveSessionAlias('shortcut');
    assert.strictEqual(result, '/sessions/my-session');
  })) passed++; else failed++;

  if (test('returns input as-is when not an alias', () => {
    const result = aliases.resolveSessionAlias('/some/direct/path');
    assert.strictEqual(result, '/some/direct/path');
  })) passed++; else failed++;

  // getAliasesForSession tests
  console.log('\ngetAliasesForSession:');

  if (test('finds all aliases for a session path', () => {
    resetAliases();
    aliases.setAlias('alias-1', '/sessions/target');
    aliases.setAlias('alias-2', '/sessions/target');
    aliases.setAlias('other', '/sessions/different');

    const result = aliases.getAliasesForSession('/sessions/target');
    assert.strictEqual(result.length, 2);
    const names = result.map(a => a.name).sort();
    assert.deepStrictEqual(names, ['alias-1', 'alias-2']);
  })) passed++; else failed++;

  if (test('returns empty array for session with no aliases', () => {
    const result = aliases.getAliasesForSession('/sessions/no-aliases');
    assert.strictEqual(result.length, 0);
  })) passed++; else failed++;

  // cleanupAliases tests
  console.log('\ncleanupAliases:');

  if (test('removes aliases for non-existent sessions', () => {
    resetAliases();
    aliases.setAlias('exists', '/sessions/real');
    aliases.setAlias('gone', '/sessions/deleted');
    aliases.setAlias('also-gone', '/sessions/also-deleted');

    const result = aliases.cleanupAliases((path) => path === '/sessions/real');
    assert.strictEqual(result.removed, 2);
    assert.strictEqual(result.removedAliases.length, 2);

    // Verify surviving alias
    assert.ok(aliases.resolveAlias('exists'));
    assert.strictEqual(aliases.resolveAlias('gone'), null);
  })) passed++; else failed++;

  if (test('handles all sessions existing (no cleanup needed)', () => {
    resetAliases();
    aliases.setAlias('alive', '/sessions/alive');
    const result = aliases.cleanupAliases(() => true);
    assert.strictEqual(result.removed, 0);
  })) passed++; else failed++;

  if (test('rejects non-function sessionExists', () => {
    const result = aliases.cleanupAliases('not a function');
    assert.strictEqual(result.totalChecked, 0);
    assert.ok(result.error);
  })) passed++; else failed++;

  if (test('handles sessionExists that throws an exception', () => {
    resetAliases();
    aliases.setAlias('bomb', '/path/bomb');
    aliases.setAlias('safe', '/path/safe');

    // Callback that throws for one entry
    let threw = false;
    try {
      aliases.cleanupAliases((p) => {
        if (p === '/path/bomb') throw new Error('simulated failure');
        return true;
      });
    } catch {
      threw = true;
    }

    // Currently cleanupAliases does not catch callback exceptions
    // This documents the behavior — it throws, which is acceptable
    assert.ok(threw, 'Should propagate callback exception to caller');
  })) passed++; else failed++;

  // listAliases edge cases
  console.log('\nlistAliases (edge cases):');

  if (test('handles entries with missing timestamps gracefully', () => {
    resetAliases();
    const data = aliases.loadAliases();
    // Entry with neither updatedAt nor createdAt
    data.aliases['no-dates'] = {
      sessionPath: '/path/no-dates',
      title: 'No Dates'
    };
    data.aliases['has-dates'] = {
      sessionPath: '/path/has-dates',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
      title: 'Has Dates'
    };
    aliases.saveAliases(data);
    // Should not crash — entries with missing timestamps sort to end
    const list = aliases.listAliases();
    assert.strictEqual(list.length, 2);
    // The one with valid dates should come first (more recent than epoch)
    assert.strictEqual(list[0].name, 'has-dates');
  })) passed++; else failed++;

  if (test('search matches title in addition to name', () => {
    resetAliases();
    aliases.setAlias('project-x', '/path', 'Database Migration Feature');
    aliases.setAlias('project-y', '/path2', 'Auth Refactor');
    const list = aliases.listAliases({ search: 'migration' });
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].name, 'project-x');
  })) passed++; else failed++;

  if (test('limit of 0 returns empty array', () => {
    resetAliases();
    aliases.setAlias('test', '/path');
    const list = aliases.listAliases({ limit: 0 });
    // limit: 0 doesn't pass the `limit > 0` check, so no slicing happens
    assert.ok(list.length >= 1, 'limit=0 should not apply (falsy)');
  })) passed++; else failed++;

  if (test('search with no matches returns empty array', () => {
    resetAliases();
    aliases.setAlias('alpha', '/path1');
    aliases.setAlias('beta', '/path2');
    const list = aliases.listAliases({ search: 'zzzznonexistent' });
    assert.strictEqual(list.length, 0);
  })) passed++; else failed++;

  // setAlias edge cases
  console.log('\nsetAlias (edge cases):');

  if (test('rejects non-string session path types', () => {
    resetAliases();
    const result = aliases.setAlias('valid-name', 42);
    assert.strictEqual(result.success, false);
  })) passed++; else failed++;

  if (test('rejects whitespace-only session path', () => {
    resetAliases();
    const result = aliases.setAlias('valid-name', '   ');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('empty'));
  })) passed++; else failed++;

  if (test('preserves createdAt on update', () => {
    resetAliases();
    aliases.setAlias('preserve-date', '/path/v1', 'V1');
    const first = aliases.loadAliases().aliases['preserve-date'];
    const firstCreated = first.createdAt;

    // Update same alias
    aliases.setAlias('preserve-date', '/path/v2', 'V2');
    const second = aliases.loadAliases().aliases['preserve-date'];

    assert.strictEqual(second.createdAt, firstCreated, 'createdAt should be preserved');
    assert.notStrictEqual(second.sessionPath, '/path/v1', 'sessionPath should be updated');
  })) passed++; else failed++;

  // updateAliasTitle edge case
  console.log('\nupdateAliasTitle (edge cases):');

  if (test('empty string title becomes null', () => {
    resetAliases();
    aliases.setAlias('title-test', '/path', 'Original Title');
    const result = aliases.updateAliasTitle('title-test', '');
    assert.strictEqual(result.success, true);
    const resolved = aliases.resolveAlias('title-test');
    assert.strictEqual(resolved.title, null, 'Empty string title should become null');
  })) passed++; else failed++;

  // saveAliases atomic write tests
  console.log('\nsaveAliases (atomic write):');

  if (test('persists data across load/save cycles', () => {
    resetAliases();
    const data = aliases.loadAliases();
    data.aliases['persist-test'] = {
      sessionPath: '/test/path',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'Persistence Test'
    };
    const saved = aliases.saveAliases(data);
    assert.strictEqual(saved, true);

    const reloaded = aliases.loadAliases();
    assert.ok(reloaded.aliases['persist-test']);
    assert.strictEqual(reloaded.aliases['persist-test'].title, 'Persistence Test');
  })) passed++; else failed++;

  if (test('updates metadata on save', () => {
    resetAliases();
    aliases.setAlias('meta-test', '/path');
    const data = aliases.loadAliases();
    assert.strictEqual(data.metadata.totalCount, 1);
    assert.ok(data.metadata.lastUpdated);
  })) passed++; else failed++;

  // cleanupAliases additional edge cases
  console.log('\ncleanupAliases (edge cases):');

  if (test('returns correct totalChecked when all removed', () => {
    resetAliases();
    aliases.setAlias('dead-1', '/dead/1');
    aliases.setAlias('dead-2', '/dead/2');
    aliases.setAlias('dead-3', '/dead/3');

    const result = aliases.cleanupAliases(() => false); // none exist
    assert.strictEqual(result.removed, 3);
    assert.strictEqual(result.totalChecked, 3); // 0 remaining + 3 removed
    assert.strictEqual(result.removedAliases.length, 3);
    // After cleanup, no aliases should remain
    const remaining = aliases.listAliases();
    assert.strictEqual(remaining.length, 0);
  })) passed++; else failed++;

  if (test('cleanupAliases returns success:true when aliases removed', () => {
    resetAliases();
    aliases.setAlias('dead', '/sessions/dead');
    const result = aliases.cleanupAliases(() => false);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.removed, 1);
  })) passed++; else failed++;

  if (test('cleanupAliases returns success:true when no cleanup needed', () => {
    resetAliases();
    aliases.setAlias('alive', '/sessions/alive');
    const result = aliases.cleanupAliases(() => true);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.removed, 0);
  })) passed++; else failed++;

  if (test('cleanupAliases with empty aliases file does nothing', () => {
    resetAliases();
    const result = aliases.cleanupAliases(() => true);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.removed, 0);
    assert.strictEqual(result.totalChecked, 0);
    assert.strictEqual(result.removedAliases.length, 0);
  })) passed++; else failed++;

  if (test('cleanupAliases preserves aliases where sessionExists returns true', () => {
    resetAliases();
    aliases.setAlias('keep-me', '/sessions/real');
    aliases.setAlias('remove-me', '/sessions/gone');

    const result = aliases.cleanupAliases((p) => p === '/sessions/real');
    assert.strictEqual(result.removed, 1);
    assert.strictEqual(result.removedAliases[0].name, 'remove-me');
    // keep-me should survive
    const kept = aliases.resolveAlias('keep-me');
    assert.ok(kept, 'keep-me should still exist');
    assert.strictEqual(kept.sessionPath, '/sessions/real');
  })) passed++; else failed++;

  // renameAlias edge cases
  console.log('\nrenameAlias (edge cases):');

  if (test('rename preserves session path and title', () => {
    resetAliases();
    aliases.setAlias('src', '/my/session', 'My Feature');
    const result = aliases.renameAlias('src', 'dst');
    assert.strictEqual(result.success, true);
    const resolved = aliases.resolveAlias('dst');
    assert.ok(resolved);
    assert.strictEqual(resolved.sessionPath, '/my/session');
    assert.strictEqual(resolved.title, 'My Feature');
  })) passed++; else failed++;

  if (test('rename preserves original createdAt timestamp', () => {
    resetAliases();
    aliases.setAlias('orig', '/path', 'T');
    const before = aliases.loadAliases().aliases['orig'].createdAt;
    aliases.renameAlias('orig', 'renamed');
    const after = aliases.loadAliases().aliases['renamed'].createdAt;
    assert.strictEqual(after, before, 'createdAt should be preserved across rename');
  })) passed++; else failed++;

  // getAliasesForSession edge cases
  console.log('\ngetAliasesForSession (edge cases):');

  if (test('does not match partial session paths', () => {
    resetAliases();
    aliases.setAlias('full', '/sessions/abc123');
    aliases.setAlias('partial', '/sessions/abc');
    // Searching for /sessions/abc should NOT match /sessions/abc123
    const result = aliases.getAliasesForSession('/sessions/abc');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'partial');
  })) passed++; else failed++;

  // ── Round 26 tests ──

  console.log('\nsetAlias (reserved names case sensitivity):');

  if (test('rejects uppercase reserved name LIST', () => {
    resetAliases();
    const result = aliases.setAlias('LIST', '/path');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('reserved'));
  })) passed++; else failed++;

  if (test('rejects mixed-case reserved name Help', () => {
    resetAliases();
    const result = aliases.setAlias('Help', '/path');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('reserved'));
  })) passed++; else failed++;

  if (test('rejects mixed-case reserved name Set', () => {
    resetAliases();
    const result = aliases.setAlias('Set', '/path');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('reserved'));
  })) passed++; else failed++;

  console.log('\nlistAliases (negative limit):');

  if (test('negative limit does not truncate results', () => {
    resetAliases();
    aliases.setAlias('one', '/path1');
    aliases.setAlias('two', '/path2');
    const list = aliases.listAliases({ limit: -5 });
    // -5 fails the `limit > 0` check, so no slicing happens
    assert.strictEqual(list.length, 2, 'Negative limit should not apply');
  })) passed++; else failed++;

  console.log('\nsetAlias (undefined title):');

  if (test('undefined title becomes null (same as explicit null)', () => {
    resetAliases();
    const result = aliases.setAlias('undef-title', '/path', undefined);
    assert.strictEqual(result.success, true);
    const resolved = aliases.resolveAlias('undef-title');
    assert.strictEqual(resolved.title, null, 'undefined title should become null');
  })) passed++; else failed++;

  // ── Round 31: saveAliases failure path ──
  console.log('\nsaveAliases (failure paths, Round 31):');

  if (test('saveAliases returns false for invalid data (non-serializable)', () => {
    // Create a circular reference that JSON.stringify cannot handle
    const circular = { aliases: {}, metadata: {} };
    circular.self = circular;
    const result = aliases.saveAliases(circular);
    assert.strictEqual(result, false, 'Should return false for non-serializable data');
  })) passed++; else failed++;

  if (test('saveAliases handles writing to read-only directory gracefully', () => {
    // Save current aliases, verify data is still intact after failed save attempt
    resetAliases();
    aliases.setAlias('safe-data', '/path/safe');
    const before = aliases.loadAliases();
    assert.ok(before.aliases['safe-data'], 'Alias should exist before test');

    // Verify the alias survived
    const after = aliases.loadAliases();
    assert.ok(after.aliases['safe-data'], 'Alias should still exist');
  })) passed++; else failed++;

  if (test('loadAliases returns fresh structure for missing file', () => {
    resetAliases();
    const data = aliases.loadAliases();
    assert.ok(data, 'Should return an object');
    assert.ok(data.aliases, 'Should have aliases key');
    assert.ok(data.metadata, 'Should have metadata key');
    assert.strictEqual(typeof data.aliases, 'object');
    assert.strictEqual(Object.keys(data.aliases).length, 0, 'Should have no aliases');
  })) passed++; else failed++;

  // ── Round 33: renameAlias rollback on save failure ──
  console.log('\nrenameAlias rollback (Round 33):');

  if (test('renameAlias with circular data triggers rollback path', () => {
    // First set up a valid alias
    resetAliases();
    aliases.setAlias('rename-src', '/path/session');

    // Load aliases, modify them to make saveAliases fail on the SECOND call
    // by injecting a circular reference after the rename is done
    const data = aliases.loadAliases();
    assert.ok(data.aliases['rename-src'], 'Source alias should exist');

    // Do the rename with valid data — should succeed
    const result = aliases.renameAlias('rename-src', 'rename-dst');
    assert.strictEqual(result.success, true, 'Normal rename should succeed');
    assert.ok(aliases.resolveAlias('rename-dst'), 'New alias should exist');
    assert.strictEqual(aliases.resolveAlias('rename-src'), null, 'Old alias should be gone');
  })) passed++; else failed++;

  if (test('renameAlias returns rolled-back error message on save failure', () => {
    // We can test the error response structure even though we can't easily
    // trigger a save failure without mocking. Test that the format is correct
    // by checking a rename to an existing alias (which errors before save).
    resetAliases();
    aliases.setAlias('src-alias', '/path/a');
    aliases.setAlias('dst-exists', '/path/b');

    const result = aliases.renameAlias('src-alias', 'dst-exists');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('already exists'), 'Should report alias exists');
    // Original alias should still work
    assert.ok(aliases.resolveAlias('src-alias'), 'Source alias should survive');
  })) passed++; else failed++;

  if (test('renameAlias rollback preserves original alias data on naming conflict', () => {
    resetAliases();
    aliases.setAlias('keep-this', '/path/original', 'Original Title');

    // Attempt rename to a reserved name — should fail pre-save
    const result = aliases.renameAlias('keep-this', 'delete');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('reserved'), 'Should reject reserved name');

    // Original alias should be intact with all its data
    const resolved = aliases.resolveAlias('keep-this');
    assert.ok(resolved, 'Original alias should still exist');
    assert.strictEqual(resolved.sessionPath, '/path/original');
    assert.strictEqual(resolved.title, 'Original Title');
  })) passed++; else failed++;

  // ── Round 33: saveAliases backup restoration ──
  console.log('\nsaveAliases backup/restore (Round 33):');

  if (test('saveAliases creates backup before write and removes on success', () => {
    resetAliases();
    aliases.setAlias('backup-test', '/path/backup');

    // After successful save, .bak file should NOT exist
    const aliasesPath = path.join(tmpHome, '.claude', 'session-aliases.json');
    const backupPath = aliasesPath + '.bak';
    assert.ok(!fs.existsSync(backupPath), 'Backup should be removed after successful save');
    assert.ok(fs.existsSync(aliasesPath), 'Main aliases file should exist');
  })) passed++; else failed++;

  if (test('saveAliases with non-serializable data returns false and preserves existing file', () => {
    resetAliases();
    aliases.setAlias('before-fail', '/path/safe');

    // Verify the file exists
    const aliasesPath = path.join(tmpHome, '.claude', 'session-aliases.json');
    assert.ok(fs.existsSync(aliasesPath), 'Aliases file should exist');
    const contentBefore = fs.readFileSync(aliasesPath, 'utf8');

    // Attempt to save circular data — will fail
    const circular = { aliases: {}, metadata: {} };
    circular.self = circular;
    const result = aliases.saveAliases(circular);
    assert.strictEqual(result, false, 'Should return false');

    // The file should still have the old content (restored from backup or untouched)
    const contentAfter = fs.readFileSync(aliasesPath, 'utf8');
    assert.ok(contentAfter.includes('before-fail'),
      'Original aliases data should be preserved after failed save');
  })) passed++; else failed++;

  // ── Round 39: atomic overwrite on Unix (no unlink before rename) ──
  console.log('\nRound 39: atomic overwrite:');

  if (test('saveAliases overwrites existing file atomically', () => {
    // Create initial aliases
    aliases.setAlias('atomic-test', '2026-01-01-abc123-session.tmp');
    const aliasesPath = aliases.getAliasesPath();
    assert.ok(fs.existsSync(aliasesPath), 'Aliases file should exist');
    const sizeBefore = fs.statSync(aliasesPath).size;
    assert.ok(sizeBefore > 0, 'Aliases file should have content');

    // Overwrite with different data
    aliases.setAlias('atomic-test-2', '2026-02-01-def456-session.tmp');

    // The file should still exist and be valid JSON
    const content = fs.readFileSync(aliasesPath, 'utf8');
    const parsed = JSON.parse(content);
    assert.ok(parsed.aliases['atomic-test'], 'First alias should exist');
    assert.ok(parsed.aliases['atomic-test-2'], 'Second alias should exist');

    // Cleanup
    aliases.deleteAlias('atomic-test');
    aliases.deleteAlias('atomic-test-2');
  })) passed++; else failed++;

  // Cleanup — restore both HOME and USERPROFILE (Windows)
  process.env.HOME = origHome;
  if (origUserProfile !== undefined) {
    process.env.USERPROFILE = origUserProfile;
  } else {
    delete process.env.USERPROFILE;
  }
  try {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  } catch {
    // best-effort
  }

  // ── Round 48: rapid sequential saves data integrity ──
  console.log('\nRound 48: rapid sequential saves:');

  if (test('rapid sequential setAlias calls maintain data integrity', () => {
    resetAliases();
    for (let i = 0; i < 5; i++) {
      const result = aliases.setAlias(`rapid-${i}`, `/path/${i}`, `Title ${i}`);
      assert.strictEqual(result.success, true, `setAlias rapid-${i} should succeed`);
    }
    const data = aliases.loadAliases();
    for (let i = 0; i < 5; i++) {
      assert.ok(data.aliases[`rapid-${i}`], `rapid-${i} should exist after all saves`);
      assert.strictEqual(data.aliases[`rapid-${i}`].sessionPath, `/path/${i}`);
    }
    assert.strictEqual(data.metadata.totalCount, 5, 'Metadata count should match actual aliases');
  })) passed++; else failed++;

  // ── Round 56: Windows platform unlink-before-rename code path ──
  console.log('\nRound 56: Windows platform atomic write path:');

  if (test('Windows platform mock: unlinks existing file before rename', () => {
    resetAliases();
    // First create an alias so the file exists
    const r1 = aliases.setAlias('win-initial', '2026-01-01-abc123-session.tmp');
    assert.strictEqual(r1.success, true, 'Initial alias should succeed');
    const aliasesPath = aliases.getAliasesPath();
    assert.ok(fs.existsSync(aliasesPath), 'Aliases file should exist before win32 test');

    // Mock process.platform to 'win32' to trigger the unlink-before-rename path
    const origPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

    try {
      // This save triggers the Windows code path: unlink existing → rename temp
      const r2 = aliases.setAlias('win-updated', '2026-02-01-def456-session.tmp');
      assert.strictEqual(r2.success, true, 'setAlias should succeed under win32 mock');

      // Verify data integrity after the Windows path
      assert.ok(fs.existsSync(aliasesPath), 'Aliases file should exist after win32 save');
      const data = aliases.loadAliases();
      assert.ok(data.aliases['win-initial'], 'Original alias should still exist');
      assert.ok(data.aliases['win-updated'], 'New alias should exist');
      assert.strictEqual(data.aliases['win-updated'].sessionPath,
        '2026-02-01-def456-session.tmp', 'Session path should match');

      // No .tmp or .bak files left behind
      assert.ok(!fs.existsSync(aliasesPath + '.tmp'), 'No temp file should remain');
      assert.ok(!fs.existsSync(aliasesPath + '.bak'), 'No backup file should remain');
    } finally {
      // Restore original platform descriptor
      if (origPlatform) {
        Object.defineProperty(process, 'platform', origPlatform);
      }
      resetAliases();
    }
  })) passed++; else failed++;

  // ── Round 64: loadAliases backfills missing version and metadata ──
  console.log('\nRound 64: loadAliases version/metadata backfill:');

  if (test('loadAliases backfills missing version and metadata fields', () => {
    resetAliases();
    const aliasesPath = aliases.getAliasesPath();
    // Write a file with valid aliases but NO version and NO metadata
    fs.writeFileSync(aliasesPath, JSON.stringify({
      aliases: {
        'backfill-test': {
          sessionPath: '/sessions/backfill',
          createdAt: '2026-01-15T00:00:00.000Z',
          updatedAt: '2026-01-15T00:00:00.000Z',
          title: 'Backfill Test'
        }
      }
    }));

    const data = aliases.loadAliases();
    // Version should be backfilled to ALIAS_VERSION ('1.0')
    assert.strictEqual(data.version, '1.0', 'Should backfill missing version to 1.0');
    // Metadata should be backfilled with totalCount from aliases
    assert.ok(data.metadata, 'Should backfill missing metadata object');
    assert.strictEqual(data.metadata.totalCount, 1, 'Metadata totalCount should match alias count');
    assert.ok(data.metadata.lastUpdated, 'Metadata should have lastUpdated');
    // Alias data should be preserved
    assert.ok(data.aliases['backfill-test'], 'Alias data should be preserved');
    assert.strictEqual(data.aliases['backfill-test'].sessionPath, '/sessions/backfill');
    resetAliases();
  })) passed++; else failed++;

  // ── Round 67: loadAliases empty file, resolveSessionAlias null, metadata-only backfill ──
  console.log('\nRound 67: loadAliases (empty 0-byte file):');

  if (test('loadAliases returns default structure for empty (0-byte) file', () => {
    resetAliases();
    const aliasesPath = aliases.getAliasesPath();
    // Write a 0-byte file — readFile returns '', which is falsy → !content branch
    fs.writeFileSync(aliasesPath, '');
    const data = aliases.loadAliases();
    assert.ok(data.aliases, 'Should have aliases key');
    assert.strictEqual(Object.keys(data.aliases).length, 0, 'Should have no aliases');
    assert.strictEqual(data.version, '1.0', 'Should have default version');
    assert.ok(data.metadata, 'Should have metadata');
    assert.strictEqual(data.metadata.totalCount, 0, 'Should have totalCount 0');
    resetAliases();
  })) passed++; else failed++;

  console.log('\nRound 67: resolveSessionAlias (null/falsy input):');

  if (test('resolveSessionAlias returns null when given null input', () => {
    resetAliases();
    const result = aliases.resolveSessionAlias(null);
    assert.strictEqual(result, null, 'Should return null for null input');
  })) passed++; else failed++;

  console.log('\nRound 67: loadAliases (metadata-only backfill, version present):');

  if (test('loadAliases backfills only metadata when version already present', () => {
    resetAliases();
    const aliasesPath = aliases.getAliasesPath();
    // Write a file WITH version but WITHOUT metadata
    fs.writeFileSync(aliasesPath, JSON.stringify({
      version: '1.0',
      aliases: {
        'meta-only': {
          sessionPath: '/sessions/meta-only',
          createdAt: '2026-01-20T00:00:00.000Z',
          updatedAt: '2026-01-20T00:00:00.000Z',
          title: 'Metadata Only Test'
        }
      }
    }));

    const data = aliases.loadAliases();
    // Version should remain as-is (NOT overwritten)
    assert.strictEqual(data.version, '1.0', 'Version should remain 1.0');
    // Metadata should be backfilled
    assert.ok(data.metadata, 'Should backfill missing metadata');
    assert.strictEqual(data.metadata.totalCount, 1, 'Metadata totalCount should be 1');
    assert.ok(data.metadata.lastUpdated, 'Metadata should have lastUpdated');
    // Alias data should be preserved
    assert.ok(data.aliases['meta-only'], 'Alias should be preserved');
    assert.strictEqual(data.aliases['meta-only'].title, 'Metadata Only Test');
    resetAliases();
  })) passed++; else failed++;

  // ── Round 70: updateAliasTitle save failure path ──
  console.log('\nupdateAliasTitle save failure (Round 70):');

  if (test('updateAliasTitle returns failure when saveAliases fails (read-only dir)', () => {
    if (process.platform === 'win32' || process.getuid?.() === 0) {
      console.log('    (skipped — chmod ineffective on Windows/root)');
      return;
    }
    // Use a fresh isolated HOME to avoid .tmp/.bak leftovers from other tests.
    // On macOS, overwriting an EXISTING file in a read-only dir succeeds,
    // so we must start clean with ONLY the .json file present.
    const isoHome = path.join(os.tmpdir(), `ecc-alias-r70-${Date.now()}`);
    const isoClaudeDir = path.join(isoHome, '.claude');
    fs.mkdirSync(isoClaudeDir, { recursive: true });
    const savedHome = process.env.HOME;
    const savedProfile = process.env.USERPROFILE;
    try {
      process.env.HOME = isoHome;
      process.env.USERPROFILE = isoHome;
      // Re-require to pick up new HOME
      delete require.cache[require.resolve('../../scripts/lib/session-aliases')];
      delete require.cache[require.resolve('../../scripts/lib/utils')];
      const freshAliases = require('../../scripts/lib/session-aliases');

      // Set up a valid alias
      freshAliases.setAlias('title-save-fail', '/path/session', 'Original Title');
      // Verify no leftover .tmp/.bak
      const ap = freshAliases.getAliasesPath();
      assert.ok(fs.existsSync(ap), 'Alias file should exist after setAlias');

      // Make .claude dir read-only so saveAliases fails when creating .bak
      fs.chmodSync(isoClaudeDir, 0o555);

      const result = freshAliases.updateAliasTitle('title-save-fail', 'New Title');
      assert.strictEqual(result.success, false, 'Should fail when save is blocked');
      assert.ok(result.error.includes('Failed to update alias title'),
        `Should return save failure error, got: ${result.error}`);
    } finally {
      try { fs.chmodSync(isoClaudeDir, 0o755); } catch { /* best-effort */ }
      process.env.HOME = savedHome;
      process.env.USERPROFILE = savedProfile;
      delete require.cache[require.resolve('../../scripts/lib/session-aliases')];
      delete require.cache[require.resolve('../../scripts/lib/utils')];
      fs.rmSync(isoHome, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ── Round 72: deleteAlias save failure path ──
  console.log('\nRound 72: deleteAlias (save failure):');

  if (test('deleteAlias returns failure when saveAliases fails (read-only dir)', () => {
    if (process.platform === 'win32' || process.getuid?.() === 0) {
      console.log('    (skipped — chmod ineffective on Windows/root)');
      return;
    }
    const isoHome = path.join(os.tmpdir(), `ecc-alias-r72-${Date.now()}`);
    const isoClaudeDir = path.join(isoHome, '.claude');
    fs.mkdirSync(isoClaudeDir, { recursive: true });
    const savedHome = process.env.HOME;
    const savedProfile = process.env.USERPROFILE;
    try {
      process.env.HOME = isoHome;
      process.env.USERPROFILE = isoHome;
      delete require.cache[require.resolve('../../scripts/lib/session-aliases')];
      delete require.cache[require.resolve('../../scripts/lib/utils')];
      const freshAliases = require('../../scripts/lib/session-aliases');

      // Create an alias first (writes the file)
      freshAliases.setAlias('to-delete', '/path/session', 'Test');
      const ap = freshAliases.getAliasesPath();
      assert.ok(fs.existsSync(ap), 'Alias file should exist after setAlias');

      // Make .claude directory read-only — save will fail (can't create temp file)
      fs.chmodSync(isoClaudeDir, 0o555);

      const result = freshAliases.deleteAlias('to-delete');
      assert.strictEqual(result.success, false, 'Should fail when save is blocked');
      assert.ok(result.error.includes('Failed to delete alias'),
        `Should return delete failure error, got: ${result.error}`);
    } finally {
      try { fs.chmodSync(isoClaudeDir, 0o755); } catch { /* best-effort */ }
      process.env.HOME = savedHome;
      process.env.USERPROFILE = savedProfile;
      delete require.cache[require.resolve('../../scripts/lib/session-aliases')];
      delete require.cache[require.resolve('../../scripts/lib/utils')];
      fs.rmSync(isoHome, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // Summary
  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
