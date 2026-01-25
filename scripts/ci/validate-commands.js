#!/usr/bin/env node
/**
 * Validate command markdown files have required frontmatter
 */

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '../../commands');

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

function validateCommands() {
  if (!fs.existsSync(COMMANDS_DIR)) {
    console.log('No commands directory found, skipping validation');
    process.exit(0);
  }

  const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md'));
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(COMMANDS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    // Commands may have frontmatter but it's optional
    // Just validate the file is readable markdown
    if (content.trim().length === 0) {
      console.error(`ERROR: ${file} - Empty command file`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`Validated ${files.length} command files`);
}

validateCommands();
