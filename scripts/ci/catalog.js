#!/usr/bin/env node
/**
 * Verify repo catalog counts against README.md and AGENTS.md.
 *
 * Usage:
 *   node scripts/ci/catalog.js
 *   node scripts/ci/catalog.js --json
 *   node scripts/ci/catalog.js --md
 *   node scripts/ci/catalog.js --text
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const README_PATH = path.join(ROOT, 'README.md');
const AGENTS_PATH = path.join(ROOT, 'AGENTS.md');

const OUTPUT_MODE = process.argv.includes('--md')
  ? 'md'
  : process.argv.includes('--text')
    ? 'text'
    : 'json';

function normalizePathSegments(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function listMatchingFiles(relativeDir, matcher) {
  const directory = path.join(ROOT, relativeDir);
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => matcher(entry))
    .map(entry => normalizePathSegments(path.join(relativeDir, entry.name)))
    .sort();
}

function buildCatalog() {
  const agents = listMatchingFiles('agents', entry => entry.isFile() && entry.name.endsWith('.md'));
  const commands = listMatchingFiles('commands', entry => entry.isFile() && entry.name.endsWith('.md'));
  const skills = listMatchingFiles('skills', entry => entry.isDirectory() && fs.existsSync(path.join(ROOT, 'skills', entry.name, 'SKILL.md')))
    .map(skillDir => `${skillDir}/SKILL.md`);

  return {
    agents: { count: agents.length, files: agents, glob: 'agents/*.md' },
    commands: { count: commands.length, files: commands, glob: 'commands/*.md' },
    skills: { count: skills.length, files: skills, glob: 'skills/*/SKILL.md' }
  };
}

