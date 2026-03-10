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
const { getPackageManager } = require('../lib/package-manager');

const MAX_STDIN = 1024 * 1024; // 1MB limit
const BIOME_CONFIGS = ['biome.json', 'biome.jsonc'];
const PRETTIER_CONFIGS = [
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.json5',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.mjs',
  '.prettierrc.ts',
  '.prettierrc.cts',
  '.prettierrc.mts',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  '.prettierrc.toml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  'prettier.config.ts',
  'prettier.config.cts',
  'prettier.config.mts',
];
const PROJECT_ROOT_MARKERS = ['package.json', ...BIOME_CONFIGS, ...PRETTIER_CONFIGS];
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

  while (true) {
    if (PROJECT_ROOT_MARKERS.some(marker => fs.existsSync(path.join(dir, marker)))) {
      return dir;
    }

    const parentDir = path.dirname(dir);
    if (parentDir === dir) break;
    dir = parentDir;
  }

  return startDir;
}

function detectFormatter(projectRoot) {
  for (const cfg of BIOME_CONFIGS) {
    if (fs.existsSync(path.join(projectRoot, cfg))) return 'biome';
  }

  for (const cfg of PRETTIER_CONFIGS) {
    if (fs.existsSync(path.join(projectRoot, cfg))) return 'prettier';
  }

  return null;
}

function getRunnerBin(bin) {
  if (process.platform !== 'win32') return bin;
  if (bin === 'npx') return 'npx.cmd';
  if (bin === 'pnpm') return 'pnpm.cmd';
  if (bin === 'yarn') return 'yarn.cmd';
  if (bin === 'bunx') return 'bunx.cmd';
  return bin;
}

function getFormatterRunner(projectRoot) {
  const pm = getPackageManager({ projectDir: projectRoot });
  const execCmd = pm?.config?.execCmd || 'npx';
  const [bin = 'npx', ...prefix] = execCmd.split(/\s+/).filter(Boolean);

  return {
    bin: getRunnerBin(bin),
    prefix
  };
}

function getFormatterCommand(formatter, filePath, projectRoot) {
  const runner = getFormatterRunner(projectRoot);

  if (formatter === 'biome') {
    return {
      bin: runner.bin,
      args: [...runner.prefix, '@biomejs/biome', 'format', '--write', filePath]
    };
  }
  if (formatter === 'prettier') {
    return {
      bin: runner.bin,
      args: [...runner.prefix, 'prettier', '--write', filePath]
    };
  }
  return null;
}

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && /\.(ts|tsx|js|jsx)$/.test(filePath)) {
      try {
        const projectRoot = findProjectRoot(path.dirname(path.resolve(filePath)));
        const formatter = detectFormatter(projectRoot);
        const cmd = getFormatterCommand(formatter, filePath, projectRoot);

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
