#!/usr/bin/env node

/**
 * Night Shift Helper Script
 * Utilities for autonomous task execution from tasks.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Find tasks.md in the following priority:
 * 1. .kiro/specs/[project name]/tasks.md
 * 2. .kiro/tasks.md
 * 3. tasks.md (root)
 */
function findTasksFile() {
  // Check .kiro/specs/[project name]/tasks.md
  if (fs.existsSync('.kiro/specs')) {
    const specsDir = '.kiro/specs';
    const projectDirs = fs.readdirSync(specsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const projectDir of projectDirs) {
      const tasksPath = path.join(specsDir, projectDir, 'tasks.md');
      if (fs.existsSync(tasksPath)) {
        return tasksPath;
      }
    }
  }

  // Check .kiro/tasks.md
  if (fs.existsSync('.kiro/tasks.md')) {
    return '.kiro/tasks.md';
  }

  // Check root tasks.md
  if (fs.existsSync('tasks.md')) {
    return 'tasks.md';
  }

  return null;
}

/**
 * Find spec directory in the following priority:
 * 1. .kiro/specs/[project name]/
 * 2. spec/
 */
function findSpecDir() {
  // Check .kiro/specs/[project name]
  if (fs.existsSync('.kiro/specs')) {
    const specsDir = '.kiro/specs';
    const projectDirs = fs.readdirSync(specsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (projectDirs.length > 0) {
      return path.join(specsDir, projectDirs[0]);
    }
  }

  // Check root spec/
  if (fs.existsSync('spec')) {
    return 'spec';
  }

  return null;
}

/**
 * Parse tasks.md and extract task list
 */
function parseTasks(tasksPath) {
  // Auto-detect if not provided
  if (!tasksPath) {
    tasksPath = findTasksFile();
  }

  if (!tasksPath || !fs.existsSync(tasksPath)) {
    console.error(`Error: ${tasksPath || 'tasks.md'} not found`);
    console.error('Searched: .kiro/specs/[project]/tasks.md, .kiro/tasks.md, tasks.md');
    process.exit(1);
  }

  const content = fs.readFileSync(tasksPath, 'utf-8');
  const lines = content.split('\n');
  const tasks = [];

  lines.forEach((line, index) => {
    const uncheckedMatch = line.match(/^(\s*)-\s+\[\s+\]\s+(.+)$/);
    const checkedMatch = line.match(/^(\s*)-\s+\[x\]\s+(.+)$/i);
    const commentMatch = line.match(/<!--\s*FAILED:\s*(.+?)\s*-->/);

    if (uncheckedMatch) {
      tasks.push({
        lineNumber: index + 1,
        checked: false,
        text: uncheckedMatch[2].trim(),
        indent: uncheckedMatch[1].length,
        failed: false
      });
    } else if (checkedMatch) {
      tasks.push({
        lineNumber: index + 1,
        checked: true,
        text: checkedMatch[2].trim(),
        indent: checkedMatch[1].length,
        failed: false
      });
    }

    // Check for FAILED comment on the line after a task
    if (commentMatch && tasks.length > 0) {
      tasks[tasks.length - 1].failed = true;
      tasks[tasks.length - 1].failReason = commentMatch[1].trim();
    }
  });

  return tasks;
}

/**
 * Get the next unchecked task
 */
function getNextTask(tasksPath) {
  if (!tasksPath) {
    tasksPath = findTasksFile();
  }
  const tasks = parseTasks(tasksPath);
  const nextTask = tasks.find(task => !task.checked && !task.failed);

  return nextTask || null;
}

/**
 * Get all unchecked tasks
 */
function getUncompletedTasks(tasksPath) {
  if (!tasksPath) {
    tasksPath = findTasksFile();
  }
  const tasks = parseTasks(tasksPath);
  return tasks.filter(task => !task.checked);
}

/**
 * Get task completion statistics
 */
function getTaskStats(tasksPath) {
  if (!tasksPath) {
    tasksPath = findTasksFile();
  }
  const tasks = parseTasks(tasksPath);
  const total = tasks.length;
  const completed = tasks.filter(t => t.checked).length;
  const failed = tasks.filter(t => t.failed).length;
  const remaining = tasks.filter(t => !t.checked && !t.failed).length;

  return {
    total,
    completed,
    failed,
    remaining,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

/**
 * Fetch open GitHub issues
 */
function getGitHubIssues() {
  try {
    const output = execSync(
      'gh issue list --state open --limit 50 --json number,title,body',
      { encoding: 'utf-8' }
    );
    return JSON.parse(output);
  } catch (error) {
    console.error('Error fetching GitHub issues:', error.message);
    return [];
  }
}

/**
 * Match task to GitHub issue using fuzzy matching
 */
function matchTaskToIssue(taskText, issues) {
  if (!issues || issues.length === 0) return null;

  const taskWords = taskText.toLowerCase().split(/\s+/);
  let bestMatch = null;
  let bestScore = 0;

  issues.forEach(issue => {
    const issueText = `${issue.title} ${issue.body || ''}`.toLowerCase();
    const issueWords = issueText.split(/\s+/);

    // Calculate word overlap score
    let score = 0;
    taskWords.forEach(word => {
      if (word.length > 3 && issueWords.some(iw => iw.includes(word) || word.includes(iw))) {
        score++;
      }
    });

    // Normalize score by task word count
    const normalizedScore = score / taskWords.length;

    if (normalizedScore > bestScore && normalizedScore > 0.3) {
      bestScore = normalizedScore;
      bestMatch = issue;
    }
  });

  return bestMatch;
}

/**
 * Mark task as completed in tasks.md
 */
function markTaskCompleted(tasksPath, taskText) {
  let content = fs.readFileSync(tasksPath, 'utf-8');

  // Find and replace the unchecked task
  const regex = new RegExp(`^(\\s*)-\\s+\\[\\s+\\]\\s+${escapeRegex(taskText)}$`, 'm');
  content = content.replace(regex, '$1- [x] ' + taskText);

  fs.writeFileSync(tasksPath, content, 'utf-8');
}

/**
 * Mark task as failed in tasks.md
 */
function markTaskFailed(tasksPath, taskText, reason) {
  let content = fs.readFileSync(tasksPath, 'utf-8');

  // Find the task line and add FAILED comment below it
  const lines = content.split('\n');
  const taskIndex = lines.findIndex(line =>
    line.match(new RegExp(`^\\s*-\\s+\\[\\s+\\]\\s+${escapeRegex(taskText)}$`))
  );

  if (taskIndex !== -1) {
    lines.splice(taskIndex + 1, 0, `<!-- FAILED: ${reason} -->`);
    content = lines.join('\n');
    fs.writeFileSync(tasksPath, content, 'utf-8');
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Display task progress
 */
function displayProgress(tasksPath) {
  if (!tasksPath) {
    tasksPath = findTasksFile();
    if (!tasksPath) {
      console.error('❌ Error: tasks.md not found');
      console.log('   Searched: .kiro/specs/[project]/tasks.md, .kiro/tasks.md, tasks.md');
      return;
    }
  }

  console.log(`\n📂 Using: ${tasksPath}\n`);

  const stats = getTaskStats(tasksPath);

  console.log('🌙 Night Shift Progress Report');
  console.log('━'.repeat(50));
  console.log(`Total Tasks:     ${stats.total}`);
  console.log(`Completed:       ${stats.completed} ✓`);
  console.log(`Failed:          ${stats.failed} ✗`);
  console.log(`Remaining:       ${stats.remaining}`);
  console.log(`Progress:        ${stats.progress}%`);
  console.log('━'.repeat(50));

  const nextTask = getNextTask(tasksPath);
  if (nextTask) {
    console.log(`\n📋 Next Task: ${nextTask.text}`);

    const issues = getGitHubIssues();
    const matchedIssue = matchTaskToIssue(nextTask.text, issues);

    if (matchedIssue) {
      console.log(`🔗 Matched Issue: #${matchedIssue.number} - ${matchedIssue.title}`);
    } else {
      console.log('ℹ️  No matching GitHub issue found');
    }
  } else {
    console.log('\n✨ All tasks completed!');
  }
}

/**
 * Create CURRENT_TASK.md file
 */
function createCurrentTaskFile(task, issue = null, specFiles = []) {
  const content = `# Current Task

## Task Description
${task.text}

${issue ? `## GitHub Issue #${issue.number}

**Title**: ${issue.title}

**Body**:
${issue.body || 'No description provided'}

---
` : ''}

## Implementation Plan

### 1. Write Tests
- [ ] Create/update test file
- [ ] Write failing tests
- [ ] Verify tests fail

### 2. Write Code
- [ ] Implement minimum code to pass tests
- [ ] Follow coding standards
- [ ] Keep changes focused

### 3. Refactor
- [ ] Clean up implementation
- [ ] Ensure tests still pass
- [ ] Update documentation

## Relevant Specifications
${specFiles.length > 0 ? specFiles.map(f => `- ${f}`).join('\n') : '- None found'}

## Status
- Attempt: 1/3
- Last Error: None

## Notes
`;

  fs.writeFileSync('CURRENT_TASK.md', content, 'utf-8');
  console.log('✓ Created CURRENT_TASK.md');
}

/**
 * Check if on correct branch (not main)
 */
function checkBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();

    if (branch === 'main' || branch === 'master') {
      console.error('❌ Error: Cannot run Night Shift on main/master branch');
      console.log('💡 Create a feature branch first:');
      console.log('   git checkout -b night-shift-$(date +%Y-%m-%d)');
      return false;
    }

    console.log(`✓ On branch: ${branch}`);
    return true;
  } catch (error) {
    console.error('❌ Error checking git branch:', error.message);
    return false;
  }
}

/**
 * Ensure required files exist
 */
function checkPrerequisites() {
  let allPassed = true;

  // Check for tasks.md (auto-detect)
  const tasksPath = findTasksFile();
  if (tasksPath) {
    console.log(`✓ Task list found: ${tasksPath}`);
  } else {
    console.log('⚠️  Task list not found');
    console.log('   Searched: .kiro/specs/[project]/tasks.md, .kiro/tasks.md, tasks.md');
    allPassed = false;
  }

  // Check for spec directory (auto-detect)
  const specDir = findSpecDir();
  if (specDir) {
    console.log(`✓ Specification folder found: ${specDir}`);
  } else {
    console.log('⚠️  Specification folder not found');
    console.log('   Searched: .kiro/specs/[project]/, spec/');
    allPassed = false;
  }

  return allPassed;
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'progress':
    case 'status':
      displayProgress();
      break;

    case 'next':
      const nextTask = getNextTask();
      if (nextTask) {
        console.log(nextTask.text);
      } else {
        console.log('No unchecked tasks remaining');
        process.exit(1);
      }
      break;

    case 'check':
      console.log('🔍 Checking Night Shift Prerequisites\n');
      const branchOk = checkBranch();
      const prereqOk = checkPrerequisites();

      if (branchOk && prereqOk) {
        console.log('\n✓ Ready for Night Shift!');
        process.exit(0);
      } else {
        console.log('\n✗ Prerequisites not met');
        process.exit(1);
      }
      break;

    case 'match':
      const taskText = process.argv.slice(3).join(' ');
      if (!taskText) {
        console.error('Usage: node night-shift-helper.js match <task text>');
        process.exit(1);
      }
      const issues = getGitHubIssues();
      const match = matchTaskToIssue(taskText, issues);
      if (match) {
        console.log(`#${match.number} - ${match.title}`);
      } else {
        console.log('No matching issue found');
      }
      break;

    case 'init-task':
      const task = getNextTask();
      if (!task) {
        console.log('No tasks to initialize');
        process.exit(1);
      }
      const allIssues = getGitHubIssues();
      const matchedIssue = matchTaskToIssue(task.text, allIssues);
      createCurrentTaskFile(task, matchedIssue);
      break;

    default:
      console.log('Night Shift Helper - Utilities for autonomous task execution\n');
      console.log('Usage:');
      console.log('  node night-shift-helper.js progress  - Show task progress');
      console.log('  node night-shift-helper.js next      - Show next task');
      console.log('  node night-shift-helper.js check     - Check prerequisites');
      console.log('  node night-shift-helper.js match <task> - Find matching issue');
      console.log('  node night-shift-helper.js init-task - Create CURRENT_TASK.md');
  }
}

// Export functions for use as module
module.exports = {
  findTasksFile,
  findSpecDir,
  parseTasks,
  getNextTask,
  getUncompletedTasks,
  getTaskStats,
  getGitHubIssues,
  matchTaskToIssue,
  markTaskCompleted,
  markTaskFailed,
  displayProgress,
  createCurrentTaskFile,
  checkBranch,
  checkPrerequisites
};
