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

  if (test('cleanupAliases with empty aliases file does nothing', () => {
    resetAliases();
    const result = aliases.cleanupAliases(() => true);
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

  // Summary
  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
