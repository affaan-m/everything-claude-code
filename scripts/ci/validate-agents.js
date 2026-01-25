#!/usr/bin/env node
/**
 * Validate agent markdown files have required frontmatter
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '../../agents');
const REQUIRED_FIELDS = ['model', 'tools'];

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      frontmatter[key] = value;
    }
  }
  return frontmatter;
}

function validateAgents() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.log('No agents directory found, skipping validation');
    process.exit(0);
  }

  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(AGENTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      console.error(`ERROR: ${file} - Missing frontmatter`);
      hasErrors = true;
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      if (!frontmatter[field]) {
        console.error(`ERROR: ${file} - Missing required field: ${field}`);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`Validated ${files.length} agent files`);
}

validateAgents();
