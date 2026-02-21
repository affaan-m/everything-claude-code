#!/usr/bin/env node
/**
 * Sync command adapters from canonical root commands/.
 *
 * By default, writes updates into adapter targets.
 * Use --check to report drift without writing.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT_DIR, 'commands');

const TARGETS = [
  {
    name: 'cursor',
    dir: path.join(ROOT_DIR, '.cursor/commands'),
    excluded: new Set(),
    overrides: new Set([
      'build-fix.md',
      'evolve.md',
      'refactor-clean.md',
      'test-coverage.md',
      'update-codemaps.md',
      'update-docs.md'
    ]),
    extraAllowed: new Set()
  },
  {
    name: 'opencode',
    dir: path.join(ROOT_DIR, '.opencode/commands'),
    excluded: new Set([
      'multi-backend.md',
      'multi-execute.md',
      'multi-frontend.md',
      'multi-plan.md',
      'multi-workflow.md',
      'pm2.md',
      'python-review.md',
      'sessions.md'
    ]),
    overrides: new Set([
      'build-fix.md',
      'checkpoint.md',
      'code-review.md',
      'e2e.md',
      'eval.md',
      'evolve.md',
      'go-build.md',
      'go-review.md',
      'go-test.md',
      'instinct-export.md',
      'instinct-import.md',
      'instinct-status.md',
      'learn.md',
      'orchestrate.md',
      'plan.md',
      'refactor-clean.md',
      'setup-pm.md',
      'skill-create.md',
      'tdd.md',
      'test-coverage.md',
      'update-codemaps.md',
      'update-docs.md',
      'verify.md'
    ]),
    extraAllowed: new Set(['security.md'])
  }
];

function readNormalized(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith('.md')).sort();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function syncTarget(target, sourceFiles, checkOnly) {
  const issues = [];
  const updates = [];
  const expectedFiles = sourceFiles.filter(file => !target.excluded.has(file));
  const expectedSet = new Set(expectedFiles);

  for (const file of expectedFiles) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const targetPath = path.join(target.dir, file);
    const isOverride = target.overrides.has(file);

    if (!fs.existsSync(targetPath)) {
      if (isOverride || checkOnly) {
        issues.push(`[${target.name}] missing command: ${file}`);
      } else {
        copyFile(sourcePath, targetPath);
        updates.push(`[${target.name}] created ${file}`);
      }
      continue;
    }

    if (isOverride) continue;

    const sourceContent = readNormalized(sourcePath);
    const targetContent = readNormalized(targetPath);
    if (sourceContent !== targetContent) {
      if (checkOnly) {
        issues.push(`[${target.name}] drift detected: ${file}`);
      } else {
        copyFile(sourcePath, targetPath);
        updates.push(`[${target.name}] updated ${file}`);
      }
    }
  }

  const targetFiles = listMarkdownFiles(target.dir);
  for (const file of targetFiles) {
    const isExpected = expectedSet.has(file);
    const isAllowedExtra = target.extraAllowed.has(file);
    if (!isExpected && !isAllowedExtra) {
      issues.push(`[${target.name}] unexpected adapter command: ${file}`);
    }
  }

  return { issues, updates };
}

function syncCommandAdapters(options = {}) {
  const { checkOnly = false } = options;

  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`commands directory not found: ${SOURCE_DIR}`);
  }

  const sourceFiles = listMarkdownFiles(SOURCE_DIR);
  let allIssues = [];
  let allUpdates = [];

  for (const target of TARGETS) {
    ensureDir(target.dir);
    const result = syncTarget(target, sourceFiles, checkOnly);
    allIssues = allIssues.concat(result.issues);
    allUpdates = allUpdates.concat(result.updates);
  }

  if (allIssues.length > 0) {
    for (const issue of allIssues) console.error(issue);
  }

  if (!checkOnly && allUpdates.length > 0) {
    for (const update of allUpdates) console.log(update);
  }

  if (!checkOnly && allUpdates.length === 0 && allIssues.length === 0) {
    console.log('Command adapters are already in sync.');
  }

  return { issues: allIssues, updates: allUpdates };
}

if (require.main === module) {
  const checkOnly = process.argv.includes('--check');
  const { issues } = syncCommandAdapters({ checkOnly });

  if (issues.length > 0) {
    process.exit(1);
  }
  process.exit(0);
}

module.exports = {
  syncCommandAdapters
};

