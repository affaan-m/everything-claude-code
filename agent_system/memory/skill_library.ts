'use strict';

const fs = require('fs');
const path = require('path');
const {
  dedupeStrings,
  ensureDir,
  readText,
  textMatchScore,
  toSnakeCase,
  writeText
} = require('../shared/file_utils.ts');

class SkillLibrary {
  constructor(options) {
    const normalizedOptions = options || {};
    this.cwd = path.resolve(normalizedOptions.cwd || process.cwd());
    this.directory = path.resolve(this.cwd, normalizedOptions.directory || 'agent_skills');
    ensureDir(this.directory);
  }

  listSkills() {
    const fileNames = fs.existsSync(this.directory)
      ? fs.readdirSync(this.directory).filter((fileName) => fileName.endsWith('.md'))
      : [];

    return fileNames
      .map((fileName) => this.parseSkill(path.join(this.directory, fileName)))
      .filter(Boolean)
      .sort((left, right) => left.slug.localeCompare(right.slug));
  }

  search(query, limit) {
    const normalizedLimit = Number.isInteger(limit) ? limit : 5;
    return this.listSkills()
      .map((skill) => ({
        ...skill,
        score: textMatchScore(query, buildSkillSearchText(skill), skill.tags)
      }))
      .filter((skill) => skill.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, normalizedLimit);
  }

  storeSkill(skill) {
    const normalizedSkill = normalizeSkill(skill);
    const filePath = path.join(this.directory, `${normalizedSkill.slug}.md`);
    const content = formatSkillMarkdown(normalizedSkill);

    writeText(filePath, content);

    return {
      ...normalizedSkill,
      filePath,
      content
    };
  }

  parseSkill(filePath) {
    const content = readText(filePath, '');
    if (!content.trim()) {
      return null;
    }

    const frontmatter = parseFrontmatter(content);
    const slug = frontmatter.slug || path.basename(filePath, '.md');
    const title = frontmatter.title || headingValue(content) || slug;
    const tags = dedupeStrings(splitListValue(frontmatter.tags));
    const problem = extractSection(content, 'Problem');
    const steps = sectionLines(extractSection(content, 'Steps'));
    const toolsUsed = sectionLines(extractSection(content, 'Tools Used'));
    const commonFailures = sectionLines(extractSection(content, 'Common Failures'));
    const reusablePattern = extractSection(content, 'Reusable Pattern');

    return {
      slug,
      title,
      tags,
      problem,
      steps,
      toolsUsed,
      commonFailures,
      reusablePattern,
      content
    };
  }
}

function normalizeSkill(skill) {
  const normalizedTitle = typeof skill.title === 'string' && skill.title.trim()
    ? skill.title.trim()
    : String(skill.slug || 'Reusable Skill').trim();
  const normalizedSlug = typeof skill.slug === 'string' && skill.slug.trim()
    ? toSnakeCase(skill.slug)
    : toSnakeCase(normalizedTitle);

  return {
    slug: normalizedSlug,
    title: normalizedTitle,
    tags: dedupeStrings(skill.tags || []),
    problem: String(skill.problem || '').trim(),
    steps: dedupeStrings(skill.steps || []),
    toolsUsed: dedupeStrings(skill.toolsUsed || []),
    commonFailures: dedupeStrings(skill.commonFailures || []),
    reusablePattern: String(skill.reusablePattern || '').trim()
  };
}

function formatSkillMarkdown(skill) {
  const tags = skill.tags.length > 0 ? skill.tags.join(', ') : '';

  return [
    '---',
    `slug: ${skill.slug}`,
    `title: ${skill.title}`,
    `tags: ${tags}`,
    '---',
    '',
    `# ${skill.title}`,
    '',
    '## Problem',
    skill.problem || 'Document the recurring problem here.',
    '',
    '## Steps',
    ...formatList(skill.steps),
    '',
    '## Tools Used',
    ...formatList(skill.toolsUsed),
    '',
    '## Common Failures',
    ...formatList(skill.commonFailures),
    '',
    '## Reusable Pattern',
    skill.reusablePattern || 'Summarize the reusable operating pattern here.',
    ''
  ].join('\n');
}

function formatList(values) {
  const normalizedValues = Array.isArray(values) && values.length > 0
    ? values
    : ['Add entries here.'];

  return normalizedValues.map((value) => `- ${value}`);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }

  return match[1]
    .split(/\r?\n/)
    .reduce((accumulator, line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      return {
        ...accumulator,
        [key]: value
      };
    }, {});
}

function headingValue(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractSection(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function sectionLines(sectionContent) {
  return String(sectionContent || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*]|\d+\.)\s*/, '').trim())
    .filter(Boolean);
}

function splitListValue(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue;
  }

  return String(rawValue || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildSkillSearchText(skill) {
  return [
    skill.title,
    skill.problem,
    skill.steps.join(' '),
    skill.toolsUsed.join(' '),
    skill.commonFailures.join(' '),
    skill.reusablePattern
  ].join(' ');
}

module.exports = {
  SkillLibrary,
  formatSkillMarkdown,
  normalizeSkill
};
