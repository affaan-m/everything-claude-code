#!/usr/bin/env node
/**
 * PostToolUse Hook: Auto-format JS/TS files after edits
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use. If the edited file is a JS/TS file,
 * auto-detects the project formatter (Biome or Prettier) by looking
 * for config files, then formats accordingly.
 * Fails silently if no formatter is found or installed.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024; // 1MB limit
const JS_TS_FILE_REGEX = /\.(ts|tsx|js|jsx)$/;
let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) {
    const remaining = MAX_STDIN - data.length;
    data += chunk.substring(0, remaining);
  }
});

function findProjectRoot(startDir) {
  let dir = startDir;

  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }

  return startDir;
}

function hasPrettierInPackageJson(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return Object.prototype.hasOwnProperty.call(pkg, 'prettier');
  } catch {
    return false;
  }
}

function detectFormatter(startDir) {
  const biomeConfigs = ['biome.json', 'biome.jsonc'];
  const prettierConfigs = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.mjs',
    '.prettierrc.yml',
    '.prettierrc.yaml',
    '.prettierrc.toml',
    'prettier.config.js',
    'prettier.config.cjs',
    'prettier.config.mjs'
  ];

  let dir = startDir;
  while (true) {
    for (const cfg of biomeConfigs) {
      if (fs.existsSync(path.join(dir, cfg))) return 'biome';
    }

    for (const cfg of prettierConfigs) {
      if (fs.existsSync(path.join(dir, cfg))) return 'prettier';
    }

    if (hasPrettierInPackageJson(dir)) return 'prettier';

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

function getFormatterCommand(formatter, filePath) {
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  if (formatter === 'biome') {
    return { bin: npxBin, args: ['@biomejs/biome', 'format', '--write', filePath] };
  }
  if (formatter === 'prettier') {
    return { bin: npxBin, args: ['prettier', '--write', filePath] };
  }

  return null;
}

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && JS_TS_FILE_REGEX.test(filePath)) {
      try {
        const absFilePath = path.resolve(filePath);
        const projectRoot = findProjectRoot(path.dirname(absFilePath));
        const formatter = detectFormatter(projectRoot);
        const cmd = getFormatterCommand(formatter, absFilePath);

        if (cmd) {
          execFileSync(cmd.bin, cmd.args, {
            cwd: projectRoot,
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 15000
          });
        }
      } catch {
        // Formatter not installed, file missing, or failed — non-blocking
      }
    }
  } catch {
    // Invalid input — pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