function readFileOrThrow(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read ${path.basename(filePath)}: ${error.message}`);
  }
}

function parseReadmeExpectations(readmeContent) {
  const expectations = [];

  const quickStartMatch = readmeContent.match(/access to\s+(\d+)\s+agents,\s+(\d+)\s+skills,\s+and\s+(\d+)\s+commands/i);
  if (!quickStartMatch) {
    throw new Error('README.md is missing the quick-start catalog summary');
  }

  expectations.push(
    { category: 'agents', mode: 'exact', expected: Number(quickStartMatch[1]), source: 'README.md quick-start summary' },
    { category: 'skills', mode: 'exact', expected: Number(quickStartMatch[2]), source: 'README.md quick-start summary' },
    { category: 'commands', mode: 'exact', expected: Number(quickStartMatch[3]), source: 'README.md quick-start summary' }
  );

  const tablePatterns = [
    { category: 'agents', regex: /\|\s*(?:\*\*)?Agents(?:\*\*)?\s*\|\s*(?:(?:PASS:|\u2705)\s*)?(\d+)\s+agents\s*\|/i, source: 'README.md comparison table' },
    { category: 'commands', regex: /\|\s*(?:\*\*)?Commands(?:\*\*)?\s*\|\s*(?:(?:PASS:|\u2705)\s*)?(\d+)\s+commands\s*\|/i, source: 'README.md comparison table' },
    { category: 'skills', regex: /\|\s*(?:\*\*)?Skills(?:\*\*)?\s*\|\s*(?:(?:PASS:|\u2705)\s*)?(\d+)\s+skills\s*\|/i, source: 'README.md comparison table' }
  ];

  for (const pattern of tablePatterns) {
    const match = readmeContent.match(pattern.regex);
    if (!match) {
      throw new Error(`${pattern.source} is missing the ${pattern.category} row`);
    }

    expectations.push({
      category: pattern.category,
      mode: 'exact',
      expected: Number(match[1]),
      source: `${pattern.source} (${pattern.category})`
    });
  }

  return expectations;
}

function parseAgentsDocExpectations(agentsContent) {
  const summaryMatch = agentsContent.match(/providing\s+(\d+)\s+specialized agents,\s+(\d+)(\+)?\s+skills,\s+(\d+)\s+commands/i);
  if (!summaryMatch) {
    throw new Error('AGENTS.md is missing the catalog summary line');
  }

  const expectations = [
    { category: 'agents', mode: 'exact', expected: Number(summaryMatch[1]), source: 'AGENTS.md summary' },
    {
      category: 'skills',
      mode: summaryMatch[3] ? 'minimum' : 'exact',
      expected: Number(summaryMatch[2]),
      source: 'AGENTS.md summary'
    },
    { category: 'commands', mode: 'exact', expected: Number(summaryMatch[4]), source: 'AGENTS.md summary' }
  ];

  const structurePatterns = [
    {
      category: 'agents',
      mode: 'exact',
      regex: /^\s*agents\/\s*[—–-]\s*(\d+)\s+specialized subagents\s*$/im,
      source: 'AGENTS.md project structure'
    },
    {
      category: 'skills',
      mode: 'minimum',
      regex: /^\s*skills\/\s*[—–-]\s*(\d+)(\+)?\s+workflow skills and domain knowledge\s*$/im,
      source: 'AGENTS.md project structure'
    },
    {
      category: 'commands',
      mode: 'exact',
      regex: /^\s*commands\/\s*[—–-]\s*(\d+)\s+slash commands\s*$/im,
      source: 'AGENTS.md project structure'
    }
  ];

  for (const pattern of structurePatterns) {
    const match = agentsContent.match(pattern.regex);
    if (!match) {
      throw new Error(`${pattern.source} is missing the ${pattern.category} entry`);
    }

    expectations.push({
      category: pattern.category,
      mode: pattern.mode === 'minimum' && match[2] ? 'minimum' : pattern.mode,
      expected: Number(match[1]),
      source: `${pattern.source} (${pattern.category})`
    });
  }

  return expectations;
}

function evaluateExpectations(catalog, expectations) {
  return expectations.map(expectation => {
    const actual = catalog[expectation.category].count;
    const ok = expectation.mode === 'minimum'
      ? actual >= expectation.expected
      : actual === expectation.expected;

    return {
      ...expectation,
      actual,
      ok
    };
  });
}

function formatExpectation(expectation) {
  const comparator = expectation.mode === 'minimum' ? '>=' : '=';
  return `${expectation.source}: ${expectation.category} documented ${comparator} ${expectation.expected}, actual ${expectation.actual}`;
}

function renderText(result) {
  console.log('Catalog counts:');
  console.log(`- agents: ${result.catalog.agents.count}`);
  console.log(`- commands: ${result.catalog.commands.count}`);
  console.log(`- skills: ${result.catalog.skills.count}`);
  console.log('');

  const mismatches = result.checks.filter(check => !check.ok);
  if (mismatches.length === 0) {
    console.log('Documentation counts match the repository catalog.');
    return;
  }

  console.error('Documentation count mismatches found:');
  for (const mismatch of mismatches) {
    console.error(`- ${formatExpectation(mismatch)}`);
  }
}

function renderMarkdown(result) {
  const mismatches = result.checks.filter(check => !check.ok);
  console.log('# ECC Catalog Verification\n');
  console.log('| Category | Count | Pattern |');
  console.log('| --- | ---: | --- |');
  console.log(`| Agents | ${result.catalog.agents.count} | \`${result.catalog.agents.glob}\` |`);
  console.log(`| Commands | ${result.catalog.commands.count} | \`${result.catalog.commands.glob}\` |`);
  console.log(`| Skills | ${result.catalog.skills.count} | \`${result.catalog.skills.glob}\` |`);
  console.log('');

  if (mismatches.length === 0) {
    console.log('Documentation counts match the repository catalog.');
    return;
  }

  console.log('## Mismatches\n');
  for (const mismatch of mismatches) {
    console.log(`- ${formatExpectation(mismatch)}`);
  }
}

function main() {
  const catalog = buildCatalog();
  const readmeContent = readFileOrThrow(README_PATH);
  const agentsContent = readFileOrThrow(AGENTS_PATH);
  const expectations = [
    ...parseReadmeExpectations(readmeContent),
    ...parseAgentsDocExpectations(agentsContent)
  ];
  const checks = evaluateExpectations(catalog, expectations);
  const result = { catalog, checks };

  if (OUTPUT_MODE === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else if (OUTPUT_MODE === 'md') {
    renderMarkdown(result);
  } else {
    renderText(result);
  }

  if (checks.some(check => !check.ok)) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
