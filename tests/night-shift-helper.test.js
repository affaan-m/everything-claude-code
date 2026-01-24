/**
 * Tests for scripts/night-shift-helper.js
 *
 * Run with: node tests/night-shift-helper.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the module
const helper = require('../scripts/night-shift-helper');

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    if (err.stack) {
      console.log(`    Stack: ${err.stack.split('\n')[1]}`);
    }
    return false;
  }
}

// Test fixtures
const testTasksContent = `# Test Tasks

## Phase 1
- [ ] First unchecked task
- [x] Completed task
- [ ] Second unchecked task
<!-- FAILED: Some reason -->
- [ ] Third unchecked task

## Phase 2
- [x] Another completed task
- [ ] Last task
`;

const testIssues = [
  {
    number: 1,
    title: 'First unchecked task implementation',
    body: 'Details about the first task'
  },
  {
    number: 2,
    title: 'Setup something else',
    body: 'Different task'
  },
  {
    number: 3,
    title: 'Third task to do',
    body: 'Details about third task'
  }
];

// Create temp test file
function createTempTasksFile(content) {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `test-tasks-${Date.now()}.md`);
  fs.writeFileSync(tempFile, content, 'utf-8');
  return tempFile;
}

// Test suite
function runTests() {
  console.log('\n=== Testing night-shift-helper.js ===\n');

  let passed = 0;
  let failed = 0;

  // Task parsing tests
  console.log('Task Parsing:');

  const tempFile = createTempTasksFile(testTasksContent);

  if (test('parseTasks returns array of tasks', () => {
    const tasks = helper.parseTasks(tempFile);
    assert.ok(Array.isArray(tasks));
    assert.strictEqual(tasks.length, 6);
  })) passed++; else failed++;

  if (test('parseTasks correctly identifies unchecked tasks', () => {
    const tasks = helper.parseTasks(tempFile);
    const unchecked = tasks.filter(t => !t.checked);
    assert.strictEqual(unchecked.length, 4);
  })) passed++; else failed++;

  if (test('parseTasks correctly identifies checked tasks', () => {
    const tasks = helper.parseTasks(tempFile);
    const checked = tasks.filter(t => t.checked);
    assert.strictEqual(checked.length, 2);
  })) passed++; else failed++;

  if (test('parseTasks correctly identifies failed tasks', () => {
    const tasks = helper.parseTasks(tempFile);
    const failed = tasks.filter(t => t.failed);
    assert.strictEqual(failed.length, 1);
    assert.strictEqual(failed[0].failReason, 'Some reason');
  })) passed++; else failed++;

  if (test('getNextTask returns first unchecked, non-failed task', () => {
    const nextTask = helper.getNextTask(tempFile);
    assert.ok(nextTask);
    assert.strictEqual(nextTask.text, 'First unchecked task');
    assert.strictEqual(nextTask.checked, false);
  })) passed++; else failed++;

  if (test('getUncompletedTasks returns all unchecked tasks', () => {
    const uncompleted = helper.getUncompletedTasks(tempFile);
    assert.strictEqual(uncompleted.length, 4);
  })) passed++; else failed++;

  // Task stats tests
  console.log('\nTask Statistics:');

  if (test('getTaskStats returns correct stats', () => {
    const stats = helper.getTaskStats(tempFile);
    assert.strictEqual(stats.total, 6);
    assert.strictEqual(stats.completed, 2);
    assert.strictEqual(stats.failed, 1);
    assert.strictEqual(stats.remaining, 3); // unchecked and not failed
    assert.strictEqual(stats.progress, 33); // 2/6 = 33%
  })) passed++; else failed++;

  // Issue matching tests
  console.log('\nGitHub Issue Matching:');

  if (test('matchTaskToIssue finds exact match', () => {
    const match = helper.matchTaskToIssue('First unchecked task', testIssues);
    assert.ok(match);
    assert.strictEqual(match.number, 1);
  })) passed++; else failed++;

  if (test('matchTaskToIssue finds partial match', () => {
    const match = helper.matchTaskToIssue('third task', testIssues);
    assert.ok(match);
    assert.strictEqual(match.number, 3);
  })) passed++; else failed++;

  if (test('matchTaskToIssue returns null for no match', () => {
    const match = helper.matchTaskToIssue('completely unrelated task xyz', testIssues);
    assert.strictEqual(match, null);
  })) passed++; else failed++;

  if (test('matchTaskToIssue handles empty issues array', () => {
    const match = helper.matchTaskToIssue('some task', []);
    assert.strictEqual(match, null);
  })) passed++; else failed++;

  // Task modification tests
  console.log('\nTask Modifications:');

  if (test('markTaskCompleted updates tasks.md correctly', () => {
    const tempFile2 = createTempTasksFile(testTasksContent);
    helper.markTaskCompleted(tempFile2, 'First unchecked task');

    const content = fs.readFileSync(tempFile2, 'utf-8');
    assert.ok(content.includes('- [x] First unchecked task'));
    assert.ok(!content.includes('- [ ] First unchecked task'));

    fs.unlinkSync(tempFile2);
  })) passed++; else failed++;

  if (test('markTaskFailed adds FAILED comment', () => {
    const tempFile3 = createTempTasksFile(testTasksContent);
    helper.markTaskFailed(tempFile3, 'Third unchecked task', 'Test failure reason');

    const content = fs.readFileSync(tempFile3, 'utf-8');
    assert.ok(content.includes('<!-- FAILED: Test failure reason -->'));

    fs.unlinkSync(tempFile3);
  })) passed++; else failed++;

  // File creation tests
  console.log('\nFile Creation:');

  if (test('createCurrentTaskFile creates valid markdown', () => {
    const task = { text: 'Test task', lineNumber: 1 };
    const issue = { number: 42, title: 'Test Issue', body: 'Test body' };

    helper.createCurrentTaskFile(task, issue);

    assert.ok(fs.existsSync('CURRENT_TASK.md'));
    const content = fs.readFileSync('CURRENT_TASK.md', 'utf-8');

    assert.ok(content.includes('Test task'));
    assert.ok(content.includes('#42'));
    assert.ok(content.includes('Test Issue'));

    fs.unlinkSync('CURRENT_TASK.md');
  })) passed++; else failed++;

  if (test('createCurrentTaskFile works without issue', () => {
    const task = { text: 'Test task without issue', lineNumber: 1 };

    helper.createCurrentTaskFile(task, null);

    assert.ok(fs.existsSync('CURRENT_TASK.md'));
    const content = fs.readFileSync('CURRENT_TASK.md', 'utf-8');

    assert.ok(content.includes('Test task without issue'));
    assert.ok(!content.includes('GitHub Issue'));

    fs.unlinkSync('CURRENT_TASK.md');
  })) passed++; else failed++;

  // Cleanup
  fs.unlinkSync(tempFile);

  // Edge cases
  console.log('\nEdge Cases:');

  if (test('getNextTask returns null when all tasks complete', () => {
    const allCompleteContent = `# Tasks
- [x] Task 1
- [x] Task 2
- [x] Task 3
`;
    const tempFile4 = createTempTasksFile(allCompleteContent);
    const nextTask = helper.getNextTask(tempFile4);
    assert.strictEqual(nextTask, null);
    fs.unlinkSync(tempFile4);
  })) passed++; else failed++;

  if (test('parseTasks handles empty file', () => {
    const tempFile5 = createTempTasksFile('');
    const tasks = helper.parseTasks(tempFile5);
    assert.ok(Array.isArray(tasks));
    assert.strictEqual(tasks.length, 0);
    fs.unlinkSync(tempFile5);
  })) passed++; else failed++;

  if (test('parseTasks handles malformed tasks', () => {
    const malformedContent = `# Tasks
- [ ] Valid task
-[ ] Missing space
- [] Missing x
- [x] Valid completed
Not a task line
`;
    const tempFile6 = createTempTasksFile(malformedContent);
    const tasks = helper.parseTasks(tempFile6);
    assert.strictEqual(tasks.length, 2); // Only valid tasks
    fs.unlinkSync(tempFile6);
  })) passed++; else failed++;

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');

  return failed === 0 ? 0 : 1;
}

// Run tests
if (require.main === module) {
  const exitCode = runTests();
  process.exit(exitCode);
}

module.exports = { runTests };
