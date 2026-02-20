#!/usr/bin/env node
/**
 * Sync/check Cursor rules and skills adapters from canonical root sources.
 *
 * Supports:
 * - check mode (CI): detect drift and missing mappings
 * - sync mode: auto-update safe non-override files
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');

const RULES_DIR = path.join(ROOT_DIR, 'rules');
const CURSOR_RULES_DIR = path.join(ROOT_DIR, '.cursor/rules');

const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const CURSOR_SKILLS_DIR = path.join(ROOT_DIR, '.cursor/skills');

const RULE_LANGS = ['common', 'typescript', 'python', 'golang'];

// Language-specific Cursor rule variants are intentionally adapted.
const CURSOR_RULE_OVERRIDES = new Set([
  'typescript-coding-style.md',
  'typescript-hooks.md',
  'typescript-patterns.md',
  'typescript-security.md',
  'typescript-testing.md',
  'python-coding-style.md',
  'python-hooks.md',
  'python-patterns.md',
  'python-security.md',
  'python-testing.md',
  'golang-coding-style.md',
  'golang-hooks.md',
  'golang-patterns.md',
  'golang-security.md',
  'golang-testing.md'
]);

const CURSOR_EXTRA_RULES = new Set([
  'context-dev.md',
  'context-research.md',
  'context-review.md',
  'hooks-guidance.md'
]);

// Root skills currently not shipped in Cursor adapter.
const CURSOR_SKILL_EXCLUDED = new Set([
  'api-design',
  'content-hash-cache-pattern',
  'cost-aware-llm-pipeline',
  'database-migrations',
  'deployment-patterns',
  'docker-patterns',
  'e2e-testing',
  'regex-vs-llm-structured-text',
  'swift-actor-persistence',
  'swift-protocol-di-testing'
]);

// Cursor skill variants intentionally diverge in content.
const CURSOR_SKILL_OVERRIDES = new Set([
  'backend-patterns',
  'clickhouse-io',
  'coding-standards',
  'continuous-learning',
  'continuous-learning-v2',
  'django-verification',
  'eval-harness',
  'frontend-patterns',
  'iterative-retrieval',
  'java-coding-standards',
  'jpa-patterns',
  'springboot-patterns',
  'springboot-security',
  'springboot-verification',
  'strategic-compact'
]);

const CURSOR_SKILL_EXTRA_FILES = {
  'strategic-compact': new Set(['suggest-compact.js'])
};

function normalizeText(content) {
  return content.replace(/\r\n/g, '\n');
}

function readNormalized(filePath) {
  return normalizeText(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith('.md')).sort();
}

function listSubdirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

function listFilesRecursive(dir, rel = '') {
  if (!fs.existsSync(dir)) return [];
  const files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '__pycache__' || entry.name === '.DS_Store') continue;

    const nextRel = rel ? `${rel}/${entry.name}` : entry.name;
    const absPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(absPath, nextRel));
    } else if (!entry.name.endsWith('.pyc')) {
      files.push(nextRel);
    }
  }

  return files.sort();
}

function splitFrontmatter(content) {
  const text = normalizeText(content);
  if (!text.startsWith('---\n')) {
    return { frontmatter: '', body: text };
  }

  const closingIndex = text.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    return { frontmatter: '', body: text };
  }

  const frontmatter = text.slice(0, closingIndex + 5);
  const body = text.slice(closingIndex + 5).replace(/^\n+/, '');
  return { frontmatter, body };
}

function composeFrontmatterAndBody(frontmatter, body) {
  const normalizedBody = normalizeText(body).replace(/\n+$/, '\n');
  if (!frontmatter) return normalizedBody;
  return `${frontmatter}\n${normalizedBody}`;
}

function copyFile(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function syncCursorRules(options = {}) {
  const { checkOnly = false } = options;
  const issues = [];
  const updates = [];
  const expectedRules = new Set();

  for (const lang of RULE_LANGS) {
    const sourceDir = path.join(RULES_DIR, lang);
    if (!fs.existsSync(sourceDir)) {
      issues.push(`[rules] missing source language directory: ${lang}`);
      continue;
    }

    for (const file of listMarkdownFiles(sourceDir)) {
      const sourcePath = path.join(sourceDir, file);
      const targetName = `${lang}-${file}`;
      const targetPath = path.join(CURSOR_RULES_DIR, targetName);
      const isOverride = CURSOR_RULE_OVERRIDES.has(targetName);

      expectedRules.add(targetName);

      if (!fs.existsSync(targetPath)) {
        issues.push(`[rules] missing cursor rule: ${targetName}`);
        continue;
      }

      if (isOverride) continue;

      const sourceContent = readNormalized(sourcePath).replace(/\n+$/, '\n');
      const targetContent = readNormalized(targetPath);
      const { frontmatter, body } = splitFrontmatter(targetContent);
      const targetBody = body.replace(/\n+$/, '\n');

      if (sourceContent !== targetBody) {
        if (checkOnly) {
          issues.push(`[rules] drift detected: ${targetName}`);
        } else if (!frontmatter) {
          issues.push(`[rules] missing frontmatter in cursor rule: ${targetName}`);
        } else {
          fs.writeFileSync(targetPath, composeFrontmatterAndBody(frontmatter, sourceContent));
          updates.push(`[rules] updated ${targetName}`);
        }
      }
    }
  }

  for (const cursorRule of listMarkdownFiles(CURSOR_RULES_DIR)) {
    const isExpected = expectedRules.has(cursorRule);
    const isAllowedExtra = CURSOR_EXTRA_RULES.has(cursorRule);
    if (!isExpected && !isAllowedExtra) {
      issues.push(`[rules] unexpected cursor rule file: ${cursorRule}`);
    }
  }

  return { issues, updates };
}

function syncCursorSkills(options = {}) {
  const { checkOnly = false } = options;
  const issues = [];
  const updates = [];

  const sourceSkillDirs = listSubdirs(SKILLS_DIR);
  const expectedSkillDirs = sourceSkillDirs.filter(name => !CURSOR_SKILL_EXCLUDED.has(name));
  const expectedSet = new Set(expectedSkillDirs);

  for (const skillName of expectedSkillDirs) {
    const sourceDir = path.join(SKILLS_DIR, skillName);
    const targetDir = path.join(CURSOR_SKILLS_DIR, skillName);
    const isOverride = CURSOR_SKILL_OVERRIDES.has(skillName);
    const allowedExtra = CURSOR_SKILL_EXTRA_FILES[skillName] || new Set();

    if (!fs.existsSync(targetDir)) {
      issues.push(`[skills] missing cursor skill directory: ${skillName}`);
      continue;
    }

    const sourceFiles = listFilesRecursive(sourceDir);
    const targetFiles = listFilesRecursive(targetDir);
    const sourceSet = new Set(sourceFiles);
    const targetSet = new Set(targetFiles);

    for (const relPath of sourceFiles) {
      const sourcePath = path.join(sourceDir, relPath);
      const targetPath = path.join(targetDir, relPath);

      if (!targetSet.has(relPath)) {
        if (checkOnly || isOverride) {
          issues.push(`[skills] missing cursor skill file: ${skillName}/${relPath}`);
        } else {
          copyFile(sourcePath, targetPath);
          updates.push(`[skills] created ${skillName}/${relPath}`);
        }
        continue;
      }

      if (isOverride) continue;

      const sourceContent = readNormalized(sourcePath);
      const targetContent = readNormalized(targetPath);
      if (sourceContent !== targetContent) {
        if (checkOnly) {
          issues.push(`[skills] drift detected: ${skillName}/${relPath}`);
        } else {
          copyFile(sourcePath, targetPath);
          updates.push(`[skills] updated ${skillName}/${relPath}`);
        }
      }
    }

    for (const relPath of targetFiles) {
      const isExpectedFile = sourceSet.has(relPath);
      const isAllowedExtra = allowedExtra.has(relPath);
      if (!isExpectedFile && !isAllowedExtra) {
        issues.push(`[skills] unexpected cursor skill file: ${skillName}/${relPath}`);
      }
    }
  }

  for (const cursorSkillDir of listSubdirs(CURSOR_SKILLS_DIR)) {
    if (!expectedSet.has(cursorSkillDir)) {
      issues.push(`[skills] unexpected cursor skill directory: ${cursorSkillDir}`);
    }
  }

  return { issues, updates };
}

function syncRulesAndSkills(options = {}) {
  const { checkOnly = false } = options;
  ensureDir(CURSOR_RULES_DIR);
  ensureDir(CURSOR_SKILLS_DIR);

  const rules = syncCursorRules({ checkOnly });
  const skills = syncCursorSkills({ checkOnly });

  const issues = [...rules.issues, ...skills.issues];
  const updates = [...rules.updates, ...skills.updates];

  if (issues.length > 0) {
    for (const issue of issues) console.error(issue);
  }

  if (!checkOnly && updates.length > 0) {
    for (const update of updates) console.log(update);
  }

  if (!checkOnly && updates.length === 0 && issues.length === 0) {
    console.log('Cursor rules/skills adapters are already in sync.');
  }

  return { issues, updates };
}

if (require.main === module) {
  const checkOnly = process.argv.includes('--check');
  const { issues } = syncRulesAndSkills({ checkOnly });
  process.exit(issues.length > 0 ? 1 : 0);
}

module.exports = {
  syncRulesAndSkills
};

