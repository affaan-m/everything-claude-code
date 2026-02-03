#!/usr/bin/env node
/**
 * Validate command markdown files are non-empty and readable
 */

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '../../commands');

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

    // Validate the file is non-empty readable markdown
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
