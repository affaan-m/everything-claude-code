'use strict';

const fs = require('fs');
const path = require('path');

function ensureDir(directoryPath) {
  if (!directoryPath) {
    return;
  }

  fs.mkdirSync(directoryPath, { recursive: true });
}

function readText(filePath, fallback = '') {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_err) {
    return fallback;
  }
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, String(content), 'utf8');
  return filePath;
}

function appendText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, String(content), 'utf8');
  return filePath;
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_err) {
    return cloneValue(fallback);
  }
}

function writeJson(filePath, value) {
  return writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function cloneValue(value) {
  if (typeof value === 'undefined') {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized || 'item';
}

function toSnakeCase(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');

  return normalized || 'item';
}

function tokenize(value) {
  return Array.from(new Set(
    String(value || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1)
  ));
}

function textMatchScore(query, candidate, tags) {
  const queryText = String(query || '').trim().toLowerCase();
  const candidateText = String(candidate || '').toLowerCase();
  const tagText = Array.isArray(tags) ? tags.join(' ').toLowerCase() : '';
  const combined = `${candidateText} ${tagText}`.trim();

  if (!queryText || !combined) {
    return 0;
  }

  const queryTokens = tokenize(queryText);
  const candidateTokens = tokenize(combined);
  const candidateTokenSet = new Set(candidateTokens);

  let score = 0;
  for (const token of queryTokens) {
    if (candidateTokenSet.has(token)) {
      score += 3;
    } else if (combined.includes(token)) {
      score += 1;
    }
  }

  if (combined.includes(queryText)) {
    score += 5;
  }

  return score;
}

function resolveWithinCwd(cwd, targetPath) {
  const resolvedPath = path.resolve(cwd, targetPath);
  const relativePath = path.relative(cwd, resolvedPath);
  const isInside = relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));

  return {
    resolvedPath,
    relativePath,
    isInside
  };
}

function dedupeStrings(values) {
  return Array.from(new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value).trim())
    .filter(Boolean)));
}

module.exports = {
  appendText,
  cloneValue,
  dedupeStrings,
  ensureDir,
  readJson,
  readText,
  resolveWithinCwd,
  slugify,
  textMatchScore,
  toSnakeCase,
  tokenize,
  writeJson,
  writeText
};
